import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import "@/styles/home.css";

export const metadata: Metadata = {
  title: "ShutUni Home | Honest college reviews",
  description:
    "When college marketing spins the truth Megaphone. Uncensored student feedback — no paid rankings, no institutional PR.",
};

export default function HomePage() {
  return (
    <div className="suhome-frame">
      <section className="suhome__hero-fold">
        <div className="suhome__hero-fold-collage-wrap">
          <div className="suhome__hero-fold-collage">
            <Image
              src="/home/hero-collage.png"
              alt="Students calling out overhyped placements, fake facilities, and broken promises"
              width={1636}
              height={961}
              sizes="(max-width: 1440px) 100vw, 1440px"
              preload
            />
            <div className="suhome__hero-fold-collage-fade" aria-hidden="true" />
          </div>
        </div>

        <div className="suhome__hero-fold-copy">
          <h1>
            <span className="suhome__hero-fold-line">When college marketing</span>
            <span className="suhome__hero-fold-line">spins the truth</span>
            <span className="suhome__hero-fold-accent">
              STUDENTS SET IT STRAIGHT
            </span>
          </h1>
          <p>
            Mainstream rankings are rigged, bought, and outdated. So we
            <br />
            built a place for real, uncensored student feedback to help
            <br />
            future students see the truth.
          </p>
          <Link href="/review" className="suhome__btn suhome__btn--orange">
            Add your Review
          </Link>
        </div>

        <div className="suhome__hero-fold-props" aria-hidden="true">
          <div className="suhome__hero-fold-cap-wrap">
            <Image
              className="suhome__hero-fold-cap"
              src="/home/grad-cap.png"
              alt=""
              width={350}
              height={287}
              sizes="350px"
            />
          </div>
        </div>
        <Image
          className="suhome__hero-fold-mic"
          src="/home/mic-hand.png"
          alt=""
          width={226}
          height={268}
          sizes="226px"
        />
      </section>

      <div className="suhome">
        <section className="suhome__pillars" id="pillars">
          <div className="suhome__pillars-orange" aria-hidden="true">
            <Image
              className="suhome__pillars-orange-desktop"
              src="/home/pillars-orange.svg"
              alt=""
              fill
              sizes="100vw"
            />
            <Image
              className="suhome__pillars-orange-mobile"
              src="/home/pillars-orange-mobile.svg"
              alt=""
              width={1034}
              height={623}
              sizes="100vw"
            />
          </div>

          <Image
            className="suhome__pillars-mega suhome__pillars-mega--desktop"
            src="/home/mega-side.png"
            alt=""
            width={601}
            height={511}
            sizes="601px"
          />
          <Image
            className="suhome__pillars-mega suhome__pillars-mega--mobile"
            src="/home/pillars-mega-mobile.png"
            alt=""
            width={230}
            height={209}
            sizes="230px"
          />

          <div className="suhome__pillars-inner">
            <div className="suhome__pillars-head">
              <p className="suhome__pillars-label">Our Pillars</p>
              <div className="suhome__pillars-titles">
                <p>NO PAID RANKINGS</p>
                <p>No Institutional Influence</p>
                <p>No Fluff, No PR</p>
              </div>
            </div>

            <div className="suhome__pillars-copies">
              <p>
                Universities cannot claim, alter, or negotiate student
                submissions.
              </p>
              <span className="suhome__pillars-divider" aria-hidden="true" />
              <p>
                Institutions cannot buy visibility, inflate metrics, or scrub
                genuine critique.
              </p>
              <span className="suhome__pillars-divider" aria-hidden="true" />
              <p>
                Institutions cannot buy visibility, inflate metrics, or scrub
                genuine critique.
              </p>
            </div>
          </div>
        </section>

        <section className="suhome__process" id="how">
          <div className="suhome__process-inner">
            <h2>
              How the Process
              <br />
              works
            </h2>

            <div className="suhome__process-track">
              <div
                className="suhome__process-line suhome__process-line--desktop"
                aria-hidden="true"
              >
                <Image
                  src="/home/process-line.svg"
                  alt=""
                  width={3935}
                  height={381}
                  sizes="1440px"
                />
              </div>
              <div
                className="suhome__process-line suhome__process-line--mobile"
                aria-hidden="true"
              >
                <Image
                  src="/home/process-line-mobile.svg"
                  alt=""
                  width={754}
                  height={203}
                  sizes="200px"
                />
              </div>

              <div className="suhome__step suhome__step--one">
                <span className="suhome__step-num">01</span>
                <p>
                  Select your
                  <br />
                  institution
                </p>
              </div>

              <div className="suhome__step suhome__step--two">
                <span className="suhome__step-num">02</span>
                <p>
                  Channel your
                  <br />
                  experience
                </p>
              </div>

              <div className="suhome__step suhome__step--three">
                <p>
                  Verify and
                  <br />
                  publish
                </p>
                <span className="suhome__step-num">03</span>
              </div>
            </div>
          </div>
        </section>

        <section className="suhome__record">
          <Image
            className="suhome__mic suhome__mic--record"
            src="/home/mic-hand.png"
            alt=""
            width={239}
            height={283}
            sizes="239px"
          />

          <div className="suhome__record-inner">
            <div className="suhome__record-copy">
              <h2>
                Set the record
                <span>Straight</span>
              </h2>
              <p>
                Share your authentic campus experience and guide the next
                incoming class.
              </p>
              <Link href="/review" className="suhome__btn suhome__btn--white">
                Start Your Review
              </Link>
            </div>

            <div className="suhome__tablet-wrap">
              <Image
                className="suhome__record-cap"
                src="/home/grad-cap.png"
                alt=""
                width={207}
                height={170}
                sizes="207px"
              />
              <div className="suhome__tablet">
                <Image
                  src="/home/tablet.png"
                  alt="Review form preview"
                  width={709}
                  height={532}
                  sizes="(max-width: 700px) 90vw, 709px"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="suhome__anon">
          <div className="suhome__anon-inner">
            <div className="suhome__anon-head">
              <div className="suhome__anon-copy">
                <h2>
                  Your name is optional
                  <span>Your perspective isn&apos;t.</span>
                </h2>
              </div>
              <p className="suhome__anon-note">
                Post under your real name or complete anonymity. Your honesty
                protects the next applicant, not institutional PR.
              </p>
            </div>
            <div className="suhome__anon-crowd-wrap">
              <Image
                className="suhome__section-art suhome__anon-crowd"
                src="/home/crowd.png"
                alt="A crowd of students, with one voice standing out"
                fill
                sizes="100vw"
                quality={90}
              />
            </div>
          </div>
        </section>

        <section className="suhome__truths">
          <div className="suhome__truths-inner">
            <div className="suhome__typewriter-wrap">
              <Image
                className="suhome__typewriter"
                src="/home/typewriter.png"
                alt="Typed student reviews coming off a typewriter"
                width={498}
                height={839}
                sizes="(max-width: 700px) 90vw, 498px"
              />
            </div>
            <div className="suhome__truths-copy">
              <div className="suhome__truths-copy-top">
                <h2>Unfiltered truths. Zero marketing spin.</h2>
                <p>Real student accounts, published exactly as experienced.</p>
              </div>
              <div className="suhome__truths-copy-bottom">
                <h2>Real feedback recorded</h2>
                <p className="suhome__count">
                  <strong>3,102 </strong>
                  reviews
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="suhome__voices" aria-labelledby="suhome-voices-heading">
          <div className="suhome__voices-inner">
            <div className="suhome__voices-banner">
              <div className="suhome__voices-tear" aria-hidden="true">
                <Image
                  src="/home/torn-cta.png"
                  alt=""
                  width={1254}
                  height={1254}
                  sizes="1200px"
                />
              </div>
              <div className="suhome__voices-copy">
                <h2 id="suhome-voices-heading">3,000 voices and counting.</h2>
                <p className="suhome__voices-badge">Yours is next</p>
              </div>
            </div>

            <div className="suhome__voices-megas" aria-hidden="true">
              <Image
                className="suhome__voices-mega suhome__voices-mega--left"
                src="/home/voices-mega.png"
                alt=""
                width={226}
                height={178}
                sizes="226px"
              />
              <Image
                className="suhome__voices-mega suhome__voices-mega--right"
                src="/home/voices-mega.png"
                alt=""
                width={239}
                height={178}
                sizes="239px"
              />
            </div>

            <Link
              href="/review"
              className="suhome__btn suhome__btn--orange suhome__btn--light-shadow"
            >
              Submit your review
            </Link>
          </div>
        </section>

        <footer className="suhome__footer">
          <div className="suhome__footer-inner">
            <div className="suhome__footer-copy">
              <h2 className="suhome__footer-title">
                Unbiased Reviews. <span>Honest Decisions.</span>
              </h2>
              <div className="suhome__footer-line" aria-hidden="true" />
              <div className="suhome__footer-meta">
                <nav className="suhome__footer-nav" aria-label="Footer">
                  <Link href="#how">How it works</Link>
                  <Link href="#pillars">Purpose</Link>
                  <Link href="/review">Submit a Review</Link>
                  <Link href="/privacy">Privacy</Link>
                  <Link href="/terms">Terms &amp; Conditions</Link>
                </nav>
                <p className="suhome__footer-legal">
                  © 2026 CampusJanta. By the students. For the students.
                </p>
              </div>
            </div>
            <div className="suhome__footer-keyboard">
              <Image
                src="/home/footer-keyboard.png"
                alt=""
                width={471}
                height={471}
                sizes="471px"
              />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
