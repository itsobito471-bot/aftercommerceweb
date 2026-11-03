'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturedProgram from '@/components/landing/FeaturedProgram';
import FeaturedCourses from '@/components/landing/FeaturedCourses';
import logoIcon from '@/assets/images/logo-icon.svg';

export default function LandingPage() {
  const [ctaVisible, setCtaVisible] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setCtaVisible(entry.isIntersecting);
      },
      { 
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    if (ctaRef.current) {
      observer.observe(ctaRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleNavigate = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8F9FC] text-[#1A1A2E] font-['Poppins',sans-serif] selection:bg-[#2B4788] selection:text-white">
      {/* Top Navbar Component */}
      <Navbar onNavigate={handleNavigate} />

      {/* Main Hero Section with 4-Stage Convergence Scroll Animation */}
      <HeroSection />

      {/* Continuous Dotted Background Wrapper for Post-Hero Sections */}
      <div 
        className="relative w-full border-t border-slate-200/60"
        style={{
          backgroundImage: 'radial-gradient(rgba(30, 41, 59, 0.22) 1.2px, transparent 1.2px)',
          backgroundSize: '28px 28px',
          backgroundColor: '#F8F9FC'
        }}
      >
        {/* ── FEATURED PROGRAM BANNER (Replacing previous disciplines grid) ── */}
        <section id="programs" className="relative pt-12 sm:pt-16 pb-4">
          <FeaturedProgram />
        </section>

        {/* ── FEATURED COURSES WITH 3D COVERFLOW CAROUSEL ── */}
        <section id="career-tracks" className="relative pt-6 pb-20 sm:pb-28">
          <FeaturedCourses />
        </section>

        {/* ── PLATFORM OS PREVIEW & CTA BANNER ── */}
        <section
          id="platform"
          className="relative py-16 sm:py-20 px-6 sm:px-10 border-t border-slate-200/60 bg-gradient-to-b from-transparent to-[#F1F4F9]/60"
        >
          <div ref={ctaRef} className="max-w-7xl mx-auto">
            <div 
              className={`rounded-3xl bg-[#121624] text-white p-8 sm:p-14 border border-slate-800 shadow-2xl relative overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                ctaVisible 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-12 scale-[0.98]'
              }`}
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#2B4788]/30 rounded-full filter blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FF6B35]/20 rounded-full filter blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-2xl">
                {/* AFTER COMMERCE PLATFORM OS */}
                <span 
                  className={`inline-block px-3 py-1 rounded-full bg-white/10 text-cyan-300 font-mono text-xs font-semibold uppercase tracking-widest mb-4 transition-all duration-700 delay-100 ${
                    ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                >
                  AFTER COMMERCE CAREER PLATFORM
                </span>
                <h2 
                  className={`text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight transition-all duration-700 delay-200 ${
                    ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}
                >
                  Ready to converge your career into a high-performance operating system?
                </h2>
                <p 
                  className={`mt-4 text-sm sm:text-base text-slate-300 leading-relaxed transition-all duration-700 delay-300 ${
                    ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}
                >
                  Join thousands of future financial engineers, chartered executives, and commerce innovators already operating with After Commerce.
                </p>

                <div 
                  className={`mt-8 flex flex-wrap items-center gap-4 transition-all duration-700 delay-400 ${
                    ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}
                >
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
              <span className="font-extrabold text-sm tracking-wide text-[#1A1A2E] font-['Poppins',sans-serif]">
                {/* AFTER COMMERCE // KERNEL SYS.01 */}
                AFTER COMMERCE
              </span>
            </div>

            <div className="flex items-center gap-6 font-mono text-xs text-slate-500 uppercase tracking-wider">
              {/* Commented out unwanted sci-fi/kernel telemetry terms */}
              {/* <span>SECURITY PROTOCOL ENFORCED</span>
              <span>·</span> */}
              <span>100% UNIFIED CURRICULUM</span>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              © 2026 AFTER COMMERCE • ALL RIGHTS RESERVED
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
