'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import logoIcon from '@/assets/images/logo-icon.svg';
import logoIconDark from '@/assets/images/logo-icon-dark.svg';

interface NodeData {
  id: string;
  code: string;
  discipline: string;
  labelTop: string;
  labelSub: string;
  heading?: string;
  isOrange?: boolean;
  baseSize: number;
  // Stage 1 (Dispersed): coordinates as percentage of viewport (0-100)
  s1: { x: number; y: number };
  // Stage 2 (Connected Lattice): coordinates drifted inward
  s2: { x: number; y: number };
  // Stage 3 (Gravitational Orbital Convergence): tightly orbiting center (50, 46)
  s3: { x: number; y: number };
  badgeSub?: string;
}

const NODES: NodeData[] = [
  {
    id: '01',
    code: 'ACT',
    discipline: 'ACCOUNTING',
    labelTop: '● 01 / ACCOUNTING',
    labelSub: '.MOD: CORE.01',
    isOrange: false,
    baseSize: 66,
    s1: { x: 13, y: 26 },
    s2: { x: 18, y: 27 },
    s3: { x: 42, y: 32 },
    badgeSub: 'ACCOUNTING'
  },
  {
    id: '02',
    code: 'TAX',
    discipline: 'TAXATION',
    labelTop: '02 / TAXATION ●',
    labelSub: '.ALPHA ACTIVE',
    isOrange: true,
    baseSize: 84,
    s1: { x: 82, y: 26 },
    s2: { x: 77, y: 28 },
    s3: { x: 58, y: 29 },
    badgeSub: '02 // TAXATION'
  },
  {
    id: '03',
    code: 'FIN',
    discipline: 'FINANCE',
    labelTop: '03 / CORP_FIN',
    heading: 'Finance',
    labelSub: 'CAPITAL ENG.',
    isOrange: false,
    baseSize: 92,
    s1: { x: 10, y: 51 },
    s2: { x: 16, y: 50 },
    s3: { x: 64, y: 41 },
    badgeSub: 'FINANCE'
  },
  {
    id: '04',
    code: 'AUD',
    discipline: 'AUDIT',
    labelTop: '● 04 / AUDIT',
    labelSub: '',
    isOrange: false,
    baseSize: 54,
    s1: { x: 15, y: 79 },
    s2: { x: 19, y: 76 },
    s3: { x: 33, y: 43 },
    badgeSub: 'AUDIT'
  },
  {
    id: '05',
    code: 'CMP',
    discipline: 'COMPLIANCE',
    labelTop: '05 / COMPLIANCE',
    labelSub: 'REG_FRAME',
    isOrange: false,
    baseSize: 52,
    s1: { x: 28, y: 24 },
    s2: { x: 30, y: 26 },
    s3: { x: 34, y: 56 },
    badgeSub: 'COMPLIANCE'
  },
  {
    id: '06',
    code: 'ANL',
    discipline: 'ANALYTICS',
    labelTop: '06 / TELEMETRY',
    heading: 'Analytics',
    labelSub: 'STREAM READY',
    isOrange: true,
    baseSize: 86,
    s1: { x: 88, y: 49 },
    s2: { x: 83, y: 49 },
    s3: { x: 53, y: 64 },
    badgeSub: '06 // ANALYTICS'
  },
  {
    id: '07',
    code: 'BNK',
    discipline: 'BANKING',
    labelTop: '07 / BANKING ●',
    labelSub: '',
    isOrange: false,
    baseSize: 72,
    s1: { x: 81, y: 79 },
    s2: { x: 76, y: 76 },
    s3: { x: 61, y: 52 },
    badgeSub: 'BANKING'
  },
  {
    id: '08',
    code: 'STR',
    discipline: 'STRATEGY',
    labelTop: '08 / STRATEGY',
    labelSub: 'OPS_VENTURE',
    isOrange: false,
    baseSize: 54,
    s1: { x: 67, y: 24 },
    s2: { x: 64, y: 26 },
    s3: { x: 62, y: 62 },
    badgeSub: 'STRATEGY'
  },
  {
    id: '09',
    code: 'OPS',
    discipline: 'OPERATIONS',
    labelTop: 'ACTIVE NODES 10 / 10 ONLINE',
    labelSub: '09 / OPERATIONS',
    isOrange: false,
    baseSize: 64,
    s1: { x: 64, y: 83 },
    s2: { x: 60, y: 80 },
    s3: { x: 44, y: 48 },
    badgeSub: 'OPERATIONS'
  },
  {
    id: '10',
    code: 'LAW',
    discipline: 'COMMERCE LAW',
    labelTop: '94.8% ACCELERATION',
    labelSub: '10 / JURIS_PRUD COMMERCE_LAW',
    isOrange: false,
    baseSize: 50,
    s1: { x: 28, y: 85 },
    s2: { x: 31, y: 81 },
    s3: { x: 42, y: 67 },
    badgeSub: 'COMMERCE LAW'
  }
];

