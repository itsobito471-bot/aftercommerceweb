'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

interface CourseItem {
  id: string;
  category: string;
  rating: number;
  title: string;
  tutor: string;
  duration: string;
  nodes: number;
  price: string;
}

const FEATURED_COURSES: CourseItem[] = [
  {
    id: 'c1',
    category: 'FORENSIC CONTROLS',
    rating: 4.7,
    title: 'Internal Audit & System Telemetry',
    tutor: 'Devansh Mehta',
    duration: '140 mins',
    nodes: 9,
    price: '₹2,899'
  },
  {
    id: 'c2',
    category: 'COMMERCE DATA',
    rating: 4.8,
    title: 'PowerBI Analytics & Revenue Engines',
    tutor: 'Sneha Kapoor',
    duration: '110 mins',
    nodes: 7,
    price: '₹2,299'
  },
  {
    id: 'c3',
    category: 'REGULATORY LAW',
    rating: 4.85,
    title: 'Cross-Border Corporate Compliance',
    tutor: 'Siddharth Rao',
    duration: '125 mins',
    nodes: 9,
    price: '₹2,799'
  },
  {
    id: 'c4',
    category: 'FINANCIAL ACCOUNTING',
    rating: 4.9,
    title: 'Financial Accounting Essentials',
    tutor: 'Ahmed Muneer',
    duration: '120 mins',
    nodes: 8,
    price: '₹2,499'
  },
  {
    id: 'c5',
    category: 'FINANCIAL MODELING',
    rating: 4.8,
    title: 'Tax DCF & LBO Architecture',
    tutor: 'Rohith Verma',
    duration: '150 mins',
    nodes: 10,
    price: '₹3,199'
  },
  {
    id: 'c6',
    category: 'VENTURE CAPITAL',
    rating: 4.95,
    title: 'Venture Capital & Deal Structuring',
    tutor: 'Ananya Iyer',
    duration: '135 mins',
    nodes: 8,
    price: '₹3,499'
  }
];

