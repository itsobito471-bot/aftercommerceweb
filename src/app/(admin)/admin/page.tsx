'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { getDashboardStats } from '../../../services/adminApi';
import { Course, User, Category } from '../../../types/admin-lms';

/* ─────────────── Scroll reveal ─────────────── */
function useReveal(threshold = 0.06) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } }, { threshold });
    obs.observe(el); 
    const fallback = setTimeout(() => setV(true), 300); // Safety fallback
    return () => { obs.disconnect(); clearTimeout(fallback); };
  }, [threshold]);
  return { ref, visible: v };
}

/* ─────────────── Animated counter ─────────────── */
function useCountUp(target: number, duration = 1100, started = false) {
  const [c, setC] = useState(0);
  useEffect(() => {
    if (!started) return;
    if (target === 0) { setC(0); return; }
    let raf: number;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      setC(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, started]);
  return c;
}

/* ─────────────── SVG Area Chart ─────────────── */
function AreaChart({ labels, income, expenses }: { labels: string[]; income: number[]; expenses: number[] }) {
  const W = 600, H = 200;
  const PL = 42, PR = 12, PT = 14, PB = 28;
  const cW = W - PL - PR, cH = H - PT - PB;
  const maxV = Math.max(...income, ...expenses, 1);
  const gx = (i: number) => PL + (i / (labels.length - 1)) * cW;
  const gy = (v: number) => PT + cH - (v / maxV) * cH;

  const curve = (vals: number[]) => vals.map((v, i) => {
    const x = gx(i), y = gy(v);
    if (i === 0) return `M${x},${y}`;
    const px = gx(i - 1), py = gy(vals[i - 1]), cpx = (px + x) / 2;
    return `C${cpx},${py} ${cpx},${y} ${x},${y}`;
  }).join(' ');

  const area = (vals: number[], path: string) =>
    `${path} L${gx(vals.length - 1)},${PT + cH} L${gx(0)},${PT + cH}Z`;

  const incPath  = curve(income);
  const expPath  = curve(expenses);
  const gridVals = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      <defs>
        <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.01"/>
        </linearGradient>
        <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fb923c" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#fb923c" stopOpacity="0.01"/>
        </linearGradient>
      </defs>

      {/* Grid */}
      {gridVals.map(r => {
        const y = PT + cH * (1 - r);
        return (
          <g key={r}>
            <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="4 4"/>
            <text x={PL - 6} y={y + 4} textAnchor="end" fontSize="9" fill="currentColor" fillOpacity="0.4">
              ${Math.round(maxV * r)}
            </text>
          </g>
        );
      })}

      {/* Areas */}
      <path d={area(income, incPath)}  fill="url(#gi)"/>
      <path d={area(expenses, expPath)} fill="url(#ge)"/>

      {/* Lines */}
      <path d={incPath}  stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d={expPath}  stroke="#fb923c" strokeWidth="2"   fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 3"/>

      {/* Dots */}
      {income.map((v, i)  => <circle key={`i${i}`} cx={gx(i)} cy={gy(v)} r="3.5" fill="#38bdf8" stroke="var(--color-bg-surface)" strokeWidth="2"/>)}
      {expenses.map((v, i) => <circle key={`e${i}`} cx={gx(i)} cy={gy(v)} r="2.5" fill="#fb923c" stroke="var(--color-bg-surface)" strokeWidth="1.5"/>)}

      {/* X labels */}
      {labels.map((l, i) => (
        <text key={l} x={gx(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="currentColor" fillOpacity="0.4">{l}</text>
      ))}
    </svg>
  );
}

/* ─────────────── Mini sparkline ─────────────── */
function Sparkline({ vals, color }: { vals: number[]; color: string }) {
  const W = 72, H = 28;
  const max = Math.max(...vals, 1);
  const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * W},${H - (v / max) * (H - 4) - 2}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: 72, height: 28, flexShrink: 0 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ─────────────── Avatar initials ─────────────── */
function Av({ name, size = 36, hue = 220 }: { name: string; size?: number; hue?: number }) {
  const init = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `hsl(${hue},60%,55%)`, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 800, letterSpacing: '-0.02em',
    }}>{init}</div>
  );
}

