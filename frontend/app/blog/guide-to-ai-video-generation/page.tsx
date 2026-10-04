"use client";

import Link from "next/link";
import { ArrowLeft, Film, Clock, Search, Wand2, ShieldAlert, Layers } from "lucide-react";

export default function GuideToVideoGeneration() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0c081a]">
      {/* Header */}
      <div className="w-full bg-white dark:bg-[#110d22] border-b border-slate-200 dark:border-white/10 px-6 py-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
        <div className="max-w-4xl mx-auto">
          <Link href="/blog" className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-blue-500 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Blog
          </Link>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
            The Ultimate Guide to AI Video Generation: From Text to Masterpiece
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <span>By Boto</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span>Video & Filmmaking</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> 15 min read</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12 prose dark:prose-invert prose-slate prose-headings:font-black prose-a:text-blue-500 hover:prose-a:text-blue-400">
        
        <p className="text-xl font-medium text-slate-700 dark:text-slate-300 leading-relaxed mb-10">
          Creating stunning videos used to require expensive cameras, a massive crew, and weeks of editing. Today, artificial intelligence has completely revolutionized this process. With Botock, you can generate cinematic, high-quality video content using nothing but your imagination. 
        </p>

        <h2 className="flex items-center gap-2"><Film className="w-6 h-6 text-blue-500"/> Understanding Text-to-Video and Image-to-Video</h2>
        
        <p>Before we dive into creating full-scale movies, it is crucial to understand the two primary ways you can generate video content on our platform:</p>

        <h3>1. Text-to-Video</h3>
        <p>
          Text-to-video is exactly what it sounds like: you type a description of a scene, and the AI brings it to life. This is the purest form of AI creation because you are starting with a blank canvas. 
        </p>
        <p>
          When you use text-to-video, the AI interprets your words to create the environment, the lighting, the characters, and the motion all at once. This is perfect for establishing shots, dynamic action sequences, or entirely fictional worlds that do not exist in reality.
        </p>

        <h3>2. Image-to-Video</h3>
        <p>
          Image-to-video gives you much more control over the final visual. Instead of starting from a blank slate, you upload a starting image (which you can generate using our Photo Generator or upload from your device). The AI then takes that static image and adds realistic motion, physics, and life to it.
        </p>
        <p>
          If you have a specific character design, a brand logo, or a precise architectural rendering that must remain consistent, Image-to-Video is the superior choice. You lock in the exact look with the image, and simply tell the AI how you want the camera and the elements within the picture to move.
        </p>

        <hr className="my-12 border-slate-200 dark:border-white/10" />

        <h2 className="flex items-center gap-2"><Wand2 className="w-6 h-6 text-blue-500"/> The Secret to a Good Prompt</h2>
        
        <p>
          While we will cover advanced prompt techniques in a future blog, getting a good result right now requires understanding a basic formula. The AI does not think like a human; it thinks in terms of visual tags and camera terminology.
        </p>
        
        <p>A weak prompt looks like this: <em>"A man walking in a city."</em></p>
        
        <p>To get a cinematic result, your prompt should answer three questions:</p>
        <ul>
          <li><strong>What is the subject?</strong> (e.g., A man wearing a neon-lit cyber-suit)</li>
          <li><strong>What is the environment?</strong> (e.g., A rainy, futuristic Tokyo street at midnight)</li>
          <li><strong>What is the camera doing?</strong> (e.g., Cinematic slow-motion, tracking shot moving backwards, 8k resolution, photorealistic)</li>
        </ul>

        <div className="bg-blue-500/10 border-l-4 border-blue-500 p-6 rounded-r-2xl my-8">
          <p className="m-0 text-sm font-bold text-slate-800 dark:text-slate-200">Example of a Strong Prompt:</p>
          <p className="m-0 mt-2 text-slate-600 dark:text-slate-400 italic">
            "Cinematic tracking shot, moving backwards. A lone traveler wearing a glowing neon suit walking down a rainy, cyberpunk city street at midnight. Reflections in the puddles, volumetric fog, neon signs blinking. Photorealistic, 8k resolution, cinematic lighting, slow motion."
          </p>
        </div>

        <p>
          By giving the AI clear instructions on the lighting, the mood, and the camera movement, you transform a generic clip into a Hollywood-style cinematic shot.
        </p>

        <hr className="my-12 border-slate-200 dark:border-white/10" />

        <h2 className="flex items-center gap-2"><Layers className="w-6 h-6 text-blue-500"/> How to Build a 30-Minute Video from 10-Second Clips</h2>

        <p>
          One of the most common questions we receive is: <em>"If the AI generates 5 to 10-second clips, how do I create a long documentary, a YouTube video, or a 30-minute short film?"</em>
        </p>

        <p>
          The answer lies in how real movies are made. No Hollywood film is shot in one continuous 30-minute take. Movies are a sequence of small clips—usually lasting between 3 to 8 seconds each—stitched together in the editing room. You will use the exact same technique.
        </p>

        <h3>Step 1: Write a Script and Storyboard</h3>
        <p>
          Never start generating randomly. First, use our AI tools (or your own notebook) to write a script. Break that script down into scenes. For a 30-minute video, you might need around 150 to 250 individual shots depending on your pacing.
        </p>

        <h3>Step 2: Generate Scene by Scene</h3>
        <p>
          Focus on generating one clip at a time. If your scene requires a character walking into a building, generate a 5-second clip of them walking. Then, generate a separate 5-second clip of the building's interior. 
        </p>

        <h3>Step 3: Stitching and Editing</h3>
        <p>
          Once you have generated your batch of 10-second clips, you bring them into a video editor (like our upcoming editing suite or any third-party software). You place the clips side-by-side on the timeline. 
        </p>

        <h3>Step 4: Voiceover and Audio</h3>
        <p>
          The secret glue that holds a 30-minute video together is the audio. Once your clips are sequenced, you overlay a continuous voiceover, background music, and sound effects. The continuous audio track makes the transition between the 10-second AI clips feel completely seamless and natural to the viewer.
        </p>
        
        <p>
          By generating in small, highly-controlled 10-second bursts, you ensure that every single frame of your 30-minute video is exactly what you want it to be.
        </p>

        <hr className="my-12 border-slate-200 dark:border-white/10" />

        <h2 className="flex items-center gap-2"><Search className="w-6 h-6 text-blue-500"/> Common Generation Questions (FAQ)</h2>

        <h3>Why does generation sometimes take longer?</h3>
        <p>
          AI video generation requires massive amounts of computational power. Because we provide these services globally, there are peak hours when thousands of creators are generating content simultaneously. 
        </p>
        <p>
          During these high-traffic periods, your request is placed in a secure queue. The system automatically balances the load, but you may experience slightly longer loading times. Rest assured, once your creative compute node is allocated, your video will be rendered at maximum quality.
        </p>

        <h3 className="flex items-center gap-2 mt-8"><ShieldAlert className="w-5 h-5 text-red-500"/> Why do some prompts fail to generate?</h3>
        <p>
          We operate under very strict safety and content policies to ensure our platform remains a safe, professional environment for everyone. 
        </p>
        <p>
          If your prompt contains violence, inappropriate material, explicit adult content, or highly sensitive political figures, the strict automated content filters will immediately block the generation. When this happens, you will see a "Generation Failed" or "Service Unavailable" message. 
        </p>
        <p>
          If you encounter this error, simply adjust your prompt to remove any potentially sensitive words or overly suggestive descriptions, and try again. Keeping your prompts clean and focused on artistic, cinematic, or professional subjects ensures 100% success rate.
        </p>

        <hr className="my-12 border-slate-200 dark:border-white/10" />

        <div className="bg-slate-100 dark:bg-slate-800/50 p-8 rounded-3xl text-center">
          <h3 className="mt-0 font-black text-slate-900 dark:text-white">Ready to Start Directing?</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Now that you understand the mechanics of text-to-video, image-to-video, and how to string clips together, the only limit is your imagination.
          </p>
          <Link href="/tools?cat=video" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-500/25 active:scale-95">
            Open Video Studio
          </Link>
        </div>

      </div>
    </div>
  );
}
