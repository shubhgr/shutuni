import Image from "next/image";
import Link from "next/link";

import { LandingFooter } from "@/components/layout/LandingFooter";
import { buttonVariants } from "@/components/ui/button";

import "@/styles/landing.css";

export default function LandingHomePage() {
  return (
    <div className="landing">
      <section className="landing__hero">
        <div className="landing__hero-visual">
          <Image
            className="landing__hero-collage"
            src="/lpImage/figma/hero-collage-exact.png"
            alt="Students exposing overhyped placements, fake facilities, and broken college promises"
            width={1636}
            height={961}
            sizes="(max-width: 700px) 125vw, 971px"
            preload
          />
        </div>

        <div className="landing__hero-heading">
          <h1 className="landing__headline">
            Every college has a story they won&apos;t tell. We let
            <span>Students Talk</span>
          </h1>
        </div>

        <div className="landing__hero-details">
          <div className="landing__hero-side">
            <Image
              className="landing__hero-hat"
              src="/lpImage/figma/hero-hat-exact.png"
              alt=""
              width={310}
              height={293}
              sizes="200px"
            />
          </div>
          <div className="landing__hero-inner">
            <p className="landing__support">
              Institutions lie. Marketing hides the truth. VoiceCheck is the
              unsponsored, unvarnished public record of what actually happens
              on campus.
            </p>
            <div className="landing__cta-row">
              <Link href="/review" className={buttonVariants({ size: "lg" })}>
                Add your Review
              </Link>
            </div>
          </div>
          <div className="landing__hero-side">
            <Image
              className="landing__hero-hand"
              src="/lpImage/figma/hero-fist-exact.png"
              alt=""
              width={207}
              height={318}
              sizes="200px"
            />
          </div>
        </div>
        <div className="landing__hero-tear" aria-hidden="true">
          <Image
            src="/lpImage/figma/hero-tear-exact.png"
            alt=""
            fill
            sizes="111vw"
          />
        </div>
      </section>

      <section className="landing__purpose" id="voice">
        <h2 className="landing__purpose-title">Our Purpose</h2>

        <div className="landing__purpose-burst" aria-hidden="true">
          <div className="landing__purpose-ray landing__purpose-ray--truth">
            <Image
              src="/lpImage/figma/purpose-strip.png"
              alt=""
              fill
              sizes="80vw"
            />
            <span>JUST THE TRUTH</span>
          </div>
          <div className="landing__purpose-ray landing__purpose-ray--rankings">
            <Image
              src="/lpImage/figma/purpose-strip.png"
              alt=""
              fill
              sizes="85vw"
            />
            <span>NO PAID RANKINGS</span>
          </div>
          <div className="landing__purpose-ray landing__purpose-ray--brochures">
            <Image
              src="/lpImage/figma/purpose-strip.png"
              alt=""
              fill
              sizes="90vw"
            />
            <span>NO BROCHURES</span>
          </div>
          <div className="landing__purpose-ray landing__purpose-ray--students">
            <Image
              src="/lpImage/figma/purpose-strip.png"
              alt=""
              fill
              sizes="100vw"
            />
            <span>REAL STUDENTS REAL TALK</span>
          </div>
          <Image
            className="landing__purpose-face"
            src="/lpImage/figma/purpose-mouth.png"
            alt=""
            width={1024}
            height={682}
            sizes="(max-width: 700px) 180px, 340px"
          />
        </div>

        <p className="landing__purpose-copy">
          Forget the ranking.
          <br />
          Ask the ones who lived it.
        </p>
      </section>

      <section className="landing__community">
        <Image
          className="landing__community-top-paper"
          src="/lpImage/figma/community-top-paper.png"
          alt=""
          width={1024}
          height={120}
          sizes="100vw"
        />
        <h2 className="landing__community-title">Join the Community</h2>
        <div className="landing__community-panel">
          <Image
            src="/lpImage/figma/community-dark-paper.png"
            alt=""
            fill
            sizes="100vw"
          />
          <div className="landing__community-content">
            <p>
              Every review, every rant, every real story it all
              <br />
              adds up. Be part of the hundred.
            </p>
            <Link
              href="/review"
              className={buttonVariants({ size: "lg" })}
            >
              Add your Review
            </Link>
          </div>
        </div>
        <div className="landing__community-hands-wrap">
          <Image
            className="landing__community-hands"
            src="/lpImage/figma/community-hands-exact.png"
            alt=""
            width={1200}
            height={422}
            sizes="(max-width: 700px) 140vw, 1200px"
          />
        </div>
        <Image
          className="landing__community-roll"
          src="/lpImage/figma/community-roll.png"
          alt=""
          width={198}
          height={260}
          sizes="198px"
        />
      </section>

      <section className="landing__process" id="how">
        <h2>How the Process Works</h2>
        <Image
          className="landing__process-rope"
          src="/lpImage/figma/process-rope.png"
          alt=""
          width={1024}
          height={162}
          sizes="100vw"
        />
        <div className="landing__process-cards">
          <article className="landing__process-card landing__process-card--first">
            <Image
              src="/lpImage/figma/process-orange-card.png"
              alt=""
              fill
              sizes="(max-width: 700px) 260px, 24vw"
            />
            <div>
              <h3>Skip the 5-star theatre.</h3>
              <p>
                Tell us what actually happened the good, the bad, the boring
                parts nobody mentions.
              </p>
            </div>
          </article>
          <article className="landing__process-card landing__process-card--second">
            <Image
              src="/lpImage/figma/process-dark-card.png"
              alt=""
              fill
              sizes="(max-width: 700px) 260px, 24vw"
            />
            <div>
              <h3>Anonymous if you want.</h3>
              <p>
                Your name is optional. Your account isn&apos;t your identity.
                What&apos;s not optional is telling it straight.
              </p>
            </div>
          </article>
          <article className="landing__process-card landing__process-card--third">
            <Image
              src="/lpImage/figma/process-orange-card.png"
              alt=""
              fill
              sizes="(max-width: 700px) 260px, 24vw"
            />
            <div>
              <h3>We don&apos;t trickle. We arrive.</h3>
              <p>
                No soft launch, no slow drip of three reviews a week. We hit our
                number, and every voice goes live together.
              </p>
            </div>
          </article>
        </div>
        <div className="landing__process-tear" aria-hidden="true" />
      </section>

      <section className="landing__voices">
        <div
          className="landing__voices-tear landing__voices-tear--top"
          aria-hidden="true"
        />
        <div className="landing__voices-copy">
          <h2>3,000 voices and counting.</h2>
          <p>Yours is next</p>
        </div>
        <Link
          href="/review"
          className={`landing__voices-cta ${buttonVariants({ size: "lg" })}`}
        >
          Add your Review
        </Link>
        <div className="landing__voices-face landing__voices-face--left">
          <div className="landing__voices-face-crop">
            <Image
              src="/lpImage/figma/voices-mouth.png"
              alt=""
              width={1536}
              height={1024}
              sizes="260px"
            />
          </div>
        </div>
        <div className="landing__voices-face landing__voices-face--right">
          <div className="landing__voices-face-crop">
            <Image
              src="/lpImage/figma/voices-mouth.png"
              alt=""
              width={1536}
              height={1024}
              sizes="260px"
            />
          </div>
        </div>
        <div
          className="landing__voices-tear landing__voices-tear--bottom"
          aria-hidden="true"
        />
        <Image
          className="landing__voices-crowd"
          src="/lpImage/figma/voices-crowd-exact.png"
          alt=""
          width={1774}
          height={887}
          sizes="100vw"
        />
      </section>

      <section className="landing__invite">
        <div className="landing__invite-inner">
          <div className="landing__invite-warning">
            <Image
              src="/lpImage/figma/invite-warning-paper.png"
              alt=""
              fill
              sizes="(max-width: 700px) 110vw, 930px"
            />
            <h2>
              One voice is a rant.
              <br />
              A hundred is a warning
            </h2>
          </div>
          <div className="landing__invite-row">
            <Image
              className="landing__invite-megaphone landing__invite-megaphone--left"
              src="/lpImage/figma/megaphone.png"
              alt=""
              width={1024}
              height={900}
              sizes="277px"
            />
            <div className="landing__invite-content">
              <p>Copy below the Invite Link and Share it with your friends</p>
              <button type="button">Share</button>
            </div>
            <Image
              className="landing__invite-megaphone landing__invite-megaphone--right"
              src="/lpImage/figma/megaphone.png"
              alt=""
              width={1024}
              height={900}
              sizes="275px"
            />
          </div>
        </div>
        <div className="landing__invite-tear" aria-hidden="true" />
      </section>

      <LandingFooter />
    </div>
  );
}
