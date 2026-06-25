import { useEffect, useMemo, useRef, useState } from 'react';
import {
  motion,
  useMotionTemplate,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';

import heroVideo from '../videos/hero.mp4';
import cinematicVideo from '../videos/cinematic-text.mp4';
import metricsVideo from '../videos/metrics.mp4';
import technologyVideo from '../videos/adaptive-intelligence.mp4';
import footerVideo from '../videos/footer.mp4';

const VIDEOS = {
  hero: heroVideo,
  cinematic: cinematicVideo,
  metrics: metricsVideo,
  technology: technologyVideo,
  footer: footerVideo,
};

const SCRAMBLE_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~|}{[]:;?><';

type ScrambleInProps = {
  text: string;
  delay: number;
  triggered: boolean;
};

function randomChar() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

function ScrambleIn({ text, delay, triggered }: ScrambleInProps) {
  const [display, setDisplay] = useState('\u00a0');

  useEffect(() => {
    if (!triggered) {
      setDisplay('\u00a0');
      return undefined;
    }

    let frame = 0;
    const timeout = window.setTimeout(() => {
      const interval = window.setInterval(() => {
        const revealCursor = frame * 0.5;

        setDisplay(
          text
            .split('')
            .map((char, index) => {
              if (char === ' ') return ' ';
              if (index < revealCursor) return char;
              if (index < revealCursor + 3) return randomChar();
              return '';
            })
            .join(''),
        );

        frame += 1;

        if (revealCursor >= text.length) {
          window.clearInterval(interval);
          setDisplay(text);
        }
      }, 25);
    }, delay);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [delay, text, triggered]);

  return <>{display}</>;
}

type ScrambleTextProps = {
  text: string;
  isHovered: boolean;
  className?: string;
};

function ScrambleText({ text, isHovered, className }: ScrambleTextProps) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (!isHovered) {
      setDisplay(text);
      return undefined;
    }

    let frame = 0;
    const interval = window.setInterval(() => {
      const revealCursor = Math.floor(frame / 4);

      setDisplay(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            return index <= revealCursor ? char : randomChar();
          })
          .join(''),
      );

      frame += 1;

      if (revealCursor >= text.length) {
        window.clearInterval(interval);
        setDisplay(text);
      }
    }, 25);

    return () => {
      window.clearInterval(interval);
    };
  }, [isHovered, text]);

  return <span className={className}>{display}</span>;
}

function BreakBuddyLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <rect x="4" y="3" width="5" height="18" rx="2.5" />
      <rect x="15" y="3" width="5" height="18" rx="2.5" />
    </svg>
  );
}

function SquashHamburger({
  open,
  mobile = false,
}: {
  open: boolean;
  mobile?: boolean;
}) {
  const barHeight = mobile ? 1.2 : 1.5;

  return (
    <span
      className="relative block"
      style={{ width: mobile ? 15 : 18, height: mobile ? 10 : 12 }}
    >
      {[0, 1, 2].map((bar) => (
        <motion.span
          key={bar}
          className="absolute left-0 w-full rounded-full bg-white"
          style={{ height: barHeight }}
          animate={
            bar === 0
              ? { top: open ? '50%' : 0, rotate: open ? 45 : 0, y: open ? '-50%' : 0 }
              : bar === 1
                ? {
                    top: '50%',
                    opacity: open ? 0 : 1,
                    scaleX: open ? 0 : 1,
                    y: '-50%',
                  }
                : {
                    bottom: open ? '50%' : 0,
                    rotate: open ? -45 : 0,
                    y: open ? '50%' : 0,
                  }
          }
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          initial={false}
        />
      ))}
    </span>
  );
}

function HoverScrambleButton({
  children,
  className,
  onClick,
}: {
  children: (hovered: boolean) => JSX.Element;
  className: string;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children(hovered)}
    </button>
  );
}

function scrollToSection(multiplier: number) {
  window.scrollTo({
    top: window.innerHeight * multiplier,
    behavior: 'smooth',
  });
}

