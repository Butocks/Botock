import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Edit3, Image as ImageIcon, Video, FileText, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us: The Story Behind Botock",
  description:
    "Learn about Botock's mission to make generative AI video and creative multimedia tools universally accessible, private, and easy to use.",
  alternates: {
    canonical: "/blog/about-botock-app",
  },
  openGraph: {
    title: "About Us: The Story Behind Botock | Botock Blog",
    description:
      "Learn about Botock's mission to make generative AI video and creative multimedia tools universally accessible.",
    url: "https://botock.app/blog/about-botock-app",
    type: "article",
    publishedTime: "2026-10-04T00:00:00Z",
    authors: ["Boto"],
    images: ["https://botock.app/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us: The Story Behind Botock | Botock Blog",
    description:
      "Learn about Botock's mission to make generative AI video and creative multimedia tools universally accessible.",
    images: ["https://botock.app/og-image.jpg"],
  },
};

export default function AboutBotockApp() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: "About Us: The Story Behind Botock",
        description:
          "Botock was created by Boto with a simple idea: creative technology should be easier to access.",
        author: {
          "@type": "Person",
          name: "Boto",
        },
        datePublished: "2026-10-04",
        publisher: {
          "@type": "Organization",
          name: "Botock",
          logo: {
            "@type": "ImageObject",
            url: "https://botock.app/logo.png",
          },
        },
        mainEntityOfPage: "https://botock.app/blog/about-botock-app",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://botock.app",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: "https://botock.app/blog",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "About Botock",
            item: "https://botock.app/blog/about-botock-app",
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header */}
      <div className="w-full bg-white dark:bg-[#111114] border-b border-slate-200 dark:border-white/10 px-6 py-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
        <div className="max-w-4xl mx-auto">
          <Link href="/blog" className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-amber-500 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Blog
          </Link>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
            About Us: The Story Behind Botock
          </h1>
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <span>By Boto</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>October 4, 2026</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12 prose dark:prose-invert prose-slate prose-headings:font-black prose-a:text-amber-500 hover:prose-a:text-amber-400">
        
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 lead">
          Botock was created by Boto with a simple idea: creative technology should be easier to access.
        </p>

        <p>
          Today, creating content is no longer limited to large companies with production teams, expensive software, and professional equipment. AI has made many parts of the creative process possible for individuals, creators, small businesses, and anyone with an idea.
        </p>
        <p>But there is still a problem.</p>
        <p>Having access to AI does not automatically mean knowing how to use it well.</p>
        <p>
          Generating a video is one thing. Creating a video that actually looks good, follows a clear idea, has the right visual direction, feels consistent, and is useful for a real audience is something else entirely.
        </p>
        <p>That is the space where I wanted to build Botock.</p>
        <p>
          Botock is my attempt to make AI-powered content creation more accessible while also building a place where people can eventually get professional creative work done for them.
        </p>

        <hr className="my-10 border-slate-200 dark:border-white/10" />

        <h2>Who Is Boto?</h2>
        <p>I use <strong>Boto</strong> as my creative name and identity.</p>
        <p>
          I am interested in AI, digital content creation, video generation, editing, and the practical ways these technologies can help people create things that would otherwise require considerably more time, technical knowledge, or resources.
        </p>
        <p>
          Over time, I have developed my own workflow for working with AI to create and improve digital content.
        </p>
        <p>
          I have learned that the difference between simply asking an AI to generate something and actually producing a useful result often comes from how the tools are used, how the content is directed, how problems are handled, and how the final result is refined.
        </p>
        <p>That experience is one of the main reasons Botock exists.</p>

        <hr className="my-10 border-slate-200 dark:border-white/10" />

        <h2>What Does Botock Provide?</h2>
        <p>Botock is being developed around a collection of AI-powered creative and productivity services.</p>
        <p>The platform can be used for different types of digital content, including:</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8 not-prose">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
            <Video className="w-8 h-8 text-amber-500 mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Video Generation</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Users can create AI-generated videos from their ideas and prompts. The goal is not simply to generate something random. It is to help turn an idea into a piece of content that can actually be used for social media, projects, storytelling, or marketing.
            </p>
          </div>
          
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
            <Edit3 className="w-8 h-8 text-blue-500 mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Video Editing</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Video generation is only one part of content creation. Botock also focuses on editing, allowing users to work with existing videos and turn raw footage into more useful and polished content.
            </p>
          </div>
          
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
            <ImageIcon className="w-8 h-8 text-emerald-500 mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Photo Editing & AI Content</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Images are just as important as videos. Botock provides tools and workflows for image editing and AI-generated visual content without needing a complete professional editing setup.
            </p>
          </div>
          
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
            <FileText className="w-8 h-8 text-purple-500 mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">PDF & Document Tools</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Content creation does not always mean video. Botock also includes tools designed to help users work with PDFs and digital documents, making common tasks easier.
            </p>
          </div>
        </div>

        <h3>📝 Documentary & Scriptwriting</h3>
        <p>
          A good video often starts before the camera, editor, or AI generator is ever involved. It starts with an idea and a script.
        </p>
        <p>
          Botock is also intended to support documentary-style content, storytelling, research-based scripts, and other forms of written content that can eventually become videos or other media.
        </p>
        <p>
          These services are part of a larger goal: <strong>to give users a place where different parts of the content creation process can be handled together.</strong>
        </p>

        <hr className="my-10 border-slate-200 dark:border-white/10" />

        <h2>Why Am I Providing These Services for Free?</h2>
        <p>This is an important part of the Botock story.</p>
        <p>
          The services currently being made available are <strong>free for a limited period</strong>. They are not being presented as a promise that everything will remain free forever.
        </p>
        <p>I am making them available freely because I want people to actually use them.</p>
        <ul className="space-y-2">
          <li><CheckCircle2 className="inline-block w-4 h-4 text-amber-500 mr-2"/>There are creators who have ideas but do not have expensive software.</li>
          <li><CheckCircle2 className="inline-block w-4 h-4 text-amber-500 mr-2"/>There are people trying to grow a social media channel who cannot afford to hire an editor.</li>
          <li><CheckCircle2 className="inline-block w-4 h-4 text-amber-500 mr-2"/>There are small businesses that need content but do not have a production team.</li>
          <li><CheckCircle2 className="inline-block w-4 h-4 text-amber-500 mr-2"/>And there are simply people who want to experiment with AI without immediately paying for another subscription.</li>
        </ul>
        <p>I want those people to have an opportunity to create.</p>
        <p>
          If someone can use a Botock tool to make a video, improve a photo, create content for their social media page, or turn an idea into something they can publish, then the platform has already served a useful purpose.
        </p>
        <p>
          The current free availability is therefore an <strong>introductory opportunity to use Botock while it is being developed and expanded.</strong>
        </p>

        <hr className="my-10 border-slate-200 dark:border-white/10" />

        <h2>Can These Tools Guarantee Your Social Media Growth?</h2>
        <p>No.</p>
        <p>And I do not want to make that promise.</p>
        <p>
          A better video can help a creator present their ideas more professionally. Better content can improve consistency, experimentation, and the overall quality of a social media presence. But no tool can honestly guarantee followers, views, or viral success.
        </p>
        <p>Your audience, topic, consistency, distribution, timing, and the quality of your ideas still matter.</p>
        <p>What Botock can do is help reduce one of the biggest barriers:</p>
        <p className="text-xl font-black text-center my-6 text-amber-500">
          The difficulty of producing the content itself.
        </p>
        <p>
          If you have an idea but creating the video is the part stopping you, Botock is designed to help you get past that obstacle.
        </p>

        <hr className="my-10 border-slate-200 dark:border-white/10" />

        <h2>Why Not Just Give Everyone the Tools?</h2>
        <p>Because using a tool and having someone do the work for you are two different things.</p>
        <p>A creator may be perfectly happy generating one or two videos themselves. But imagine a business that needs:</p>
        <ul>
          <li>multiple videos every week</li>
          <li>social media content</li>
          <li>promotional visuals</li>
          <li>edited footage</li>
          <li>AI-generated scenes</li>
          <li>product images</li>
          <li>documentary-style videos</li>
          <li>scripts and research</li>
          <li>large amounts of content produced consistently</li>
        </ul>
        <p>
          At that point, simply giving someone a tool may not be enough. They have a business to run. They may not have the time to learn every AI workflow, solve every generation problem, edit every result, check every output, and repeat the process dozens of times.
        </p>
        <p><strong>That is where professional content services become valuable.</strong></p>

        <hr className="my-10 border-slate-200 dark:border-white/10" />

        <h2>From Free Tools to Professional Services</h2>
        <p>Botock's free tools are one side of what I am building.</p>
        <p>
          The other side is a future professional service where users can come to me with a requirement and have the work created for them.
        </p>
        <p>Instead of learning how to generate and edit everything themselves, a client could say:</p>
        <blockquote className="border-l-4 border-amber-500 pl-4 italic text-slate-600 dark:text-slate-400 bg-amber-500/5 py-2 px-4 rounded-r-lg my-4">
          "I need a professional video for my channel."
        </blockquote>
        <p>Or:</p>
        <blockquote className="border-l-4 border-amber-500 pl-4 italic text-slate-600 dark:text-slate-400 bg-amber-500/5 py-2 px-4 rounded-r-lg my-4">
          "I need several videos for my business."
        </blockquote>
        <p>Or:</p>
        <blockquote className="border-l-4 border-amber-500 pl-4 italic text-slate-600 dark:text-slate-400 bg-amber-500/5 py-2 px-4 rounded-r-lg my-4">
          "I need a documentary-style video with a script, visuals, editing, and final production."
        </blockquote>
        <p>
          The goal is to take that requirement and handle the creative production process. This is especially useful for people who need more than a single generation and want <strong>consistency, quality, direction, and professional handling.</strong>
        </p>

        <hr className="my-10 border-slate-200 dark:border-white/10" />

        <h2>Why I Want to Work With Future Clients</h2>
        <p>The ultimate purpose of building Botock is not simply to collect users.</p>
        <p>I want to build relationships with people and businesses that genuinely need creative production.</p>
        <p>
          The free tools give people a chance to experience what is possible. They also give me the opportunity to demonstrate the workflows and skills I have developed.
        </p>
        <p>
          If a creator uses Botock today to make a few videos and later needs someone to produce twenty, fifty, or more pieces of content professionally, that relationship can naturally grow into a client relationship.
        </p>
        <p>That is the direction I want to build toward.</p>
        <p className="text-lg font-bold text-amber-500 text-center my-6">
          The free service is the starting point. Professional work is the long-term opportunity.
        </p>

        <hr className="my-10 border-slate-200 dark:border-white/10" />

        <h2>Why AI?</h2>
        <p>AI has changed the creative process dramatically.</p>
        <p>But I do not see AI as a replacement for creativity. I see it as a tool.</p>
        <p>
          The same AI system can produce a poor result in one person's hands and a much better result in another's because the workflow, instructions, selection, editing, and decision-making are different.
        </p>
        <p>
          I have spent time learning how to work with these systems and how to combine AI generation with editing and creative direction. That is one of the skills behind Botock.
        </p>
        <p>The objective is not simply:</p>
        <p className="font-bold text-center text-slate-500">"Let AI make something."</p>
        <p>It is:</p>
        <p className="font-bold text-center text-amber-500 text-xl">"Use AI intelligently to help create something useful."</p>

        <hr className="my-10 border-slate-200 dark:border-white/10" />

        <h2>What Happens When Free Access Ends?</h2>
        <p>Botock's current free availability is temporary.</p>
        <p>
          As the platform develops, some tools or services may move toward different plans, limits, or professional service options. The exact structure can evolve as the platform grows.
        </p>
        <p>What I do not want to do is make a false promise that everything will remain free forever.</p>
        <p>For now, the purpose is simple:</p>
        <p className="text-xl font-black text-center my-6 text-emerald-500">
          Use the platform. Experiment. Create something. See what is possible.
        </p>
        <p>
          And if you eventually need something beyond the self-service tools, professional content creation can become the next step.
        </p>

        <hr className="my-10 border-slate-200 dark:border-white/10" />

        <h2>More Than an AI Tool Website</h2>
        <p>I do not want Botock to become just another website filled with buttons that say "Generate."</p>
        <p>I want it to become a place where an idea can move through the entire creative process.</p>
        <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl my-6">
          <ul className="space-y-3 font-semibold text-slate-700 dark:text-slate-300">
            <li>An idea can become a script.</li>
            <li>A script can become visuals.</li>
            <li>Visuals can become a video.</li>
            <li>A video can be edited.</li>
            <li>A finished piece can become content for a social media channel.</li>
          </ul>
        </div>
        <p>
          And when a user needs more than a tool can provide, there can be a person behind the process who can take responsibility for producing the work.
        </p>
        <p>That is the direction I am building toward.</p>

        <hr className="my-10 border-slate-200 dark:border-white/10" />

        <h2>My Purpose</h2>
        <p>My purpose with Botock is straightforward.</p>
        <p className="text-lg font-bold text-amber-500">
          I want to make high-quality digital content more accessible while building the skills, technology, and relationships needed to provide professional creative services.
        </p>
        <ul className="space-y-2 mt-6">
          <li>If you are a creator, I want Botock to help you create.</li>
          <li>If you are experimenting with AI, I want you to have a place to explore it.</li>
          <li>If you are building a social media channel, I want to make content production easier.</li>
          <li>If you are a business that eventually needs someone to handle the work professionally, I want Botock to grow into a service you can rely on.</li>
        </ul>
        <p>The platform may change.</p>
        <p>The tools will continue to improve.</p>
        <p>The technology will continue to evolve.</p>
        <p>But the basic idea will remain the same:</p>
        
        <div className="text-center p-8 mt-10 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
          <p className="text-2xl font-black text-slate-900 dark:text-white mb-4">
            You bring the idea. Botock helps turn it into something real.
          </p>
          <p className="text-xl font-bold text-amber-500">Welcome to Botock.</p>
          <p className="text-slate-500 mt-2">— Created by Boto.</p>
        </div>

      </div>
    </div>
  );
}
