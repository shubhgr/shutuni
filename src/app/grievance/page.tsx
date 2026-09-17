import type { Metadata } from "next";
import Link from "next/link";

import "@/styles/legal.css";

export const metadata: Metadata = {
  title: "Grievance Redressal Policy",
  description:
    "How to raise content and platform complaints with VerdictED.",
};

const CONTACT_EMAIL = "whatstheverdict.ed@gmail.com";
const EFFECTIVE_DATE = "17 September 2026";

export default function GrievancePage() {
  return (
    <div className="legal-page">
      <div className="legal-page__inner">
        <Link href="/" className="legal-page__back">
          ← Back to home
        </Link>

        <header className="legal-page__header">
          <p className="legal-page__eyebrow">VerdictED</p>
          <h1 className="legal-page__title">Grievance Redressal Policy</h1>
          <p className="legal-page__lede">
            How to report content issues and other platform complaints
          </p>
          <p className="legal-page__meta">Effective Date: {EFFECTIVE_DATE}</p>
        </header>

        <div className="legal-page__body">
          <section className="legal-page__section">
            <h2>1. Purpose</h2>
            <p>
              This Grievance Redressal Policy explains how users, institutions,
              and other affected persons can report content or conduct on
              VerdictED that they believe violates our{" "}
              <Link href="/terms">Terms and Conditions</Link>, Community
              Guidelines, or applicable law, including the Information Technology
              Act, 2000 and rules made thereunder.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>2. Grievance Officer</h2>
            <p>
              Complaints may be sent to our designated contact for grievance
              redressal:
            </p>
            <ul>
              <li>
                Email:{" "}
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </li>
              <li>Subject line: &quot;Grievance — VerdictED&quot;</li>
            </ul>
            <p>
              Please include: (a) your name and contact email; (b) the URL or
              other identifier of the content or account at issue; (c) a clear
              description of the concern; and (d) any supporting material.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>3. Process and timelines</h2>
            <p>
              We will acknowledge receipt of a complete complaint as soon as
              reasonably practicable. We aim to examine and act on grievances in
              good faith within timelines consistent with applicable Indian
              intermediary guidelines, typically acknowledging within 24 hours
              where required and disposing of the complaint within 15 days, or
              such other period as the law may prescribe.
            </p>
            <p>
              Possible outcomes include removing or hiding content, requesting
              clarification, declining action where the complaint is incomplete or
              unfounded, or referring the matter for further review. Voluntary
              moderation in response to a complaint is a trust-and-safety measure
              and does not, by itself, constitute an admission of editorial
              control for intermediary-status purposes.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>4. Institution disputes</h2>
            <p>
              Institutions that have claimed their listing may flag reviews for
              moderator attention through this process. Claiming a listing does
              not confer a right to delete, alter, or suppress student- or
              alumni-submitted reviews or ratings.
            </p>
          </section>

          <section className="legal-page__section">
            <h2>5. Related policies</h2>
            <p>
              This policy should be read with our{" "}
              <Link href="/terms">Terms and Conditions</Link> and{" "}
              <Link href="/privacy">Privacy Policy</Link>. Nothing in this policy
              limits any party&apos;s legal rights before a court of competent
              jurisdiction in Gurgaon, Haryana, as set out in the Terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
