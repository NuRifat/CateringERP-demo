import React from 'react';
import {
  TrendingUp,
  Warehouse,
  UtensilsCrossed,
  ShoppingCart,
  Truck,
  ArrowUpRight,
  Package,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { Badge, Card, PageHeader, StatCard, formatMoney } from '../components/UI';
import type { ModuleId } from '../types/erp';

export const DashboardModule: React.FC<{ onNavigate: (m: ModuleId) => void }> = ({ onNavigate }) => {
  const { orders, accounts, inventory, kots, prs, trips, assets, logs, currentUser } = useERP();

  const totalIncome = accounts
    .filter((a) => a.type === 'Income')
    .reduce((s, a) => s + a.amount, 0);
  const totalExpenses = accounts
    .filter((a) => a.type === 'Expense' || a.type === 'COGS')
    .reduce((s, a) => s + a.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  const inventoryValue = inventory.reduce((sum, item) => {
    const qty =
      item.warehouseStock['Central Store'] +
      item.warehouseStock['Cold Storage'] +
      item.warehouseStock['Kitchen Sub-Store'];
    return sum + qty * item.unitCost;
  }, 0);

  const lowStockCount = inventory.filter((i) => {
    const qty =
      i.warehouseStock['Central Store'] +
      i.warehouseStock['Cold Storage'] +
      i.warehouseStock['Kitchen Sub-Store'];
    return qty < i.minStock;
  }).length;

  const activeKots = kots.filter((k) => k.status !== 'Dispatched').length;
  const pendingPRs = prs.filter((p) => p.status === 'Pending').length;
  const activeTrips = trips.filter((t) => t.status !== 'Delivered').length;
  const totalAssetVal = assets.reduce((s, a) => s + a.purchaseValue, 0);

  const canGo = (m: ModuleId) => currentUser?.allowedModules.includes(m);

  return (
    <div>
      <PageHeader
        title="Executive Business Overview"
        description="Real-time operational snapshot across all 10 interconnected catering departments."
      />

      {/* Top KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Revenue (Collected)"
          value={formatMoney(totalIncome)}
          sub={`Net Profit: ${formatMoney(netProfit)}`}
          icon={<TrendingUp className="w-5 h-5" />}
          tone="emerald"
        />
        <StatCard
          label="Inventory Valuation"
          value={formatMoney(inventoryValue)}
          sub={`${lowStockCount} item(s) below min stock`}
          icon={<Warehouse className="w-5 h-5" />}
          tone={lowStockCount > 0 ? 'amber' : 'blue'}
        />
        <StatCard
          label="Active Kitchen KOTs"
          value={String(activeKots)}
          sub={`${pendingPRs} pending purchase req(s)`}
          icon={<UtensilsCrossed className="w-5 h-5" />}
          tone="blue"
        />
        <StatCard
          label="Fleet & Fixed Assets"
          value={formatMoney(totalAssetVal)}
          sub={`${activeTrips} delivery currently in transit`}
          icon={<Package className="w-5 h-5" />}
          tone="default"
        />
      </div>

      {/* Interconnected Workflow Quick Guide */}
      <Card
        title="Interconnected Department Flow"
        subtitle="Confirming an order in CRM automatically cascades through Kitchen, Production, Inventory, Procurement & Accounts"
        className="mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            {
              step: '1. CRM & Orders',
              desc: 'Confirm event quotation',
              mod: 'crm' as ModuleId,
              cls: 'bg-sky-50/70 border-sky-200 hover:bg-sky-100/70 text-sky-950',
              iconCls: 'text-sky-600',
            },
            {
              step: '2. Kitchen KOT',
              desc: 'Auto-split by department',
              mod: 'kitchen' as ModuleId,
              cls: 'bg-indigo-50/70 border-indigo-200 hover:bg-indigo-100/70 text-indigo-950',
              iconCls: 'text-indigo-600',
            },
            {
              step: '3. Production & Store',
              desc: 'BOM math & stock deduct',
              mod: 'inventory' as ModuleId,
              cls: 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/70 text-emerald-950',
              iconCls: 'text-emerald-600',
            },
            {
              step: '4. Procurement',
              desc: 'Auto PR for shortages',
              mod: 'procurement' as ModuleId,
              cls: 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/70 text-amber-950',
              iconCls: 'text-amber-600',
            },
            {
              step: '5. Accounts & Fleet',
              desc: 'Auto ledger & GPS dispatch',
              mod: 'accounts' as ModuleId,
              cls: 'bg-violet-50/70 border-violet-200 hover:bg-violet-100/70 text-violet-950',
              iconCls: 'text-violet-600',
            },
          ].map((item) => (
            <button
              key={item.step}
              disabled={!canGo(item.mod)}
              onClick={() => canGo(item.mod) && onNavigate(item.mod)}
              className={`text-left p-3.5 rounded-xl border transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group ${item.cls}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">{item.step}</span>
                <ArrowUpRight className={`w-3.5 h-3.5 ${item.iconCls} group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform`} />
              </div>
              <p className="text-xs text-slate-600 mt-1">{item.desc}</p>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Catering Orders */}
        <Card
          title="Recent Catering Orders"
          action={
            canGo('crm') && (
              <button
                onClick={() => onNavigate('crm')}
                className="text-xs font-medium text-slate-700 hover:text-slate-900 underline cursor-pointer"
              >
                View all
              </button>
            )
          }
        >
          <div className="divide-y divide-slate-100">
            {orders.slice(0, 5).map((o) => (
              <div key={o.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">{o.eventName}</div>
                  <div className="text-xs text-slate-500">
                    {o.id} • {o.guestCount} guests • {o.eventDate}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold text-slate-900">{formatMoney(o.totalAmount)}</div>
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
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Live Audit Trail */}
        <Card
          title="Live Cross-Department Activity"
          action={
            canGo('admin') && (
              <button
                onClick={() => onNavigate('admin')}
                className="text-xs font-medium text-slate-700 hover:text-slate-900 underline cursor-pointer"
              >
                Audit trail
              </button>
            )
          }
        >
          <div className="space-y-3">
            {logs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-start justify-between gap-3 text-xs border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{log.action}</span>
                    {log.automated && <Badge variant="green">Auto</Badge>}
                  </div>
                  <p className="text-slate-500 mt-0.5 line-clamp-2">{log.details}</p>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">{log.timestamp.slice(11)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Alerts */}
      {(pendingPRs > 0 || activeTrips > 0) && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingPRs > 0 && (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-amber-700" />
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {pendingPRs} Pending Purchase Requisition(s)
                  </div>
                  <div className="text-xs text-slate-600">Auto-generated from stock shortages</div>
                </div>
              </div>
              {canGo('procurement') && (
                <button
                  onClick={() => onNavigate('procurement')}
                  className="px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-medium text-amber-900 hover:bg-amber-100 cursor-pointer"
                >
                  Review PRs
                </button>
              )}
            </div>
          )}
          {activeTrips > 0 && (
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-blue-700" />
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {activeTrips} Vehicle(s) Currently On Delivery
                  </div>
                  <div className="text-xs text-slate-600">Live GPS tracking &amp; POD active</div>
                </div>
              </div>
              {canGo('delivery') && (
                <button
                  onClick={() => onNavigate('delivery')}
                  className="px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-medium text-blue-900 hover:bg-blue-100 cursor-pointer"
                >
                  Track Fleet
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
