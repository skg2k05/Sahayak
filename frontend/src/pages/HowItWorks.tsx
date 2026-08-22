import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mic, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Sign in securely',
      desc: 'Log in with your email and password. Voice assistance can guide you through the login form if requested.',
      icon: <ShieldCheck className="h-6 w-6 text-[#6D5DFB]" />,
    },
    {
      num: '02',
      title: 'Speak or tap',
      desc: 'Tap the persistent 3D floating orb and speak naturally in English or Hindi, or select quick onscreen shortcuts.',
      icon: <Mic className="h-6 w-6 text-[#4F8CFF]" />,
    },
    {
      num: '03',
      title: 'Sahayak explains',
      desc: 'Live captions display your interpreted request alongside AI fraud safety scores and plain language SMS explanations.',
      icon: <Sparkles className="h-6 w-6 text-emerald-600" />,
    },
    {
      num: '04',
      title: 'Confirm safely',
      desc: 'Review the payee name, UPI address, amount, and safety check before explicitly confirming your transaction.',
      icon: <CheckCircle2 className="h-6 w-6 text-violet-600" />,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-12 pb-16 pt-4">
      <div className="text-center space-y-3">
        <span className="rounded-full bg-[#6D5DFB]/10 px-4 py-1 text-xs font-bold text-[#6D5DFB]">
          Simple 4-Step Process
        </span>
        <h1 className="text-4xl font-extrabold text-zinc-900 sm:text-5xl tracking-tight">
          How Sahayak Works
        </h1>
        <p className="text-zinc-600 text-base max-w-xl mx-auto">
          No complex menus or confusing financial jargon. Just clear voice commands and safe confirmations.
        </p>
      </div>

      {/* 4 Steps Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <article key={s.num} className="card p-6 bg-white border border-zinc-200 space-y-4 hover:border-[#6D5DFB]/40 transition relative">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-[#6D5DFB]/20 font-mono">{s.num}</span>
              <div className="h-10 w-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                {s.icon}
              </div>
            </div>
            <h2 className="text-lg font-bold text-zinc-900">{s.title}</h2>
            <p className="text-xs text-zinc-600 leading-relaxed">{s.desc}</p>
          </article>
        ))}
      </div>

      {/* Call to Action */}
      <div className="rounded-3xl bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-200 p-8 sm:p-12 text-center space-y-4 shadow-sm">
        <h2 className="text-2xl font-extrabold sm:text-3xl text-slate-900">Experience voice-first banking today</h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Join users enjoying simpler transactions and calm explanations.
        </p>
        <div className="pt-2">
          <Link
            to="/register"
            className="focus-ring inline-flex min-h-[48px] items-center justify-center rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#4F8CFF] px-6 font-bold text-white shadow-lg hover:opacity-95"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
};
