import React, { useState } from 'react';
import { Plus, CheckCircle, DollarSign, Users } from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { Badge, Card, PageHeader, formatMoney } from '../components/UI';

export const CRMModule: React.FC = () => {
  const { customers, orders, recipes, createOrder, confirmOrder, recordOrderPayment } = useERP();
  const [showModal, setShowModal] = useState(false);

  const [customerId, setCustomerId] = useState(customers[0]?.id ?? '');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('2026-11-30');
  const [venue, setVenue] = useState('');
  const [guestCount, setGuestCount] = useState(200);
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>(['rec-1', 'rec-3']);
  const [advancePaid, setAdvancePaid] = useState(50000);

  const toggleRecipe = (id: string) => {
    setSelectedRecipes((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const estimatedTotal = recipes
    .filter((r) => selectedRecipes.includes(r.id))
    .reduce((sum, r) => sum + r.pricePerGuest * guestCount, 0);

  const handleCreate = (confirmNow: boolean) => {
    if (!eventName.trim() || !venue.trim() || selectedRecipes.length === 0) return;
    createOrder({
      customerId,
      eventName,
      eventDate,
      venue,
      guestCount,
      recipeIds: selectedRecipes,
      advancePaid,
      confirmImmediately: confirmNow,
    });
    setShowModal(false);
    setEventName('');
    setVenue('');
  };

  return (
    <div>
      <PageHeader
        title="CRM & Catering Order Management"
        description="Manage clients, event quotations, advance billing, and trigger automated kitchen/inventory workflows."
        action={
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Catering Order
          </button>
        }
      />

      {/* Orders Table */}
      <Card title="Event Orders & Quotations" className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium text-slate-500">
                <th className="py-3 pr-4">Order &amp; Event</th>
                <th className="py-3 pr-4">Client</th>
                <th className="py-3 pr-4">Guests</th>
                <th className="py-3 pr-4">Total / Paid / Due</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {orders.map((o) => {
                const due = o.totalAmount - o.advancePaid;
                return (
                  <tr key={o.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 pr-4">
                      <div className="font-semibold text-slate-900">{o.eventName}</div>
                      <div className="text-xs text-slate-500">
                        {o.id} • {o.eventDate} • {o.venue}
                      </div>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-700">{o.customerName}</td>
                    <td className="py-3.5 pr-4 font-medium text-slate-900">{o.guestCount}</td>
                    <td className="py-3.5 pr-4">
                      <div className="font-semibold text-slate-900">{formatMoney(o.totalAmount)}</div>
                      <div className="text-xs text-slate-500">
                        Paid: {formatMoney(o.advancePaid)} • Due:{' '}
                        <span className={due > 0 ? 'text-rose-600 font-medium' : 'text-emerald-600'}>
                          {formatMoney(due)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <Badge
                        variant={
                          o.status === 'Quotation'
                            ? 'amber'
                            : o.status === 'Delivered'
                            ? 'green'
                            : 'blue'
                        }
                      >
                        {o.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 text-right space-x-2 whitespace-nowrap">
                      {o.status === 'Quotation' && (
                        <button
                          onClick={() => confirmOrder(o.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Confirm Order
                        </button>
                      )}
                      {due > 0 && (
                        <button
                          onClick={() => recordOrderPayment(o.id, due)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg cursor-pointer"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          Collect Due
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Customers Directory */}
      <Card title="Customer Database (CRM)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {customers.map((c) => (
            <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{c.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{c.phone}</div>
                </div>
                <Badge>{c.type}</Badge>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {c.totalOrders} orders
                </span>
                <span className="font-semibold text-slate-900">{formatMoney(c.totalSpent)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* New Order Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900">Create Catering Quotation / Order</h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">
              Select menu items and guest count. Confirming immediately triggers Kitchen KOT, Store deduction, PRs &amp; Accounts.
            </p>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Customer</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Event Name</label>
                  <input
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="e.g. Corporate Dinner"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Event Date</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Venue</label>
                  <input
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. Banani Club"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Guest Count</label>
                  <input
                    type="number"
                    min={10}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Menu Items</label>
                <div className="space-y-1.5">
                  {recipes.map((r) => (
                    <label
                      key={r.id}
                      className="flex items-center justify-between p-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedRecipes.includes(r.id)}
                          onChange={() => toggleRecipe(r.id)}
                        />
                        <span className="text-xs font-medium text-slate-900">{r.dishName}</span>
                      </div>
                      <span className="text-xs text-slate-500">{formatMoney(r.pricePerGuest)} / guest</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Advance Paid ({formatMoney(0).slice(0, 1)})</label>
                  <input
                    type="number"
                    min={0}
                    value={advancePaid}
                    onChange={(e) => setAdvancePaid(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-right">
                  <div className="text-[11px] text-slate-500">Calculated Total</div>
                  <div className="text-base font-semibold text-slate-900">{formatMoney(estimatedTotal)}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCreate(false)}
                className="px-3 py-2 text-xs font-medium border border-slate-300 text-slate-800 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                Save as Quotation
              </button>
              <button
                onClick={() => handleCreate(true)}
                className="px-4 py-2 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-lg cursor-pointer"
              >
                Confirm &amp; Trigger ERP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
