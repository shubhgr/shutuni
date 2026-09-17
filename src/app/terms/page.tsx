import type { Metadata } from "next";
import Link from "next/link";

import "@/styles/legal.css";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Terms and Conditions governing your use of the VerdictED platform.",
};

const CONTACT_EMAIL = "whatstheverdict.ed@gmail.com";
const EFFECTIVE_DATE = "17 September 2026";

export default function TermsPage() {
  return (
    <div className="legal-page">
      <div className="legal-page__inner">
        <Link href="/" className="legal-page__back">
          ← Back to home
        </Link>

        <header className="legal-page__header">
          <p className="legal-page__eyebrow">VerdictED</p>
          <h1 className="legal-page__title">Terms and Conditions</h1>
          <p className="legal-page__lede">
            Governing your use of the VerdictED platform
          </p>
          <p className="legal-page__meta">Effective Date: {EFFECTIVE_DATE}</p>
        </header>

        <div className="legal-page__body">
          <section className="legal-page__section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              These Terms and Conditions (&quot;Terms&quot;) govern access to and
              use of the VerdictED website, mobile applications, and related
              services (collectively, the &quot;Platform&quot;), operated by
              VerdictED (&quot;VerdictED&quot;, &quot;we&quot;, &quot;us&quot;,
              &quot;our&quot;). You must affirmatively accept these Terms
              (including by checking the &quot;I agree to the Terms and Grievance
              Redressal Policy&quot; box at account creation or first review
              submission) before you may create an account or submit content.
              Passive browsing of publicly available pages does not, by itself,
              constitute acceptance of these Terms for the purpose of this
              Section, but any submission of content, creation of an account, or
              claim of an institution listing does. If you do not agree, you must
              not use the Platform.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>2. Eligibility</h2>
            <p>
              The Platform is intended for use by individuals who are at least 16
              years of age. By using the Platform you represent that you meet this
              requirement and, where you are between 16 and 18 years of age, that
              you have the consent of a parent or guardian where required by
              applicable law.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>3. Nature of the Platform</h2>
            <p>
              VerdictED is a user-generated review and information platform for
              colleges and universities. Reviews, ratings, salary figures, and
              placement data displayed on the Platform are submitted by students,
              alumni, and other users and reflect individual, subjective
              experiences. VerdictED does not independently verify the factual
              accuracy of user-submitted content beyond the identity-verification
              checks described in our Community Guidelines and Trust &amp;
              Verification practices.
            </p>
            <p>
              Content drawn from official sources (such as NIRF, NAAC, NBA, or
              UGC) is presented for reference and comparison purposes and is
              attributed to its respective source. VerdictED does not guarantee
              that official data is current, complete, or error-free, and
              disclaims responsibility for inaccuracies in third-party data.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>4. User Accounts and Verification</h2>
            <p>
              Users may interact with the Platform anonymously, as a logged-in
              unverified user, or as a verified student/alumnus, as described in
              our Community Guidelines.
            </p>
            <p>
              Verification (including via LinkedIn profile linkage or
              institutional email) is a trust signal, not a guarantee of identity
              or accuracy, and VerdictED reserves the right to revoke a verified
              badge at any time if verification is found to be false or
              fraudulent.
            </p>
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials and for all activity under your account.
            </p>
            <p>
              You may not create multiple accounts to circumvent rate limits,
              moderation, or verification checks, or to post coordinated or
              fraudulent reviews.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>5. User Content and License</h2>
            <p>
              &quot;User Content&quot; means any review, rating, comment, reply,
              or other material submitted to the Platform. You retain ownership of
              your User Content. By submitting User Content, you grant VerdictED a
              worldwide, non-exclusive, royalty-free, sub-licensable, and
              transferable license to host, store, reproduce, display, distribute,
              and adapt that content for the purpose of operating, promoting, and
              improving the Platform, including in aggregated or anonymized form,
              for so long as the content remains on the Platform or is retained in
              accordance with our data retention practices.
            </p>
            <p>You represent and warrant that your User Content:</p>
            <ul>
              <li>
                (a) reflects your genuine, good-faith experience or knowledge;
              </li>
              <li>
                (b) does not infringe any third party&apos;s intellectual
                property, privacy, or other rights;
              </li>
              <li>
                (c) is not defamatory, threatening, harassing, obscene, or
                unlawful; and
              </li>
              <li>
                (d) does not contain confidential information you are not
                authorized to disclose.
              </li>
            </ul>
          </section>

          <section className="legal-page__section">
            <h2>6. Content Standards and Moderation</h2>
            <p>
              VerdictED reserves the right, but does not assume the obligation, to
              review, moderate, hide, or remove User Content that violates these
              Terms, our Community Guidelines, or applicable law, or that is
              flagged through our dispute resolution process. Voluntary moderation
              action taken in response to a user or institution complaint is a
              good-faith trust-and-safety measure and is distinct from, and does
              not itself constitute, an admission of editorial control over content
              for the purpose of intermediary status under Section 79 of the
              Information Technology Act, 2000. Moderation decisions made in this
              manner are final and binding within the Platform&apos;s internal
              process, without prejudice to any party&apos;s legal rights.
            </p>
            <p>
              Prohibited content includes, without limitation: defamatory or
              knowingly false statements of fact about identifiable individuals
              (an offence under Section 356 of the Bharatiya Nyaya Sanhita, 2023,
              and actionable in civil law); hate speech; harassment or threats;
              content violating a third party&apos;s privacy (including personal
              contact details); impersonation; spam or coordinated inauthentic
              behavior; and content that is unlawful under Indian law, including
              the Information Technology Act, 2000 and rules made thereunder.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>7. Institution Rights</h2>
            <p>
              Institutions that claim their listing (subject to verification) may
              edit factual, institution-controlled information (such as course
              lists, fee structures, and official placement data as published by
              the institution), publicly reply to reviews, and flag reviews for
              moderator attention through the dispute resolution process described
              in our{" "}
              <Link href="/grievance">Grievance Redressal Policy</Link>.
              Institutions may not delete, alter, or suppress student- or
              alumni-submitted reviews or ratings, and no payment or commercial
              relationship with VerdictED confers any such right.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>8. Disclaimers</h2>
            <p className="legal-page__disclaimer">
              THE PLATFORM AND ALL CONTENT ARE PROVIDED &quot;AS IS&quot; AND
              &quot;AS AVAILABLE,&quot; WITHOUT WARRANTIES OF ANY KIND, WHETHER
              EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF ACCURACY, COMPLETENESS,
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR
              NON-INFRINGEMENT. VERDICTED DOES NOT ENDORSE, AND IS NOT RESPONSIBLE
              FOR, THE ACCURACY OR RELIABILITY OF ANY USER CONTENT, INCLUDING
              PLACEMENT RATES, SALARY FIGURES, OR OTHER DATA REPORTED BY USERS.
              ANY DECISION MADE IN RELIANCE ON CONTENT AVAILABLE ON THE PLATFORM
              IS MADE AT THE USER&apos;S OWN RISK, AND WE STRONGLY RECOMMEND
              CROSS-VERIFYING MATERIAL DECISIONS (SUCH AS COLLEGE ADMISSION)
              AGAINST MULTIPLE SOURCES.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, VerdictED, its
              officers, employees, and affiliates shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages,
              or any loss of profits, data, goodwill, or opportunity, arising out
              of or related to your use of the Platform or reliance on any content
              available on it, whether based on contract, tort, or any other legal
              theory, even if advised of the possibility of such damages.
              VerdictED&apos;s aggregate liability for any claim arising out of
              these Terms shall not exceed INR 5,000 or the amount paid by you to
              VerdictED in the preceding 12 months, if any, whichever is higher.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>10. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless VerdictED and its officers,
              employees, and affiliates from any claim, demand, loss, or damage,
              including reasonable legal fees, arising out of: (a) your User
              Content; (b) your violation of these Terms; or (c) your violation of
              any third party&apos;s rights.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>11. Intellectual Property</h2>
            <p>
              The Platform&apos;s design, branding, software, and compiled
              database (excluding individual User Content) are the property of
              VerdictED and are protected by applicable intellectual property
              laws. You may not copy, scrape, reverse-engineer, or create
              derivative works from the Platform without prior written consent,
              except as permitted by applicable law.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>12. Suspension and Termination</h2>
            <p>
              VerdictED may suspend or terminate a User&apos;s access to the
              Platform, with or without notice, for violation of these Terms,
              suspected fraud or abuse, or at our discretion where reasonably
              necessary to protect the integrity of the Platform. Sections
              relating to User Content licensing, disclaimers, limitation of
              liability, indemnification, and dispute resolution survive
              termination.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>13. Governing Law and Jurisdiction</h2>
            <p>
              These Terms are governed by the laws of India. Subject to the
              grievance redressal process described in our{" "}
              <Link href="/grievance">Grievance Redressal Policy</Link>, the
              courts at Gurgaon, Haryana shall have exclusive jurisdiction over
              any dispute arising out of or relating to these Terms or the
              Platform.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>14. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. Material changes will
              be notified through the Platform or by other reasonable means, and
              will take effect from the date specified in the notice. Continued
              use of the Platform after changes take effect constitutes acceptance
              of the revised Terms.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>15. Contact</h2>
            <p>
              For questions about these Terms, contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. For
              content-related complaints, see our{" "}
              <Link href="/grievance">Grievance Redressal Policy</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
