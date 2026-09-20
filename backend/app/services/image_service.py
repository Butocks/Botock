import os
import time
import asyncio
import logging
import urllib.parse
import aiohttp
from app.config import settings

logger = logging.getLogger(__name__)

ASPECT_RATIO_DIMENSIONS = {
    "16:9": (1280, 720),
    "4:3": (1024, 768),
    "1:1": (1024, 1024),
    "3:4": (768, 1024),
    "9:16": (720, 1280),
}

MODEL_ENHANCERS = {
    "nano-banana-lite": "fast generation, sharp details, vibrant colors",
    "nano-banana-2": "photorealistic, cinematic lighting, 8k resolution, highly detailed, masterwork",
    "nano-banana-pro": "studio master quality, ultra-detailed 8k, ray tracing, award winning photography, Hasselblad",
}


class NanoBananaImageService:
    def __init__(self):
        self.images_dir = settings.IMAGES_DIR
        os.makedirs(self.images_dir, exist_ok=True)

    async def generate_image(
        self,
        prompt: str,
        generation_id: str,
        status_dict: dict,
        aspect_ratio: str = "1:1",
        model: str = "nano-banana-2",
        style: str = None,
        is_pro: bool = False,
    ):
        """
        Generates photorealistic AI image matching the Nano Banana specs:
        - Free models: nano-banana-lite, nano-banana-2
        - Pro model: nano-banana-pro
        - Aspect ratios: 16:9, 4:3, 1:1, 3:4, 9:16
        """
        # Guard: Free users cannot use Pro model
        if not is_pro and model == "nano-banana-pro":
            model = "nano-banana-2"

        status_dict[generation_id] = {
            "status": "processing",
            "message": f"Generating image with {model.replace('-', ' ').title()}...",
        }

        width, height = ASPECT_RATIO_DIMENSIONS.get(aspect_ratio, (1024, 1024))
        enhancer = MODEL_ENHANCERS.get(model, MODEL_ENHANCERS["nano-banana-2"])

        full_prompt = prompt.strip()
        if style:
            full_prompt += f", in {style} style"
        full_prompt += f", {enhancer}"

        encoded_prompt = urllib.parse.quote(full_prompt)
        # Using ultra-fast high quality generative pipeline with seed
        seed = int(time.time() * 1000) % 1000000
        image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width={width}&height={height}&seed={seed}&nologo=true"

        output_path = os.path.join(self.images_dir, f"{generation_id}.png")

        try:
            status_dict[generation_id]["message"] = "Synthesizing pixels and textures..."
            
            async with aiohttp.ClientSession() as session:
                async with session.get(image_url, timeout=aiohttp.ClientTimeout(total=45)) as resp:
                    if resp.status == 200:
                        image_data = await resp.read()
                        with open(output_path, "wb") as f:
                            f.write(image_data)
                    else:
                        raise Exception(f"Image API returned HTTP {resp.status}")

            download_url = f"/api/image/download/{generation_id}"
            status_dict[generation_id] = {
                "status": "completed",
                "message": "Image generated successfully!",
                "download_url": download_url,
                "image_url": download_url,
            }
            logger.info(f"[{generation_id}] Image successfully generated and saved to {output_path}")

        except Exception as e:
            logger.error(f"[{generation_id}] Image generation failed: {e}")
            status_dict[generation_id] = {
                "status": "failed",
                "message": f"Image generation failed: {str(e)}",
            }
