import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, X, Sparkles, ShieldCheck } from 'lucide-react';
import { Button, Input, ErrorState } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/api';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  // Dynamic Password Validation Criteria
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setError('Please satisfy all password security requirements before proceeding.');
      return;
    }

    setError('');
    setPending(true);

    try {
      await register({
        full_name: fullName,
        email: email,
        phone: phone.trim() || null,
        password: password,
        preferred_language: 'en',
        accessibility_settings: {},
      });
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Could not create account. Please check your network connection.');
      }
    } finally {
      setPending(false);
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
            <span>Create Your Free Account</span>
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900">Get Started</h1>
          <p className="text-sm text-zinc-600">A simpler, safer voice-first way to manage everyday digital banking.</p>
        </div>

        {error && (
          <div className="mt-6">
            <ErrorState message={error} />
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <Input
            label="Full name"
            type="text"
            name="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="Rahul Sharma"
            voiceHint="Enter your full name"
          />

          <Input
            label="Email address"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="rahul@example.com"
            voiceHint="Enter your email address"
          />

          <Input
            label="Phone number (optional)"
            type="tel"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            placeholder="+91 98765 43210"
            voiceHint="Enter your phone number"
          />

          <div className="space-y-2">
            <Input
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="••••••••"
              voiceHint="Choose a secure password"
            />

            {/* Dynamic Password Policy Box */}
            <div className="rounded-2xl bg-zinc-50 p-4 border border-zinc-200 text-xs space-y-2">
              <p className="font-bold text-zinc-700">Password must contain:</p>
              <div className="grid grid-cols-2 gap-2">
                <div className={`flex items-center gap-1.5 font-medium ${hasMinLength ? 'text-emerald-700' : 'text-zinc-500'}`}>
                  {hasMinLength ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <X className="h-3.5 w-3.5 text-zinc-400" />}
                  <span>8+ characters</span>
                </div>
                <div className={`flex items-center gap-1.5 font-medium ${hasUppercase ? 'text-emerald-700' : 'text-zinc-500'}`}>
                  {hasUppercase ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <X className="h-3.5 w-3.5 text-zinc-400" />}
                  <span>One uppercase</span>
                </div>
                <div className={`flex items-center gap-1.5 font-medium ${hasLowercase ? 'text-emerald-700' : 'text-zinc-500'}`}>
                  {hasLowercase ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <X className="h-3.5 w-3.5 text-zinc-400" />}
                  <span>One lowercase</span>
                </div>
                <div className={`flex items-center gap-1.5 font-medium ${hasNumber ? 'text-emerald-700' : 'text-zinc-500'}`}>
                  {hasNumber ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <X className="h-3.5 w-3.5 text-zinc-400" />}
                  <span>One number</span>
                </div>
              </div>
            </div>
          </div>

          <Button disabled={pending || !isPasswordValid} className="w-full font-bold text-base" type="submit" variant="gradient">
            {pending ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-8 border-t border-zinc-100 pt-6 text-center text-sm text-zinc-600">
          Already have an account?{' '}
          <Link className="focus-ring font-bold text-[#6D5DFB] underline hover:text-violet-700" to="/login">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