export default function FeaturedCourses() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(2); // Cross-Border Corporate Compliance as active center
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [addedCourseId, setAddedCourseId] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState(1200);
  const [isHovered, setIsHovered] = useState(false);

  const total = FEATURED_COURSES.length;

  // Viewport intersection observer for smooth starting entrance animation
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

  // Screen width monitoring for responsive 3D card layout
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, handlePrev, handleNext]);

  // Subtle auto-advance when user is not hovering
  useEffect(() => {
    if (!isVisible || isHovered) return;
    const interval = setInterval(() => {
      handleNext();
    }, 5500);
    return () => clearInterval(interval);
  }, [isVisible, isHovered, handleNext]);

  const handleAddToCart = (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation();
    setAddedCourseId(courseId);
    setTimeout(() => {
      setAddedCourseId((prev) => (prev === courseId ? null : prev));
    }, 2000);
  };

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 40) {
      handleNext();
    } else if (diff < -40) {
      handlePrev();
    }
    setTouchStartX(null);
  };

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  const maxVisibleDiff = windowWidth >= 1280 ? 2 : 1;

  return (
    <section 
      ref={sectionRef} 
      className="relative w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden select-none"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header with Staggered Entrance Animation */}
        <div 
          className={`text-center mb-12 sm:mb-16 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#2B4788] font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-[#2B4788] animate-pulse" />
            <span>ACCELERATED SPECIALIZATIONS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1E3BB8] tracking-tight font-['Poppins',sans-serif]">
            Featured courses
          </h2>
          <p className="mt-2.5 sm:mt-3 text-sm sm:text-base text-slate-500 font-normal">
            Hand-picked to move you forward.
          </p>
        </div>

        {/* Carousel Showcase Container */}
        <div 
          className="relative max-w-7xl mx-auto flex items-center justify-between"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Left Arrow Button - Positioned completely clear of card stack with high z-index */}
          <button
            onClick={handlePrev}
            aria-label="Previous Course"
            className={`z-40 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white border border-slate-200/90 shadow-lg hover:shadow-xl flex items-center justify-center text-slate-700 hover:text-[#2B4788] hover:border-blue-400 transition-all duration-300 active:scale-95 group shrink-0 ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}
          >
            <svg 
              className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              strokeWidth="2.2"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* 3D Coverflow Stage */}
          <div 
            className={`relative flex-1 h-[410px] sm:h-[440px] flex items-center justify-center transition-all duration-1000 delay-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{ perspective: '1200px' }}
          >
            {/* Soft Ambient Radial Floor Glow under Active Center Card */}
            <div 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-500/20 filter blur-3xl pointer-events-none transition-opacity duration-500"
              style={{ opacity: isVisible ? 1 : 0 }}
            />

            {/* Cards Layer */}
            <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
              {FEATURED_COURSES.map((course, idx) => {
                let diff = idx - activeIndex;
                while (diff > total / 2) diff -= total;
                while (diff < -total / 2) diff += total;

                const isCenter = diff === 0;
                const absDiff = Math.abs(diff);

                // Dynamically cull cards outside the active viewport cone
                if (absDiff > maxVisibleDiff) return null;

                // Responsive 3D Geometry
                const spacing = isMobile ? 120 : isTablet ? 175 : 210;
                const translateX = diff * spacing;
                const translateZ = -absDiff * (isMobile ? 65 : 85);
                const rotateY = diff * -13;
                const scale = isCenter ? (isMobile ? 1.02 : 1.05) : 1 - absDiff * 0.12;
                const zIndex = 30 - absDiff * 10;

                return (
                  <div
                    key={course.id}
                    onClick={() => {
                      if (!isCenter) setActiveIndex(idx);
                    }}
                    className={`absolute w-[285px] sm:w-[335px] md:w-[365px] h-[340px] sm:h-[365px] rounded-3xl p-6 sm:p-7 flex flex-col justify-between cursor-pointer pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden ${
                      isCenter 
                        ? 'shadow-[0_28px_65px_-12px_rgba(20,50,180,0.48),0_10px_20px_rgba(0,0,0,0.12)] border border-blue-300/45' 
                        : 'shadow-lg border border-blue-400/20 hover:brightness-105'
                    }`}
                    style={{
                      transform: `translate3d(${translateX}px, 0, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                      zIndex,
                      // SOLID 100% OPAQUE BACKGROUND - Completely eliminates double-exposed text bleed-through
                      background: isCenter
                        ? 'radial-gradient(circle at 20% 15%, #2a52ee 0%, #1d43cc 40%, #1534a6 80%, #0d216f 100%)'
                        : 'radial-gradient(circle at 20% 15%, #2346c9 0%, #19389e 40%, #122978 80%, #0c1a52 100%)',
                      transformStyle: 'preserve-3d',
                      willChange: 'transform, opacity'
                    }}
                  >
                    {/* Dark/Depth Glass Mask for Side Cards (Opaque mask instead of CSS opacity) */}
                    {!isCenter && (
                      <div 
                        className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-300 z-20"
                        style={{
                          backgroundColor: absDiff === 1 ? 'rgba(10, 20, 60, 0.28)' : 'rgba(8, 14, 45, 0.52)'
                        }}
                      />
                    )}

                    {/* Specular Glaze Highlight Flare */}
                    <div
                      className="absolute inset-0 rounded-3xl pointer-events-none opacity-30 z-10"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 55%)'
                      }}
                    />

                    {/* Header Row: Category Pill & Rating Badge */}
                    <div className="relative z-30 flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-md bg-white text-[#1E3BB8] font-mono text-[10px] sm:text-[11px] font-bold tracking-wider uppercase shadow-sm">
                        {course.category}
                      </span>

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 border border-white/25 text-white font-mono text-xs font-bold shadow-sm backdrop-blur-sm">
                        <span className="text-amber-300">★</span>
                        <span>{course.rating.toFixed(course.rating % 1 === 0 ? 1 : 2)}</span>
                      </span>
                    </div>

                    {/* Body Content */}
                    <div className="relative z-30 my-auto">
                      <h3 className="font-extrabold text-[19px] sm:text-[21px] text-white leading-snug font-['Poppins',sans-serif] line-clamp-2">
                        {course.title}
                      </h3>

                      <p className="mt-2 text-xs text-blue-100/90 font-medium">
                        Tutor: <span className="font-semibold text-white">{course.tutor}</span>
                      </p>

                      {/* Metadata Chips */}
                      <div className="mt-3.5 flex items-center gap-3 text-xs text-blue-100/75 font-mono">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-blue-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="9" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          <span>{course.duration}</span>
                        </div>

                        <span>·</span>

                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-blue-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 3v3m0 12v3m9-9h-3M6 12H3" />
                          </svg>
                          <span>{course.nodes} nodes</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Row: Price Tag & Add To Cart Button */}
                    <div className="relative z-30 pt-3.5 border-t border-white/15 flex items-center justify-between gap-3">
                      <div className="px-3.5 py-1.5 sm:py-2 rounded-xl bg-white text-[#1A1A2E] font-extrabold text-sm sm:text-base font-mono shadow-sm">
                        {course.price}
                      </div>

                      <button
                        onClick={(e) => handleAddToCart(e, course.id)}
                        className={`inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all transform active:scale-95 ${
                          addedCourseId === course.id
                            ? 'bg-emerald-500 text-white shadow-emerald-500/40'
                            : 'bg-gradient-to-r from-[#FF7D47] to-[#FF6B35] hover:from-[#ff8c5a] hover:to-[#ff7642] text-white shadow-[0_6px_20px_rgba(255,107,53,0.35)] hover:-translate-y-0.5'
                        }`}
                      >
                        {addedCourseId === course.id ? (
                          <>
                            <span>✓</span>
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <span className="text-base leading-none font-extrabold">+</span>
                            <span>Add to cart</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Arrow Button - Positioned completely clear of card stack with high z-index */}
          <button
            onClick={handleNext}
            aria-label="Next Course"
            className={`z-40 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white border border-slate-200/90 shadow-lg hover:shadow-xl flex items-center justify-center text-slate-700 hover:text-[#2B4788] hover:border-blue-400 transition-all duration-300 active:scale-95 group shrink-0 ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}
          >
            <svg 
              className="w-5 h-5 transition-transform group-hover:translate-x-0.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              strokeWidth="2.2"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Carousel Pagination Dots */}
        <div 
          className={`mt-6 sm:mt-8 flex items-center justify-center gap-2 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {FEATURED_COURSES.map((_, dotIdx) => (
            <button
              key={`dot-${dotIdx}`}
              onClick={() => setActiveIndex(dotIdx)}
              aria-label={`Go to slide ${dotIdx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                dotIdx === activeIndex
                  ? 'w-8 bg-[#204FD8]'
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
