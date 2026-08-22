import React, { useEffect, useState } from 'react';
import { Wallet, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../services/api';
import type { Account } from '../types';
import { money, Loading, ErrorState, Button } from '../components/ui';

export const Accounts: React.FC = () => {
  const { token } = useAuth();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setError('');

    api.accounts(token)
      .then(setAccounts)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Could not fetch bank accounts.');
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Loading label="Loading linked bank accounts..." />;
  if (error) return <ErrorState message={error} />;

  const totalBalance = accounts.reduce((acc, current) => acc + Number(current.balance || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight sm:text-4xl">Linked Accounts</h1>
        <p className="text-zinc-500 text-sm mt-1">Manage your bank balances and account parameters in one clear place.</p>
      </div>

      {/* Summary Header */}
      <div className="rounded-3xl glass-dark text-white p-7 shadow-xl border border-white/20">
        <span className="text-xs font-bold uppercase tracking-wider text-violet-300">Total Net Worth</span>
        <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white mt-1">
          {money(totalBalance)}
        </h2>
        <p className="text-xs text-zinc-400 mt-2">Spread across {accounts.length} linked bank account{accounts.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Account Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {accounts.map((acc) => (
          <article key={acc.id} className="card p-6 bg-white shadow-md border border-zinc-200 space-y-4 hover:border-[#6D5DFB]/40 transition">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">{acc.account_type} Account</span>
                <h3 className="text-xl font-bold text-zinc-900 mt-0.5">{acc.bank_name}</h3>
                <span className="font-mono text-xs text-zinc-500 font-semibold block mt-1">
                  Account No: •••• {acc.account_number.slice(-4)}
                </span>
              </div>
              {acc.is_primary && (
                <span className="rounded-full bg-[#6D5DFB]/10 border border-[#6D5DFB]/30 px-3 py-1 text-xs font-bold text-[#6D5DFB]">
                  Primary
                </span>
              )}
            </div>

            <div className="border-t border-zinc-100 pt-3">
              <span className="text-xs text-zinc-400 uppercase font-semibold">Available Balance</span>
              <p className="text-3xl font-extrabold text-zinc-900 mt-0.5">{money(acc.balance)}</p>
            </div>

            {acc.upi_id && (
              <div className="rounded-xl bg-zinc-50 p-3 border border-zinc-200 text-xs flex justify-between items-center">
                <span className="text-zinc-500 font-medium">UPI Address:</span>
                <span className="font-mono font-bold text-emerald-700">{acc.upi_id}</span>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
};
