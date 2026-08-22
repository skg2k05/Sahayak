import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShieldCheck, Volume2, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../services/api';
import type { Transaction } from '../types';
import { money, formatDate, Loading, ErrorState, SpeakButton, RiskBadge, Button } from '../components/ui';

export const TransactionDetail: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { token } = useAuth();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !id) return;

    setLoading(true);
    setError('');

    api.transaction(id, token)
      .then(setTransaction)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Could not fetch transaction details.');
      })
      .finally(() => setLoading(false));
  }, [token, id]);

  if (loading) return <Loading label="Loading transaction details..." />;
  if (error || !transaction) return <ErrorState message={error || 'Transaction not found.'} />;

  const isDebit = transaction.transaction_type.toLowerCase() === 'debit';
  const detailText = `Transaction of ${money(transaction.amount)} ${isDebit ? 'sent to' : 'received from'} ${
    transaction.payee_name || 'recipient'
  } on ${formatDate(transaction.created_at)}. Status is ${transaction.status}.`;

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-12">
      <Link to="/transactions" className="focus-ring text-xs font-bold text-zinc-600 hover:text-zinc-900 inline-flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to All Transactions</span>
      </Link>

      <div className="card p-7 sm:p-9 bg-white shadow-xl border border-zinc-200 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Transaction Details</span>
            <h1 className="text-3xl font-black text-zinc-900 mt-1">
              {isDebit ? '-' : '+'}{money(transaction.amount)}
            </h1>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${isDebit ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
            {transaction.transaction_type}
          </span>
        </div>

        <RiskBadge level="low" />

        {/* Breakdown List */}
        <dl className="divide-y divide-zinc-100 text-sm">
          <div className="flex justify-between py-3">
            <dt className="text-zinc-500 font-medium">Payee / Merchant</dt>
            <dd className="font-bold text-zinc-900 text-right">{transaction.payee_name || transaction.description || 'Bank Transaction'}</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-zinc-500 font-medium">Date & Time</dt>
            <dd className="font-bold text-zinc-900 text-right">{formatDate(transaction.created_at)}</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-zinc-500 font-medium">Status</dt>
            <dd className="font-bold text-emerald-700 capitalize text-right">{transaction.status}</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-zinc-500 font-medium">Reference Number</dt>
            <dd className="font-mono font-semibold text-zinc-800 text-right">{transaction.reference || transaction.id}</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-zinc-500 font-medium">Description</dt>
            <dd className="font-medium text-zinc-700 text-right">{transaction.description || 'N/A'}</dd>
          </div>
        </dl>

        <div className="border-t border-zinc-100 pt-4 flex items-center justify-between">
          <SpeakButton text={detailText} token={token} />
        </div>
      </div>
    </div>
  );
};
