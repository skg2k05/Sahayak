import React, { useState, FormEvent } from 'react';
import { Languages, Volume2, Sparkles, HelpCircle, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../services/api';
import type { Translation } from '../types';
import { Button, ErrorState, SpeakButton, money } from '../components/ui';

export const Translator: React.FC = () => {
  const { token } = useAuth();

  const [text, setText] = useState('');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [data, setData] = useState<Translation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sampleSMS = [
    'UPI txn of Rs 450 debited from a/c **4821 on 22-Aug to Amazon India ref 38491023',
    'Dear SBI User, your A/C 4821 is credited by Rs 2000.00 on 21Aug26 by Salary. Avail Bal: Rs 24580.00',
    'Alert: Rs 1500 debited from A/C 4821 towards Zomato Order #8491. If not done by you, report to bank.',
  ];

  const handleTranslate = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !token) return;

    setLoading(true);
    setError('');

    try {
      const result = await api.translate(text.trim(), language, token);
      setData(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to explain this message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#6D5DFB]/10 px-3 py-1 text-xs font-bold text-[#6D5DFB]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Transaction Explainer</span>
        </div>
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight sm:text-4xl mt-2">
          SMS & Message Translator
        </h1>
        <p className="text-zinc-600 text-sm mt-1">
          Paste any confusing bank SMS to get a calm, plain-language explanation in English or Hindi.
        </p>
      </div>

      {/* Main Input Form Card */}
      <form onSubmit={handleTranslate} className="card p-6 sm:p-8 bg-white shadow-md border border-zinc-200 space-y-5">
        <div>
          <label htmlFor="sms-input" className="block text-sm font-bold text-zinc-900 mb-2">
            Banking Message or SMS Text
          </label>
          <textarea
            id="sms-input"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your bank SMS here... e.g. UPI txn of Rs 450 debited..."
            className="focus-ring w-full rounded-2xl border border-zinc-300 bg-white p-4 font-normal text-base text-zinc-900 placeholder:text-zinc-400"
            required
          />
        </div>

        {/* Quick Sample Chips */}
        <div>
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
            Try a Sample Bank SMS
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleSMS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setText(sample)}
                className="focus-ring rounded-xl bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200 transition text-left"
              >
                Sample #{idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Language Selection */}
        <div className="border-t border-zinc-100 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="block text-xs font-bold text-zinc-800">Select Explanation Language</span>
            <span className="text-xs text-zinc-500">Choose preferred language for the output</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`focus-ring rounded-xl px-4 py-2 text-xs font-bold transition border ${
                language === 'en'
                  ? 'border-[#6D5DFB] bg-[#6D5DFB]/10 text-[#6D5DFB]'
                  : 'border-zinc-200 bg-white text-zinc-600'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`focus-ring rounded-xl px-4 py-2 text-xs font-bold transition border ${
                language === 'hi'
                  ? 'border-[#6D5DFB] bg-[#6D5DFB]/10 text-[#6D5DFB]'
                  : 'border-zinc-200 bg-white text-zinc-600'
              }`}
            >
              हिंदी (Hindi)
            </button>
          </div>
        </div>

        <Button disabled={loading || !text.trim()} className="w-full text-base font-bold" variant="gradient" type="submit">
          {loading ? 'Explaining Message...' : 'Explain This Bank Message →'}
        </Button>
      </form>

      {error && <ErrorState message={error} />}

      {/* EXPLANATION RESULT CARD */}
      {data && (
        <section className="card p-6 sm:p-8 bg-white shadow-xl border border-violet-200 space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              <h2 className="text-xl font-bold text-zinc-900">What This Message Means</h2>
            </div>
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-[#6D5DFB]">
              {language === 'hi' ? 'हिंदी' : 'English'}
            </span>
          </div>

          {/* Plain Language Core Summary */}
          <div className="rounded-2xl bg-gradient-to-r from-violet-50 to-blue-50 p-6 border border-violet-100 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#6D5DFB]">Plain Language Summary</p>
            <p className="text-lg font-bold text-zinc-900 leading-relaxed">{data.plain_language}</p>
          </div>

          {/* Breakdown Grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-zinc-50 p-4 border border-zinc-200">
              <span className="text-xs text-zinc-500 font-semibold block">Detected Amount</span>
              <span className="text-xl font-bold text-zinc-900 mt-1 block">
                {data.amount ? money(data.amount) : 'Not found in SMS'}
              </span>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-4 border border-zinc-200">
              <span className="text-xs text-zinc-500 font-semibold block">Transaction Type</span>
              <span className="text-xl font-bold text-zinc-900 mt-1 block capitalize">
                {data.transaction_type || 'Debit'}
              </span>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-4 border border-zinc-200">
              <span className="text-xs text-zinc-500 font-semibold block">Merchant / Payee</span>
              <span className="text-base font-bold text-zinc-900 mt-1 block">
                {data.merchant || 'General Merchant'}
              </span>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-4 border border-zinc-200">
              <span className="text-xs text-zinc-500 font-semibold block">Bank Account</span>
              <span className="text-base font-bold text-zinc-900 mt-1 block">
                {data.account_last4 ? `•••• ${data.account_last4}` : 'Primary Account'}
              </span>
            </div>
          </div>

          {/* Voice Read Aloud Section */}
          <div className="border-t border-zinc-100 pt-4 flex items-center justify-between">
            <SpeakButton text={data.plain_language} language={language} token={token} />
          </div>
        </section>
      )}
    </div>
  );
};
