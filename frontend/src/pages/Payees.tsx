import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Send, Plus, Trash2, ShieldCheck, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../api';
import type { Payee } from '../types';
import { Loading, ErrorState, Button, Input, Modal } from '../components/ui';

export const Payees: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [payees, setPayees] = useState<Payee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newPayeeName, setNewPayeeName] = useState('');
  const [newPayeeUpi, setNewPayeeUpi] = useState('');

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setError('');

    api.payees(token)
      .then(setPayees)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Could not fetch saved payees.');
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Loading label="Loading saved payees..." />;
  if (error) return <ErrorState message={error} />;

  const filteredPayees = payees.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.upi_id?.toLowerCase().includes(q);
  });

  const handleAddPayee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayeeName || !newPayeeUpi) return;

    const newPayee: Payee = {
      id: `p-${Date.now()}`,
      name: newPayeeName,
      upi_id: newPayeeUpi,
      is_trusted: true,
    };

    setPayees([newPayee, ...payees]);
    setAddModalOpen(false);
    setNewPayeeName('');
    setNewPayeeUpi('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight sm:text-4xl">Saved Payees</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage trusted contacts for fast, voice-assisted money transfers.</p>
        </div>

        <Button onClick={() => setAddModalOpen(true)} className="gap-2" variant="gradient">
          <Plus className="h-4 w-4" />
          <span>Add New Payee</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search payee by name or UPI handle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="focus-ring h-11 w-full rounded-2xl border border-zinc-300 bg-white pl-10 pr-4 text-sm font-semibold text-zinc-900 placeholder:text-zinc-400"
        />
      </div>

      {/* Payees Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPayees.map((p) => (
          <article key={p.id} className="card p-6 bg-white border border-zinc-200 space-y-4 hover:border-[#6D5DFB]/40 transition">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#6D5DFB] to-[#4F8CFF] text-white font-bold text-lg shadow-md">
                  {p.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900">{p.name}</h2>
                  <span className="text-xs font-mono text-zinc-500 block">{p.upi_id || p.phone || p.bank_name || 'UPI Contact'}</span>
                </div>
              </div>

              {p.is_trusted && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Trusted
                </span>
              )}
            </div>

            <div className="border-t border-zinc-100 pt-3 flex items-center justify-between">
              <Button
                size="sm"
                variant="primary"
                onClick={() => navigate(`/send?payee=${encodeURIComponent(p.name)}`)}
                className="gap-1.5 w-full"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send Money</span>
              </Button>
            </div>
          </article>
        ))}
      </div>

      {/* Add Payee Modal */}
      {addModalOpen && (
        <Modal title="Add New Payee" onClose={() => setAddModalOpen(false)}>
          <form onSubmit={handleAddPayee} className="space-y-4">
            <Input
              label="Payee Full Name"
              placeholder="e.g. Amit Kumar"
              value={newPayeeName}
              onChange={(e) => setNewPayeeName(e.target.value)}
              required
            />
            <Input
              label="UPI ID / Phone Number"
              placeholder="e.g. amit@upi"
              value={newPayeeUpi}
              onChange={(e) => setNewPayeeUpi(e.target.value)}
              required
            />
            <div className="pt-2 flex gap-2">
              <Button type="submit" className="flex-1" variant="gradient">
                Save Payee
              </Button>
              <Button type="button" variant="secondary" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
