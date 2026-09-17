import type { Metadata } from "next";
import Link from "next/link";

import "@/styles/legal.css";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How VerdictED collects, uses, and protects your data under applicable Indian law.",
};

const CONTACT_EMAIL = "whatstheverdict.ed@gmail.com";
const EFFECTIVE_DATE = "17 September 2026";

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <div className="legal-page__inner">
        <Link href="/" className="legal-page__back">
          ← Back to home
        </Link>

        <header className="legal-page__header">
          <p className="legal-page__eyebrow">VerdictED</p>
          <h1 className="legal-page__title">Privacy Policy</h1>
          <p className="legal-page__lede">
            How VerdictED collects, uses, and protects your data
          </p>
          <p className="legal-page__meta">Effective Date: {EFFECTIVE_DATE}</p>
        </header>

        <div className="legal-page__body">
          <section className="legal-page__section">
            <h2>1. Introduction</h2>
            <p>
              This Privacy Policy explains how VerdictED (&quot;we&quot;,
              &quot;us&quot;, &quot;our&quot;) collects, uses, discloses, and
              protects personal data in connection with the VerdictED website and
              mobile applications (the &quot;Platform&quot;). It is intended to
              comply with the Digital Personal Data Protection Act, 2023
              (&quot;DPDP Act&quot;) and other applicable Indian data protection
              law. By using the Platform, you consent to the practices described
              here.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>2. Data We Collect</h2>
            <h3>2.1 Information you provide directly</h3>
            <ul>
              <li>
                <strong>Account details:</strong> name (optional for anonymous
                posting), email address, password.
              </li>
              <li>
                <strong>Verification details:</strong> LinkedIn profile link,
                institutional email address, or supporting documents submitted
                for verification (e.g. staff ID, authorization letter for
                institution claims).
              </li>
              <li>
                <strong>Review content:</strong> ratings, written reviews,
                placement and salary figures you choose to disclose, and any
                replies or flags you submit.
              </li>
            </ul>
            <h3>2.2 Information collected automatically</h3>
            <ul>
              <li>
                <strong>Device and usage data:</strong> IP address, browser type,
                device identifiers, pages visited, and timestamps, collected for
                security, spam prevention, and analytics.
              </li>
              <li>
                Cookies and similar technologies, as described in Section 7.
              </li>
            </ul>
          </section>

          <section className="legal-page__section">
            <h2>3. How We Use Your Data</h2>
            <ul>
              <li>
                To operate the Platform, including publishing reviews, displaying
                trust badges, and enabling institution replies.
              </li>
              <li>
                To verify user identity and prevent fraudulent, duplicate, or
                coordinated fake reviews.
              </li>
              <li>
                To enforce rate limits and detect abuse (maximum submission
                limits per account within a given time window).
              </li>
              <li>
                To investigate and resolve disputes flagged by institutions or
                users, as described in our{" "}
                <Link href="/grievance">Grievance Redressal Policy</Link>.
              </li>
              <li>
                To communicate with you about your account, moderation decisions,
                or platform updates.
              </li>
              <li>
                To comply with legal obligations, including responding to lawful
                requests from courts or government authorities.
              </li>
            </ul>
          </section>

          <section className="legal-page__section">
            <h2>4. Legal Basis and Consent</h2>
            <p>
              We process personal data on the basis of your consent at the point
              of account creation or content submission, and, where applicable,
              for the performance of our{" "}
              <Link href="/terms">Terms and Conditions</Link> with you, or to
              comply with a legal obligation. You may withdraw consent at any
              time by contacting us, though this may limit or end your ability to
              use certain features of the Platform, including previously
              published content that we are entitled to retain as described in
              Section 6.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>5. Anonymity and Pseudonymous Posting</h2>
            <p>
              VerdictED allows users to submit reviews without displaying their
              name publicly. However, &quot;anonymous&quot; posting refers to
              public display only: we retain account-level identifying and
              verification information internally, which may be disclosed in the
              limited circumstances described in Section 8 (including confirmed
              cases of harassment, fraud, or abuse, or where required by law),
              even where a review is displayed publicly without a name.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>5A. Log Retention (CERT-In Compliance)</h2>
            <p>
              In accordance with the Indian Computer Emergency Response Team
              (CERT-In) Directions of April 2022 issued under Section 70B(6) of
              the Information Technology Act, 2000, VerdictED retains user
              registration and login logs, including IP addresses, timestamps, and
              account creation/verification records, for a minimum of 180 days.
              These logs are retained specifically so that, if lawfully compelled
              by a court or authorized government agency, VerdictED can identify
              the account holder behind a pseudonymous or &quot;Unverified&quot;
              review — this underpins the integrity of our anonymity model:
              public anonymity does not mean the Platform itself cannot identify
              a poster internally or on lawful demand.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>6. Data Retention</h2>
            <p>
              We retain account and review data for as long as your account is
              active and the content remains relevant to the Platform&apos;s
              purpose. Where a review is hidden or removed from public view
              following a dispute, we retain it in our internal records,
              accessible only to authorized administrators, unless deletion is
              required by law, court order, regulatory obligation, or a confirmed
              case of harassment, abuse, or fraud, consistent with our{" "}
              <Link href="/grievance">Grievance Redressal Policy</Link>.
              Verification documents (such as institutional proof) are retained
              only as long as necessary to establish and maintain trust-tier
              status, or as required by law.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>7. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies for authentication, session
              management, fraud/rate-limit detection, and analytics. You can
              control cookies through your browser settings; disabling certain
              cookies may affect Platform functionality.
            </p>
            <p>
              A detailed cookie table (name, purpose, and duration) will be
              published here once analytics tooling is finalized.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>8. Sharing and Disclosure</h2>
            <ul>
              <li>
                <strong>With institutions:</strong> only the content and trust
                badge you choose to publish; we do not disclose your private
                account identity to an institution unless you consent or the
                disclosure is required under this Section 8.
              </li>
              <li>
                <strong>With service providers:</strong> hosting, analytics, and
                verification providers acting on our instructions and under
                confidentiality obligations.
              </li>
              <li>
                <strong>For legal reasons:</strong> where required by law, court
                order, or governmental authority, or to establish, exercise, or
                defend legal claims, or in confirmed cases of harassment, abuse,
                or fraud.
              </li>
              <li>
                <strong>Business transfers:</strong> in connection with a merger,
                acquisition, or sale of assets, subject to equivalent privacy
                protections.
              </li>
            </ul>
            <p>We do not sell personal data to third parties.</p>
          </section>

          <section className="legal-page__section">
            <h2>9. Your Rights</h2>
            <p>
              Subject to applicable law, you may have the right to: access the
              personal data we hold about you; request correction of inaccurate
              data; request erasure of your personal data (subject to our
              retention obligations under Section 6); withdraw consent; and file
              a complaint with us or the relevant Data Protection Board. To
              exercise these rights, contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>10. Children&apos;s Data</h2>
            <p>
              The Platform is not intended for use by individuals under 16 years
              of age without parental or guardian consent, where required by
              applicable law. We do not knowingly collect personal data from
              children in violation of applicable law. If you believe a
              child&apos;s data has been submitted without appropriate consent,
              contact us for removal.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>11. Data Security</h2>
            <p>
              We implement reasonable technical and organizational measures to
              protect personal data against unauthorized access, alteration,
              disclosure, or destruction. No system is completely secure, and we
              cannot guarantee absolute security of data transmitted to or stored
              on the Platform.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>12. International Data Transfers</h2>
            <p>
              Personal data is primarily processed and stored in India. Where
              data is transferred to service providers outside India, we take
              reasonable steps to ensure an equivalent level of protection
              consistent with the DPDP Act and applicable government
              notifications.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>13. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Material
              changes will be notified through the Platform. Continued use after
              such notice constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>14. Contact and Grievance Officer</h2>
            <p>
              For privacy-related queries, contact{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. For
              content moderation and grievance matters, refer to our{" "}
              <Link href="/grievance">Grievance Redressal Policy</Link>, which
              names our designated Grievance Officer.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