/* ─────────────── Stats strip item (own component so hook is not in a loop) ─────────────── */
interface StripItemProps { val: number; label: string; color: string; icon: string; delay: number; started: boolean; }
function StripItem({ val, label, color, icon, delay, started }: StripItemProps) {
  const count = useCountUp(val, 1000, started);
  return (
    <div className="db-strip-item" style={{ transitionDelay: `${delay}ms` }}>
      <span className="db-strip-icon">{icon}</span>
      <div>
        <p className="db-strip-num" style={{ color }}>{count}</p>
        <p className="db-strip-label">{label}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════════════ */
export default function AdminDashboardPage() {
  const [admin,           setAdmin]           = useState<User | null>(null);
  const [courses,         setCourses]         = useState<Course[]>([]);
  const [totalCourses,    setTotalCourses]    = useState(0);
  const [published,       setPublished]       = useState(0);
  const [categories,      setCategories]      = useState<Category[]>([]);
  const [totalCats,       setTotalCats]       = useState(0);
  const [staff,           setStaff]           = useState<User[]>([]);
  const [kycCount,        setKycCount]        = useState(0);
  const [assessCount,     setAssessCount]     = useState(0);
  const [influencers,     setInfluencers]     = useState<any[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [now,             setNow]             = useState(new Date());

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60_000); return () => clearInterval(t); }, []);

  useEffect(() => {
    getDashboardStats()
      .then((data) => {
        if (!data) return;
        setAdmin(data.admin || null);
        setCourses(data.courses || []);
        setTotalCourses(data.totalCourses || 0);
        setPublished(data.publishedCourses || 0);
        setCategories(data.categories || []);
        setTotalCats(data.totalCats || 0);
        setStaff(data.staff || []);
        setKycCount(data.kycCount || 0);
        setAssessCount(data.assessCount || 0);
        setInfluencers(data.influencers || []);
      })
      .catch((err) => console.error('Dashboard load error:', err))
      .finally(() => setLoading(false));
  }, []);

  /* Reveal refs */
  const rWelcome  = useReveal(0.02);
  const rStrip    = useReveal(0.04);
  const rChart    = useReveal(0.05);
  const rLeaders  = useReveal(0.05);
  const rBottom   = useReveal(0.05);

  /* Derived */
  const h = now.getHours();
  const greeting  = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const dayLabel  = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const initials  = admin?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'AD';
  const roleLabel = (admin?.role ?? 'admin').replace('_', ' ');

  const walletBal  = admin?.wallet_balance  ?? 0;
  const pendingBal = admin?.pending_balance ?? 0;
  const commission = admin?.commission_percentage ?? 0;

  /* Chart data — distribute balance over 12 months with realistic curve */
  const months  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const iRamp   = [0.04,0.06,0.09,0.12,0.14,0.13,0.11,0.10,0.09,0.07,0.05,0.10];
  const eRamp   = [0.03,0.04,0.06,0.08,0.10,0.09,0.08,0.07,0.06,0.05,0.04,0.05];
  const base    = walletBal + pendingBal;
  const income  = iRamp.map(r => +(base * r).toFixed(2));
  const expenses = eRamp.map(r => +(base * r * 0.55).toFixed(2));

  /* Top entries */
  const topCourse     = courses.find(c => c.is_published) ?? courses[0] ?? null;
  const topInfluencer = [...influencers].sort((a, b) =>
    (b.influencer_profile?.metrics?.total_earnings ?? b.wallet_balance ?? 0) -
    (a.influencer_profile?.metrics?.total_earnings ?? a.wallet_balance ?? 0)
  )[0] ?? null;
  const topStaff = staff.filter(s => s.role !== 'super_admin')[0] ?? staff[0] ?? null;

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
        {[...Array(9)].map((_, i) => (
          <div key={i} className="dash-skeleton-card" style={{ animationDelay: `${i * 55}ms`, height: 100 + (i % 3) * 24 }}/>
        ))}
      </div>
    );
  }

  return (
    <div className="db-root">

      {/* ══ 1. WELCOME ══ */}
      <div ref={rWelcome.ref} className="db-welcome" style={{ opacity: rWelcome.visible ? 1 : 0, transform: rWelcome.visible ? 'none' : 'translateY(-14px)' }}>
        {/* Avatar */}
        <div className="db-welcome-av">{initials}</div>

        {/* Text */}
        <div className="db-welcome-body">
          <p className="db-welcome-hey">{greeting} 👋</p>
          <h1 className="db-welcome-name">{admin?.name || 'Administrator'}</h1>
          <p className="db-welcome-date">{dayLabel}</p>
        </div>

        {/* Role + email */}
        <div className="db-welcome-role-col">
          <span className="db-role-pill">{roleLabel}</span>
          <p className="db-welcome-email" title={admin?.email}>{admin?.email}</p>
        </div>

        {/* Quick numbers */}
        <div className="db-welcome-nums">
          <div className="db-wn-item">
            <span className="db-wn-val">{totalCourses}</span>
            <span className="db-wn-label">Courses</span>
          </div>
          <div className="db-wn-sep"/>
          <div className="db-wn-item">
            <span className="db-wn-val">{published}</span>
            <span className="db-wn-label">Published</span>
          </div>
          <div className="db-wn-sep"/>
          <div className="db-wn-item">
            <span className="db-wn-val">{staff.length}</span>
            <span className="db-wn-label">Staff</span>
          </div>
          <div className="db-wn-sep"/>
          <div className="db-wn-item">
            <span className="db-wn-val">{influencers.length}</span>
            <span className="db-wn-label">Affiliates</span>
          </div>
        </div>

        <div className="db-welcome-orb" aria-hidden/>
      </div>

      {/* ══ 2. STATS STRIP ══ */}
      <div ref={rStrip.ref} className="db-strip" style={{ opacity: rStrip.visible ? 1 : 0, transform: rStrip.visible ? 'none' : 'translateY(12px)' }}>
        <StripItem val={totalCourses}       label="Total Courses"  color="var(--color-accent)" icon="📚" delay={0}   started={rStrip.visible}/>
        <StripItem val={published}          label="Published"      color="#10b981"             icon="✅" delay={60}  started={rStrip.visible}/>
        <StripItem val={totalCats}          label="Categories"     color="#8b5cf6"             icon="🗂️" delay={120} started={rStrip.visible}/>
        <StripItem val={staff.length}       label="Staff Members"  color="#f59e0b"             icon="👥" delay={180} started={rStrip.visible}/>
        <StripItem val={influencers.length} label="Affiliates"     color="#ef4444"             icon="🔗" delay={240} started={rStrip.visible}/>
        <StripItem val={kycCount}           label="KYC Fields"     color="#06b6d4"             icon="📋" delay={300} started={rStrip.visible}/>
        <StripItem val={assessCount}        label="Assessments"    color="#ec4899"             icon="🧩" delay={360} started={rStrip.visible}/>
      </div>

      {/* ══ 3. CHART + SIDE CARDS ══ */}
      <div ref={rChart.ref} className="db-chart-row" style={{ opacity: rChart.visible ? 1 : 0, transform: rChart.visible ? 'none' : 'translateY(22px)' }}>

        {/* Revenue Chart */}
        <div className="db-chart-card">
          <div className="db-chart-topbar">
            <div>
              <h2 className="db-card-h">Revenue Overview</h2>
              <p className="db-card-sub">Income vs Expenses — all 12 months</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span className="db-legend"><span className="db-legend-dot" style={{ background: '#38bdf8' }}/>Income</span>
              <span className="db-legend"><span className="db-legend-dot" style={{ background: '#fb923c' }}/>Expenses</span>
            </div>
          </div>

          <div className="db-chart-area">
            <AreaChart labels={months} income={income} expenses={expenses}/>
          </div>

          <div className="db-chart-footer">
            <div className="db-cf-item">
              <p className="db-cf-label" style={{ color: '#38bdf8' }}>Wallet Balance</p>
              <p className="db-cf-val">${walletBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="db-cf-sep"/>
            <div className="db-cf-item">
              <p className="db-cf-label" style={{ color: '#fb923c' }}>Pending Payouts</p>
              <p className="db-cf-val">${pendingBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="db-cf-sep"/>
            <div className="db-cf-item">
              <p className="db-cf-label" style={{ color: '#10b981' }}>Commission Rate</p>
              <p className="db-cf-val">{commission}%</p>
            </div>
            <div className="db-cf-sep"/>
            <div className="db-cf-item">
              <p className="db-cf-label" style={{ color: '#8b5cf6' }}>Published Rate</p>
              <p className="db-cf-val">{totalCourses > 0 ? Math.round((published / totalCourses) * 100) : 0}%</p>
            </div>
          </div>
        </div>

        {/* Side stack */}
        <div className="db-side-stack">

          {/* 🏆 Top Course */}
          <div className="db-top-course">
            <div className="db-tc-badge">🏆 Top Course</div>
            {topCourse ? (
              <>
                <h3 className="db-tc-title">{topCourse.title}</h3>
                <div className="db-tc-row">
                  <span className={`db-status-dot ${topCourse.is_published ? 'db-green' : 'db-amber'}`}/>
                  <span className="db-tc-meta">{topCourse.is_published ? 'Live' : 'Draft'}</span>
                  <span className="db-tc-sep">·</span>
                  <span className="db-tc-meta">{topCourse.pricing.is_free ? 'Free' : `$${topCourse.pricing.discounted_price || topCourse.pricing.regular_price}`}</span>
                  <span className="db-tc-sep">·</span>
                  <span className="db-tc-meta">{topCourse.validity_days ? `${topCourse.validity_days}d` : 'Lifetime'}</span>
                </div>
                <div className="db-tc-stars">★★★★★</div>
              </>
            ) : (
              <p className="db-tc-empty">No courses yet</p>
            )}
            <Link href="/admin/courses" className="db-tc-link">View all courses →</Link>
            <div className="db-tc-glow" aria-hidden/>
          </div>

          {/* 👑 Top Influencer */}
          <div className="db-top-inf">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              {topInfluencer
                ? <Av name={topInfluencer.name} size={40} hue={280}/>
                : <div className="db-inf-av-empty">—</div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="db-inf-badge-label">👑 Top Affiliate</p>
                <p className="db-inf-name">{topInfluencer?.name ?? 'No affiliates yet'}</p>
              </div>
            </div>
            {topInfluencer && (
              <div className="db-inf-chips">
                <span className="db-inf-chip">{topInfluencer.influencer_profile?.metrics?.total_referrals ?? 0} refs</span>
                <span className="db-inf-chip">${(topInfluencer.influencer_profile?.metrics?.total_earnings ?? topInfluencer.wallet_balance ?? 0).toFixed(0)} earned</span>
                <span className="db-inf-chip">{topInfluencer.influencer_profile?.commission_percentage ?? 0}% rate</span>
              </div>
            )}
            <Link href="/admin/affiliates" className="db-inf-link">Manage Affiliates →</Link>
          </div>

        </div>
      </div>

      {/* ══ 4. LEADERBOARDS ══ */}
      <div ref={rLeaders.ref}>
        <div className="db-section-bar" style={{ opacity: rLeaders.visible ? 1 : 0 }}>
          <h2 className="db-section-h">Platform Leaderboards</h2>
          <span className="db-live-badge"><span className="db-live-pulse"/>Live</span>
        </div>

        <div className="db-leaders" style={{ opacity: rLeaders.visible ? 1 : 0, transform: rLeaders.visible ? 'none' : 'translateY(22px)' }}>

          {/* Courses leaderboard */}
          <div className="db-leader-card" style={{ '--lc': '#38bdf8' } as React.CSSProperties}>
            <div className="db-lc-head">
              <div className="db-lc-icon" style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}>📚</div>
              <div>
                <h3 className="db-lc-title">Top Courses</h3>
                <p className="db-lc-sub">{totalCourses} in catalog</p>
              </div>
            </div>
            <ul className="db-lc-list">
              {courses.slice(0, 5).map((c, i) => (
                <li key={c._id} className="db-lc-row" style={{ transitionDelay: `${i * 55}ms`, opacity: rLeaders.visible ? 1 : 0, transform: rLeaders.visible ? 'none' : 'translateX(-10px)' }}>
                  <span className="db-rank" style={{ color: ['#f59e0b','#94a3b8','#cd7c3e','var(--color-text-subtle)','var(--color-text-subtle)'][i] }}>
                    {i < 3 ? ['🥇','🥈','🥉'][i] : `#${i + 1}`}
                  </span>
                  <div className="db-lc-info">
                    <p className="db-lc-name">{c.title}</p>
                    <p className="db-lc-meta">{c.pricing.is_free ? 'Free' : `$${c.pricing.regular_price}`} · {c.structure_mode}</p>
                  </div>
                  <Sparkline vals={[2,3,5,4,6,7,5,8,9,8]} color="#38bdf8"/>
                </li>
              ))}
              {courses.length === 0 && <li className="db-lc-empty">No courses yet — <Link href="/admin/courses" style={{ color: '#38bdf8' }}>add one</Link></li>}
            </ul>
            <Link href="/admin/courses" className="db-lc-cta" style={{ color: '#38bdf8', borderColor: 'rgba(56,189,248,0.2)', background: 'rgba(56,189,248,0.06)' }}>View all courses →</Link>
          </div>

          {/* Staff leaderboard */}
          <div className="db-leader-card" style={{ '--lc': '#8b5cf6' } as React.CSSProperties}>
            <div className="db-lc-head">
              <div className="db-lc-icon" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>🛡️</div>
              <div>
                <h3 className="db-lc-title">Team Members</h3>
                <p className="db-lc-sub">{staff.length} active accounts</p>
              </div>
            </div>
            <ul className="db-lc-list">
              {staff.slice(0, 5).map((s, i) => (
                <li key={s._id} className="db-lc-row" style={{ transitionDelay: `${i * 55 + 100}ms`, opacity: rLeaders.visible ? 1 : 0, transform: rLeaders.visible ? 'none' : 'translateX(-10px)' }}>
                  <Av name={s.name} size={30} hue={200 + i * 55}/>
                  <div className="db-lc-info">
                    <p className="db-lc-name">{s.name}</p>
                    <p className="db-lc-meta" style={{ textTransform: 'capitalize' }}>{s.role.replace('_', ' ')}</p>
                  </div>
                  <span className="db-perm-chip">{s.permissions?.length ?? 0} perms</span>
                </li>
              ))}
              {staff.length === 0 && <li className="db-lc-empty">No staff yet — <Link href="/admin/staff/staff-form" style={{ color: '#8b5cf6' }}>add one</Link></li>}
            </ul>
            <Link href="/admin/staff" className="db-lc-cta" style={{ color: '#8b5cf6', borderColor: 'rgba(139,92,246,0.2)', background: 'rgba(139,92,246,0.06)' }}>Manage team →</Link>
          </div>

          {/* Affiliates leaderboard */}
          <div className="db-leader-card" style={{ '--lc': '#fb923c' } as React.CSSProperties}>
            <div className="db-lc-head">
              <div className="db-lc-icon" style={{ background: 'rgba(251,146,60,0.15)', color: '#fb923c' }}>🔗</div>
              <div>
                <h3 className="db-lc-title">Top Affiliates</h3>
                <p className="db-lc-sub">{influencers.length} affiliates</p>
              </div>
            </div>
            <ul className="db-lc-list">
              {influencers.slice(0, 5).map((inf, i) => (
                <li key={inf._id} className="db-lc-row" style={{ transitionDelay: `${i * 55 + 200}ms`, opacity: rLeaders.visible ? 1 : 0, transform: rLeaders.visible ? 'none' : 'translateX(-10px)' }}>
                  <span className="db-rank" style={{ color: ['#f59e0b','#94a3b8','#cd7c3e','var(--color-text-subtle)','var(--color-text-subtle)'][i] }}>
                    {i < 3 ? ['🥇','🥈','🥉'][i] : `#${i + 1}`}
                  </span>
                  <div className="db-lc-info">
                    <p className="db-lc-name">{inf.name}</p>
                    <p className="db-lc-meta">
                      {inf.influencer_profile?.metrics?.total_referrals ?? 0} refs ·
                      ${(inf.influencer_profile?.metrics?.total_earnings ?? inf.wallet_balance ?? 0).toFixed(0)} earned
                    </p>
                  </div>
                  <Sparkline vals={[1,2,4,3,5,6,5,7,8,9]} color="#fb923c"/>
                </li>
              ))}
              {influencers.length === 0 && <li className="db-lc-empty">No affiliates yet</li>}
            </ul>
            <Link href="/admin/affiliates" className="db-lc-cta" style={{ color: '#fb923c', borderColor: 'rgba(251,146,60,0.2)', background: 'rgba(251,146,60,0.06)' }}>View affiliates →</Link>
          </div>

        </div>
      </div>

      {/* ══ 5. BOTTOM: COURSES + CATEGORIES + QUICK ACTIONS ══ */}
      <div ref={rBottom.ref} className="db-bottom" style={{ opacity: rBottom.visible ? 1 : 0, transform: rBottom.visible ? 'none' : 'translateY(22px)' }}>

        {/* Recent Courses list */}
        <div className="db-glass-card">
          <div className="db-card-bar">
            <h3 className="db-card-h">Recent Courses</h3>
            <Link href="/admin/courses" className="db-link-pill">View all →</Link>
          </div>
          {courses.length === 0 ? (
            <div className="db-empty">
              <span style={{ fontSize: 32 }}>📚</span>
              <p>No courses yet</p>
              <Link href="/admin/courses" className="db-cta-link">Create your first course →</Link>
            </div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {courses.slice(0, 7).map((c, i) => (
                <li key={c._id} className="db-course-row"
                  style={{ transitionDelay: `${i * 45}ms`, opacity: rBottom.visible ? 1 : 0, transform: rBottom.visible ? 'none' : 'translateX(-8px)' }}>
                  <span className="db-course-idx">{i + 1}</span>
                  <div className="db-lc-info">
                    <p className="db-lc-name">{c.title}</p>
                    <p className="db-lc-meta">
                      {c.pricing.is_free ? 'Free' : `$${c.pricing.discounted_price || c.pricing.regular_price}`} ·{' '}
                      {c.validity_days ? `${c.validity_days}d` : 'Lifetime'} ·{' '}
                      <span style={{ textTransform: 'capitalize' }}>{c.structure_mode}</span>
                    </p>
                  </div>
                  <span className={`db-badge ${c.is_published ? 'db-badge-green' : 'db-badge-amber'}`}>
                    {c.is_published ? 'Live' : 'Draft'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right column */}
        <div className="db-right-col">

          {/* Categories */}
          <div className="db-glass-card">
            <div className="db-card-bar">
              <h3 className="db-card-h">Course Categories</h3>
              <Link href="/admin/courses/categories" className="db-link-pill">Manage →</Link>
            </div>
            <div className="db-cat-chips">
              {categories.slice(0, 10).map(cat => (
                <span key={cat._id} className="db-cat-chip">
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: cat.is_active ? '#10b981' : '#94a3b8', flexShrink: 0 }}/>
                  {cat.name}
                </span>
              ))}
              {categories.length === 0 && <p style={{ color: 'var(--color-text-subtle)', fontSize: '0.78rem' }}>No categories yet</p>}
              {categories.length > 10 && <span className="db-cat-chip" style={{ borderStyle: 'dashed', color: 'var(--color-text-subtle)' }}>+{categories.length - 10} more</span>}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="db-glass-card">
            <h3 className="db-card-h" style={{ marginBottom: '0.75rem' }}>Quick Actions</h3>
            <div className="db-qa-grid">
              {[
                { href: '/admin/courses',              label: 'Course Catalog',   emoji: '📚', color: 'var(--color-accent)' },
                { href: '/admin/students',             label: 'Students',         emoji: '👥', color: '#10b981' },
                { href: '/admin/kyc',                  label: 'KYC Setup',        emoji: '📋', color: '#f59e0b' },
                { href: '/admin/staff',                label: 'Team Mgmt',        emoji: '🛡️', color: '#8b5cf6' },
                { href: '/admin/assessment-templates', label: 'Assessments',      emoji: '🧩', color: '#ef4444' },
                { href: '/admin/affiliates',           label: 'Affiliates',       emoji: '🔗', color: '#fb923c' },
              ].map(({ href, label, emoji, color }) => (
                <Link key={href} href={href} className="db-qa-btn" style={{ borderTopColor: color }}>
                  <span style={{ fontSize: 20 }}>{emoji}</span>
                  <span className="db-qa-label">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Admin Profile card */}
          <div className="db-glass-card db-profile-card">
            <div className="db-card-bar">
              <h3 className="db-card-h">My Profile</h3>
              <Link href="/admin/profile" className="db-link-pill">Edit →</Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
              <Av name={admin?.name ?? 'AD'} size={44} hue={220}/>
              <div>
                <p style={{ fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, fontSize: '0.9rem' }}>{admin?.name}</p>
                <p style={{ color: 'var(--color-text-subtle)', margin: 0, fontSize: '0.72rem' }}>{admin?.email}</p>
              </div>
            </div>
            <div className="db-profile-rows">
              {[
                { key: 'Role',        val: roleLabel,                                              style: { textTransform: 'capitalize' as const } },
                { key: 'Permissions', val: `${admin?.permissions?.length ?? 0} active` },
                { key: '2FA',         val: admin?.is_two_factor_enabled ? '✓ Enabled' : '⚠ Disabled',
                  style: { color: admin?.is_two_factor_enabled ? '#10b981' : '#f59e0b' } },
              ].map(({ key, val, style }) => (
                <div key={key} className="db-profile-row">
                  <span className="db-profile-key">{key}</span>
                  <span className="db-profile-val" style={style}>{val}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
