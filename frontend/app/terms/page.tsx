import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service, Acceptable Use Policy, and Legal Agreements for Botock.app.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="flex-1 flex flex-col py-12 bg-white dark:bg-[#0a0a0c]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-8">
          Terms of Service
        </h1>

        <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed space-y-6">
          <p className="font-semibold text-slate-500 dark:text-slate-400">
            Last Updated: October 5, 2026
          </p>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using the Botock platform located at{" "}
              <a href="https://botock.app" className="text-primary hover:underline">
                https://botock.app
              </a>{" "}
              (&quot;Botock,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;) and our Privacy Policy. If you do not agree to these Terms, you may not access or use our services or tools.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">
              2. Description of Services
            </h2>
            <p>
              Botock provides a unified creative operating suite consisting of generative AI tools (AI Video Generator, AI Image Generator), media manipulation utilities (Video Editor, Trim, Audio Extraction), and in-browser document processing tools (PDF Merge, PDF to Word, Image Converters).
            </p>
            <p>
              Standard multimedia utilities operate on client-side sandboxes (via WebAssembly and browser APIs) ensuring your personal files never leave your device without explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">
              3. User Accounts and Verification
            </h2>
            <p>
              Certain advanced generative features and quota allocations require account registration. You agree to provide accurate, current, and complete information during registration and to maintain the security of your authentication credentials. You are responsible for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">
              4. Acceptable Use and Content Policies
            </h2>
            <p>You agree not to use Botock to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Generate, upload, or disseminate harmful, unlawful, defamatory, abusive, or sexually explicit material.</li>
              <li>Violate any third-party intellectual property, privacy, or publicity rights.</li>
              <li>Attempt to reverse-engineer, exploit, or bypass platform quota enforcement or security controls.</li>
              <li>Deploy automated scrapers, bots, or unauthorized API querying against our infrastructure.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">
              5. Intellectual Property and Generations
            </h2>
            <p>
              As between you and Botock, you retain ownership of the original input media and prompts you provide. To the extent permitted by applicable law, you own the creative outputs generated through your lawful use of the platform, subject to third-party model licensing constraints where applicable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">
              6. Disclaimers and Limitation of Liability
            </h2>
            <p>
              The services and tools are provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, whether express or implied. Botock does not warrant that the tools will be uninterrupted, error-free, or completely secure. In no event shall Botock be liable for indirect, incidental, special, consequential, or punitive damages arising out of your access to or use of the services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">
              7. Refunds and Cancellation Policy
            </h2>
            <p>
              All purchases of platform credits, generative tokens, and custom digital development services are governed by our formal{" "}
              <Link href="/refund" className="text-violet-600 dark:text-violet-400 font-bold hover:underline">
                Refund &amp; Cancellation Policy
              </Link>
              . Unused accidental purchases reported within 7 days with zero consumption are eligible for full refund. Consumed generation credits, usage exceeding the 20% quota threshold, or custom client engineering projects that have progressed beyond initial planning approval are strictly non-refundable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">
              8. Contact and Inquiries
            </h2>
            <p>
              If you have any questions regarding these Terms of Service or wish to file a notice of infringement, please reach out to our legal and support team:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Support &amp; Services:</strong>{" "}
                <a href="mailto:services@botock.app" className="text-primary hover:underline">
                  services@botock.app
                </a>
              </li>
              <li>
                <strong>Complaints &amp; Legal:</strong>{" "}
                <a href="mailto:complaint@botock.app" className="text-primary hover:underline">
                  complaint@botock.app
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
