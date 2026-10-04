import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Botock",
  description: "Privacy Policy and Legal Terms for Botock.app",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex-1 flex flex-col py-12 bg-white dark:bg-[#0a0a0c]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-8">
          Privacy Policy
        </h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed space-y-6">
          <p className="font-semibold">Last Updated: October 4, 2026</p>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">1. Introduction</h2>
            <p>
              Welcome to Botock.app ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice or our practices with regard to your personal information, please contact us at services@botock.app or complaint@botock.app.
            </p>
            <p>
              This Privacy Policy applies to all information collected through our website (https://botock.app), and/or any related services, sales, marketing, or events (we refer to them collectively in this Privacy Policy as the "Services").
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">2. Information We Collect</h2>
            <p>
              <strong>Personal Information You Disclose to Us:</strong> We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us. The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use.
            </p>
            <p>
              <strong>Information Automatically Collected:</strong> We automatically collect certain information when you visit, use, or navigate the Services. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our Services, and other technical information. This information is primarily needed to maintain the security and operation of our Services, and for our internal analytics and reporting purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">3. How We Use Your Information</h2>
            <p>
              We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations. We indicate the specific processing grounds we rely on next to each purpose listed below:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>To facilitate account creation and logon process.</li>
              <li>To post testimonials.</li>
              <li>Request feedback and to contact you about your use of our Services.</li>
              <li>To manage user accounts and keep them in working order.</li>
              <li>To protect our Services. We may use your information as part of our efforts to keep our Services safe and secure (for example, for fraud monitoring and prevention).</li>
              <li>To enforce our terms, conditions, and policies for business purposes, to comply with legal and regulatory requirements, or in connection with our contract.</li>
              <li>To respond to legal requests and prevent harm.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">4. Client-Side Processing & Privacy</h2>
            <p>
              Botock utilizes client-side technologies (e.g., WebAssembly, local browser APIs) for many of its utilities (PDF manipulation, image editing, etc.). This means your files are processed directly on your device, and the contents are never uploaded, stored, or transmitted to our servers. We cannot access, view, or retain your files processed in this manner, thereby guaranteeing maximum privacy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">5. Limitation of Liability and Legal Protection</h2>
            <p>
              To the maximum extent permitted by applicable law, in no event shall Botock.app, its affiliates, agents, directors, employees, suppliers, or licensors be liable for any direct, indirect, punitive, incidental, special, consequential, or exemplary damages, including without limitation damages for loss of profits, goodwill, use, data, or other intangible losses, arising out of or relating to the use of, or inability to use, this service.
            </p>
            <p>
              The Services are provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, either express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
            </p>
            <p>
              We make no warranty that the Services will meet your requirements, be safe, secure, uninterrupted, timely, accurate, or error-free, or that your information and data will be secure from unauthorized access or destruction.
            </p>
            <p>
              Any disputes arising from your use of the Services will be governed by the laws of the applicable jurisdiction, without regard to its conflict of law provisions. You agree to submit to the personal jurisdiction of the courts located in our respective jurisdiction for any actions for which we retain the right to seek injunctive or other equitable relief in a court of competent jurisdiction to prevent the actual or threatened infringement, misappropriation, or violation of our copyrights, trademarks, trade secrets, patents, or other intellectual property or proprietary rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">6. Sharing of Information</h2>
            <p>
              We only share and disclose your information in the following situations:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Compliance with Laws:</strong> We may disclose your information where we are legally required to do so in order to comply with applicable law, governmental requests, a judicial proceeding, court order, or legal process.</li>
              <li><strong>Vital Interests and Legal Rights:</strong> We may disclose your information where we believe it is necessary to investigate, prevent, or take action regarding potential violations of our policies, suspected fraud, situations involving potential threats to the safety of any person and illegal activities, or as evidence in litigation in which we are involved.</li>
              <li><strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">7. Data Retention</h2>
            <p>
              We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements). Generative media and files temporarily handled by our server infrastructure are subject to automated purging, typically within 24 hours, to enforce strict data hygiene.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">8. Security of Your Information</h2>
            <p>
              We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">9. Contact Us</h2>
            <p>
              If you have questions or comments about this notice, you may email us at:
            </p>
            <ul className="list-none space-y-1 mt-4">
              <li><strong>General Services & Support:</strong> services@botock.app</li>
              <li><strong>Complaints & Legal:</strong> complaint@botock.app</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
