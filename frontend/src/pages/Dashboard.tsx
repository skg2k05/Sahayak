import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Send,
  Wallet,
  Mic,
  History,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Sparkles,
  QrCode,
  FileText,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../services/api';
import type { Account, Transaction } from '../types';
import { money, formatDate, Loading, ErrorState, Modal, Button } from '../components/ui';
import { TiltCard } from '../components/TiltCard';

export const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBalance, setShowBalance] = useState(true);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [billModalOpen, setBillModalOpen] = useState(false);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setError('');

    Promise.all([api.accounts(token), api.transactions(token)])
      .then(([accData, txData]) => {
        setAccounts(accData);
        setTransactions(txData.items || []);
      })
      .catch((err) => {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Could not fetch dashboard information.');
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Loading label="Loading your Sahayak dashboard..." />;
  if (error) return <ErrorState message={error} />;

  const totalBalance = accounts.reduce((acc, current) => acc + Number(current.balance || 0), 0);
  const primaryAccount = accounts.find((a) => a.is_primary) || accounts[0];

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Greeting & User Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight sm:text-4xl">
            {getGreetingTime()}, {user?.full_name?.split(' ')[0] || 'Friend'} 👋
          </h1>
          <p className="text-sm font-medium text-zinc-500 mt-1">
            Welcome to your voice-assisted financial center.
          </p>
        </div>

        <Link
          to="/voice"
          className="focus-ring inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#6D5DFB] to-[#4F8CFF] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#6D5DFB]/20 hover:opacity-95 transition"
        >
          <Mic className="h-4 w-4 animate-pulse" />
          <span>Talk to Sahayak</span>
        </Link>
      </div>

      {/* 3D INTERACTIVE BALANCE CARD SHOWCASE */}
      <section aria-label="Account balance overview" className="perspective-3d">
        <TiltCard className="rounded-3xl" maxTilt={6} scale={1.01} glare={false}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-[#1E1B4B] via-[#312E81] to-[#4338CA] text-white p-7 sm:p-9 shadow-2xl border border-indigo-400/30">
            {/* Subtle gradient glowing spheres behind balance */}
            <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-[#6D5DFB]/30 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-[#4F8CFF]/30 blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-violet-300">
                Primary Account • {primaryAccount?.bank_name || 'Bank'}
              </span>
            </div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="focus-ring flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/20 transition"
              aria-label={showBalance ? 'Hide account balance' : 'Show account balance'}
            >
              {showBalance ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              <span>{showBalance ? 'Hide' : 'Show'}</span>
            </button>
          </div>

          <div className="mt-6 space-y-1">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Total Available Balance</p>
            <div className="flex items-baseline gap-4">
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                {showBalance ? money(totalBalance) : '••••••••'}
              </h2>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between border-t border-white/10 pt-5 text-xs text-zinc-400 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">Account Number:</span>
              <span className="font-mono text-zinc-300">
                {primaryAccount?.account_number ? `•••• ${primaryAccount.account_number.slice(-4)}` : '•••• 4821'}
              </span>
            </div>
            {primaryAccount?.upi_id && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">UPI ID:</span>
                <span className="font-mono text-emerald-300">{primaryAccount.upi_id}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>Fraud Protection Active</span>
            </div>
          </div>
          </div>
        </TiltCard>
      </section>

      {/* QUICK ACTIONS GRID */}
      <section aria-label="Quick actions" className="space-y-4">
        <h2 className="text-xl font-bold text-zinc-900">Quick Actions</h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Link
            to="/send"
            className="focus-ring card flex min-h-[140px] flex-col justify-between p-5 hover:border-[#6D5DFB]/40 hover:shadow-lg transition group bg-white"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6D5DFB]/10 text-[#6D5DFB] group-hover:bg-[#6D5DFB] group-hover:text-white transition">
                <Send className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-bold text-[#6D5DFB] bg-[#6D5DFB]/10 px-2 py-0.5 rounded-md">
                🎙 "Send"
              </span>
            </div>
            <div>
              <span className="block font-bold text-zinc-900 text-base">Send Money</span>
              <span className="text-xs text-zinc-500">Pay payees or UPI IDs</span>
            </div>
          </Link>

          <button
            onClick={() => setQrModalOpen(true)}
            className="focus-ring card flex min-h-[140px] flex-col justify-between p-5 hover:border-[#4F8CFF]/40 hover:shadow-lg transition group bg-white text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4F8CFF]/10 text-[#4F8CFF] group-hover:bg-[#4F8CFF] group-hover:text-white transition">
                <QrCode className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-bold text-[#4F8CFF] bg-[#4F8CFF]/10 px-2 py-0.5 rounded-md">
                🎙 "Receive"
              </span>
            </div>
            <div>
              <span className="block font-bold text-zinc-900 text-base">Receive Money</span>
              <span className="text-xs text-zinc-500">Show UPI QR Code</span>
            </div>
          </button>

          <button
            onClick={() => setBillModalOpen(true)}
            className="focus-ring card flex min-h-[140px] flex-col justify-between p-5 hover:border-emerald-500/40 hover:shadow-lg transition group bg-white text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                <FileText className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                🎙 "Bills"
              </span>
            </div>
            <div>
              <span className="block font-bold text-zinc-900 text-base">Pay Bills</span>
              <span className="text-xs text-zinc-500">Electricity, Mobile, DTH</span>
            </div>
          </button>

          <Link
            to="/transactions"
            className="focus-ring card flex min-h-[140px] flex-col justify-between p-5 hover:border-violet-500/40 hover:shadow-lg transition group bg-white"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition">
                <History className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-bold text-violet-700 bg-violet-500/10 px-2 py-0.5 rounded-md">
                🎙 "History"
              </span>
            </div>
            <div>
              <span className="block font-bold text-zinc-900 text-base">Transactions</span>
              <span className="text-xs text-zinc-500">Statement history</span>
            </div>
          </Link>
        </div>
      </section>

      {/* RECENT TRANSACTIONS SECTION */}
      <section className="card p-6 sm:p-8 bg-white border border-zinc-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Recent Activity</h2>
            <p className="text-xs text-zinc-500">Your latest debits and credits</p>
          </div>
          <Link
            to="/transactions"
            className="focus-ring text-sm font-bold text-[#6D5DFB] hover:underline flex items-center gap-1"
          >
            <span>See all</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {transactions.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {transactions.slice(0, 5).map((t) => {
              const isDebit = t.transaction_type.toLowerCase() === 'debit';
              return (
                <div
                  key={t.id}
                  onClick={() => navigate(`/transactions/${t.id}`)}
                  className="focus-ring group flex cursor-pointer items-center justify-between py-4 hover:bg-zinc-50/80 rounded-2xl px-3 -mx-3 transition"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        isDebit ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {isDebit ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownLeft className="h-6 w-6" />}
                    </div>

                    <div>
                      <h3 className="font-bold text-zinc-900 text-base group-hover:text-[#6D5DFB] transition">
                        {t.payee_name || t.description || 'Bank Transaction'}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {formatDate(t.created_at)} • <span className="capitalize">{t.status}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`block font-bold text-base ${isDebit ? 'text-red-600' : 'text-emerald-600'}`}>
                      {isDebit ? '-' : '+'}{money(t.amount)}
                    </span>
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      {t.transaction_type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-zinc-500 space-y-2">
            <p className="font-semibold text-base">No transactions yet</p>
            <p className="text-xs">Your completed payments will appear here in plain language.</p>
          </div>
        )}
      </section>

      {/* RECEIVE QR MODAL */}
      {qrModalOpen && (
        <Modal title="Receive Money — Your UPI QR" onClose={() => setQrModalOpen(false)}>
          <div className="text-center space-y-6 py-2">
            <p className="text-xs text-zinc-500">Scan this code using any UPI app (PhonePe, Google Pay, PayTM) to receive funds directly into your account.</p>

            <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-3xl bg-slate-50 p-4 shadow-lg border border-slate-200">
              {/* SVG QR Code Simulation */}
              <div className="h-full w-full bg-white p-3 rounded-2xl flex flex-col items-center justify-center space-y-2">
                <QrCode className="h-32 w-32 text-zinc-900" />
                <span className="text-[10px] font-mono font-bold text-zinc-600">
                  {primaryAccount?.upi_id || 'sahayak@upi'}
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-4 border border-zinc-200 text-sm">
              <span className="text-xs font-bold text-zinc-500 uppercase block">Account Holder</span>
              <span className="font-bold text-zinc-900 text-base">{user?.full_name}</span>
            </div>

            <Button className="w-full" onClick={() => setQrModalOpen(false)}>
              Done
            </Button>
          </div>
        </Modal>
      )}

      {/* PAY BILLS MODAL */}
      {billModalOpen && (
        <Modal title="Pay Utilities & Bills" onClose={() => setBillModalOpen(false)}>
          <div className="space-y-4 py-2">
            <p className="text-xs text-zinc-500">Select a bill category to pay using voice or screen shortcuts:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setBillModalOpen(false);
                  navigate('/send?payee=Electricity%20Board&amount=750');
                }}
                className="flex items-center gap-3 rounded-2xl border border-zinc-200 p-4 text-left hover:bg-zinc-50 transition"
              >
                <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">⚡</div>
                <div>
                  <span className="font-bold text-sm text-zinc-900 block">Electricity</span>
                  <span className="text-xs text-zinc-500">State Board</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setBillModalOpen(false);
                  navigate('/send?payee=Mobile%20Recharge&amount=299');
                }}
                className="flex items-center gap-3 rounded-2xl border border-zinc-200 p-4 text-left hover:bg-zinc-50 transition"
              >
                <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">📱</div>
                <div>
                  <span className="font-bold text-sm text-zinc-900 block">Mobile Prepaid</span>
                  <span className="text-xs text-zinc-500">Recharge</span>
                </div>
              </button>
            </div>
            <Button variant="secondary" className="w-full" onClick={() => setBillModalOpen(false)}>
              Close
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
