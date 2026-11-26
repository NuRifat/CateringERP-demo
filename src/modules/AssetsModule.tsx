import React, { useState } from 'react';
import { Wrench, Plus } from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { Badge, Card, PageHeader, formatMoney } from '../components/UI';

export const AssetsModule: React.FC = () => {
  const { assets, addAsset, addAssetMaintenance } = useERP();
  const [maintAssetId, setMaintAssetId] = useState(assets[0]?.id ?? '');
  const [maintNote, setMaintNote] = useState('');
  const [maintCost, setMaintCost] = useState(2500);

  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('AST-KIT-005');
  const [newDept, setNewDept] = useState('Kitchen Operations');
  const [newValue, setNewValue] = useState(120000);

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addAsset({
      assetCode: newCode,
      name: newName,
      category: 'Kitchen Equipment',
      department: newDept,
      location: 'Central Kitchen',
      purchaseDate: new Date().toISOString().slice(0, 10),
      purchaseValue: newValue,
      annualDepreciationPct: 15,
      status: 'Active',
    });
    setNewName('');
  };

  return (
    <div>
      <PageHeader
        title="Fixed Asset Management"
        description="Asset register, department allocation, annual depreciation calculations, and maintenance history."
      />

      <Card title="Fixed Asset Register" className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium text-slate-500">
                <th className="py-3 pr-4">Asset &amp; Code</th>
                <th className="py-3 pr-4">Department &amp; Location</th>
                <th className="py-3 pr-4">Purchase Value</th>
                <th className="py-3 pr-4">Annual Depr.</th>
                <th className="py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assets.map((a) => {
                const annualDepr = Math.round((a.purchaseValue * a.annualDepreciationPct) / 100);
                return (
                  <tr key={a.id}>
                    <td className="py-3.5 pr-4">
                      <div className="font-semibold text-slate-900">{a.name}</div>
                      <div className="text-xs text-slate-500">
                        {a.assetCode} • {a.category} • Purchased {a.purchaseDate}
                      </div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <div className="text-slate-800">{a.department}</div>
                      <div className="text-xs text-slate-500">{a.location}</div>
                    </td>
                    <td className="py-3.5 pr-4 font-semibold">{formatMoney(a.purchaseValue)}</td>
                    <td className="py-3.5 pr-4 text-xs text-slate-600">
                      {a.annualDepreciationPct}% ({formatMoney(annualDepr)}/yr)
                    </td>
                    <td className="py-3.5 text-right">
                      <Badge variant="green">{a.status}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Register New Asset">
          <form onSubmit={handleAddAsset} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <input
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="Asset Code"
                className="px-3 py-2 border border-slate-200 rounded-lg"
              />
              <input
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                placeholder="Department"
                className="px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Asset Name (e.g. Heavy Duty Tandoor)"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              required
            />
            <input
              type="number"
              min={1000}
              value={newValue}
              onChange={(e) => setNewValue(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <button
              type="submit"
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add to Register
            </button>
          </form>
        </Card>

        <Card title="Log Asset Maintenance (Auto-posts to Accounts)">
          <div className="space-y-3 text-xs">
            <select
              value={maintAssetId}
              onChange={(e) => setMaintAssetId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>{a.assetCode} — {a.name}</option>
              ))}
            </select>
            <input
              value={maintNote}
              onChange={(e) => setMaintNote(e.target.value)}
              placeholder="Repair / Servicing note"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <input
              type="number"
              min={0}
              value={maintCost}
              onChange={(e) => setMaintCost(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
            <button
              onClick={() => {
                if (!maintNote.trim()) return;
                addAssetMaintenance(maintAssetId, maintNote, maintCost);
                setMaintNote('');
              }}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" /> Record Maintenance
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
