import React, { useState, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Mic, ShieldCheck, Sparkles, Check, Send, Wallet, Lock, History, ArrowRight, Languages } from 'lucide-react';
import { money } from '../components/ui';
import { TiltCard } from '../components/TiltCard';

const HeroScene = React.lazy(() => import('../components/three/HeroScene'));

export const Landing: React.FC = () => {
  const [demoVoiceState, setDemoVoiceState] = useState<'idle' | 'listening' | 'result'>('idle');
  const [demoText, setDemoText] = useState('');

  const simulateDemoVoice = () => {
    setDemoVoiceState('listening');
    setDemoText('Listening...');

    setTimeout(() => {
      setDemoText('Send ₹500 to Rahul Sharma');
      setDemoVoiceState('result');
    }, 1800);
  };

  return (
    <div className="space-y-24 pb-20 relative">
      {/* Subtle Background Radial Depth Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 h-[600px] w-[800px] bg-gradient-to-tr from-[#6D5DFB]/10 via-[#4F8CFF]/5 to-transparent blur-[140px] pointer-events-none -z-10" />

      {/* HERO SECTION */}
      <section className="relative pt-6 sm:pt-12">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Hero Text Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#6D5DFB]/25 bg-[#6D5DFB]/10 px-4 py-1.5 text-xs sm:text-sm font-bold text-[#6D5DFB] shadow-sm backdrop-blur-md">
              <Sparkles className="h-4 w-4" />
              <span>Next-Gen Voice-First Digital Banking</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl leading-[1.08]">
              Your bank.<br />
              <span className="bg-gradient-to-r from-[#6D5DFB] via-[#4F8CFF] to-violet-600 bg-clip-text text-transparent">
                Your voice.
              </span><br />
              Your way.
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed max-w-xl font-medium">
              Sahayak makes everyday banking simpler with voice guidance, clear plain-language explanations, and accessible digital payments designed for everyone.
            </p>

            <div className="flex flex-wrap gap-3.5 pt-2">
              <Link
                to="/register"
                className="focus-ring btn-3d inline-flex min-h-[54px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#6D5DFB] to-[#4F8CFF] px-8 font-bold text-white shadow-xl shadow-[#6D5DFB]/30 hover:opacity-95 text-base"
              >
                <span>Get Started</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/voice"
                className="focus-ring inline-flex min-h-[54px] items-center justify-center gap-2 rounded-2xl border border-slate-200/90 bg-white/90 px-7 font-bold text-slate-800 shadow-md hover:bg-slate-50 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-md"
              >
                <Mic className="h-5 w-5 text-[#6D5DFB]" />
                <span>Try Voice Assistant</span>
              </Link>
            </div>

            {/* Trust highlights */}
            <div className="flex items-center gap-6 pt-6 text-xs font-semibold text-slate-500 border-t border-slate-200/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
                <span>Secure Authentication</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4.5 w-4.5 text-[#6D5DFB]" />
                <span>WCAG 2.1 AA Accessible</span>
              </div>
            </div>
          </div>

          {/* Right — Interactive WebGL 3D Banking Visual */}
          <div className="lg:col-span-6 relative min-h-[420px] sm:min-h-[520px]">
            <div className="absolute inset-0 rounded-3xl">
              <Suspense
                fallback={
                  <div className="h-full w-full rounded-3xl bg-gradient-to-br from-[#6D5DFB]/8 via-transparent to-[#4F8CFF]/8 animate-pulse" />
                }
              >
                <HeroScene />
              </Suspense>
            </div>

            {/* Floating glass info chips above the 3D scene */}
            <div className="pointer-events-none absolute left-0 top-10 z-10 animate-float rounded-2xl bg-white/80 px-4 py-3 shadow-xl border border-slate-200/70 backdrop-blur-xl">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Available Balance</p>
              <p className="text-lg font-black text-slate-900 mt-0.5">₹24,580.00</p>
            </div>

            <div className="pointer-events-none absolute bottom-14 right-0 z-10 animate-float [animation-delay:1.4s] rounded-2xl bg-white/80 px-4 py-3 shadow-xl border border-emerald-200/70 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span>₹500 sent to Rahul ✓ Safe</span>
              </div>
              <p className="text-[10px] font-semibold text-slate-400 mt-1 pl-8">Fraud check passed · UPI</p>
            </div>

            <div className="pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-slate-900/70 px-3.5 py-1.5 text-[11px] font-bold text-white/90 backdrop-blur-md">
              ✦ Drag the coin to spin it
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE VOICE TRY-OUT SECTION */}
      <section id="how-it-works" className="rounded-3xl card p-8 sm:p-14 bg-white relative overflow-hidden border border-slate-200/90 shadow-2xl transition-all duration-300">
        <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-[#6D5DFB]/5 blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center space-y-4 relative z-10">
          <span className="rounded-full bg-[#6D5DFB]/10 px-4 py-1.5 text-xs font-bold text-[#6D5DFB] uppercase tracking-wider border border-[#6D5DFB]/20">
            Interactive Experience
          </span>
          <h2 className="text-3xl font-extrabold sm:text-5xl text-slate-900 tracking-tight">
            Banking made simple. Just speak.
          </h2>
          <p className="text-slate-600 text-base max-w-2xl mx-auto font-medium">
            No endless navigation menus or tiny forms. Speak naturally in English or Hindi and Sahayak will transcribe, confirm, and explain everything.
          </p>

          {/* Interactive Mic Box */}
          <div className="pt-6">
            <div className="mx-auto flex flex-col items-center space-y-5 max-w-md rounded-3xl bg-slate-50/80 p-7 border border-slate-200 shadow-md backdrop-blur-sm">
              <button
                onClick={simulateDemoVoice}
                className={`focus-ring flex h-24 w-24 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 active:scale-95 ${
                  demoVoiceState === 'listening'
                    ? 'bg-red-500 ring-8 ring-red-500/20 animate-pulse'
                    : 'bg-gradient-to-tr from-[#6D5DFB] via-[#4F8CFF] to-violet-600 hover:scale-105 shadow-[#6D5DFB]/30'
                }`}
                aria-label="Try Voice Interaction Demo"
              >
                <Mic className="h-10 w-10 text-white" />
              </button>

              <p className="font-bold text-slate-800 text-sm">
                {demoVoiceState === 'idle'
                  ? 'Tap the microphone to try speaking'
                  : demoVoiceState === 'listening'
                  ? 'Listening...'
                  : 'Sahayak understood:'}
              </p>

              {demoText && (
                <div className="w-full rounded-2xl bg-white p-3.5 border border-slate-200 font-semibold text-slate-900 text-sm shadow-sm">
                  "{demoText}"
                </div>
              )}

              {demoVoiceState === 'result' && (
                <Link
                  to="/register"
                  className="focus-ring w-full rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#4F8CFF] py-3 font-bold text-white text-xs text-center shadow-md hover:opacity-95 transition"
                >
                  Create account to try full transactions →
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section id="features" className="space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">
            Designed for total accessibility
          </h2>
          <p className="mt-3 text-slate-600 font-medium">
            Built specifically for elderly users, people with limited digital literacy, and anyone who prefers voice over typing.
          </p>
        </div>

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          <TiltCard className="card p-8 hover:border-[#6D5DFB]/50 transition-colors duration-300 shadow-lg hover:shadow-xl" maxTilt={9}>
            <article>
              <div className="h-14 w-14 rounded-2xl bg-[#6D5DFB]/10 text-[#6D5DFB] flex items-center justify-center mb-6 shadow-sm border border-[#6D5DFB]/20">
                <Mic className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Voice-First Interaction</h3>
              <p className="mt-2.5 text-sm text-slate-600 leading-relaxed font-medium">
                Check your balance, transfer funds, or explain messages simply by speaking naturally. Live captions are always displayed.
              </p>
            </article>
          </TiltCard>

          <TiltCard className="card p-8 hover:border-[#4F8CFF]/50 transition-colors duration-300 shadow-lg hover:shadow-xl" maxTilt={9}>
            <article>
              <div className="h-14 w-14 rounded-2xl bg-[#4F8CFF]/10 text-[#4F8CFF] flex items-center justify-center mb-6 shadow-sm border border-[#4F8CFF]/20">
                <Languages className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Plain Language SMS Translator</h3>
              <p className="mt-2.5 text-sm text-slate-600 leading-relaxed font-medium">
                Paste complex banking SMS strings like "UPI txn debited..." and get simple explanations in English or Hindi.
              </p>
            </article>
          </TiltCard>

          <TiltCard className="card p-8 hover:border-emerald-500/50 transition-colors duration-300 shadow-lg hover:shadow-xl" maxTilt={9}>
            <article>
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6 shadow-sm border border-emerald-500/20">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Explainable Fraud Checks</h3>
              <p className="mt-2.5 text-sm text-slate-600 leading-relaxed font-medium">
                Every payment is analyzed before execution with clear, human-readable risk warnings (Low, Medium, High).
              </p>
            </article>
          </TiltCard>
        </div>
      </section>

      {/* SECURITY SECTION — CLEAN LIGHT GRADIENT */}
      <section id="security" className="rounded-3xl bg-gradient-to-br from-[#6D5DFB]/10 via-white to-[#4F8CFF]/10 text-slate-900 p-8 sm:p-14 relative overflow-hidden border border-[#6D5DFB]/25 shadow-2xl">
        <div className="grid gap-10 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="rounded-full bg-emerald-100/90 px-3.5 py-1 text-xs font-bold text-emerald-800 uppercase tracking-wider border border-emerald-200 shadow-sm">
              Bank-Grade Protection
            </span>
            <h2 className="text-3xl font-extrabold sm:text-5xl text-slate-900 tracking-tight">
              Financial safety at every single step
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium text-base">
              Sahayak never executes voice transactions without an explicit confirmation screen. You get to review the recipient, amount, and safety check before proceeding.
            </p>
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-sm">
                  <Check className="h-4 w-4" />
                </div>
                <span className="text-sm text-slate-800 font-semibold">No passwords or tokens stored in plain local state</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-sm">
                  <Check className="h-4 w-4" />
                </div>
                <span className="text-sm text-slate-800 font-semibold">AI Fraud risk scoring provided before funds leave your account</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center perspective-3d">
            <TiltCard className="w-full max-w-sm rounded-3xl bg-white p-7 border border-slate-200/90 shadow-2xl space-y-4 backdrop-blur-md" maxTilt={10}>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">SAFETY CHECK</span>
                <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                  ✓ Safe
                </span>
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900">₹500.00</p>
                <p className="text-xs font-semibold text-slate-500 mt-1">To Rahul Sharma (rahul@upi)</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-700 leading-relaxed border border-slate-200 font-medium">
                This transaction has low risk score (15/100). Recipient is in your trusted contact list.
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="rounded-3xl bg-gradient-to-r from-[#6D5DFB] via-[#4F8CFF] to-violet-600 p-10 sm:p-16 text-white text-center shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-extrabold sm:text-5xl tracking-tight">
            Ready for a simpler banking experience?
          </h2>
          <p className="text-violet-100 text-lg font-medium">
            Join thousands of users who bank effortlessly using voice assistance and plain language.
          </p>
          <div className="pt-4">
            <Link
              to="/register"
              className="focus-ring btn-3d inline-flex min-h-[58px] items-center justify-center rounded-2xl bg-white px-9 font-extrabold text-slate-900 shadow-2xl hover:bg-slate-100 text-base"
            >
              Get Started Now — It's Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
