import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, ChevronRight, History, Search, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../services/api';
import type { Transaction } from '../types';
import { money, formatDate, Loading, ErrorState, Button } from '../components/ui';

export const Transactions: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'debit' | 'credit'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setError('');

    api.transactions(token)
      .then((res) => {
        setTransactions(res.items || []);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Could not fetch transaction statement history.');
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Loading label="Loading transaction statement timeline..." />;
  if (error) return <ErrorState message={error} />;

  const filteredList = transactions.filter((t) => {
    const isDebit = t.transaction_type.toLowerCase() === 'debit';
    if (filter === 'debit' && !isDebit) return false;
    if (filter === 'credit' && isDebit) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const payeeMatch = t.payee_name?.toLowerCase().includes(q);
      const descMatch = t.description?.toLowerCase().includes(q);
      const refMatch = t.reference?.toLowerCase().includes(q);
      return payeeMatch || descMatch || refMatch;
    }

    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight sm:text-4xl">Transaction Statement</h1>
        <p className="text-zinc-500 text-sm mt-1">Review all your payments, debits, and incoming credits.</p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2" role="group" aria-label="Transaction filters">
          <Button
            size="sm"
            variant={filter === 'all' ? 'primary' : 'secondary'}
            onClick={() => setFilter('all')}
          >
            All Transactions
          </Button>
          <Button
            size="sm"
            variant={filter === 'debit' ? 'primary' : 'secondary'}
            onClick={() => setFilter('debit')}
          >
            Sent (Debits)
          </Button>
          <Button
            size="sm"
            variant={filter === 'credit' ? 'primary' : 'secondary'}
            onClick={() => setFilter('credit')}
          >
            Received (Credits)
          </Button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search payee or reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="focus-ring h-10 w-full rounded-xl border border-zinc-300 bg-white pl-10 pr-4 text-xs font-semibold text-zinc-900 placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* Transactions List Timeline */}
      <div className="card p-6 bg-white shadow-sm border border-zinc-200">
        {filteredList.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {filteredList.map((t) => {
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
                      <h2 className="font-bold text-zinc-900 text-base group-hover:text-[#6D5DFB] transition">
                        {t.payee_name || t.description || 'Bank Transaction'}
                      </h2>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {formatDate(t.created_at)} • <span className="capitalize">{t.status}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className={`block font-bold text-base ${isDebit ? 'text-red-600' : 'text-emerald-600'}`}>
                        {isDebit ? '-' : '+'}{money(t.amount)}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        {t.transaction_type}
                      </span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-zinc-400 group-hover:text-[#6D5DFB] transition" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-zinc-500 space-y-2">
            <p className="font-semibold text-base">No matching transactions found</p>
            <p className="text-xs text-zinc-400">Try adjusting your filter tabs or search query.</p>
          </div>
        )}
      </div>
    </div>
  );
};
