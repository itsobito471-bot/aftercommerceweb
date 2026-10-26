'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import leaderImg from '@/assets/images/leader-featured.png';

export default function FeaturedProgram() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div 
          className={`relative rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(24,56,171,0.28)] border border-blue-400/35 p-6 sm:p-10 lg:p-14 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-[0.98]'
          }`}
          style={{
            background: 'radial-gradient(circle at 18% 18%, #2b57f0 0%, #1e44cc 35%, #1838ab 70%, #102476 100%)'
          }}
        >
          {/* Subtle Ambient Backing Glow & Precision Grid Flare */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/25 rounded-full filter blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FF6B35]/20 rounded-full filter blur-3xl pointer-events-none" />
          
          {/* Subtle Grid Corner Accents */}
          <div className="absolute top-4 left-4 w-3 h-3 border-t border-l border-white/20 pointer-events-none" />
          <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-white/20 pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-white/20 pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-3 h-3 border-b border-r border-white/20 pointer-events-none" />

          {/* Left Column: Information & Actions */}
          <div className="relative z-10 flex-1 max-w-2xl">
            {/* Top Badge with Staggered Entrance */}
            <div 
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 backdrop-blur-sm text-white font-mono text-[11px] font-bold uppercase tracking-wider mb-4 sm:mb-6 transition-all duration-700 delay-100 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#FF6B35] animate-pulse" />
              <span>FEATURED PROGRAM</span>
            </div>

            {/* Title with Staggered Entrance */}
            <h2 
              className={`text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.12] font-['Poppins',sans-serif] transition-all duration-700 delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              Leadership in Tech 101
            </h2>

            {/* Subtitle with Staggered Entrance */}
            <p 
              className={`mt-4 sm:mt-5 text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-xl font-normal transition-all duration-700 delay-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              Elevating tech talents into visionary leaders through innovative training and real-world experience.
            </p>

            {/* Action Buttons with Staggered Entrance */}
            <div 
              className={`mt-7 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4 transition-all duration-700 delay-400 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <Link
                href="/admin-login"
                className="inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#FF7D47] to-[#FF6B35] hover:from-[#ff8c5a] hover:to-[#ff7642] text-white font-bold text-sm shadow-[0_8px_25px_rgba(255,107,53,0.35)] hover:shadow-[0_10px_30px_rgba(255,107,53,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Enroll now</span>
                <span className="font-bold">→</span>
              </Link>

              <a
                href="#syllabus"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/25 hover:border-white/40 transition-all backdrop-blur-sm"
              >
                <span>View syllabus</span>
              </a>
            </div>

            {/* Bottom Meta Badges with Staggered Entrance */}
            <div 
              className={`mt-8 sm:mt-10 pt-6 border-t border-white/15 flex flex-wrap items-center gap-3 sm:gap-4 font-mono text-xs text-blue-100/80 transition-all duration-700 delay-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-blue-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 3v3m0 12v3m9-9h-3M6 12H3" />
                </svg>
                <span>8 nodes</span>
              </div>

              <span className="text-white/40">·</span>

              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-blue-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>120 mins</span>
              </div>

              <span className="text-white/40">·</span>

              <span className="px-2.5 py-0.5 rounded-md bg-white/15 border border-white/20 font-bold text-white text-[10px] tracking-wider uppercase">
                BEGINNER
              </span>
            </div>
          </div>

          {/* Right Column: Hero Visual with Overlaid Floating Rating Pill */}
          <div 
            className={`relative z-10 w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[420px] flex items-center justify-center transition-all duration-1000 delay-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isVisible ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-10 scale-95'
            }`}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-slate-900 group">
              <img
                src={leaderImg.src}
                alt="Leadership in Tech 101 Featured Mentor"
                className="w-full h-auto object-cover select-none transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
