import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { Badge, Card, PageHeader, StatCard, formatMoney } from '../components/UI';
import type { AccountEntry } from '../types/erp';

export const AccountsModule: React.FC = () => {
  const { accounts, orders, addManualAccountEntry } = useERP();
  const [type, setType] = useState<AccountEntry['type']>('Expense');
  const [category, setCategory] = useState('Utilities & Gas');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(5000);

  const totalIncome = accounts.filter((a) => a.type === 'Income').reduce((s, a) => s + a.amount, 0);
  const totalReceivable = accounts.filter((a) => a.type === 'Receivable').reduce((s, a) => s + a.amount, 0);
  const totalPayable = accounts.filter((a) => a.type === 'Payable').reduce((s, a) => s + a.amount, 0);
  const totalCosts = accounts
    .filter((a) => a.type === 'Expense' || a.type === 'COGS')
    .reduce((s, a) => s + a.amount, 0);
  const netProfit = totalIncome - totalCosts;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount <= 0) return;
    addManualAccountEntry({
      type,
      category,
      description,
      amount,
      paymentMethod: 'Bank',
    });
    setDescription('');
  };

  return (
    <div>
      <PageHeader
        title="Accounts & Financial Management"
        description="Automated general ledger, P&L summary, receivables/payables, and event-wise profitability."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Cash & Bank Income" value={formatMoney(totalIncome)} tone="emerald" />
        <StatCard label="Total COGS & Expenses" value={formatMoney(totalCosts)} tone="rose" />
        <StatCard label="Net Profit (P&L)" value={formatMoney(netProfit)} tone={netProfit >= 0 ? 'emerald' : 'rose'} />
        <StatCard
          label="Receivable / Payable"
          value={formatMoney(totalReceivable)}
          sub={`Payable: ${formatMoney(totalPayable)}`}
          tone="amber"
        />
      </div>

      {/* Event-wise Profitability */}
      <Card title="Order & Event-wise Profitability" className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium text-slate-500">
                <th className="py-2.5 pr-4">Event</th>
                <th className="py-2.5 pr-4">Order Revenue</th>
                <th className="py-2.5 pr-4">Est. Food Cost</th>
                <th className="py-2.5 pr-4">Gross Margin</th>
                <th className="py-2.5 text-right">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => {
                const margin = o.totalAmount - o.estimatedCost;
                const pct = o.totalAmount > 0 ? Math.round((margin / o.totalAmount) * 100) : 0;
                return (
                  <tr key={o.id}>
                    <td className="py-3 pr-4">
                      <div className="font-medium text-slate-900">{o.eventName}</div>
                      <div className="text-xs text-slate-500">{o.id} • {o.guestCount} guests</div>
                    </td>
                    <td className="py-3 pr-4 font-medium">{formatMoney(o.totalAmount)}</td>
                    <td className="py-3 pr-4 text-slate-600">{formatMoney(o.estimatedCost)}</td>
                    <td className="py-3 pr-4 font-semibold text-emerald-700">{formatMoney(margin)}</td>
                    <td className="py-3 text-right">
                      <Badge variant="green">{pct}%</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Post Manual Entry + Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Record Manual Voucher">
          <form onSubmit={handleAdd} className="space-y-3 text-xs">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AccountEntry['type'])}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              required
            />
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <button
              type="submit"
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Post Entry
            </button>
          </form>
        </Card>

        <Card title="Integrated General Ledger" className="lg:col-span-2">
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {accounts.map((a) => (
              <div key={a.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{a.category}</span>
                    <Badge
                      variant={
                        a.type === 'Income'
                          ? 'green'
                          : a.type === 'Receivable'
                          ? 'blue'
                          : a.type === 'Payable'
                          ? 'amber'
                          : 'red'
                      }
                    >
                      {a.type}
                    </Badge>
                    {a.automated && <Badge>Auto</Badge>}
                  </div>
                  <div className="text-slate-500 mt-0.5">{a.description}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold text-slate-900">{formatMoney(a.amount)}</div>
                  <div className="text-[11px] text-slate-400">{a.date}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