function Navbar({ entranceComplete }: { entranceComplete: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [ctaHovered, setCtaHovered] = useState(false);

  const navItems = useMemo(
    () => [
      { label: 'How it works', section: 1 },
      { label: 'Features', section: 3 },
    ],
    [],
  );

  return (
    <motion.nav
      className="fixed left-0 top-0 z-50 h-20 w-full px-4 sm:px-6 md:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: entranceComplete ? 1 : 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="hidden h-full items-center justify-between sm:flex">
        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            className={`${menuOpen ? 'hidden md:flex' : 'flex'} h-12 items-center gap-2 rounded-[14px] bg-white/15 px-5 text-white backdrop-blur-md`}
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.22)' }}
            whileTap={{ scale: 0.98 }}
          >
            <BreakBuddyLogo className="h-[18px] w-[18px]" />
            <span className="text-[16px] font-medium tracking-tight">Break Buddy</span>
          </motion.button>

          <motion.div
            className="flex h-12 items-center overflow-hidden rounded-[14px] bg-white/15 backdrop-blur-md"
            animate={{ width: menuOpen ? 290 : 48 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            initial={false}
          >
            <button
              type="button"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className={`flex shrink-0 items-center justify-center transition-colors ${
                menuOpen
                  ? 'ml-1.5 h-9 w-9 rounded-[11px] bg-white/10 hover:bg-white/20'
                  : 'h-12 w-12 rounded-[14px]'
              }`}
              onClick={() => setMenuOpen((value) => !value)}
            >
              <SquashHamburger open={menuOpen} />
            </button>

            <motion.div
              className="ml-5 flex items-center gap-6 whitespace-nowrap"
              animate={{
                opacity: menuOpen ? 1 : 0,
                x: menuOpen ? 0 : 15,
                pointerEvents: menuOpen ? 'auto' : 'none',
              }}
              transition={{ duration: 0.25 }}
            >
              {navItems.map((item) => (
                <HoverScrambleButton
                  key={item.label}
                  className="text-[16px] font-normal text-white/85 transition-colors hover:text-white"
                  onClick={() => scrollToSection(item.section)}
                >
                  {(hovered) => <ScrambleText text={item.label} isHovered={hovered} />}
                </HoverScrambleButton>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <motion.a
          href="#install"
          className="flex h-12 items-center gap-2 rounded-full bg-white px-6 text-black"
          whileHover={{ scale: 1.03, backgroundColor: '#e2e2e6' }}
          whileTap={{ scale: 0.97 }}
          onMouseEnter={() => setCtaHovered(true)}
          onMouseLeave={() => setCtaHovered(false)}
        >
          <i className="bi bi-browser-chrome text-[17px]" aria-hidden="true" />
          <ScrambleText text="Add to Chrome" isHovered={ctaHovered} />
        </motion.a>
      </div>

      <div className="flex h-full items-center justify-between gap-2 sm:hidden">
        <motion.button
          type="button"
          className="flex h-9 shrink-0 items-center gap-2 overflow-hidden rounded-[10px] bg-white/15 px-3 text-white backdrop-blur-md"
          animate={{ width: menuOpen ? 0 : 'auto', paddingLeft: menuOpen ? 0 : 12, paddingRight: menuOpen ? 0 : 12 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          initial={false}
        >
          <BreakBuddyLogo className="h-[15px] w-[15px]" />
          <span className="text-[13px] font-medium tracking-tight">Break Buddy</span>
        </motion.button>

        <motion.div
          className="flex h-9 items-center overflow-hidden rounded-[10px] bg-white/15 backdrop-blur-md"
          animate={{ width: menuOpen ? '100%' : 36 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          initial={false}
        >
          <button
            type="button"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className={`flex shrink-0 items-center justify-center transition-colors ${
              menuOpen
                ? 'ml-1 h-7 w-7 rounded-[8px] bg-white/10 hover:bg-white/20'
                : 'h-9 w-9 rounded-[10px]'
            }`}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <SquashHamburger open={menuOpen} mobile />
          </button>

          <motion.div
            className="ml-4 flex items-center gap-4 whitespace-nowrap"
            animate={{
              opacity: menuOpen ? 1 : 0,
              x: menuOpen ? 0 : 15,
              pointerEvents: menuOpen ? 'auto' : 'none',
            }}
            transition={{ duration: 0.25 }}
          >
            {navItems.map((item) => (
              <HoverScrambleButton
                key={item.label}
                className="text-[13px] text-white/85 transition-colors hover:text-white"
                onClick={() => scrollToSection(item.section)}
              >
                {(hovered) => <ScrambleText text={item.label} isHovered={hovered} />}
              </HoverScrambleButton>
            ))}
          </motion.div>
        </motion.div>

        <motion.a
          href="#install"
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 text-[13px] text-black"
          whileHover={{ scale: 1.03, backgroundColor: '#e2e2e6' }}
          whileTap={{ scale: 0.97 }}
          onMouseEnter={() => setCtaHovered(true)}
          onMouseLeave={() => setCtaHovered(false)}
        >
          <i className="bi bi-browser-chrome text-[14px]" aria-hidden="true" />
          <ScrambleText text="Install" isHovered={ctaHovered} />
        </motion.a>
      </div>
    </motion.nav>
  );
}

function Hero({ entranceComplete }: { entranceComplete: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const targetTimeRef = useRef(0);
  const seekingRef = useRef(false);

  const requestSeek = () => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || seekingRef.current) return;

    seekingRef.current = true;
    video.currentTime = Math.min(Math.max(targetTimeRef.current, 0), video.duration);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration === 0) return;

    const deltaSeconds = (event.movementX / window.innerWidth) * video.duration * 0.8;
    targetTimeRef.current = Math.min(
      Math.max(targetTimeRef.current + deltaSeconds, 0),
      video.duration,
    );

    requestSeek();
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const handleSeeked = () => {
      const currentTarget = Math.min(
        Math.max(targetTimeRef.current, 0),
        Number.isFinite(video.duration) ? video.duration : 0,
      );

      seekingRef.current = false;

      if (Math.abs(video.currentTime - currentTarget) > 0.03) {
        requestSeek();
      }
    };

    video.addEventListener('seeked', handleSeeked);

    return () => {
      video.removeEventListener('seeked', handleSeeked);
    };
  }, []);

  return (
    <section
      className="relative flex h-screen h-[100dvh] overflow-hidden px-4 pb-8 pt-20 sm:px-6 sm:pb-12 sm:pt-24 md:px-8"
      onMouseMove={handleMouseMove}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src={VIDEOS.hero}
        playsInline
        muted
        preload="auto"
        onLoadedMetadata={(event) => {
          event.currentTarget.pause();
          event.currentTarget.currentTime = 0;
          targetTimeRef.current = 0;
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-black/20" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 select-none whitespace-nowrap text-center uppercase opacity-10"
        style={{
          transform: 'translate(-50%, calc(-50% + 50px))',
          fontFamily: '"Anton SC", sans-serif',
          fontSize: 'clamp(120px, 30vw, 521px)',
          letterSpacing: '-4px',
          background:
            'radial-gradient(circle, rgba(142,127,148,0) 0%, #8E7F94 70%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        REST
      </div>

      <motion.div
        className="relative z-10 flex min-h-0 w-full flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: entranceComplete ? 1 : 0 }}
        transition={{ duration: 1 }}
      >
        <div className="flex-1" />
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-4">
            <h1 className="text-[clamp(40px,10vw,100px)] font-light leading-[0.95] tracking-[-0.03em] text-white">
              <ScrambleIn text="Take A" delay={200} triggered={entranceComplete} />
              <br />
              <ScrambleIn text="Break" delay={500} triggered={entranceComplete} />
            </h1>
            <motion.p
              className="max-w-sm text-[13px] leading-relaxed text-white/60 sm:text-[15px]"
              initial={{ opacity: 0, y: 25 }}
              animate={entranceComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
              transition={{
                duration: 0.9,
                delay: 0.2,
                ease: [0.215, 0.61, 0.355, 1],
              }}
            >
              A Chrome extension that watches how long you browse, then replaces your screen with a
              cinematic break overlay until your timer runs out. Tab-aware. Zero willpower required.
            </motion.p>
          </div>

          <h1 className="text-left text-[clamp(40px,10vw,100px)] font-light leading-[0.95] tracking-[-0.03em] text-white md:text-right">
            <ScrambleIn text="Smart" delay={700} triggered={entranceComplete} />
            <br />
            <ScrambleIn text="Timer" delay={1000} triggered={entranceComplete} />
          </h1>
        </div>
      </motion.div>
    </section>
  );
}

function CinematicText() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 15,
    damping: 32,
    mass: 1.8,
  });
  const y = useTransform(smoothProgress, [0, 1], [60, -120]);
  const opacity = useTransform(smoothProgress, [0.3, 0.5], [0, 1]);
  const transform = useMotionTemplate`rotateX(24deg) translateY(${y}px) translateZ(15px)`;

  return (
    <section ref={sectionRef} className="relative h-screen h-[100dvh] overflow-hidden">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={VIDEOS.cinematic}
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-x-0 top-0 z-10 h-[180px] bg-[linear-gradient(to_bottom,#010103,transparent)]" />
      <div className="relative z-20 flex h-full items-center justify-center">
        <div className="max-w-5xl" style={{ perspective: 400 }}>
          <motion.p
            className="select-none px-6 text-center font-sans text-[22px] font-normal leading-[1.35] tracking-[-0.02em] text-white sm:px-12 sm:text-[30px] md:text-[36px] lg:text-[42px]"
            style={{ opacity, transform, transformStyle: 'preserve-3d' }}
          >
            A Chrome extension built for the moment you know you should stop scrolling — but won't.
            Break Buddy tracks focused time on the sites you choose, then takes over the tab with a
            full-screen break screen. Scrub the video. Watch the countdown. Step away. When the
            timer hits zero, browsing unlocks and the focus clock resets. No uploads. No accounts.
            Just friction when you need it most.
          </motion.p>
        </div>
      </div>
    </section>
  );
}

function Metrics() {
  const metrics = [
    ['10m', 'Default Focus Limit'],
    ['5m', 'Default Break Length'],
    ['0', 'Uploads Required'],
  ];

  return (
    <section className="relative min-h-screen overflow-hidden">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={VIDEOS.metrics}
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-32">
        <motion.p
          className="mb-20 text-center text-[13px] uppercase tracking-[0.2em] text-white/40 sm:text-[14px]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.2 }}
        >
          By The Numbers
        </motion.p>
        <div className="grid grid-cols-1 gap-16 text-center md:grid-cols-3 md:gap-8">
          {metrics.map(([value, label], index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
            >
              <div className="text-[clamp(48px,10vw,96px)] font-light leading-none tracking-[-0.04em] text-white">
                {value}
              </div>
              <div className="mt-4 text-[13px] tracking-wide text-white/40 sm:text-[15px]">
                {label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Technology() {
  const capabilities = [
    ['Tab-Aware Clock', 'Time only counts while the tab is active and focused — switch away and the timer pauses.'],
    ['Cinematic Break Screen', 'A hero-style overlay with scrubbable video, dot grid, and a large countdown timer.'],
    ['End Break Early', 'Open the extension popup and dismiss an active break instantly when you need to.'],
    ['Built-In Video', 'No uploads or setup — your break screen ships with a cinematic clip ready to go.'],
  ];

  return (
    <section className="relative flex h-screen h-[100dvh] overflow-hidden px-8 py-12 sm:px-12 sm:py-16 md:px-16">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={VIDEOS.technology}
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 flex min-h-0 w-full flex-col">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <motion.h2
            className="text-[clamp(36px,8vw,72px)] font-light leading-[0.95] tracking-[-0.03em] text-white"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1 }}
          >
            Smart
            <br />
            Breaks
          </motion.h2>
          <motion.p
            className="max-w-xs text-[13px] leading-relaxed text-white/50 sm:text-[15px] md:pt-2 md:text-right"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            Pick your sites, set your limits, and let Break Buddy enforce the pauses your future
            self will thank you for. A friction tool — not a lock — for healthier browsing.
          </motion.p>
        </div>

        <div className="flex-1" />

        <motion.div
          className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          {capabilities.map(([title, description], index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
            >
              <h3 className="mb-2 text-[14px] font-normal text-white sm:text-[16px]">
                {title}
              </h3>
              <p className="text-[12px] leading-relaxed text-white/40 sm:text-[14px]">
                {description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Architecture() {
  const layers = [
    ['Step 1', 'Load Unpacked'],
    ['Step 2', 'Add Sites'],
    ['Step 3', 'Take Breaks'],
  ];

  return (
    <section className="flex min-h-screen items-center justify-center bg-black px-6 py-32 text-center">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1 }}
        >
          <p className="mb-8 text-[13px] uppercase tracking-[0.2em] text-white/40 sm:text-[14px]">
            Install
          </p>
          <h2 className="mb-10 text-[clamp(28px,6vw,56px)] font-light leading-[1.15] tracking-[-0.02em] text-white">
            Three steps. Zero friction.
          </h2>
          <p className="mx-auto max-w-xl text-[15px] leading-relaxed text-white/45 sm:text-[17px]">
            Open chrome://extensions, enable Developer mode, and load the break-buddy folder.
            Add your sites in the popup, save, and reload any open tabs on those domains.
          </p>
        </motion.div>

        <motion.div
          className="mt-20 flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.2, delay: 0.4 }}
        >
          {layers.map(([layer, name]) => (
            <div
              key={layer}
              className="flex h-[72px] w-full max-w-md items-center justify-between rounded-lg border border-white/10 px-6"
            >
              <span className="text-[12px] uppercase tracking-[0.15em] text-white/30">
                {layer}
              </span>
              <span className="text-[16px] font-light text-white sm:text-[18px]">{name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="install" className="overflow-hidden bg-black">
      <div className="flex min-h-[400px] flex-col md:flex-row">
        <div className="h-[300px] md:h-auto md:w-1/2">
          <video
            className="h-full w-full object-cover"
            src={VIDEOS.footer}
            autoPlay
            muted
            loop
            playsInline
          />
        </div>
        <div className="flex flex-1 flex-col justify-between p-10 sm:p-16">
          <div>
            <div className="mb-8 flex items-center gap-2 text-white/70">
              <BreakBuddyLogo className="h-[18px] w-[18px]" />
              <span className="text-[15px] font-medium tracking-tight">Break Buddy</span>
            </div>
            <p className="max-w-sm text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              The cinematic break extension for Chrome. Built for anyone who keeps saying "five more
              minutes" and meaning fifty.
            </p>
            <ol className="mt-8 space-y-3 text-[13px] leading-relaxed text-white/45">
              <li>1. Open chrome://extensions</li>
              <li>2. Enable Developer mode → Load unpacked</li>
              <li>3. Select the break-buddy folder and save your sites</li>
            </ol>
          </div>
          <p className="mt-12 text-[12px] text-white/25">
            (c) 2026 Break Buddy. A friction tool for healthier browsing.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [entranceComplete, setEntranceComplete] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setEntranceComplete(true);
    }, 800);

    return () => {
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <main className="bg-black text-white" style={{ fontFamily: '"Space Mono", monospace' }}>
      <Navbar entranceComplete={entranceComplete} />
      <Hero entranceComplete={entranceComplete} />
      <CinematicText />
      <Metrics />
      <Technology />
      <Architecture />
      <Footer />
    </main>
  );
}
