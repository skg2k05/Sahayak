import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Send,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  ArrowLeft,
  ShieldCheck,
  Mic,
  Plus,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../services/api';
import type { Account, Payee, Risk, Transaction } from '../types';
import { money, Loading, ErrorState, Button, Input, RiskBadge, SpeakButton } from '../components/ui';

export const SendMoney: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [payees, setPayees] = useState<Payee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedPayee, setSelectedPayee] = useState<Payee | null>(null);
  const [customUpi, setCustomUpi] = useState('');
  const [customName, setCustomName] = useState('');
  const [amount, setAmount] = useState<string>(searchParams.get('amount') || '');
  const [risk, setRisk] = useState<Risk | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setError('');

    Promise.all([api.accounts(token), api.payees(token)])
      .then(([accData, payeeData]) => {
        setAccounts(accData);
        setPayees(payeeData);

        // Handle pre-selected payee from URL search query if provided
        const payeeParam = searchParams.get('payee');
        if (payeeParam && payeeData.length > 0) {
          const match = payeeData.find((p) => p.name.toLowerCase().includes(payeeParam.toLowerCase()));
          if (match) {
            setSelectedPayee(match);
            if (searchParams.get('amount')) setStep(2);
          }
        }
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Could not fetch payment data.');
      })
      .finally(() => setLoading(false));
  }, [token, searchParams]);

  if (loading) return <Loading label="Loading payment transfer system..." />;
  if (error && !submitting) return <ErrorState message={error} />;

  const primaryAccount = accounts.find((a) => a.is_primary) || accounts[0];

  // Run Fraud Risk Assessment API call
  const handlePerformFraudCheck = async () => {
    if (!token || !primaryAccount || (!selectedPayee && !customUpi)) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid payment amount in rupees.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const payeeId = selectedPayee ? selectedPayee.id : payees[0]?.id || primaryAccount.id;
      const riskData = await api.fraud(
        {
          account_id: primaryAccount.id,
          payee_id: payeeId,
          amount: numAmount,
          transaction_type: 'DEBIT',
        },
        token
      );

      setRisk(riskData);
      setStep(3);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Fraud check could not be completed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Execute actual transaction API call
  const handleExecutePayment = async () => {
    if (!token || !primaryAccount) return;
    setError('');
    setSubmitting(true);

    try {
      const payeeName = selectedPayee ? selectedPayee.name : customName || customUpi || 'Recipient';
      const payeeId = selectedPayee ? selectedPayee.id : undefined;

      const tx = await api.createTransaction(
        {
          account_id: primaryAccount.id,
          payee_id: payeeId,
          amount: parseFloat(amount),
          description: `Payment to ${payeeName}`,
        },
        token
      );

      setCompletedTx(tx);
      setStep(4);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Payment failed to process.');
    } finally {
      setSubmitting(false);
    }
  };

  const getConfirmationTextToSpeak = () => {
    const payeeName = selectedPayee ? selectedPayee.name : customName || customUpi;
    return `You are confirming a payment of ${amount} rupees to ${payeeName}. Please review the risk alert before confirming.`;
  };

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">Send Money</h1>
          <p className="text-xs text-zinc-500 mt-1">Step {step} of 4 • Accessible & Safe UPI Transfer</p>
        </div>
        {step > 1 && step < 4 && (
          <button
            onClick={() => setStep((step - 1) as any)}
            className="focus-ring flex items-center gap-1 text-xs font-bold text-zinc-600 hover:text-zinc-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </button>
        )}
      </div>

      {error && <ErrorState message={error} />}

      {/* STEP 1: CHOOSE PAYEE */}
      {step === 1 && (
        <div className="card p-6 sm:p-8 bg-white space-y-6 shadow-md border border-zinc-200">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Who do you want to pay?</h2>
            <p className="text-xs text-zinc-500 mt-1">Select a saved payee or type a new UPI handle.</p>
          </div>

          {/* Saved Payees */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Saved Payees</label>
            <div className="grid gap-3">
              {payees.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPayee(p);
                    setStep(2);
                  }}
                  className="focus-ring flex w-full items-center justify-between rounded-2xl border border-zinc-200 p-4 text-left hover:border-[#6D5DFB]/50 hover:bg-violet-50/50 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-[#6D5DFB] font-bold">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <span className="block font-bold text-zinc-900 text-base group-hover:text-[#6D5DFB] transition">
                        {p.name}
                      </span>
                      <span className="text-xs text-zinc-500">{p.upi_id || p.phone || p.bank_name || 'UPI Address'}</span>
                    </div>
                  </div>
                  {p.is_trusted && (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                      ✓ Trusted
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Or Manual Custom UPI Input */}
          <div className="border-t border-zinc-100 pt-5 space-y-4">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">New Recipient</span>
            <Input
              label="Recipient Name"
              placeholder="e.g. Rahul Sharma"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
            <Input
              label="UPI ID / Phone Number"
              placeholder="rahul@upi or 9876543210"
              value={customUpi}
              onChange={(e) => setCustomUpi(e.target.value)}
            />
            <Button
              disabled={!customUpi}
              className="w-full"
              onClick={() => {
                setSelectedPayee(null);
                setStep(2);
              }}
            >
              Continue with this recipient
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: AMOUNT INPUT */}
      {step === 2 && (
        <div className="card p-6 sm:p-8 bg-white space-y-6 shadow-md border border-zinc-200">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div>
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Paying To</span>
              <h2 className="text-xl font-bold text-zinc-900">
                {selectedPayee ? selectedPayee.name : customName || customUpi}
              </h2>
              <p className="text-xs text-zinc-500">
                {selectedPayee ? selectedPayee.upi_id : customUpi}
              </p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="focus-ring text-xs font-bold text-[#6D5DFB] underline"
            >
              Change
            </button>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-zinc-900" htmlFor="amount-input">
              Enter Amount in Rupees (₹)
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-extrabold text-zinc-400">
                ₹
              </span>
              <input
                id="amount-input"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                inputMode="decimal"
                className="focus-ring min-h-[64px] w-full rounded-2xl border border-zinc-300 bg-white pl-10 pr-4 text-3xl font-extrabold text-zinc-900 placeholder:text-zinc-300"
              />
            </div>

            {/* Quick Amount Chip Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              {[100, 500, 1000, 2000, 5000].map((quick) => (
                <button
                  key={quick}
                  onClick={() => setAmount(quick.toString())}
                  className="focus-ring rounded-xl bg-zinc-100 px-4 py-2 text-xs font-bold text-zinc-800 hover:bg-zinc-200 transition"
                >
                  +₹{quick}
                </button>
              ))}
            </div>
          </div>

          <Button
            disabled={!amount || parseFloat(amount) <= 0 || submitting}
            className="w-full text-base font-bold"
            variant="gradient"
            onClick={handlePerformFraudCheck}
          >
            {submitting ? 'Assessing Risk...' : 'Review Payment & Check Risk →'}
          </Button>
        </div>
      )}

      {/* STEP 3: FRAUD CHECK & REVIEW */}
      {step === 3 && risk && (
        <div className="card p-6 sm:p-8 bg-white space-y-6 shadow-xl border border-zinc-200">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Review Before Confirming</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Sahayak AI analyzed your transfer for financial safety.</p>
          </div>

          {/* Payment Summary Box */}
          <div className="rounded-2xl bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-200 text-slate-900 p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-violet-200/60 pb-3">
              <span className="text-xs text-[#6D5DFB] uppercase font-bold">Payment Amount</span>
              <span className="text-3xl font-black tracking-tight text-slate-900">{money(amount)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block font-medium">Recipient Name</span>
                <span className="font-bold text-slate-900 text-sm">{selectedPayee ? selectedPayee.name : customName || customUpi}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">From Account</span>
                <span className="font-bold text-slate-900 text-sm font-mono">•••• {primaryAccount?.account_number.slice(-4)}</span>
              </div>
            </div>
          </div>

          {/* Fraud Risk Score Badge Component */}
          <div className="space-y-3">
            <RiskBadge level={risk.risk_level} />

            <div className="rounded-2xl bg-zinc-50 p-4 border border-zinc-200 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-zinc-700">
                <span>AI Risk Score Assessment:</span>
                <span className="text-zinc-900">{risk.risk_score} / 100</span>
              </div>
              {risk.reasons.length > 0 && (
                <ul className="list-disc pl-4 space-y-1 text-zinc-600">
                  {risk.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Speech Read Aloud Button */}
          <div className="flex items-center justify-between pt-2">
            <SpeakButton text={getConfirmationTextToSpeak()} token={token} />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-2">
            <Button
              disabled={submitting}
              className="w-full text-base font-bold"
              variant={risk.risk_level === 'high' ? 'danger' : 'gradient'}
              onClick={handleExecutePayment}
            >
              {submitting ? 'Executing Payment...' : `Confirm & Pay ${money(amount)}`}
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => setStep(2)}>
              Modify Payment
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: SUCCESS CELEBRATION */}
      {step === 4 && completedTx && (
        <div className="card p-8 bg-white text-center space-y-6 shadow-2xl border border-emerald-200 animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
            <CheckCircle2 className="h-12 w-12" />
          </div>

          <div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              ✓ Payment Successful
            </span>
            <h2 className="text-3xl font-black text-zinc-900 mt-3">{money(completedTx.amount)}</h2>
            <p className="text-sm font-semibold text-zinc-600 mt-1">
              Sent to {completedTx.payee_name || selectedPayee?.name || customName}
            </p>
          </div>

          <div className="rounded-2xl bg-zinc-50 p-4 border border-zinc-200 text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-500">Transaction Ref:</span>
              <span className="font-mono font-bold text-zinc-800">{completedTx.reference || completedTx.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Status:</span>
              <span className="font-bold text-emerald-700 capitalize">{completedTx.status}</span>
            </div>
          </div>

          <div className="pt-2">
            <SpeakButton
              text={`Payment of ${completedTx.amount} rupees to ${completedTx.payee_name || 'recipient'} was successful.`}
              token={token}
            />
          </div>

          <Button className="w-full font-bold" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      )}
    </div>
  );
};