// Synaptic connections between nodes (0-indexed indices into NODES)
const LATTICE_CONNECTIONS = [
  [0, 2], [2, 3], [3, 9], [9, 8], [8, 6], [6, 5], [5, 1],
  [1, 7], [7, 4], [4, 0], [4, 2], [7, 5], [8, 2], [9, 6]
];

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeStage, setActiveStage] = useState<1 | 2 | 3 | 4>(1);

  // Sync scroll progress with window scroll within container
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const totalScrollable = containerRef.current.offsetHeight - window.innerHeight;
    
    if (totalScrollable <= 0) return;

    const currentScroll = -rect.top;
    const progress = Math.max(0, Math.min(1, currentScroll / totalScrollable));
    setScrollProgress(progress);

    // Determine discrete stage
    if (progress < 0.28) {
      setActiveStage(1);
    } else if (progress < 0.58) {
      setActiveStage(2);
    } else if (progress < 0.85) {
      setActiveStage(3);
    } else {
      setActiveStage(4);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Programmatically jump/scroll to a specific stage
  const scrollToStage = (stage: 1 | 2 | 3 | 4) => {
    if (!containerRef.current) return;
    const totalScrollable = containerRef.current.offsetHeight - window.innerHeight;
    const targets = {
      1: 0.05,
      2: 0.38,
      3: 0.68,
      4: 0.95
    };
    const targetProgress = targets[stage];
    const targetY = containerRef.current.offsetTop + totalScrollable * targetProgress;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  // Node interpolation helper: guarantees smooth physical merge into the center
  const getNodeState = (node: NodeData, progress: number) => {
    let x = node.s1.x;
    let y = node.s1.y;
    let scale = 1;
    let opacity = 1;
    let isColliding = false;

    if (progress < 0.30) {
      // Transition from S1 to S2
      const t = progress / 0.30;
      x = node.s1.x + (node.s2.x - node.s1.x) * t;
      y = node.s1.y + (node.s2.y - node.s1.y) * t;
      scale = 1;
      opacity = 1;
    } else if (progress < 0.62) {
      // Transition from S2 to S3 (Orbital constellation)
      const t = (progress - 0.30) / 0.32;
      const ease = t * t * (3 - 2 * t);
      x = node.s2.x + (node.s3.x - node.s2.x) * ease;
      y = node.s2.y + (node.s3.y - node.s2.y) * ease;
      scale = 1 - 0.12 * ease;
      opacity = 1;
    } else {
      // STAGE 3 TO 4: ACTIVE PHYSICAL CONVERGENCE & FUSION MERGE
      // From 0.62 to 0.88, balls are drawn with gravitational acceleration directly into (50, 47)
      const t = Math.min(1, Math.max(0, (progress - 0.62) / 0.26));
      // Gravitational acceleration: inward trajectory
      const easeIn = Math.pow(t, 2.2);

      const targetCenter = { x: 50, y: 50 };
      x = node.s3.x + (targetCenter.x - node.s3.x) * easeIn;
      y = node.s3.y + (targetCenter.y - node.s3.y) * easeIn;

      // The balls remain fully visible as they plunge inward!
      if (t < 0.65) {
        // Approaching outer perimeter of the forming core
        scale = (1 - 0.12) * (1 - t * 0.2);
        opacity = 1;
      } else {
        // Penetrating and melting into the central sphere volume!
        isColliding = true;
        const absorbT = (t - 0.65) / 0.35;
        // As balls sink inside the core, their size compresses into the center
        scale = Math.max(0, (1 - 0.25) * (1 - absorbT * 0.95));
        // Fade out ONLY once they are absorbed deep inside the core mass
        opacity = Math.max(0, 1 - Math.pow(absorbT, 2.5));
      }
    }

    return { x, y, scale, opacity, isColliding };
  };

  // ── CENTRAL UNIFIED SPHERE SEEDING & GROWTH ──
  // The central core begins as an energy nucleus at 0.60, swells as it absorbs incoming balls,
  // peaks dynamically at 0.86 as all 10 collide, then locks into final 100% equilibrium.
  let coreScale = 0;
  let coreOpacity = 0;
  let fusionEnergy = 0; // Peak energy corona glow during collision

  if (scrollProgress >= 0.60) {
    const t = Math.min(1, (scrollProgress - 0.60) / 0.28);
    coreOpacity = Math.min(1, t * 2.5); // Rapidly reaches 1 so it receives incoming balls

    if (t < 0.85) {
      // Swells continuously as it is fed matter from the 10 balls
      const growEase = t * (2 - t);
      coreScale = 0.20 + 0.88 * growEase; // expands to ~1.08
    } else {
      // Elastic settle into stable equilibrium (1.00)
      const settleT = (t - 0.85) / 0.15;
      coreScale = 1.08 - 0.08 * settleT;
    }

    // Fusion pulse peaks right during collision impact (t = 0.50 - 0.90)
    if (t > 0.30 && t < 0.95) {
      fusionEnergy = Math.sin(((t - 0.30) / 0.65) * Math.PI);
    }
  }

  // Heading opacity: visible in Stage 1 & 2, dimmed in Stage 3, hidden in Stage 4
  let headingOpacity = 1;
  if (scrollProgress >= 0.50 && scrollProgress < 0.72) {
    const t = (scrollProgress - 0.50) / 0.22;
    headingOpacity = 1 - t * 0.85; // Dims to 15% watermark in Stage 3
  } else if (scrollProgress >= 0.72) {
    headingOpacity = Math.max(0, 0.15 - (scrollProgress - 0.72) * 1.5);
  }

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[380vh] bg-[#F8F9FC] text-[#1A1A2E]"
    >
      {/* Sticky Screen Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden select-none flex flex-col justify-between">
        
        {/* Background Dotted Matrix Grid */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(30, 41, 59, 0.22) 1.2px, transparent 1.2px)',
            backgroundSize: '28px 28px',
            backgroundColor: '#F8F9FC'
          }}
        />

        {/* Ambient Subtle Grid Accents & Precision Marks */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-1/4 left-1/4 w-3 h-3 border-t border-l border-slate-400" />
          <div className="absolute top-1/4 right-1/4 w-3 h-3 border-t border-r border-slate-400" />
          <div className="absolute bottom-1/4 left-1/4 w-3 h-3 border-b border-l border-slate-400" />
          <div className="absolute bottom-1/4 right-1/4 w-3 h-3 border-b border-r border-slate-400" />
        </div>

        {/* <div className="relative z-40 pt-20 px-6 sm:px-10 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-slate-500 uppercase tracking-widest border-b border-slate-200/40 pb-2">
          
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500/80 animate-pulse" />
            <span className="text-slate-600 font-semibold">SYS_COORD: 43.6532° N, 79.3832° W</span>
            <span className="text-slate-300">/</span>
            <span className="text-[#2B4788] font-bold">
              {activeStage === 1 && 'RENDER: VECTOR_UNCONVERGED'}
              {activeStage === 2 && 'RENDER: ACTIVE_LATTICE_TRANSIT'}
              {activeStage === 3 && 'RENDER: VECTOR_CONVERGENCE_IN_TRANSIT'}
              {activeStage === 4 && 'RENDER: UNIFIED_CORE_EQUILIBRIUM'}
            </span>
          </div>

          {(activeStage === 3 || activeStage === 4) && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded bg-slate-200/70 text-slate-700 font-bold text-[10px]">
              {activeStage === 3
                ? 'KERNEL CLUSTER LOCK: STAGE 3'
                : 'KERNEL CLUSTER LOCK: STAGE 4 (RESOLVED)'}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollToStage(1)}
              className={`hover:text-[#2B4788] transition-colors ${
                activeStage === 1 ? 'text-[#FF6B35] font-bold' : 'text-slate-400'
              }`}
            >
              01
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={() => scrollToStage(2)}
              className={`hover:text-[#2B4788] transition-colors ${
                activeStage === 2 ? 'text-[#2B4788] font-bold' : 'text-slate-400'
              }`}
            >
              02
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={() => scrollToStage(3)}
              className={`hover:text-[#2B4788] transition-colors ${
                activeStage === 3 ? 'text-[#FF6B35] font-bold' : 'text-slate-400'
              }`}
            >
              03
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={() => scrollToStage(4)}
              className={`hover:text-[#2B4788] transition-colors ${
                activeStage === 4 ? 'text-[#2B4788] font-bold' : 'text-slate-400'
              }`}
            >
              04
            </button>

            <span className="text-slate-300">|</span>

            <span className="text-slate-700 font-semibold flex items-center gap-1.5">
              {activeStage === 1 && (
                <>
                  STATE: 01 // DISPERSED DISCIPLINE MATRIX
                  <span className="w-2 h-2 rounded-full bg-[#FF6B35]" />
                </>
              )}
              {activeStage === 2 && (
                <>
                  STATE: 02 // CONNECTED KNOWLEDGE NETWORK
                  <span className="w-2 h-2 rounded-full bg-[#2B4788]" />
                </>
              )}
              {activeStage === 3 && (
                <>
                  STATE: 03 // GRAVITATIONAL CONVERGENCE • 78% CONTRACTION
                  <span className="w-2 h-2 rounded-full bg-[#FF6B35] animate-ping" />
                </>
              )}
              {activeStage === 4 && (
                <>
                  STATE: 04 // RESOLVED UNIFIED ECOSYSTEM • 100% SYNTHESIS
                  <span className="w-2 h-2 rounded-full bg-[#2B4788]" />
                </>
              )}
            </span>
          </div>
        </div> */}

        {/* ── MAIN INTERACTIVE CANVAS AREA ── */}
        <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center">

          {/* SVG CONNECTIONS & RADAR LATTICE LAYER */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <defs>
              <linearGradient id="synapseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2B4788" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#4A63CC" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#FF6B35" stopOpacity="0.3" />
              </linearGradient>

              <radialGradient id="fusionRadial" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF7D47" stopOpacity="0.8" />
                <stop offset="40%" stopColor="#2B4788" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#1E3494" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* STAGE 3 CONCENTRIC RADAR RINGS - Fades out completely before Stage 4 */}
            {scrollProgress >= 0.45 && scrollProgress < 0.78 && (
              <g
                className="transition-opacity duration-300"
                style={{
                  opacity:
                    scrollProgress < 0.60
                      ? (scrollProgress - 0.45) / 0.15
                      : Math.max(0, 1 - (scrollProgress - 0.70) / 0.08)
                }}
              >
                {/* Orbital concentric circles */}
                <circle cx="50%" cy="50%" r="90" fill="none" stroke="#2B4788" strokeWidth="1" strokeDasharray="3 4" opacity="0.3" />
                <circle cx="50%" cy="50%" r="150" fill="none" stroke="#2B4788" strokeWidth="1" strokeDasharray="4 4" opacity="0.25" />
                <circle cx="50%" cy="50%" r="220" fill="none" stroke="#2B4788" strokeWidth="1" opacity="0.18" />
                <circle cx="50%" cy="50%" r="300" fill="none" stroke="#2B4788" strokeWidth="1" strokeDasharray="5 6" opacity="0.12" />

                {/* Central crosshair & nucleus point */}
                <line x1="50%" y1="20%" x2="50%" y2="80%" stroke="#2B4788" strokeWidth="1" strokeDasharray="2 4" opacity="0.15" />
                <line x1="20%" y1="50%" x2="80%" y2="50%" stroke="#2B4788" strokeWidth="1" strokeDasharray="2 4" opacity="0.15" />
                <circle cx="50%" cy="50%" r="4" fill="#2B4788" opacity="0.6" />
                <text x="50.8%" y="49.6%" fill="#2B4788" fontSize="10" fontFamily="monospace" opacity="0.7">
                  _NUCLEUS // 0.00
                </text>
              </g>
            )}

            {/* SYNAPTIC NETWORK LINES BETWEEN NODES (Stages 2 & early 3) */}
            {scrollProgress >= 0.20 && scrollProgress < 0.70 && (
              <g
                style={{
                  opacity:
                    scrollProgress < 0.35
                      ? (scrollProgress - 0.20) / 0.15
                      : scrollProgress > 0.62
                      ? Math.max(0, 1 - (scrollProgress - 0.62) / 0.08)
                      : 0.85
                }}
              >
                {LATTICE_CONNECTIONS.map(([idxA, idxB], i) => {
                  const nodeA = NODES[idxA];
                  const nodeB = NODES[idxB];
                  const stateA = getNodeState(nodeA, scrollProgress);
                  const stateB = getNodeState(nodeB, scrollProgress);

                  return (
                    <line
                      key={`conn-${i}`}
                      x1={`${stateA.x}%`}
                      y1={`${stateA.y}%`}
                      x2={`${stateB.x}%`}
                      y2={`${stateB.y}%`}
                      stroke="url(#synapseGradient)"
                      strokeWidth={scrollProgress > 0.55 ? "1.2" : "1"}
                      strokeDasharray={scrollProgress > 0.55 ? "4 3" : undefined}
                      opacity={scrollProgress > 0.55 ? 0.45 : 0.6}
                    />
                  );
                })}
              </g>
            )}

            {/* ACTIVE MATTER STREAMS: Lines connecting each plunging ball to the nucleus during merge */}
            {scrollProgress >= 0.62 && scrollProgress < 0.85 && (
              <g>
                {NODES.map((node) => {
                  const state = getNodeState(node, scrollProgress);
                  if (state.opacity <= 0.05) return null;

                  return (
                    <line
                      key={`stream-${node.id}`}
                      x1={`${state.x}%`}
                      y1={`${state.y}%`}
                      x2="50%"
                      y2="50%"
                      stroke={node.isOrange ? '#FF7D47' : '#4A63CC'}
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                      opacity={0.35 * state.opacity}
                    />
                  );
                })}
              </g>
            )}
          </svg>

          {/* ── HERO TEXT (Center Content - States 1 & 2, dimmed in 3, hidden in 4) ── */}
          <div
            className="absolute z-20 max-w-3xl mx-auto px-6 text-center pointer-events-auto transition-opacity duration-300"
            style={{
              opacity: headingOpacity,
              transform: `scale(${1 - scrollProgress * 0.08})`,
              display: headingOpacity <= 0.01 ? 'none' : 'block'
            }}
          >
            {/* Top Indicator Pill */}
            <div className="inline-flex items-center justify-center mb-4">
              <span className="w-4 h-1.5 rounded-full bg-[#FF6B35]" />
            </div>

            {/* Main Headline */}
            <h1 className="font-extrabold text-[44px] sm:text-[56px] md:text-[68px] leading-[1.08] tracking-tight text-[#1A1A2E] font-['Poppins',sans-serif]">
              Everything your{' '}
              <br className="hidden sm:inline" />
              commerce career{' '}
              <br className="hidden sm:inline" />
              needs.
              <br />
              <span className="text-[#2B4788] inline-block mt-1">In one place.</span>
            </h1>

            {/* Sub-headline */}
            <div className="mt-5 max-w-xl mx-auto">
              <p className="font-bold text-[14px] sm:text-[15px] text-[#1A1A2E] tracking-tight">
                Beyond Theory. Into Skills.
              </p>
              <p className="mt-1 text-[13px] sm:text-[14px] text-slate-500 leading-relaxed font-normal">
                Practical apprenticeships, real-world finance engines, and executive
                mentorship unified into a cohesive career operating system.
              </p>
            </div>

            {/* CTA Buttons in State 1 & 2 */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/admin-login"
                className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-[#2B4788] hover:bg-[#1E3494] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>EXPLORE PROGRAMS</span>
                <span className="font-bold">→</span>
              </Link>
              <a
                href="#about"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200/90 shadow-sm hover:shadow transition-all"
              >
                <span>DISCOVER AFTER COMMERCE</span>
                <span className="font-mono text-xs">↗</span>
              </a>
            </div>
          </div>

          {/* ── STAGE 3 WATERMARK SUBTITLE ── */}
          {scrollProgress >= 0.55 && scrollProgress < 0.78 && (
            <div
              className="absolute top-[18%] text-center z-20 pointer-events-none transition-opacity duration-300"
              style={{
                opacity:
                  scrollProgress < 0.65
                    ? (scrollProgress - 0.55) / 0.10
                    : Math.max(0, 1 - (scrollProgress - 0.72) / 0.06)
              }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-200/60 text-[#2B4788] font-mono text-[11px] font-bold uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-[#2B4788] animate-pulse" />
                STAGE 03 • INWARD TRAJECTORY
              </div>
              <p className="text-xs font-mono text-slate-500 max-w-md mx-auto">
                Decentralized commerce specializations drawn into an integrated executive system.
              </p>
            </div>
          )}

          {/* ── STAGE 4: THE UNIFIED SINGLE GRAND 3D SPHERE ── */}
          {scrollProgress >= 0.60 && (
            <div
              className="absolute inset-0 pointer-events-none z-25 flex items-center justify-center"
              style={{
                opacity: coreOpacity,
                transform: `scale(${coreScale})`,
                transformOrigin: '50% 50%'
              }}
            >
              {/* Concentric Aura Rings centered EXACTLY on (50%, 50%) */}
              <div 
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full border border-blue-400/25 pointer-events-none transition-opacity duration-300"
                style={{ opacity: scrollProgress > 0.85 ? 1 : scrollProgress > 0.70 ? 0.4 : 0 }}
              />
              <div 
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full border border-blue-500/15 pointer-events-none transition-opacity duration-300"
                style={{ opacity: scrollProgress > 0.88 ? 1 : 0 }}
              />
              <div 
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] rounded-full bg-blue-500/15 filter blur-3xl pointer-events-none" 
              />

              {/* Fusion Collision Energy Flare */}
              {fusionEnergy > 0.05 && (
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none animate-pulse"
                  style={{
                    width: '320px',
                    height: '320px',
                    background: 'radial-gradient(circle, rgba(255,107,53,0.35) 0%, rgba(43,71,136,0.45) 45%, transparent 70%)',
                    transform: `scale(${1 + fusionEnergy * 0.25})`,
                    opacity: fusionEnergy * 0.9
                  }}
                />
              )}

              {/* Top Equilibrium Monospace Pill - Positioned cleanly above the sphere */}
              <div 
                className="absolute left-1/2 -translate-x-1/2 bottom-[calc(50%+150px)] pointer-events-auto inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 border border-slate-200 shadow-sm font-mono text-[10px] font-bold text-slate-600 uppercase tracking-widest whitespace-nowrap transition-opacity duration-300"
                style={{ opacity: scrollProgress > 0.84 ? 1 : 0 }}
              >
                <span className="w-2 h-2 rounded-full bg-[#FF6B35] animate-pulse" />
                STAGE 04 • SYSTEM EQUILIBRIUM // SYNTHESIS COMPLETE
              </div>

              {/* The Grand Unified 3D Sphere - EXACT CENTER (50%, 50%) */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] sm:w-[260px] sm:h-[260px] rounded-full flex flex-col items-center justify-center p-6 shadow-2xl select-none group cursor-pointer hover:scale-105 transition-transform duration-300 pointer-events-auto"
                style={{
                  background:
                    'radial-gradient(circle at 35% 26%, #8bb2ff 0%, #3058db 25%, #18338a 55%, #0f1f58 80%, #080d28 100%)',
                  boxShadow:
                    'inset -14px -14px 34px rgba(0, 0, 40, 0.75), inset 8px 8px 22px rgba(255, 255, 255, 0.5), 0 0 70px rgba(59, 130, 246, 0.4), 0 30px 60px -15px rgba(18, 33, 92, 0.6)'
                }}
              >
                {/* Specular Highlight Arc */}
                <div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    top: '8%',
                    left: '18%',
                    width: '45%',
                    height: '25%',
                    background:
                      'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0) 70%)',
                    transform: 'rotate(-25deg)'
                  }}
                />

                {/* Inner Sphere Content: White Badge with Larger Logo + Text */}
                <div 
                  className="relative z-10 flex flex-col items-center text-center transition-opacity duration-300"
                  style={{ opacity: Math.max(0, Math.min(1, (scrollProgress - 0.78) / 0.10)) }}
                >
                  {/* White Rounded Badge with Larger Official Logo */}
                  <div className="w-20 h-13 sm:w-24 sm:h-15 rounded-2xl bg-white shadow-xl px-3 py-1.5 flex items-center justify-center mb-3 border border-white/95 group-hover:scale-105 transition-transform duration-200">
                    <img 
                      src={logoIconDark.src} 
                      alt="After Commerce Logo" 
                      className="w-full h-full object-contain select-none pointer-events-none"
                    />
                  </div>

                  <span className="font-extrabold text-[16px] sm:text-[18px] text-white tracking-wider font-['Poppins',sans-serif] leading-tight">
                    AFTER COMMERCE
                  </span>
                  <span className="font-mono text-[10px] sm:text-[11px] font-bold text-cyan-300 tracking-widest uppercase mt-1">
                    UNIFIED CAREER ENGINE
                  </span>
                </div>
              </div>

              {/* Resolved Stage 4 Action Buttons - Sits cleanly below the outer orbit circle (at 50% + 205px) */}
              <div 
                className="absolute left-1/2 -translate-x-1/2 top-[calc(50%+205px)] pointer-events-auto flex flex-wrap items-center justify-center gap-4 whitespace-nowrap transition-all duration-300"
                style={{
                  opacity: Math.max(0, Math.min(1, (scrollProgress - 0.84) / 0.08)),
                  transform: `translate(-50%, ${(1 - Math.max(0, Math.min(1, (scrollProgress - 0.84) / 0.08))) * 12}px)`
                }}
              >
                <Link
                  href="/admin-login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#FF7D47] to-[#FF6B35] hover:from-[#ff8c5a] hover:to-[#ff7642] text-white font-bold text-sm shadow-[0_8px_25px_rgba(255,107,53,0.35)] hover:shadow-[0_10px_30px_rgba(255,107,53,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>EXPLORE PROGRAMS</span>
                  <span className="font-bold">→</span>
                </Link>

                <a
                  href="#about"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200/90 shadow-sm hover:shadow transition-all"
                >
                  <span>DISCOVER AFTER COMMERCE</span>
                  <span className="font-mono text-xs">↗</span>
                </a>
              </div>
            </div>
          )}

          {/* ── THE 10 FLOATING 3D SPHERES (ACTIVE CONVERGENCE & SINKING INTO THE CORE) ── */}
          {NODES.map((node) => {
            const state = getNodeState(node, scrollProgress);
            const size = node.baseSize * state.scale;

            if (state.opacity <= 0.01) return null;

            return (
              <div
                key={node.id}
                className="absolute transition-transform duration-75 pointer-events-auto group cursor-pointer"
                style={{
                  left: `${state.x}%`,
                  top: `${state.y}%`,
                  transform: `translate(-50%, -50%)`,
                  opacity: state.opacity,
                  // Position above the core when colliding so you see them entering and merging into it!
                  zIndex: state.isColliding ? 35 : 20
                }}
                onClick={() => {
                  if (scrollProgress < 0.5) scrollToStage(3);
                }}
              >
                {/* The 3D Glossy Sphere Orb */}
                <div
                  className="relative rounded-full transition-transform duration-150 group-hover:scale-110 flex items-center justify-center select-none"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    background: node.isOrange
                      ? 'radial-gradient(circle at 35% 28%, #ffc099 0%, #ff7d47 24%, #ff6b35 52%, #c23e0c 80%, #541703 100%)'
                      : 'radial-gradient(circle at 35% 28%, #7ea3ff 0%, #3b66d4 22%, #1e3a8a 52%, #12215c 80%, #0a1133 100%)',
                    boxShadow: node.isOrange
                      ? 'inset -6px -6px 14px rgba(60, 15, 0, 0.6), inset 4px 4px 10px rgba(255, 255, 255, 0.5), 0 16px 28px -6px rgba(255, 107, 53, 0.45), 0 8px 14px -4px rgba(0, 0, 0, 0.2)'
                      : 'inset -6px -6px 14px rgba(0, 0, 40, 0.6), inset 4px 4px 10px rgba(255, 255, 255, 0.45), 0 16px 28px -6px rgba(18, 33, 92, 0.4), 0 8px 14px -4px rgba(0, 0, 0, 0.2)',
                    // If colliding into the core, add a luminous fusion glow
                    filter: state.isColliding
                      ? `drop-shadow(0 0 12px ${node.isOrange ? '#FF7D47' : '#3B82F6'})`
                      : undefined
                  }}
                >
                  {/* Gloss Specular Reflection Oval */}
                  <div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      top: '10%',
                      left: '20%',
                      width: '42%',
                      height: '24%',
                      background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0) 70%)',
                      transform: 'rotate(-25deg)'
                    }}
                  />

                  {/* STAGE 3 CODES (Printed on sphere in Stage 3: 01 ACT, 02 TAX, etc.) */}
                  {scrollProgress >= 0.50 && scrollProgress < 0.78 && (
                    <div
                      className="flex flex-col items-center justify-center text-center font-mono leading-none text-white pointer-events-none transition-opacity duration-200"
                      style={{
                        opacity:
                          scrollProgress < 0.60
                            ? (scrollProgress - 0.50) / 0.10
                            : 1
                      }}
                    >
                      <span className="text-[10px] font-semibold opacity-85">
                        {node.id}
                      </span>
                      <span className="text-[12px] font-extrabold tracking-wider mt-0.5">
                        {node.code}
                      </span>
                      {node.isOrange && (
                        <span className="text-[8px] uppercase tracking-tighter opacity-80 mt-0.5">
                          {node.id === '02' ? 'ENERGY ACCENT' : 'CORE FOCUS'}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* LABELS & METADATA IN STAGES 1 & 2 */}
                {scrollProgress < 0.50 && (
                  <div
                    className="absolute pointer-events-none whitespace-nowrap transition-opacity duration-200"
                    style={{
                      opacity: Math.max(0, 1 - (scrollProgress - 0.35) / 0.12),
                      ...(node.id === '01' && { top: '-22px', left: '0' }),
                      ...(node.id === '02' && { top: '-22px', right: '0', textAlign: 'right' }),
                      ...(node.id === '03' && { left: '108%', top: '24%' }),
                      ...(node.id === '04' && { left: '108%', top: '30%' }),
                      ...(node.id === '05' && { bottom: '-22px', left: '0' }),
                      ...(node.id === '06' && { right: '108%', top: '24%', textAlign: 'right' }),
                      ...(node.id === '07' && { bottom: '-22px', right: '0', textAlign: 'right' }),
                      ...(node.id === '08' && { left: '108%', top: '20%' }),
                      ...(node.id === '09' && { bottom: '-26px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }),
                      ...(node.id === '10' && { top: '-30px', left: '0' })
                    }}
                  >
                    {node.heading && (
                      <div className="font-extrabold text-[15px] text-[#1A1A2E] leading-tight font-['Poppins',sans-serif]">
                        {node.heading}
                      </div>
                    )}
                    {node.labelTop && (
                      <div className="font-mono text-[10px] font-bold text-slate-700 tracking-wider">
                        {node.labelTop}
                      </div>
                    )}
                    {node.labelSub && (
                      <div className="font-mono text-[9px] text-slate-400 uppercase tracking-widest">
                        {node.labelSub}
                      </div>
                    )}
                  </div>
                )}

                {/* STAGE 3 FROSTED CAPSULE BADGES (Below each node in the radar ring) */}
                {scrollProgress >= 0.55 && scrollProgress < 0.72 && node.badgeSub && (
                  <div
                    className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap transition-opacity duration-200"
                    style={{
                      opacity:
                        scrollProgress < 0.62
                          ? (scrollProgress - 0.55) / 0.07
                          : Math.max(0, 1 - (scrollProgress - 0.66) / 0.06)
                    }}
                  >
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full font-mono text-[9px] font-bold tracking-wider shadow-sm border ${
                        node.isOrange
                          ? 'bg-orange-50/90 text-[#FF6B35] border-orange-200'
                          : 'bg-white/90 text-slate-600 border-slate-200'
                      }`}
                    >
                      {node.badgeSub}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── BOTTOM STATUS BAR & DYNAMIC ACTIONS ── */}
        <div className="relative z-40 px-6 sm:px-10 pb-5 pt-3 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] text-slate-500 uppercase tracking-wider border-t border-slate-200/40">
          
          {/* Left Status Message */}
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            {activeStage === 1 && (
              <>
                <span className="w-2 h-2 rounded-full bg-[#FF6B35]" />
                <span>ECOSYSTEM STATUS: 10 NODES DISTRIBUTED • READY FOR SYNTHESIS</span>
              </>
            )}
            {activeStage === 2 && (
              <>
                <span className="w-2 h-2 rounded-full bg-[#2B4788]" />
                <span>ECOSYSTEM STATUS: 10 NODES INTERLINKED • DYNAMIC SYNTHESIS ENGAGED</span>
              </>
            )}
            {activeStage === 3 && (
              <>
                <span className="w-2 h-2 rounded-full bg-[#FF6B35]" />
                <span>ACTIVE NODES: 10 / 10 CONVERGING • 82% ORBITAL COMPRESSION</span>
              </>
            )}
            {activeStage === 4 && (
              <>
                <span className="w-2 h-2 rounded-full bg-[#2B4788]" />
                <span>CORE RESOLUTION: 10 DISCIPLINES SYNTHESIZED • 100% UNIFIED</span>
              </>
            )}
          </div>

          {/* Center Dynamic Interaction Pill (Changes per state) */}
          <div className="flex items-center gap-4">
            {activeStage === 1 && (
              <button
                onClick={() => scrollToStage(2)}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/90 hover:bg-white border border-slate-200/90 shadow-sm text-slate-700 hover:text-[#2B4788] text-[11px] font-bold tracking-widest uppercase transition-all"
              >
                <span>🖱 SCROLL TO INITIATE CONVERGENCE</span>
                <span className="text-orange-500 font-bold">↕</span>
              </button>
            )}

            {activeStage === 2 && (
              <button
                onClick={() => scrollToStage(3)}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/90 hover:bg-white border border-slate-200/90 shadow-sm text-slate-700 hover:text-[#2B4788] text-[11px] font-bold tracking-widest uppercase transition-all"
              >
                <span>🖱 SCROLL TO CONVERGE ECOSYSTEM</span>
                <span className="text-blue-600 font-bold">↓</span>
              </button>
            )}

            {activeStage === 3 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => scrollToStage(1)}
                  className="text-slate-500 hover:text-slate-800 underline underline-offset-4 cursor-pointer text-[10px] font-mono"
                >
                  RESET TRAJECTORY
                </button>
                <button
                  onClick={() => scrollToStage(4)}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#1A1A2E] hover:bg-slate-800 text-white text-[11px] font-bold tracking-wider transition-all shadow-md"
                >
                  <span>UNIFY SYSTEM (STATE 04)</span>
                  <span>→</span>
                </button>
              </div>
            )}

            {activeStage === 4 && (
              <div className="flex items-center gap-4">
                <span className="text-slate-400 text-[10px]">KERNEL // STAGE 04 OPERATIONAL</span>
                <button
                  onClick={() => scrollToStage(1)}
                  className="text-[#2B4788] hover:text-[#1E3494] font-bold underline underline-offset-4 cursor-pointer text-[11px]"
                >
                  REPLAY CONVERGENCE
                </button>
              </div>
            )}
          </div>

          {/* Right Protocol Code */}
          <div className="hidden sm:block text-slate-400 font-mono text-[10px]">
            {activeStage === 4
              ? 'KERNEL // STAGE 04 OPERATIONAL'
              : 'KERNEL PROTOCOL • AC-CORE.SYS.BUILD_2025'}
          </div>
        </div>

      </div>
    </section>
  );
}
