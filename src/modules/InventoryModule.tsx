import React, { useState } from 'react';
import { ArrowRightLeft, AlertTriangle } from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { Badge, Card, PageHeader, formatMoney } from '../components/UI';
import type { InventoryItem } from '../types/erp';

const WAREHOUSES: (keyof InventoryItem['warehouseStock'])[] = [
  'Central Store',
  'Cold Storage',
  'Kitchen Sub-Store',
];

export const InventoryModule: React.FC = () => {
  const { inventory, movements, transferStock, recordWastage } = useERP();

  const [trItem, setTrItem] = useState(inventory[0]?.id ?? '');
  const [fromWh, setFromWh] = useState<keyof InventoryItem['warehouseStock']>('Central Store');
  const [toWh, setToWh] = useState<keyof InventoryItem['warehouseStock']>('Kitchen Sub-Store');
  const [trQty, setTrQty] = useState(10);

  const [wItem, setWItem] = useState(inventory[0]?.id ?? '');
  const [wWh, setWWh] = useState<keyof InventoryItem['warehouseStock']>('Kitchen Sub-Store');
  const [wQty, setWQty] = useState(1);
  const [wReason, setWReason] = useState('Prep trimmings / spoilage');

  return (
    <div>
      <PageHeader
        title="Inventory & Multi-Warehouse Store"
        description="Real-time stock levels across Central Store, Cold Storage, and Kitchen Sub-Store with weighted average valuation."
      />

      {/* Stock Table */}
      <Card title="Centralized Raw Material Stock" className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium text-slate-500">
                <th className="py-3 pr-4">Item &amp; SKU</th>
                <th className="py-3 pr-4">Central</th>
                <th className="py-3 pr-4">Cold Storage</th>
                <th className="py-3 pr-4">Kitchen Sub</th>
                <th className="py-3 pr-4">Total / Min</th>
                <th className="py-3 pr-4">Avg Cost</th>
                <th className="py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {inventory.map((item) => {
                const total =
                  item.warehouseStock['Central Store'] +
                  item.warehouseStock['Cold Storage'] +
                  item.warehouseStock['Kitchen Sub-Store'];
                const isLow = total < item.minStock;
                return (
                  <tr key={item.id}>
                    <td className="py-3.5 pr-4">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-xs text-slate-500">
                        {item.sku} • {item.category} • Wastage: {item.wastageQty} {item.unit}
                      </div>
                    </td>
                    <td className="py-3.5 pr-4">{item.warehouseStock['Central Store']} {item.unit}</td>
                    <td className="py-3.5 pr-4">{item.warehouseStock['Cold Storage']} {item.unit}</td>
                    <td className="py-3.5 pr-4">{item.warehouseStock['Kitchen Sub-Store']} {item.unit}</td>
                    <td className="py-3.5 pr-4">
                      <span className="font-semibold text-slate-900">
                        {total.toFixed(1)} {item.unit}
                      </span>
                      <span className="text-xs text-slate-400"> / {item.minStock}</span>
                    </td>
                    <td className="py-3.5 pr-4">{formatMoney(item.unitCost)}</td>
                    <td className="py-3.5 text-right">
                      <Badge variant={isLow ? 'red' : 'green'}>
                        {isLow ? 'Low Stock Alert' : 'Healthy'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Transfer & Wastage Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card title="Inter-Warehouse Stock Transfer">
          <div className="space-y-3 text-xs">
            <select
              value={trItem}
              onChange={(e) => setTrItem(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              {inventory.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={fromWh}
                onChange={(e) => setFromWh(e.target.value as keyof InventoryItem['warehouseStock'])}
                className="px-2 py-2 border border-slate-200 rounded-lg bg-white"
              >
                {WAREHOUSES.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
              <select
                value={toWh}
                onChange={(e) => setToWh(e.target.value as keyof InventoryItem['warehouseStock'])}
                className="px-2 py-2 border border-slate-200 rounded-lg bg-white"
              >
                {WAREHOUSES.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
              <input
                type="number"
                min={1}
                value={trQty}
                onChange={(e) => setTrQty(Number(e.target.value))}
                className="px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <button
              onClick={() => transferStock(trItem, fromWh, toWh, trQty)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Transfer Stock
            </button>
          </div>
        </Card>

        <Card title="Record Wastage / Spoilage">
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <select
                value={wItem}
                onChange={(e) => setWItem(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                {inventory.map((i) => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
              <select
                value={wWh}
                onChange={(e) => setWWh(e.target.value as keyof InventoryItem['warehouseStock'])}
                className="px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                {WAREHOUSES.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                min={0.5}
                step={0.5}
                value={wQty}
                onChange={(e) => setWQty(Number(e.target.value))}
                className="px-3 py-2 border border-slate-200 rounded-lg"
              />
              <input
                value={wReason}
                onChange={(e) => setWReason(e.target.value)}
                placeholder="Reason"
                className="col-span-2 px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <button
              onClick={() => recordWastage(wItem, wWh, wQty, wReason)}
              className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Log Wastage
            </button>
          </div>
        </Card>
      </div>

      {/* Movement Log */}
      <Card title="Recent Stock Movements">
        <div className="divide-y divide-slate-100 text-xs">
          {movements.slice(0, 8).map((m) => (
            <div key={m.id} className="py-2.5 flex items-center justify-between gap-4">
              <div>
                <span className="font-semibold text-slate-900">{m.itemName}</span>
                <span className="text-slate-500"> • {m.warehouse} • Ref: {m.reference}</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    m.type === 'IN' ? 'green' : m.type === 'WASTAGE' ? 'red' : 'gray'
                  }
                >
                  {m.type} {m.quantity} {m.unit}
                </Badge>
                <span className="text-slate-400">{m.date}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
