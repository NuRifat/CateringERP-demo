import React from 'react';
import { useERP } from '../context/ERPContext';
import { Badge, Card, PageHeader, formatMoney } from '../components/UI';

export const ProductionModule: React.FC = () => {
  const { recipes, batches, updateBatchStatus } = useERP();

  return (
    <div>
      <PageHeader
        title="Manufacturing, Recipes & Production (BOM)"
        description="Standardized Bill of Materials per guest, batch-wise production cost calculation, and automatic stock consumption."
      />

      {/* Production Batches */}
      <Card title="Production Batches" subtitle="Auto-scheduled from confirmed catering orders" className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium text-slate-500">
                <th className="py-3 pr-4">Batch ID</th>
                <th className="py-3 pr-4">Dish &amp; Event</th>
                <th className="py-3 pr-4">Guests</th>
                <th className="py-3 pr-4">Calculated Cost</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {batches.map((b) => (
                <tr key={b.id}>
                  <td className="py-3.5 pr-4 font-semibold text-slate-900">{b.id}</td>
                  <td className="py-3.5 pr-4">
                    <div className="font-medium text-slate-900">{b.dishName}</div>
                    <div className="text-xs text-slate-500">
                      {b.eventName} ({b.orderId})
                    </div>
                  </td>
                  <td className="py-3.5 pr-4">{b.guestCount}</td>
                  <td className="py-3.5 pr-4 font-semibold text-slate-900">
                    {formatMoney(b.totalIngredientCost)}
                  </td>
                  <td className="py-3.5 pr-4">
                    <Badge
                      variant={
                        b.status === 'Completed'
                          ? 'green'
                          : b.status === 'In Progress'
                          ? 'blue'
                          : 'amber'
                      }
                    >
                      {b.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 text-right">
                    {b.status !== 'Completed' && (
                      <button
                        onClick={() =>
                          updateBatchStatus(
                            b.id,
                            b.status === 'Scheduled' ? 'In Progress' : 'Completed'
                          )
                        }
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-medium rounded-lg cursor-pointer"
                      >
                        {b.status === 'Scheduled' ? 'Start Batch' : 'Complete Batch'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recipe BOM Master */}
      <Card title="Master Recipe & Bill of Materials (BOM)" subtitle="Standard ingredient ratios per 1 guest">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recipes.map((r) => (
            <div key={r.id} className="border border-sky-200/80 rounded-xl bg-white overflow-hidden hover:border-sky-300 hover:shadow-xs transition">
              <div className="px-4 py-3 bg-sky-50/80 border-b border-sky-100 flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{r.dishName}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{r.department} • {r.prepTimeMins} mins</p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-white border border-sky-200 text-xs font-semibold text-sky-700 shrink-0">
                  {formatMoney(r.pricePerGuest)}/pax
                </span>
              </div>
              <div className="p-4 space-y-2">
                {r.ingredients.map((ing) => (
                  <div key={ing.itemId} className="flex justify-between text-xs text-slate-600">
                    <span>{ing.itemName}</span>
                    <span className="font-medium text-slate-900">
                      {ing.qtyPerGuest} {ing.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
