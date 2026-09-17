import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { VerdictHomeNav } from "@/components/layout/VerdictHomeNav";
import "@/styles/home.css";

export const metadata: Metadata = {
  title: { absolute: "VerdictED" },
  description: "Real student reviews without rankings, PR, or institutional influence.",
};

const reviewHref = "/review";

export default function HomePage() {
  return (
    <main className="verdict-home">
      <VerdictHomeNav />

      <section className="verdict-hero">
        <Image className="verdict-hero__collage" src="/home/hero-collage.png" alt="Students exposing misleading college claims" width={1636} height={961} priority />
        <div className="verdict-hero__copy">
          <h1>Our colleges are<br className="verdict-hero__mobile-break" /> sneaky about<br /> <em>The Truth</em></h1>
          <p>Rankings are rigged, bought, and outdated. So we built a place for real, uncensored student feedback to help each other.</p>
          <Link className="verdict-button" href={reviewHref}>Get the Truth Out</Link>
        </div>
        <Image className="verdict-hero__hat verdict-hero__decoration--desktop" src="/home/grad-cap.png" alt="" width={1386} height={1135} />
        <Image className="verdict-hero__mic verdict-hero__decoration--desktop" src="/home/mic-hand.png" alt="" width={1152} height={1366} />
        <div className="verdict-hero__mobile-decoration verdict-hero__mobile-mic" aria-hidden="true">
          <div><Image src="/home/mobile-mic.png" alt="" width={90} height={117} /></div>
        </div>
        <div className="verdict-hero__mobile-decoration verdict-hero__mobile-cap" aria-hidden="true">
          <div><Image src="/home/mobile-cap.png" alt="" width={92} height={142} /></div>
        </div>
      </section>

      <section className="verdict-how" id="how">
        <div className="verdict-how__steps"><h2>How this works</h2><ol><li>Select your institution</li><li>Channel your experience</li><li>Verify and publish</li></ol></div>
        <div className="verdict-how__promise">
          <Image className="verdict-how__ray" src="/home/how-ray-figma.svg" alt="" width={3321} height={1607} aria-hidden="true" />
          <div className="verdict-how__background-frame"><Image className="verdict-how__background--mobile" src="/home/how-mobile-background.png" alt="" width={360} height={580} loading="eager" aria-hidden="true" /></div>
          <Image className="verdict-how__hand" src="/home/how-hand.png" alt="" width={325} height={488} aria-hidden="true" />
          <Image className="verdict-how__art verdict-how__art--mobile" src="/home/how-mobile-magnifier.png" alt="" width={248} height={202} aria-hidden="true" />
          <Image className="verdict-how__divider" src="/home/how-mobile-divider.svg" alt="" width={312} height={1} aria-hidden="true" />
          <div className="verdict-how__promise-copy"><p>NO PAID RANKINGS</p><p>NO INSTITUTIONAL INFLUENCE</p><p>NO FLUFF, NO PR</p></div>
        </div>
      </section>

      <section className="verdict-public">
        <div className="verdict-public__inner">
          <div className="verdict-public__copy"><h2>But before we<br /><strong>Go public</strong></h2><p>..we want your help in collecting enough honest reviews to create our first list</p><Link className="verdict-button" href={reviewHref}>Start your review</Link></div>
          <div className="verdict-public__art">
            <Image className="verdict-public__tablet" src="/home/section-3-tablet.png" alt="VerdictED review form" width={809} height={640} />
            <Image className="verdict-public__mobile" src="/home/mobile-review-mockup.png" alt="VerdictED review form on a phone" width={332} height={389} />
          </div>
        </div>
        <div className="verdict-public__mic-frame" aria-hidden="true"><div><Image className="verdict-public__mic" src="/home/mic-hand.png" alt="" width={1152} height={1366} /></div></div>
      </section>

      <section className="verdict-reviews" id="reviews">
        <div className="verdict-reviews__inner">
          <h2>Reviews so far</h2>
          <div className="verdict-meter">
            <div className="verdict-meter__progress">
              <div className="verdict-meter__reflections" aria-hidden="true" />
              <div className="verdict-meter__count">
                <strong>1,201</strong>
                <span>Voices and counting</span>
              </div>
            </div>
            <b>3000</b>
            <span className="verdict-meter__divider" aria-hidden="true" />
          </div>
          <div className="verdict-reviews__notes">
            <p>Why 3000 reviews ?</p>
            <p>Because that&apos;s the smallest sample size we need for a definitive ranking list.</p>
          </div>
        </div>
      </section>

      <section className="verdict-reason" id="why">
        <div className="verdict-reason__inner">
          <div className="verdict-reason__visual"><Image src="/home/typewriter.png" alt="Student accounts typed on paper" width={540} height={881} /></div>
          <div className="verdict-reason__copy">
            <div className="verdict-reason__truth"><h2>Unfiltered truths,<br /> Zero marketing spin</h2><p>Real student accounts, published exactly as experienced.</p></div>
            <div className="verdict-reason__why"><h2>Why this matters?</h2><p>Higher education is a big, rigged ecosystem with deception delivered through marketing and advertising. Only we, the students, can hold them accountable.</p></div>
          </div>
        </div>
      </section>

      <section className="verdict-cta">
        <div className="verdict-cta__inner">
          <div className="verdict-cta__center">
            <div className="verdict-cta__paper-frame">
              <Image className="verdict-cta__paper verdict-cta__paper--desktop" src="/home/torn-cta.png" alt="" width={1254} height={1254} />
              <Image className="verdict-cta__paper verdict-cta__paper--mobile" src="/home/torn-cta-mobile.png" alt="" width={1024} height={1024} />
              <h2>What&apos;s your honest<br /><span>Verdict?</span></h2>
            </div>
            <Link className="verdict-button" href={reviewHref}>Submit your review</Link>
          </div>
          <div className="verdict-cta__megaphones" aria-hidden="true">
            <div className="verdict-cta__mega verdict-cta__mega--left"><Image src="/home/cta-megaphone.png" alt="" width={277} height={268} /></div>
            <div className="verdict-cta__mega verdict-cta__mega--right"><Image src="/home/cta-megaphone.png" alt="" width={277} height={268} /></div>
          </div>
        </div>
      </section>

      <section className="verdict-anon">
        <div className="verdict-anon__copy">
          <h2>Your name is optional<br /><span>Your perspective isn&apos;t</span></h2>
          <p>Post under your real name or complete anonymity. Your honesty protects the next applicant, not institutional PR.</p>
        </div>
        <div className="verdict-anon__crowd">
          <Image src="/home/crowd.png" alt="A crowd of students with one person highlighted" width={1723} height={913} />
        </div>
      </section>

      <footer className="verdict-footer">
        <div className="verdict-footer__inner">
          <div className="verdict-footer__top"><h2>Unbiased reviews<br /><span>Honest decisions</span></h2><div className="verdict-footer__divider" aria-hidden="true" /><div><nav aria-label="Footer"><a href="#how">How it works</a><a href="#why">Purpose</a><Link href={reviewHref}>Submit a Review</Link><a href="mailto:whatstheverdict.ed@gmail.com">Contact</a><Link href="/privacy">Privacy</Link><Link href="/terms">Terms &amp; Conditions</Link><Link href="/grievance">Grievance</Link></nav><p>© 2026 VerdictEd. A Platform for honest college reviews</p></div></div>
          <Image className="verdict-footer__wordmark" src="/home/footer-wordmark.svg" alt="" width={1200} height={290} aria-hidden="true" />
        </div>
      </footer>
    </main>
  );
}
