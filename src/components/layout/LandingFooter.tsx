import Image from "next/image";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="landing__figma-footer">
      <div className="landing__footer-inner">
        <div className="landing__footer-review">
          <div className="landing__footer-card">
            <Image
              src="/lpImage/figma/process-orange-card.png"
              alt=""
              fill
              sizes="243px"
            />
            <p>
              Write your Review
              <br />
              Raise your Voice
            </p>
          </div>

          <div className="landing__footer-links">
            <nav className="landing__footer-nav" aria-label="Footer navigation">
              <Link href="#how">How it works</Link>
              <Link href="#voice">Purpose</Link>
              <a href="mailto:hello@campusjanta.com">Contact</a>
              <Link href="/privacy">Privacy</Link>
            </nav>
            <p className="landing__footer-legal">
              © 2026 CampusJanta. By the students. For the students.
            </p>
          </div>
        </div>

        <div className="landing__footer-protest">
          <Image
            src="/lpImage/figma/footer-crowd.png"
            alt="Students raising their voices together"
            width={1535}
            height={1024}
            sizes="621px"
          />
        </div>
      </div>
    </footer>
  );
}
