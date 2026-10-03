import re
import asyncio
import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class FlowCandidate:
    element: Any
    prompt: str = ""
    model: str = ""
    aspect_ratio: str = ""
    duration: str = ""
    resolution: str = ""
    creation_time: str = ""
    index: int = 0
    score: int = 0

class FlowVideoResolver:
    """
    Resolves the exact generated video for a Botock job using Flow's Project Search
    and deterministic metadata matching.
    """
    def __init__(self, page):
        self.page = page

    async def resolve_video(self, job_data: dict) -> Dict[str, Any]:
        """
        Main entry point to resolve a video.
        job_data must contain: prompt, model, aspect_ratio, duration, resolution
        """
        logger.info(f"[{job_data['id']}] Starting video resolution via Flow Search...")
        
        # 1. Search Project
        await self._search_project(job_data['prompt'])
        
        # 2. Get Candidates
        candidates = await self._get_search_results()
        if not candidates:
            # Fallback
            logger.info(f"[{job_data['id']}] Search returned no results. Refreshing and retrying...")
            await asyncio.sleep(2)
            await self.page.keyboard.press("Escape")
            await asyncio.sleep(1)
            await self._search_project(job_data['prompt'])
            candidates = await self._get_search_results()
        
        if not candidates:
            return {"status": "NOT_FOUND", "message": "No matching videos found in project search."}

        # 3. Extract Metadata and Rank
        scored_candidates = []
        for i, cand_el in enumerate(candidates):
            candidate = await self._extract_metadata(cand_el, i)
            self._rank_candidate(candidate, job_data)
            scored_candidates.append(candidate)
            
        # 4. Resolve Best Match
        best_match = self._select_best_candidate(scored_candidates)
        
        if best_match.score < 50:
             return {"status": "NOT_FOUND", "message": "Candidates found, but metadata confidence is too low."}
             
        # Check for ambiguity (duplicate prompts without distinguishing metadata)
        top_score = best_match.score
        ambiguous = [c for c in scored_candidates if c.score == top_score and c != best_match]
        if ambiguous:
            logger.warning(f"[{job_data['id']}] AMBIGUOUS RESOLUTION. Multiple candidates scored {top_score}.")
            return {"status": "AMBIGUOUS", "message": "Multiple exact matches found. Cannot safely resolve."}

        # 5. Clear Search
        await self._clear_search()
        
        return {"status": "MATCHED", "candidate": best_match}

    async def _search_project(self, prompt: str):
        # 1. Type prompt into search input and dispatch event
        await self.page.evaluate(f"""(search_term) => {{
            const searchInput = document.querySelector('.search-input');
            if (searchInput) {{
                searchInput.value = search_term;
                searchInput.dispatchEvent(new Event('input', {{ bubbles: true }}));
            }}
        }}""", prompt)
        await asyncio.sleep(2.5) # Wait for results

    async def _get_search_results(self) -> List[Any]:
        # Get all video/image tiles
        tiles = await self.page.locator('flow-video-tile, flow-image-tile, img[alt*="video" i]').all()
        return tiles

    async def _extract_metadata(self, element: Any, index: int) -> FlowCandidate:
        candidate = FlowCandidate(element=element, index=index)
        
        try:
            # Click the image inside the tile to open details pane
            img_element = element.locator('img').first
            if await img_element.is_visible(timeout=1000):
                await img_element.click()
            else:
                await element.click()
            await asyncio.sleep(1.5)
            
            # Extract exact prompt from .prompt-text
            prompt_el = self.page.locator('.prompt-text').first
            if await prompt_el.is_visible(timeout=1500):
                candidate.prompt = await prompt_el.inner_text()
            
            # Extract other metadata from the pane
            page_text = await self.page.evaluate("() => document.body.innerText")
            
            if "Omni 1.1 Flash" in page_text or "Veo" in page_text:
                candidate.model = "omni-1.1-flash" if "Omni 1.1 Flash" in page_text else "veo"
            elif "Nano Banana" in page_text:
                candidate.model = "nano-banana-2"
            
            aspect_match = re.search(r'(16:9|9:16|1:1|4:3|3:4)', page_text)
            if aspect_match:
                candidate.aspect_ratio = aspect_match.group(1)
                
            res_match = re.search(r'(360p|720p|1080p)', page_text)
            if res_match:
                candidate.resolution = res_match.group(1)
                
            dur_match = re.search(r'(4s|5s|6s|8s|10s)', page_text)
            if dur_match:
                candidate.duration = dur_match.group(1).replace('s', '')
                
            # Close metadata pane via Escape
            await self.page.evaluate("""() => {
                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            }""")
            await asyncio.sleep(0.5)
            
        except Exception as e:
            logger.debug(f"Metadata extraction warning: {e}")
            
        return candidate

    def _rank_candidate(self, candidate: FlowCandidate, job_data: dict):
        score = 0
        
        # 1. Exact prompt match (CRITICAL)
        if candidate.prompt and job_data.get('prompt'):
            cand_prompt = candidate.prompt.strip().lower()
            job_prompt = job_data['prompt'].strip().lower()
            if cand_prompt == job_prompt:
                score += 100
            elif job_prompt in cand_prompt:
                score += 50
        else:
            score += 30 # Default search relevance
        
        # 2. Match other metadata
        if candidate.model and job_data.get('model') and candidate.model in str(job_data.get('model')).lower():
            score += 20
            
        if candidate.aspect_ratio and candidate.aspect_ratio == job_data.get('aspect_ratio'):
            score += 10
            
        if candidate.resolution and candidate.resolution == job_data.get('resolution', '360p'):
            score += 10
            
        if candidate.duration and str(candidate.duration) == str(job_data.get('duration_seconds', '8')):
            score += 10
            
        if candidate.index == 0:
            score += 5
            
        candidate.score = score

    def _select_best_candidate(self, candidates: List[FlowCandidate]) -> FlowCandidate:
        candidates.sort(key=lambda c: c.score, reverse=True)
        return candidates[0]



    async def _clear_search(self):
        clear_btn = self.page.locator('button[aria-label*="Clear search" i], .clear-icon').first
        if await clear_btn.is_visible():
            await clear_btn.click()
        else:
            search_input = self.page.locator('input[type="search"], input[placeholder*="Search" i]').first
            if await search_input.is_visible():
                await search_input.fill("")
                await search_input.press("Enter")
