import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mic, ArrowRight, Lock, Mail, Sparkles, HelpCircle } from 'lucide-react';
import { Button, Input, ErrorState } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/api';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [voiceHelp, setVoiceHelp] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setPending(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Unable to sign in. Please check your network connection.');
      }
    } finally {
      setPending(false);
    }
  };

  const handleVoiceHelpToggle = () => {
    setVoiceHelp(!voiceHelp);
    if (!voiceHelp && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        'To sign in, please enter your email address and password, then click the Sign In button. If you do not have an account, click Create Account.'
      );
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="mx-auto max-w-md pt-6 pb-12">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/" className="focus-ring text-sm font-semibold text-zinc-600 hover:text-zinc-900">
          ← Back to Sahayak
        </Link>
      </div>

      <div className="card p-8 bg-white shadow-xl border border-zinc-200">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#6D5DFB]/10 px-3 py-1 text-xs font-bold text-[#6D5DFB]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Secure Banking Access</span>
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900">Welcome Back</h1>
          <p className="text-sm text-zinc-600">Sign in securely to manage your accounts and voice payments.</p>
        </div>

        {/* Voice Assistance Hint Box */}
        <div className="mt-6 rounded-2xl bg-violet-50/80 p-4 border border-violet-100 flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#6D5DFB] text-white flex items-center justify-center shrink-0">
            <Mic className="h-5 w-5" />
          </div>
          <div className="flex-1 text-xs text-violet-950">
            <p className="font-bold">🎙 Need help logging in?</p>
            <p className="mt-0.5 text-violet-800">Tap below to hear Sahayak guide you through the login form.</p>
            <button
              type="button"
              onClick={handleVoiceHelpToggle}
              className="focus-ring mt-2 font-bold text-[#6D5DFB] underline text-xs"
            >
              {voiceHelp ? '🔊 Pause Voice Helper' : '🔊 Hear Login Guidance'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6">
            <ErrorState message={error} />
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <Input
            label="Email address"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="name@example.com"
            voiceHint="Enter your email address"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            voiceHint="Enter your password"
          />

          <Button disabled={pending} className="w-full font-bold text-base" type="submit" variant="gradient">
            {pending ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-8 border-t border-zinc-100 pt-6 text-center text-sm text-zinc-600">
          New to Sahayak?{' '}
          <Link className="focus-ring font-bold text-[#6D5DFB] underline hover:text-violet-700" to="/register">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
