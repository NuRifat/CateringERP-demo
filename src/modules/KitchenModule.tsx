import React, { useState } from 'react';
import { Clock, ChefHat } from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { Badge, Card, PageHeader } from '../components/UI';
import type { KitchenOrderTicket } from '../types/erp';

const DEPARTMENTS = ['All', 'Main Course', 'Tandoor & Grill', 'Sweets & Desserts', 'Beverages'] as const;

export const KitchenModule: React.FC = () => {
  const { kots, updateKOTStatus } = useERP();
  const [deptFilter, setDeptFilter] = useState<string>('All');

  const filtered = deptFilter === 'All' ? kots : kots.filter((k) => k.department === deptFilter);

  const nextStatus = (s: KitchenOrderTicket['status']): KitchenOrderTicket['status'] | null => {
    if (s === 'Pending') return 'Preparing';
    if (s === 'Preparing') return 'Ready';
    if (s === 'Ready') return 'Dispatched';
    return null;
  };

  return (
    <div>
      <PageHeader
        title="Kitchen Management & KOT"
        description="Department-wise Kitchen Order Tickets auto-generated from confirmed orders with scaled ingredient quantities."
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {DEPARTMENTS.map((dept) => (
          <button
            key={dept}
            onClick={() => setDeptFilter(dept)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
              deptFilter === dept
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((kot) => {
          const next = nextStatus(kot.status);
          return (
            <Card key={kot.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-500">{kot.id}</span>
                    <h3 className="text-base font-semibold text-slate-900">{kot.dishName}</h3>
                  </div>
                  <Badge
                    variant={
                      kot.status === 'Pending'
                        ? 'amber'
                        : kot.status === 'Preparing'
                        ? 'blue'
                        : 'green'
                    }
                  >
                    {kot.status}
                  </Badge>
                </div>

                <div className="text-xs text-slate-600 space-y-1 mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <span>Event:</span>
                    <strong className="text-slate-900">{kot.eventName}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Department:</span>
                    <span className="font-medium text-slate-800">{kot.department}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Portions / Guests:</span>
                    <span className="font-semibold text-slate-900">{kot.guestCount} pax</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Event Date
                    </span>
                    <span>{kot.eventDate}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Scaled Recipe Ingredients
                  </div>
                  <ul className="space-y-1 text-xs">
                    {kot.ingredients.map((ing, i) => (
                      <li key={i} className="flex justify-between text-slate-700">
                        <span>{ing.itemName}</span>
                        <span className="font-medium text-slate-900">
                          {ing.qty} {ing.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {next && (
                <button
                  onClick={() => updateKOTStatus(kot.id, next)}
                  className="mt-5 w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ChefHat className="w-3.5 h-3.5" />
                  Mark as {next}
                </button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
