-- ============================================================
-- Migration 016: Seed Static Hardcoded Blogs into Blog CMS
-- Makes all 16 legacy blogs manageable, editable, and deletable
-- ============================================================

INSERT INTO public.blog_posts (slug, title, h1, excerpt, content, featured_image, status, is_indexable, published_at)
VALUES (
    'about-botock-app',
    'About Botock: Built by a Web Developer, Vibe Coding & The Doc Ock Story ',
    'About Botock: Built by a Web Developer, Vibe Coding & The Doc Ock Story ',
    'The story behind Botock: created by a web developer while vibe coding, completely costless tools with or without login, and the Doc Ock Spider-Man origin of our name.',
    'The story behind Botock: created by a web developer while vibe coding, completely costless tools with or without login, and the Doc Ock Spider-Man origin of our name.',
    'https://botock.app/og-image.jpg',
    'PUBLISHED',
    true,
    now()
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    featured_image = EXCLUDED.featured_image;

INSERT INTO public.blog_posts (slug, title, h1, excerpt, content, featured_image, status, is_indexable, published_at)
VALUES (
    'ai-agents-creative-workflows',
    'How AI Agents are Revolutionizing Creative Workflows in 2026',
    'How AI Agents are Revolutionizing Creative Workflows in 2026',
    'Explore how autonomous AI agents are taking over repetitive coding, designing, and video editing tasks, allowing creators to focus on imagination.',
    'Explore how autonomous AI agents are taking over repetitive coding, designing, and video editing tasks, allowing creators to focus on imagination.',
    'https://botock.app/images/blog/ai-agents-creative.jpg',
    'PUBLISHED',
    true,
    now()
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    featured_image = EXCLUDED.featured_image;

INSERT INTO public.blog_posts (slug, title, h1, excerpt, content, featured_image, status, is_indexable, published_at)
VALUES (
    'ai-document-management-productivity',
    'Maximizing Productivity with AI-Powered Document Management',
    'Maximizing Productivity with AI-Powered Document Management',
    'Learn how integrating AI processing with traditional PDF tools can cut down administrative hours and optimize your digital workspace.',
    'Learn how integrating AI processing with traditional PDF tools can cut down administrative hours and optimize your digital workspace.',
    'https://botock.app/images/blog/ai-document-management.jpg',
    'PUBLISHED',
    true,
    now()
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    featured_image = EXCLUDED.featured_image;

INSERT INTO public.blog_posts (slug, title, h1, excerpt, content, featured_image, status, is_indexable, published_at)
VALUES (
    'complete-guide-to-ai-audio-voice-tools',
    'Mastering AI Audio & Voice Production: Noise Removal, Voice Changer & Text-to-Speech ',
    'Mastering AI Audio & Voice Production: Noise Removal, Voice Changer & Text-to-Speech ',
    'A complete production guide to Botock',
    'A complete production guide to Botock',
    'https://botock.app/images/blog/ai-agents-creative.jpg',
    'PUBLISHED',
    true,
    now()
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    featured_image = EXCLUDED.featured_image;

INSERT INTO public.blog_posts (slug, title, h1, excerpt, content, featured_image, status, is_indexable, published_at)
VALUES (
    'complete-guide-to-ai-image-tools-upscale-rotate',
    'AI Image Editing Mastery: Batch Auto-Rotate, 4K/8K Upscaler & Background Removal ',
    'AI Image Editing Mastery: Batch Auto-Rotate, 4K/8K Upscaler & Background Removal ',
    'Complete breakdown of Botock',
    'Complete breakdown of Botock',
    'https://botock.app/images/blog/ai-image-generation.jpg',
    'PUBLISHED',
    true,
    now()
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    featured_image = EXCLUDED.featured_image;

INSERT INTO public.blog_posts (slug, title, h1, excerpt, content, featured_image, status, is_indexable, published_at)
VALUES (
    'complete-guide-to-ai-video-tools-creators',
    'The Ultimate AI Video Creator Toolkit: Auto-Reframe, Background Remover, Rotate & Reaction Studio ',
    'The Ultimate AI Video Creator Toolkit: Auto-Reframe, Background Remover, Rotate & Reaction Studio ',
    'Everything content creators, marketers, and video editors need to know about Botock',
    'Everything content creators, marketers, and video editors need to know about Botock',
    'https://botock.app/images/blog/ai-video-trends.jpg',
    'PUBLISHED',
    true,
    now()
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    featured_image = EXCLUDED.featured_image;

INSERT INTO public.blog_posts (slug, title, h1, excerpt, content, featured_image, status, is_indexable, published_at)
VALUES (
    'complete-guide-to-botock-video-editor',
    'The Complete Guide to Botock Video Editor: Timeline, Motion Animation, Visual FX & WebAssembly Export ',
    'The Complete Guide to Botock Video Editor: Timeline, Motion Animation, Visual FX & WebAssembly Export ',
    'The definitive creator guide to Botock Video Editor. Discover why it was built, full feature breakdown (multi-track power hierarchy, resizable FX blocks, continuous zoom in/out, directional motion animations, typewriter text), step-by-step workflow, and zero-server client-side MP4 export.',
    'The definitive creator guide to Botock Video Editor. Discover why it was built, full feature breakdown (multi-track power hierarchy, resizable FX blocks, continuous zoom in/out, directional motion animations, typewriter text), step-by-step workflow, and zero-server client-side MP4 export.',
    'https://botock.app/images/blog/botock-video-editor.png',
    'PUBLISHED',
    true,
    now()
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    featured_image = EXCLUDED.featured_image;

INSERT INTO public.blog_posts (slug, title, h1, excerpt, content, featured_image, status, is_indexable, published_at)
VALUES (
    'complete-guide-to-pdf-tools-workflows',
    'Complete Guide to Modern PDF Tools: AI Summarizer, 3D Flipbook, Forms & Auto-Straighten ',
    'Complete Guide to Modern PDF Tools: AI Summarizer, 3D Flipbook, Forms & Auto-Straighten ',
    'Master the complete Botock PDF suite. Learn what each tool does, step-by-step usage instructions, user benefits, practical use cases, and target audiences for AI Summarizer (Beta), 3D Book Flipbook, PDF Forms Studio, and PDF Rotate.',
    'Master the complete Botock PDF suite. Learn what each tool does, step-by-step usage instructions, user benefits, practical use cases, and target audiences for AI Summarizer (Beta), 3D Book Flipbook, PDF Forms Studio, and PDF Rotate.',
    'https://botock.app/images/blog/ai-document-management.jpg',
    'PUBLISHED',
    true,
    now()
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    featured_image = EXCLUDED.featured_image;

INSERT INTO public.blog_posts (slug, title, h1, excerpt, content, featured_image, status, is_indexable, published_at)
VALUES (
    'evolution-of-ai-image-generation',
    'The Evolution of AI Image Generation: What',
    'The Evolution of AI Image Generation: What',
    'A deep dive into advanced composition controls, vector generation, and real-time rendering. The future of AI image generation is here.',
    'A deep dive into advanced composition controls, vector generation, and real-time rendering. The future of AI image generation is here.',
    'https://botock.app/images/blog/ai-image-generation.jpg',
    'PUBLISHED',
    true,
    now()
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    featured_image = EXCLUDED.featured_image;

INSERT INTO public.blog_posts (slug, title, h1, excerpt, content, featured_image, status, is_indexable, published_at)
VALUES (
    'guide-to-ai-video-generation',
    'The Ultimate Guide to AI Video Generation: Text to Video Masterclass',
    'The Ultimate Guide to AI Video Generation: Text to Video Masterclass',
    'Master AI video prompt engineering, camera movements, lighting, and timeline stitching. Turn 10-second AI video clips into professional cinematic videos.',
    'Master AI video prompt engineering, camera movements, lighting, and timeline stitching. Turn 10-second AI video clips into professional cinematic videos.',
    'https://botock.app/og-image.jpg',
    'PUBLISHED',
    true,
    now()
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    featured_image = EXCLUDED.featured_image;

INSERT INTO public.blog_posts (slug, title, h1, excerpt, content, featured_image, status, is_indexable, published_at)
VALUES (
    'guide-to-image-editing-and-background-removal',
    'The Magic of AI Image Editing & Background Removal',
    'The Magic of AI Image Editing & Background Removal',
    'Discover how to remove backgrounds with AI edge precision and utilize transparent PNGs for product photography, thumbnails, and marketing graphics.',
    'Discover how to remove backgrounds with AI edge precision and utilize transparent PNGs for product photography, thumbnails, and marketing graphics.',
    'https://botock.app/og-image.jpg',
    'PUBLISHED',
    true,
    now()
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    featured_image = EXCLUDED.featured_image;

INSERT INTO public.blog_posts (slug, title, h1, excerpt, content, featured_image, status, is_indexable, published_at)
VALUES (
    'guide-to-pdf-and-document-tools',
    'Streamlining Document Workflows with Client-Side PDF Tools',
    'Streamlining Document Workflows with Client-Side PDF Tools',
    'Learn how to secure, merge, split, and convert PDF documents directly inside your browser with complete client-side confidentiality and zero server uploads.',
    'Learn how to secure, merge, split, and convert PDF documents directly inside your browser with complete client-side confidentiality and zero server uploads.',
    'https://botock.app/og-image.jpg',
    'PUBLISHED',
    true,
    now()
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    featured_image = EXCLUDED.featured_image;

INSERT INTO public.blog_posts (slug, title, h1, excerpt, content, featured_image, status, is_indexable, published_at)
VALUES (
    'guide-to-photo-generation-and-faq',
    'Mastering AI Photo Generation: Tips, Styles & FAQs',
    'Mastering AI Photo Generation: Tips, Styles & FAQs',
    'Learn how to generate photorealistic images from text prompts, choose optimal aspect ratios, and navigate AI generation system speeds on Botock.',
    'Learn how to generate photorealistic images from text prompts, choose optimal aspect ratios, and navigate AI generation system speeds on Botock.',
    'https://botock.app/og-image.jpg',
    'PUBLISHED',
    true,
    now()
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    featured_image = EXCLUDED.featured_image;

INSERT INTO public.blog_posts (slug, title, h1, excerpt, content, featured_image, status, is_indexable, published_at)
VALUES (
    'how-to-create-reaction-videos-trends-guide',
    'Why Reaction Videos Dominate Social Media in 2026: Trends, Data & Complete Creation Guide',
    'Why Reaction Videos Dominate Social Media in 2026: Trends, Data & Complete Creation Guide',
    'Discover why top-and-bottom stacked reaction videos dominate TikTok, Shorts, and Reels with 82% retention rates. Learn the psychology, market growth graphs, and how to create them in 60 seconds with Botock AI.',
    'Discover why top-and-bottom stacked reaction videos dominate TikTok, Shorts, and Reels with 82% retention rates. Learn the psychology, market growth graphs, and how to create them in 60 seconds with Botock AI.',
    'https://botock.app/images/blog/reaction-video-trends.jpg',
    'PUBLISHED',
    true,
    now()
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    featured_image = EXCLUDED.featured_image;

INSERT INTO public.blog_posts (slug, title, h1, excerpt, content, featured_image, status, is_indexable, published_at)
VALUES (
    'tesla-new-roadster-the-car-that-almost-flies',
    'Tesla',
    'Tesla',
    'Tesla revealed its 2nd-gen Roadster with SpaceX cold-gas thrusters, suction fans, and sub-1s 0-60. Discover how it jumps over trucks, flips mid-air, and the truth about flying cars.',
    'Tesla revealed its 2nd-gen Roadster with SpaceX cold-gas thrusters, suction fans, and sub-1s 0-60. Discover how it jumps over trucks, flips mid-air, and the truth about flying cars.',
    'https://botock.app/images/blog/tesla-roadster-unveil.jpg',
    'PUBLISHED',
    true,
    now()
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    featured_image = EXCLUDED.featured_image;

INSERT INTO public.blog_posts (slug, title, h1, excerpt, content, featured_image, status, is_indexable, published_at)
VALUES (
    'top-5-ai-video-trends-2026',
    'Top 5 AI Video Generation Trends You Need to Know This Year',
    'Top 5 AI Video Generation Trends You Need to Know This Year',
    'From real-time 3D rendering to text-to-video masterpieces, discover the trends shaping the future of digital filmmaking and content creation.',
    'From real-time 3D rendering to text-to-video masterpieces, discover the trends shaping the future of digital filmmaking and content creation.',
    'https://botock.app/images/blog/ai-video-trends.jpg',
    'PUBLISHED',
    true,
    now()
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    featured_image = EXCLUDED.featured_image;

INSERT INTO public.blog_posts (slug, title, h1, excerpt, content, featured_image, status, is_indexable, published_at)
VALUES (
    'ai-video-prompt-engineering-master-handbook',
    'The AI Video Prompt Engineering Master Handbook: 25-Chapter Production Guide (2026)',
    'The AI Video Prompt Engineering Master Handbook: 25-Chapter Production Guide (2026)',
    'The definitive reference handbook for AI video prompt engineering. Master the 9 prompt blocks, camera kinematics, optics, anatomical gestures, dialogue, and multi-clip continuity for Botock, Kling, Sora, and Runway.',
    'The definitive reference handbook for AI video prompt engineering. Master the 9 prompt blocks, camera kinematics, optics, anatomical gestures, dialogue, and multi-clip continuity for Botock, Kling, Sora, and Runway.',
    'https://botock.app/images/blog/ai-video-prompt-handbook-hero.jpg',
    'PUBLISHED',
    true,
    now()
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    featured_image = EXCLUDED.featured_image;

INSERT INTO public.blog_posts (slug, title, h1, excerpt, content, featured_image, status, is_indexable, published_at)
VALUES (
    'ai-video-camera-movements-angles-guide',
    'AI Video Camera Movements, Angles & Shot Sizes: Complete Cinematography Guide',
    'AI Video Camera Movements, Angles & Shot Sizes: Complete Cinematography Guide',
    'Master pans, tilts, dollies, tracking shots, vertigo zoom, and Dutch angles. Stop perspective warping and camera glitching with speed calibration tables.',
    'Master pans, tilts, dollies, tracking shots, vertigo zoom, and Dutch angles. Stop perspective warping and camera glitching with speed calibration tables.',
    'https://botock.app/images/blog/ai-camera-movements-angles.jpg',
    'PUBLISHED',
    true,
    now()
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    featured_image = EXCLUDED.featured_image;

INSERT INTO public.blog_posts (slug, title, h1, excerpt, content, featured_image, status, is_indexable, published_at)
VALUES (
    'ai-video-actions-body-gestures-prompt-guide',
    'AI Video Actions, Hand Gestures & Body Mechanics: Complete Prompt Engineering Guide',
    'AI Video Actions, Hand Gestures & Body Mechanics: Complete Prompt Engineering Guide',
    'Eliminate distorted hands, rubbery joints, and gliding feet. Learn how to write physical action beats and fight choreography that AI models execute with anatomical precision.',
    'Eliminate distorted hands, rubbery joints, and gliding feet. Learn how to write physical action beats and fight choreography that AI models execute with anatomical precision.',
    'https://botock.app/images/blog/ai-character-action-blocking.jpg',
    'PUBLISHED',
    true,
    now()
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    featured_image = EXCLUDED.featured_image;

INSERT INTO public.blog_posts (slug, title, h1, excerpt, content, featured_image, status, is_indexable, published_at)
VALUES (
    'ai-video-cinematic-lighting-optics-guide',
    'AI Video Lighting, Optics & Color: How to Command Cinematic Depth and Atmosphere',
    'AI Video Lighting, Optics & Color: How to Command Cinematic Depth and Atmosphere',
    'Transform flat, sterile renders into rich Hollywood-grade cinematography using 24mm to 85mm anamorphic lenses, golden hour rim lighting, and volumetric atmospheric textures.',
    'Transform flat, sterile renders into rich Hollywood-grade cinematography using 24mm to 85mm anamorphic lenses, golden hour rim lighting, and volumetric atmospheric textures.',
    'https://botock.app/images/blog/ai-cinematic-lighting-optics.jpg',
    'PUBLISHED',
    true,
    now()
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    featured_image = EXCLUDED.featured_image;
