import React from 'react';
import { Link } from 'react-router-dom';
import { LogoIcon } from '../ui';
import { useAccessibility } from '../../context/AccessibilityContext';
import { Mic, MessageSquareText, Languages, Shield, Check, ArrowRight, Lock, HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, setLanguage } = useAccessibility();

  return (
    <footer className="relative bg-[#11131A] text-white pt-20 pb-8 overflow-hidden border-t border-white/10">
      {/* Subtle Purple & Electric Ambient Glow Accents */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[#635BFF]/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] translate-y-1/2 rounded-full bg-[#4F8CFF]/10 blur-[140px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-[88rem] px-6 sm:px-8 lg:px-12 space-y-16">
        
        {/* 1. TOP BRAND STATEMENT & ACTION BANNER */}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center border-b border-white/10 pb-16">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#635BFF]/30 bg-[#635BFF]/10 px-4 py-1.5 text-xs font-bold text-[#A594FF]">
              <SparklesIcon className="h-3.5 w-3.5" />
              <span>Voice-First Accessible Digital Banking</span>
            </div>
            <h2 className="text-3xl font-extrabold sm:text-5xl lg:text-6xl tracking-tight text-white leading-[1.1]">
              Banking that listens.<br />
              <span className="bg-gradient-to-r from-[#A594FF] via-[#70A5FF] to-violet-400 bg-clip-text text-transparent">
                Banking that understands.
              </span>
            </h2>
            <p className="text-base text-white/70 leading-relaxed max-w-2xl">
              Sahayak makes digital banking simpler with voice guidance, plain-language explanations, Hindi support, and accessible financial tools for everyone.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-start lg:items-end">
            <Link
              to="/register"
              className="focus-ring inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-[#635BFF] px-8 font-bold text-white shadow-lg shadow-[#635BFF]/30 hover:bg-[#5249E0] transition active:scale-95 text-sm"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/voice"
              className="focus-ring inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 font-bold text-white hover:bg-white/10 transition active:scale-95 text-sm backdrop-blur-sm"
            >
              <Mic className="h-4 w-4 text-[#A594FF]" />
              <span>Try Voice Assistant</span>
            </Link>
          </div>
        </div>

        {/* 2. MAIN NAVIGATION GRID & BRAND COLUMN */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-6">
          
          {/* Brand Column (Col Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="focus-ring inline-flex items-center gap-3 font-extrabold text-2xl text-white">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#635BFF] to-[#4F8CFF] text-white shadow-lg shadow-[#635BFF]/30">
                <LogoIcon className="h-6 w-6" />
              </div>
              <span className="tracking-tight text-2xl">
                Sahayak<span className="text-[#A594FF]">.ai</span>
              </span>
            </Link>

            <p className="text-sm text-white/70 leading-relaxed max-w-sm">
              Voice-first digital banking designed to make financial technology simpler, safer, and more accessible for elderly users and everyone.
            </p>

            {/* Social Media Non-Navigational Icons */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="focus-ring flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-[#635BFF] hover:text-white hover:border-[#635BFF] transition"
                aria-label="Sahayak LinkedIn"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.74a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z"/></svg>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="focus-ring flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-[#635BFF] hover:text-white hover:border-[#635BFF] transition"
                aria-label="Sahayak GitHub"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="focus-ring flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-[#635BFF] hover:text-white hover:border-[#635BFF] transition"
                aria-label="Sahayak Twitter"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="focus-ring flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-[#635BFF] hover:text-white hover:border-[#635BFF] transition"
                aria-label="Sahayak Instagram"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>

          {/* Column 1: PRODUCT */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-white/50">Product</h3>
            <ul className="space-y-2.5 text-sm text-white/70 font-semibold">
              <li><Link to="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
              <li><Link to="/accounts" className="hover:text-white transition">Accounts</Link></li>
              <li><Link to="/transactions" className="hover:text-white transition">Transactions</Link></li>
              <li><Link to="/voice" className="hover:text-white transition">Voice Banking</Link></li>
              <li><Link to="/translator" className="hover:text-white transition">Transaction Translator</Link></li>
              <li><Link to="/security" className="hover:text-white transition">Fraud Protection</Link></li>
            </ul>
          </div>

          {/* Column 2: FEATURES */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-white/50">Features</h3>
            <ul className="space-y-2.5 text-sm text-white/70 font-semibold">
              <li><Link to="/voice" className="hover:text-white transition">Voice Assistant</Link></li>
              <li><Link to="/accessibility" className="hover:text-white transition">Hindi Support</Link></li>
              <li><Link to="/translator" className="hover:text-white transition">Plain-Language Explanations</Link></li>
              <li><Link to="/accessibility" className="hover:text-white transition">Accessibility Settings</Link></li>
              <li><Link to="/security" className="hover:text-white transition">Transaction Safety Check</Link></li>
              <li><Link to="/voice" className="hover:text-white transition">Live Text Captions</Link></li>
            </ul>
          </div>

          {/* Column 3: COMPANY */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-white/50">Company</h3>
            <ul className="space-y-2.5 text-sm text-white/70 font-semibold">
              <li><Link to="/" className="hover:text-white transition">About Sahayak</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition">How It Works</Link></li>
              <li><Link to="/security" className="hover:text-white transition">Security Architecture</Link></li>
              <li><Link to="/accessibility" className="hover:text-white transition">Accessibility Standard</Link></li>
              <li><a href="#contact" className="hover:text-white transition">Contact Us</a></li>
            </ul>
          </div>

          {/* Column 4: SUPPORT */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-white/50">Support</h3>
            <ul className="space-y-2.5 text-sm text-white/70 font-semibold">
              <li><a href="#help" className="hover:text-white transition">Help Center</a></li>
              <li><a href="#faqs" className="hover:text-white transition">FAQs</a></li>
              <li><a href="#contact" className="hover:text-white transition">Contact Support</a></li>
              <li><a href="#privacy" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-white transition">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* 3. "BUILT FOR EVERYONE" ACCESSIBILITY CARD */}
        <div className="rounded-3xl bg-[#181B24] p-8 border border-white/10 grid gap-6 md:grid-cols-12 md:items-center relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-[#635BFF]/10 blur-3xl pointer-events-none" />

          <div className="md:col-span-7 space-y-2">
            <div className="flex items-center gap-2">
              <HeartHandshake className="h-5 w-5 text-[#A594FF]" />
              <h3 className="text-xl font-extrabold text-white">Built for everyone.</h3>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Voice guidance, readable captions, simple plain-language explanations, and multilingual support help make digital banking easier for elderly users and everyone.
            </p>
          </div>

          <div className="md:col-span-5 flex items-center justify-start md:justify-end gap-3 flex-wrap">
            <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-3.5 py-2 border border-white/10 text-xs font-bold text-white/80">
              <Mic className="h-4 w-4 text-[#A594FF]" />
              <span>Voice</span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-3.5 py-2 border border-white/10 text-xs font-bold text-white/80">
              <MessageSquareText className="h-4 w-4 text-[#70A5FF]" />
              <span>Captions</span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-3.5 py-2 border border-white/10 text-xs font-bold text-white/80">
              <Languages className="h-4 w-4 text-emerald-400" />
              <span>Hindi / English</span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-3.5 py-2 border border-white/10 text-xs font-bold text-white/80">
              <Shield className="h-4 w-4 text-[#A594FF]" />
              <span>Safety Check</span>
            </div>
          </div>
        </div>

        {/* 4. SECURITY BADGES ROW */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-b border-white/10 py-6 text-xs font-semibold text-white/70">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>Secure authentication</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>User-scoped banking access</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>Voice + text caption support</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>WCAG 2.1 AA Accessibility focused</span>
          </div>
        </div>

        {/* 5. FOOTER CTA CARD */}
        <div className="rounded-3xl bg-gradient-to-r from-[#1E2230] to-[#181B24] p-8 sm:p-10 border border-white/15 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl font-extrabold text-white">Ready to bank your way?</h3>
            <p className="text-xs text-white/70 leading-relaxed">
              Use your voice, understand your transactions, and take control of your everyday banking with Sahayak.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/register"
              className="focus-ring inline-flex min-h-[48px] items-center justify-center rounded-xl bg-[#635BFF] px-6 text-xs font-bold text-white shadow-lg shadow-[#635BFF]/30 hover:bg-[#5249E0] transition"
            >
              Get Started
            </Link>
            <Link
              to="/voice"
              className="focus-ring inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 text-xs font-bold text-white hover:bg-white/10 transition"
            >
              <Mic className="h-4 w-4 text-[#A594FF]" />
              <span>Try Voice Assistant</span>
            </Link>
          </div>
        </div>

        {/* 6. LANGUAGE & BOTTOM COPYRIGHT ROW */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between text-xs text-white/60">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Preferred Language:</span>
              <button
                onClick={() => setLanguage('en')}
                className={`focus-ring rounded-lg px-2.5 py-1 font-bold transition border ${
                  settings.language === 'en'
                    ? 'border-[#635BFF] bg-[#635BFF]/20 text-[#A594FF]'
                    : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`focus-ring rounded-lg px-2.5 py-1 font-bold transition border ${
                  settings.language === 'hi'
                    ? 'border-[#635BFF] bg-[#635BFF]/20 text-[#A594FF]'
                    : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                हिंदी (Hindi)
              </button>
            </div>

            <span className="hidden sm:block text-white/40">Built for simpler banking.</span>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col gap-3 text-center sm:flex-row sm:items-center sm:justify-between text-xs text-white/50 font-medium">
            <p>© 2026 Sahayak.ai. All rights reserved.</p>
            <div className="flex items-center justify-center gap-4 text-white/60">
              <a href="#privacy" className="hover:text-white transition">Privacy Policy</a>
              <span>•</span>
              <a href="#terms" className="hover:text-white transition">Terms of Service</a>
              <span>•</span>
              <Link to="/accessibility" className="hover:text-white transition">Accessibility</Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}
