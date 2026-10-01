"use client";

import { useState } from "react";
import { Check, Sparkles, Video, Mail, Phone, User, Send, CheckCircle2 } from "lucide-react";
import AdBanner from "../components/AdBanner";
import Link from "next/link";

export default function ServicesPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    requirements: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate sending data or we can integrate a real endpoint later
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: "", email: "", whatsapp: "", requirements: "" });
    }, 1500);
  };

  const services = [
    {
      name: "Ad-Free Experience",
      icon: <Sparkles className="w-5 h-5 text-primary" />,
      desc: "Enjoy an uninterrupted creative workflow without any advertisements.",
      features: [
        "100% Ad-Free Experience across entire site",
        "Faster page loading times",
        "Clean, distraction-free interface",
        "Supports platform development"
      ],
      ctaText: "Get Ad-Free",
      ctaHref: "/signup?plan=tools",
      highlight: false,
    },
    {
      name: "Video Generation Tokens",
      icon: <Video className="w-5 h-5 text-white" />,
      desc: "Unlock advanced AI models for your own video generation needs.",
      features: [
        "Access to advanced Veo models",
        "High Definition (720p & 1080p)",
        "Priority queue processing",
        "Save generations in library"
      ],
      ctaText: "Buy Tokens",
      ctaHref: "/signup?plan=pro",
      highlight: true,
      badge: "Self-Service",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary uppercase tracking-wider">
          Our Services
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight mt-4 mb-4">
          Services We Provide
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Explore our offerings, from self-service video generation tokens to full-service custom video creation tailored to your exact needs.
        </p>
      </div>

      {/* Services Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
        {services.map((s: any, idx: number) => (
          <div
            key={idx}
            className={`rounded-2xl p-6 md:p-8 flex flex-col justify-between transition-all relative ${
              s.highlight
                ? "glass-card border-2 border-primary shadow-[0_0_30px_rgba(139,92,246,0.2)]"
                : "border border-border/50 bg-card/40"
            }`}
          >
            {s.highlight && s.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                {s.badge}
              </div>
            )}

            <div>
              <div className="mb-6 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.highlight ? 'bg-primary' : 'bg-primary/10'}`}>
                  {s.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground">{s.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6 min-h-[40px]">{s.desc}</p>

              <div className="space-y-3 mb-8 border-t border-border/40 pt-6">
                {s.features.map((f: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-foreground/90">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href={s.ctaHref}
              className={`w-full py-3 rounded-xl font-medium text-sm text-center transition-all ${
                s.highlight
                  ? "bg-primary hover:bg-primary-hover text-white shadow-md shadow-primary/30"
                  : "border border-border/60 bg-background/80 hover:bg-background text-foreground"
              }`}
            >
              {s.ctaText}
            </Link>
          </div>
        ))}
      </div>

      {/* Custom Video Generation Service Form Section */}
      <div className="max-w-4xl mx-auto glass-card rounded-2xl p-6 sm:p-10 border border-primary/30 mb-12 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 blur-3xl rounded-full translate-y-1/2 -translate-x-1/3"></div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Custom Video Generation Service</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Need a professional video tailored to your specific requirements? Our team of experts will create exactly what you need. Provide us with your details and requirements, and we'll get back to you with custom rates and a timeline.
            </p>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-sm text-foreground/90">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  1
                </div>
                <span>Tell us your idea and requirements</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-foreground/90">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  2
                </div>
                <span>Receive custom rates and timeline</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-foreground/90">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  3
                </div>
                <span>We generate and deliver your video</span>
              </li>
            </ul>
          </div>

          <div className="bg-background/60 backdrop-blur-sm p-6 rounded-xl border border-border/50">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10 space-y-4">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Request Sent!</h3>
                <p className="text-sm text-muted-foreground">
                  Thank you for your interest. We will contact you via email or WhatsApp shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-4 py-2 bg-secondary/20 hover:bg-secondary/30 text-secondary-foreground text-xs font-medium rounded-lg transition-colors"
                >
                  Send another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground mb-4">Request a Quote</h3>

                <div>
                  <label htmlFor="name" className="block text-xs font-medium text-foreground mb-1.5">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-foreground mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="whatsapp" className="block text-xs font-medium text-foreground mb-1.5">
                    WhatsApp Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="tel"
                      id="whatsapp"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="requirements" className="block text-xs font-medium text-foreground mb-1.5">
                    Video Requirements
                  </label>
                  <textarea
                    id="requirements"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow resize-none"
                    placeholder="Tell us about the video you want us to create..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">Submitting...</span>
                  ) : (
                    <>
                      <span>Send Request</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <AdBanner slotId="services-bottom-ad" format="horizontal" />
    </div>
  );
}
