'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import logoIcon from '@/assets/images/logo-icon.svg';

export default function LandingPage() {
  const handleNavigate = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const disciplines = [
    { code: '01', title: 'Accounting', desc: 'Financial modeling, reconciliation engines, and automated general ledgers.' },
    { code: '02', title: 'Taxation', desc: 'Direct & indirect global corporate tax strategies with statutory compliance.' },
    { code: '03', title: 'Corporate Finance', desc: 'Capital engineering, valuation frameworks, M&A liquidity structuring.' },
    { code: '04', title: 'Audit & Assurance', desc: 'Internal controls, forensic analysis, and predictive risk telemetry.' },
    { code: '05', title: 'Regulatory Compliance', desc: 'Cross-border commerce jurisdictions, AML frameworks, governance.' },
    { code: '06', title: 'Business Analytics', desc: 'High-frequency telemetry, revenue intelligence, and predictive cohort KPI engines.' },
    { code: '07', title: 'Investment Banking', desc: 'Syndicated debt, equity underwriting, and institutional market access.' },
    { code: '08', title: 'Growth Strategy', desc: 'Venture operations, market penetration matrices, and scale mechanics.' },
    { code: '09', title: 'Global Operations', desc: 'Supply chain logistics, distributed team orchestrations, enterprise execution.' },
    { code: '10', title: 'Commerce Law', desc: 'Contractual engineering, digital IP sovereignty, and jurisdictional arbitrage.' },
  ];

  return (
    <div className="relative min-h-screen bg-[#F8F9FC] text-[#1A1A2E] font-['Poppins',sans-serif] selection:bg-[#2B4788] selection:text-white">
      {/* Top Navbar Component */}
      <Navbar onNavigate={handleNavigate} />

      {/* Main Hero Section with 4-Stage Convergence Scroll Animation */}
      <HeroSection />

      {/* ── PROGRAM MODULES & DISCIPLINES SECTION ── */}
      <section 
        id="programs" 
        className="relative py-24 px-6 sm:px-10 border-t border-slate-200/60"
        style={{
          backgroundImage: 'radial-gradient(rgba(30, 41, 59, 0.22) 1.2px, transparent 1.2px)',
          backgroundSize: '28px 28px',
          backgroundColor: '#F8F9FC'
        }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2B4788] font-mono text-xs font-bold uppercase tracking-wider mb-3">
                <span className="w-2 h-2 rounded-full bg-[#2B4788]" />
                UNIFIED CURRICULUM ARCHITECTURE
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1A1A2E] tracking-tight">
                10 Core Disciplines. <br />
                <span className="text-[#2B4788]">One Unified Career Engine.</span>
              </h2>
            </div>
            <p className="max-w-md text-sm text-slate-500 leading-relaxed font-normal">
              Instead of fragmented degrees, learn the interconnected machinery of global commerce with real transaction datasets and executive simulations.
            </p>
          </div>

          {/* 10 Disciplines Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {disciplines.map((item) => (
              <div
                key={item.code}
                className="group relative p-5 rounded-2xl bg-white/80 hover:bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-[#FF6B35]">
                    {item.code} // CORE
                  </span>
                  <span className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-[#2B4788] transition-colors" />
                </div>
                <h3 className="font-bold text-base text-[#1A1A2E] group-hover:text-[#2B4788] transition-colors mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAREER TRACKS & SIMULATOR SECTION ── */}
      <section
        id="career-tracks"
        className="relative py-24 px-6 sm:px-10 border-t border-slate-200/60 bg-gradient-to-b from-[#F8F9FC] to-[#F1F4F9]"
        style={{
          backgroundImage: 'radial-gradient(rgba(30, 41, 59, 0.22) 1.2px, transparent 1.2px)',
          backgroundSize: '28px 28px',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl bg-[#121624] text-white p-8 sm:p-14 border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#2B4788]/30 rounded-full filter blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FF6B35]/20 rounded-full filter blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-cyan-300 font-mono text-xs font-semibold uppercase tracking-widest mb-4">
                AFTER COMMERCE PLATFORM OS
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Ready to converge your career into a high-performance operating system?
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
                Join thousands of future financial engineers, chartered executives, and commerce innovators already operating with After Commerce.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/admin-login"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#FF7D47] to-[#FF6B35] hover:from-[#ff8c5a] hover:to-[#ff7642] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>GET STARTED NOW</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/admin-login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/15 backdrop-blur transition-all"
                >
                  <span>ENTERPRISE ADMIN PORTAL</span>
                  <span className="font-mono text-xs">↗</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer 
        id="about"
        className="border-t border-slate-200/80 py-12 px-6 sm:px-10 bg-white/80 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#121624] flex items-center justify-center p-1 shadow border border-slate-800">
              <img 
                src={logoIcon.src} 
                alt="After Commerce Logo" 
                className="w-full h-full object-contain select-none pointer-events-none" 
              />
            </div>
            <div>
              <span className="font-extrabold text-sm text-[#1A1A2E] tracking-wider font-['Poppins',sans-serif]">
                AFTER COMMERCE
              </span>
              <p className="text-[11px] font-mono text-slate-400">
                KERNEL // SYS.01 • ALL RIGHTS RESERVED
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-mono text-slate-500">
            <Link href="/admin-login" className="hover:text-[#2B4788] transition-colors">
              ADMIN LOGIN
            </Link>
            <span>•</span>
            <a href="#programs" className="hover:text-[#2B4788] transition-colors">
              PROGRAMS
            </a>
            <span>•</span>
            <a href="#career-tracks" className="hover:text-[#2B4788] transition-colors">
              TRACKS
            </a>
            <span>•</span>
            <a href="#about" className="hover:text-[#2B4788] transition-colors">
              KERNEL SPECS
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
