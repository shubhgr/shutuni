"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const reviewHref = "/review";

export function VerdictHomeNav() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <header className="verdict-nav">
        <Link className="verdict-logo" href="/" aria-label="VerdictED home">
          <Image src="/home/header-logo.svg" alt="VerdictED" width={141} height={34} priority />
        </Link>
        <nav aria-label="Primary navigation">
          <a href="#how">How it works</a>
          <a href="#reviews">Reviews so far</a>
          <a href="#why">Why it matters?</a>
        </nav>
        <Link className="verdict-button verdict-nav__button" href={reviewHref}>Get the Truth Out</Link>
        <button
          className="verdict-menu"
          type="button"
          aria-label="Open navigation"
          aria-expanded={isOpen}
          aria-controls="verdict-mobile-navigation"
          onClick={() => setIsOpen(true)}
        >
          <Image src="/home/menu-icon.svg" alt="" width={24} height={24} aria-hidden="true" />
        </button>
      </header>

      <div
        className={`verdict-mobile-menu-layer${isOpen ? " verdict-mobile-menu-layer--open" : ""}`}
        aria-hidden={!isOpen}
      >
          <button className="verdict-mobile-menu-backdrop" type="button" aria-label="Close navigation" onClick={closeMenu} />
          <div className="verdict-mobile-menu" id="verdict-mobile-navigation">
            <div className="verdict-mobile-menu__top">
              <Link className="verdict-mobile-menu__logo" href="/" aria-label="VerdictED home" onClick={closeMenu}>
                <Image src="/home/header-logo.svg" alt="VerdictED" width={84} height={20} />
              </Link>
              <button className="verdict-mobile-menu__close" type="button" aria-label="Close navigation" onClick={closeMenu}>
                <Image src="/home/menu-close.svg" alt="" width={24} height={24} aria-hidden="true" />
              </button>
            </div>
            <nav className="verdict-mobile-menu__links" aria-label="Mobile navigation">
              <a href="#how" onClick={closeMenu}>How it works</a>
              <span className="verdict-mobile-menu__divider" aria-hidden="true" />
              <a href="#reviews" onClick={closeMenu}>Reviews so far</a>
              <span className="verdict-mobile-menu__divider" aria-hidden="true" />
              <a href="#why" onClick={closeMenu}>Why it matters</a>
            </nav>
            <Link className="verdict-button verdict-mobile-menu__cta" href={reviewHref} onClick={closeMenu}>
              Get the Truth Out
            </Link>
          </div>
      </div>
    </>
  );
}
