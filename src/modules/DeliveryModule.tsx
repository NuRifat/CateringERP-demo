import React, { useState } from 'react';
import { MapPin, Truck, CheckCircle2, Navigation } from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { Badge, Card, PageHeader, formatMoney } from '../components/UI';

export const DeliveryModule: React.FC = () => {
  const { vehicles, trips, orders, dispatchDelivery, completeDelivery } = useERP();
  const readyOrders = orders.filter((o) => o.status === 'Confirmed' || o.status === 'In Production');
  const availableVehicles = vehicles.filter((v) => v.status === 'Available');

  const [selOrder, setSelOrder] = useState(readyOrders[0]?.id ?? '');
  const [selVeh, setSelVeh] = useState(availableVehicles[0]?.id ?? '');
  const [podNote, setPodNote] = useState('Delivered hot & verified by Venue Manager');

  return (
    <div>
      <PageHeader
        title="Vehicle & Delivery Management"
        description="GPS-based live vehicle tracking, driver assignments, fuel/maintenance costs, and Proof of Delivery (POD)."
      />

      {/* Dispatch Bar */}
      <Card title="Assign Vehicle & Dispatch Order" className="mb-6">
        {readyOrders.length > 0 && availableVehicles.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <select
              value={selOrder || readyOrders[0]?.id}
              onChange={(e) => setSelOrder(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              {readyOrders.map((o) => (
                <option key={o.id} value={o.id}>{o.id} — {o.eventName} ({o.venue})</option>
              ))}
            </select>
            <select
              value={selVeh || availableVehicles[0]?.id}
              onChange={(e) => setSelVeh(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              {availableVehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.plateNumber} ({v.driverName})</option>
              ))}
            </select>
            <button
              onClick={() => dispatchDelivery(selOrder || readyOrders[0].id, selVeh || availableVehicles[0].id)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" /> Dispatch Now
            </button>
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            No confirmed/in-production orders awaiting dispatch, or all vehicles are currently on route.
          </p>
        )}
      </Card>

      {/* Active Trips & GPS Simulation */}
      <Card title="Live Delivery Tracking & Proof of Delivery" className="mb-6">
        <div className="space-y-4">
          {trips.map((t) => (
            <div key={t.id} className="p-4 border border-slate-200 rounded-xl bg-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{t.id} — {t.eventName}</span>
                    <Badge variant={t.status === 'Delivered' ? 'green' : 'blue'}>{t.status}</Badge>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {t.venue} • {t.plateNumber} ({t.driverName})
                  </div>
                </div>
                {t.status !== 'Delivered' && (
                  <div className="flex items-center gap-2">
                    <input
                      value={podNote}
                      onChange={(e) => setPodNote(e.target.value)}
                      className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg w-52"
                      placeholder="POD Note"
                    />
                    <button
                      onClick={() => completeDelivery(t.id, podNote)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Delivered
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>GPS Route Progress</span>
                  <span>{t.progressPct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${t.status === 'Delivered' ? 'bg-emerald-500' : 'bg-blue-600'}`}
                    style={{ width: `${t.progressPct}%` }}
                  />
                </div>
                {t.proofOfDelivery && (
                  <p className="text-xs text-emerald-700 mt-2">POD: {t.proofOfDelivery}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Fleet Registry */}
      <Card title="Fleet, Drivers & Vehicle Expenses (MTD)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {vehicles.map((v) => (
            <div key={v.id} className="p-4 border border-slate-200 rounded-xl">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-semibold text-slate-900">{v.plateNumber}</span>
                </div>
                <Badge variant={v.status === 'Available' ? 'green' : 'blue'}>{v.status}</Badge>
              </div>
              <div className="text-xs text-slate-600 mt-2">{v.model} ({v.type})</div>
              <div className="text-xs text-slate-500 mt-1">Driver: {v.driverName} • {v.driverPhone}</div>
              <div className="text-[11px] text-slate-500 mt-1">GPS: {v.currentLocation}</div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between text-xs">
                <span>Fuel: <strong>{formatMoney(v.fuelExpenseMTD)}</strong></span>
                <span>Maint: <strong>{formatMoney(v.maintenanceCostMTD)}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
