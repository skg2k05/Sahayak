import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, Volume2, X, AlertTriangle, ShieldCheck } from 'lucide-react';

export function LogoIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" aria-hidden="true" className={className} fill="currentColor">
      <path d="M 128.005 191.173 C 128.448 156.208 156.93 128 192 128 L 192 64 L 128 64 C 128 99.346 99.346 128 64 128 L 64 192 L 128 192 Z M 192 256 L 64 256 C 28.654 256 0 227.346 0 192 L 0 64 L 64 64 L 64 0 L 192 0 C 227.346 0 256 28.654 256 64 L 256 192 L 192 192 Z" />
    </svg>
  );
}

export function Brand() {
  return (
    <Link to="/dashboard" className="focus-ring flex items-center gap-2 rounded-xl font-bold text-xl text-zinc-900">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#6D5DFB] to-[#4F8CFF] text-white shadow-md">
        <LogoIcon className="h-5 w-5" />
      </div>
      <span className="tracking-tight text-xl">Sahayak</span>
    </Link>
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: 'min-h-[38px] px-3 text-xs font-semibold rounded-xl',
    md: 'min-h-[48px] px-5 text-sm font-semibold rounded-xl',
    lg: 'min-h-[56px] px-7 text-base font-bold rounded-2xl',
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#6D5DFB] to-[#4F8CFF] text-white shadow-md shadow-[#6D5DFB]/20 hover:opacity-95 active:scale-[0.99]',
    secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border border-zinc-200 active:scale-[0.99]',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.99]',
    ghost: 'bg-transparent text-zinc-700 hover:bg-zinc-100',
    gradient: 'bg-gradient-to-r from-[#6D5DFB] to-[#4F8CFF] text-white shadow-lg shadow-[#6D5DFB]/25 hover:opacity-95 active:scale-[0.99]',
  };

  return (
    <button
      {...props}
      className={`focus-ring inline-flex items-center justify-center transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  voiceHint?: string;
}

export function Input({ label, error, voiceHint, ...props }: InputProps) {
  const id = props.id || props.name;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-zinc-800" htmlFor={id}>
          {label}
        </label>
        {voiceHint && (
          <span className="text-xs text-[#6D5DFB] font-medium flex items-center gap-1">
            🎙 {voiceHint}
          </span>
        )}
      </div>
      <input
        {...props}
        id={id}
        className={`focus-ring min-h-[48px] w-full rounded-xl border bg-white px-4 text-base font-medium text-zinc-900 transition-all placeholder:text-zinc-400 ${
          error ? 'border-red-500 ring-1 ring-red-500' : 'border-zinc-300 hover:border-zinc-400'
        }`}
      />
      {error && <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1"><AlertCircle className="h-3.5 w-3.5" />{error}</p>}
    </div>
  );
}

export function Loading({ label = 'Loading your banking information...' }: { label?: string }) {
  return (
    <div role="status" className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-zinc-500 py-10">
      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#6D5DFB]/10 to-[#4F8CFF]/10 text-[#6D5DFB]">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
      <p className="text-sm font-semibold text-zinc-700">{label}</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-red-900 shadow-sm flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
      <div className="flex-1 text-sm font-medium leading-relaxed">{message}</div>
    </div>
  );
}

export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" role="presentation">
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-zinc-200 outline-none animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="mb-5 flex items-center justify-between border-b border-zinc-100 pb-4">
          <h2 id="modal-title" className="text-xl font-bold text-zinc-900">
            {title}
          </h2>
          <button
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function RiskBadge({ level }: { level: string }) {
  if (level === 'high') {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900">
        <div className="flex items-center gap-2 font-bold text-red-700">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span>⚠ Important warning — High Risk</span>
        </div>
        <p className="mt-1 text-xs text-red-700">This transaction exhibits several unusual patterns. Please verify carefully.</p>
      </div>
    );
  }

  if (level === 'medium') {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
        <div className="flex items-center gap-2 font-bold text-amber-800">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <span>⚠ Please review — Medium Risk</span>
        </div>
        <p className="mt-1 text-xs text-amber-700">This payment looks slightly unusual. Make sure you recognize the recipient.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
      <div className="flex items-center gap-2 font-bold text-emerald-800">
        <ShieldCheck className="h-5 w-5 text-emerald-600" />
        <span>✓ Looks safe — Low Risk</span>
      </div>
      <p className="mt-1 text-xs text-emerald-700">This payment shows standard, trusted activity.</p>
    </div>
  );
}

export function SpeakButton({
  text,
  language = 'en',
  token,
}: {
  text: string;
  language?: string;
  token: string | null;
}) {
  const [playing, setPlaying] = React.useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const say = async () => {
    if (playing) {
      if (audioRef.current) audioRef.current.pause();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }

    setPlaying(true);

    try {
      if (token) {
        const { api } = await import('../api');
        const url = await api.synthesize(text, language, token);
        audioRef.current = new Audio(url);
        audioRef.current.onended = () => setPlaying(false);
        audioRef.current.onerror = () => fallbackSpeech();
        await audioRef.current.play();
      } else {
        fallbackSpeech();
      }
    } catch {
      fallbackSpeech();
    }
  };

  const fallbackSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.onend = () => setPlaying(false);
      utterance.onerror = () => setPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setPlaying(false);
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={() => void say()}
      className={`gap-2 ${playing ? 'border-[#6D5DFB] text-[#6D5DFB] bg-[#6D5DFB]/10' : ''}`}
    >
      <Volume2 className={`h-5 w-5 ${playing ? 'animate-bounce text-[#6D5DFB]' : ''}`} />
      <span>{playing ? 'Stop speech' : '🔊 Read aloud'}</span>
    </Button>
  );
}

export function money(amount: number | string | undefined): string {
  const num = Number(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}
