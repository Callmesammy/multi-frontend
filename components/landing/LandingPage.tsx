"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { Bebas_Neue, Manrope } from "next/font/google";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./LandingPage.module.css";

const displayFont = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const bodyFont = Manrope({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--font-body",
});

const metrics = ["12 tasks due", "06h 21m focus", "99.5% uptime"];

const steps = [
  {
    number: "1",
    title: "Set your team",
    text: "Invite people, assign roles, and get a clear workspace in under one minute.",
  },
  {
    number: "2",
    title: "Create tasks",
    text: "Capture work quickly with owners, priorities, and due dates that stay visible.",
  },
  {
    number: "3",
    title: "Ship faster",
    text: "Track progress and unblock teammates with one dashboard that everyone trusts.",
  },
];

const gallery = [
  {
    src: "/auth/login-bg.jpg",
    alt: "Focused desk workspace with laptop and warm lighting",
    tag: "focus mode",
  },
  {
    src: "/auth/signup-bg.jpg",
    alt: "Abstract colorful texture with vivid gradients",
    tag: "creative energy",
  },
];

export default function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

      intro
        .from("[data-anim='topbar']", {
          y: -36,
          opacity: 0,
          duration: 0.8,
        })
        .from(
          "[data-anim='hero-line']",
          {
            yPercent: 115,
            opacity: 0,
            stagger: 0.12,
            duration: 0.95,
          },
          "-=0.45"
        )
        .from(
          "[data-anim='hero-meta']",
          {
            y: 30,
            opacity: 0,
            duration: 0.65,
          },
          "-=0.65"
        )
        .from(
          "[data-anim='hero-video']",
          {
            y: 52,
            opacity: 0,
            scale: 0.94,
            duration: 0.84,
          },
          "-=0.62"
        )
        .from(
          "[data-anim='phone-card']",
          {
            y: 70,
            opacity: 0,
            stagger: 0.14,
            duration: 0.8,
          },
          "-=0.55"
        )
        .from(
          "[data-anim='media-card']",
          {
            y: 54,
            opacity: 0,
            stagger: 0.14,
            duration: 0.75,
          },
          "-=0.45"
        );

      gsap.to("[data-anim='pulse']", {
        scale: 1.08,
        repeat: -1,
        yoyo: true,
        duration: 1.4,
        ease: "sine.inOut",
      });

      gsap.to("[data-anim='video-glow']", {
        opacity: 0.75,
        scale: 1.1,
        repeat: -1,
        yoyo: true,
        duration: 2.2,
        ease: "sine.inOut",
      });

      gsap.utils.toArray<HTMLElement>("[data-anim='section']").forEach((section) => {
        gsap.from(section, {
          y: 80,
          opacity: 0,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
          },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-anim='media-parallax']").forEach((item) => {
        gsap.fromTo(
          item,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: "none",
            scrollTrigger: {
              trigger: item,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.65,
            },
          }
        );
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className={`${styles.page} ${displayFont.variable} ${bodyFont.variable}`}
    >
      <div className={styles.noise} />

      <header className={styles.topbar} data-anim="topbar">
        <p className={styles.brand}>hourly</p>
        <nav className={styles.actions}>
          <Link href="/login" className={styles.loginBtn}>
            Login
          </Link>
          <Link href="/register" className={styles.signupBtn}>
            Sign up
          </Link>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.kicker} data-anim="hero-meta">
            teamflow workspace for focused teams
          </p>

          <div className={styles.heroTop}>
            <div className={styles.wordStack}>
              <div className={styles.clip}>
                <h1 className={styles.word} data-anim="hero-line">
                  stay
                </h1>
              </div>
              <div className={styles.clip}>
                <h1 className={styles.word} data-anim="hero-line">
                  home
                </h1>
              </div>
              <div className={styles.clip}>
                <h1 className={styles.word} data-anim="hero-line">
                  and
                </h1>
              </div>
              <div className={styles.clip}>
                <h1 className={styles.word} data-anim="hero-line">
                  work
                </h1>
              </div>
              <div className={styles.clip}>
                <h1 className={styles.hourly} data-anim="hero-line">
                  hourly
                </h1>
              </div>
            </div>

            <article className={styles.heroVideoCard} data-anim="hero-video">
              <video
                className={styles.heroVideo}
                src="/landing/hero-loop.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
              />
              <div className={styles.heroVideoOverlay} />
              <span className={styles.videoGlow} data-anim="video-glow" />
              <p className={styles.heroVideoTag}>live motion</p>
              <p className={styles.heroVideoText}>organize work with clarity and momentum.</p>
            </article>
          </div>

          <p className={styles.copy} data-anim="hero-meta">
            Plan, assign, and deliver tasks with role-based control for fast moving
            teams.
          </p>

          <div className={styles.metricRow}>
            {metrics.map((item) => (
              <article key={item} className={styles.metricCard} data-anim="phone-card">
                <p className={styles.metricValue}>{item}</p>
                <p className={styles.metricMeta}>live team status</p>
              </article>
            ))}
          </div>

          <div className={styles.heroMedia}>
            {gallery.map((card) => (
              <article key={card.src} className={styles.mediaCard} data-anim="media-card">
                <div className={styles.mediaImageWrap}>
                  <Image
                    src={card.src}
                    alt={card.alt}
                    fill
                    className={styles.mediaImage}
                    data-anim="media-parallax"
                  />
                </div>
                <div className={styles.mediaGradient} />
                <p className={styles.mediaTag}>{card.tag}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.markSection} data-anim="section">
          <h2 className={styles.mark}>
            <span>1</span>
            <span className={styles.markAccent} data-anim="pulse">
              H
            </span>
          </h2>
        </section>

        <section className={styles.howTo} data-anim="section">
          <h2 className={styles.howHeading}>how to use hourly</h2>
          <div className={styles.stepsGrid}>
            {steps.map((step) => (
              <article key={step.number} className={styles.stepCard}>
                <p className={styles.stepNumber}>{step.number}</p>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepText}>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.visualBreak} data-anim="section">
          <div className={styles.visualImage}>
            <Image
              src="/auth/login-bg.jpg"
              alt="Desk setup with keyboard and monitor"
              fill
              className={styles.mediaImage}
              data-anim="media-parallax"
            />
          </div>
          <div className={styles.visualCopy}>
            <p className={styles.visualKicker}>beautifully simple workflow</p>
            <h3 className={styles.visualTitle}>one command center for your team</h3>
            <p className={styles.visualText}>
              Keep tasks, members, and permissions aligned in one place with a layout that
              stays clear as your team grows.
            </p>
          </div>
        </section>

        <section className={styles.ctaSection} data-anim="section">
          <h2 className={styles.freeHeadline}>oh, and it is free</h2>
          <p className={styles.freeCopy}>
            Start with your team today and scale when you are ready.
          </p>
          <Link href="/register" className={styles.ctaBtn}>
            Create free workspace
          </Link>
        </section>
      </main>
    </div>
  );
}
