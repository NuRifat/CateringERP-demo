import React, { useState } from 'react';
import { ShoppingCart, PackageCheck, Plus } from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { Badge, Card, PageHeader, formatMoney } from '../components/UI';

export const ProcurementModule: React.FC = () => {
  const { suppliers, prs, pos, invoices, inventory, createPR, convertPRtoPO, receivePO, payInvoice } = useERP();
  const [selectedSupplier, setSelectedSupplier] = useState<Record<string, string>>({});
  const [newPrItem, setNewPrItem] = useState(inventory[0]?.id ?? '');
  const [newPrQty, setNewPrQty] = useState(50);
  const [newPrReason, setNewPrReason] = useState('Scheduled event restock');

  return (
    <div>
      <PageHeader
        title="Procurement & Purchase Management"
        description="Manage suppliers, auto-generated shortage Purchase Requisitions (PR), Purchase Orders (PO), and supplier invoices."
      />

      {/* Purchase Requisitions */}
      <Card
        title="Purchase Requisitions (PR)"
        subtitle="Includes automated shortage requests from confirmed catering orders"
        className="mb-6"
      >
        <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center gap-2 text-xs">
          <select
            value={newPrItem}
            onChange={(e) => setNewPrItem(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
          >
            {inventory.map((i) => (
              <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            value={newPrQty}
            onChange={(e) => setNewPrQty(Number(e.target.value))}
            className="w-24 px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
          />
          <input
            value={newPrReason}
            onChange={(e) => setNewPrReason(e.target.value)}
            placeholder="Reason"
            className="flex-1 min-w-[180px] px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
          />
          <button
            onClick={() => createPR(newPrItem, newPrQty, newPrReason)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Raise PR
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {prs.map((pr) => (
            <div key={pr.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">{pr.id} — {pr.itemName}</span>
                  <Badge variant={pr.status === 'Pending' ? 'amber' : 'green'}>{pr.status}</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Qty: <strong>{pr.quantity} {pr.unit}</strong> • Est: {formatMoney(pr.estimatedCost)} • {pr.reason}
                </p>
              </div>
              {pr.status === 'Pending' && (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedSupplier[pr.id] ?? suppliers[0]?.id}
                    onChange={(e) => setSelectedSupplier((p) => ({ ...p, [pr.id]: e.target.value }))}
                    className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => convertPRtoPO(pr.id, selectedSupplier[pr.id] ?? suppliers[0]?.id)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> Issue PO
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Purchase Orders & Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Purchase Orders (PO)" subtitle="Receiving a PO auto-adds stock & posts Accounts Payable">
          <div className="divide-y divide-slate-100 text-sm">
            {pos.map((po) => (
              <div key={po.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900">{po.id} • {po.itemName}</div>
                  <div className="text-xs text-slate-500">
                    {po.supplierName} • {po.quantity} {po.unit} • {formatMoney(po.totalAmount)}
                  </div>
                </div>
                {po.status === 'Ordered' ? (
                  <button
                    onClick={() => receivePO(po.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <PackageCheck className="w-3.5 h-3.5" /> Receive Goods
                  </button>
                ) : (
                  <Badge variant="green">Received</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Purchase Invoices & Payments">
          <div className="divide-y divide-slate-100 text-sm">
            {invoices.map((inv) => (
              <div key={inv.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900">{inv.id} ({inv.poId})</div>
                  <div className="text-xs text-slate-500">
                    {inv.supplierName} • {formatMoney(inv.amount)}
                  </div>
                </div>
                {inv.status === 'Unpaid' ? (
                  <button
                    onClick={() => payInvoice(inv.id)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg cursor-pointer"
                  >
                    Pay Supplier
                  </button>
                ) : (
                  <Badge variant="green">Paid</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Suppliers */}
      <Card title="Approved Suppliers & Vendors">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <div key={s.id} className="p-4 border border-slate-200 rounded-xl">
              <div className="font-semibold text-sm text-slate-900">{s.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.category} • {s.contactPerson}</div>
              <div className="text-xs text-slate-500 mt-1">{s.phone}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
