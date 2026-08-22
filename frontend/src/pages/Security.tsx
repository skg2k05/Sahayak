import React from 'react';
import { ShieldCheck, Lock, Key, AlertTriangle, Cpu, Check, Server, Eye } from 'lucide-react';

export const Security: React.FC = () => {
  return (
    <div className="mx-auto max-w-4xl space-y-12 pb-16 pt-4">
      {/* Hero Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-600">
          <ShieldCheck className="h-4 w-4" />
          <span>Multi-Layer Financial Safety</span>
        </div>
        <h1 className="text-4xl font-extrabold text-zinc-900 sm:text-5xl tracking-tight">
          Bank-Grade Security Architecture
        </h1>
        <p className="text-zinc-600 text-base max-w-2xl mx-auto">
          Your account is protected with strict user isolation, explainable AI fraud detection, rate-limited authentication, and encrypted data tokens.
        </p>
      </div>

      {/* Core Protection Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        <article className="card p-7 bg-white border border-zinc-200 space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900">JWT Token Authentication</h2>
          <p className="text-xs text-zinc-600 leading-relaxed">
            All user requests require cryptographically signed JSON Web Tokens (JWT). Passwords are never stored in plain state or exposed to client local storage.
          </p>
        </article>

        <article className="card p-7 bg-white border border-zinc-200 space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-[#6D5DFB]/10 text-[#6D5DFB] flex items-center justify-center font-bold">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900">Explainable AI Fraud Detection</h2>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Every transaction is evaluated before confirmation against risk models (`POST /api/fraud/check`). You receive human-readable risk reasons before funds move.
          </p>
        </article>

        <article className="card p-7 bg-white border border-zinc-200 space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Key className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900">Password Policy & Rate Limiting</h2>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Registration enforces strong passwords (8+ chars, uppercase, lowercase, numbers). Login and registration endpoints are protected with Redis-backed rate limiting.
          </p>
        </article>

        <article className="card p-7 bg-white border border-zinc-200 space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Server className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900">Strict User Isolation</h2>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Database access rules ensure users can only query their own bank accounts, payees, and transaction records. Cross-account data leakage is strictly blocked.
          </p>
        </article>
      </div>

      {/* Confirmation Safeguard Feature */}
      <section className="rounded-3xl bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-200 text-slate-900 p-8 sm:p-10 space-y-4 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Explicit Confirmation Safeguard</h2>
        <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
          Sahayak never executes a voice command immediately upon speech recognition. Every transfer presents a confirmation screen showing the recipient name, UPI address, amount, and fraud score so you can review before tapping confirm.
        </p>
        <div className="flex items-center gap-3 pt-2 text-emerald-400 font-semibold text-xs">
          <Check className="h-4 w-4" />
          <span>Speech audio captions always displayed on screen</span>
        </div>
      </section>
    </div>
  );
};
