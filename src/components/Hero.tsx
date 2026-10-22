import React, { useState } from "react";
import FluidBackground from "./FluidBackground";
import { Reveal, RevealWords } from "./Reveal";

const LINKS = [
  { label: "How it works?", href: "#how-it-works" },
  { label: "Pricing", href: "/" },
  { label: "Products", href: "#products" },
  { label: "Blog", href: "#blog" },
];

interface HeroProps {
  onGetStarted?: () => void;
}

export default function Hero({ onGetStarted }: HeroProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <section className="fs-hero">
      {/* 1. WebGL fluid (z-0) */}
      <FluidBackground />

      {/* 2. Scrim (z-1) */}
      <div className="fs-scrim" aria-hidden="true" />

      {/* 3. Nav (z-20) */}
      <Reveal as="header" delay={150} from="-0.75rem" className="fs-nav">
        <a href="/" className="fs-brand">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M2.5 9c2.5 0 2.5 4.2 5 4.2S10 9 12 9s2.5 4.2 5 4.2S19.5 9 21.5 9"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M2.5 15c2.5 0 2.5 4.2 5 4.2S10 15 12 15s2.5 4.2 5 4.2S19.5 15 21.5 15"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.5"
            />
          </svg>
          Flowstate
        </a>

        <nav className="fs-navpill">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <a
          href="#get-started"
          onClick={
            onGetStarted
              ? (e) => {
                  e.preventDefault();
                  onGetStarted();
                }
              : undefined
          }
          className="fs-pill"
        >
          Get Started
        </a>
      </Reveal>

      {/* 4. Center column (z-10) */}
      <div className="fs-col">
        <Reveal as="p" delay={320} from="1.25rem" className="fs-badge">
          10K+ already in flow
        </Reveal>

        <h1 className="fs-h1">
          <RevealWords
            text="Deep Work in a Distracted World"
            baseDelay={480}
            stagger={85}
            duration={720}
            fromY={26}
          />
        </h1>

        <p className="fs-sub">
          <RevealWords
            text="Cut through the noise, reclaim your attention, and do work that truly matters."
            baseDelay={1150}
            stagger={22}
            duration={600}
            fromY={14}
          />
        </p>

        <Reveal delay={1450} from="1.25rem" className="fs-formwrap">
          <form className="fs-form" onSubmit={handleSubmit}>
            <div className="fs-bar">
              <input
                className="fs-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={submitted ? "You're on the list!" : "Enter your email"}
              />
              <button type="submit" className="fs-pill">
                {submitted ? "Joined" : "Join Waitlist"}
              </button>
            </div>
          </form>
        </Reveal>
      </div>

      {/* 5. Footer (z-20) */}
      <Reveal as="footer" delay={1650} from="1.25rem" className="fs-footer">
        © 2026 Flowstate — engineered for deep work.
      </Reveal>
    </section>
  );
}
