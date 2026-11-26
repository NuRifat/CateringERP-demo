import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  Factory,
  Warehouse,
  ShoppingCart,
  Landmark,
  Truck,
  Package,
  Shield,
  LogOut,
  RotateCcw,
  Utensils,
  CheckCircle2,
  X,
  Menu,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import type { ModuleId } from '../types/erp';

interface NavItem {
  id: ModuleId;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'crm', label: 'CRM & Orders', icon: <Users className="w-4 h-4" /> },
  { id: 'kitchen', label: 'Kitchen & KOT', icon: <UtensilsCrossed className="w-4 h-4" /> },
  { id: 'production', label: 'Production & BOM', icon: <Factory className="w-4 h-4" /> },
  { id: 'inventory', label: 'Inventory & Store', icon: <Warehouse className="w-4 h-4" /> },
  { id: 'procurement', label: 'Procurement', icon: <ShoppingCart className="w-4 h-4" /> },
  { id: 'accounts', label: 'Accounts & Finance', icon: <Landmark className="w-4 h-4" /> },
  { id: 'delivery', label: 'Fleet & Delivery', icon: <Truck className="w-4 h-4" /> },
  { id: 'assets', label: 'Fixed Assets', icon: <Package className="w-4 h-4" /> },
  { id: 'admin', label: 'Roles & Audit', icon: <Shield className="w-4 h-4" /> },
];

export const Layout: React.FC<{
  activeModule: ModuleId;
  onSelectModule: (m: ModuleId) => void;
  children: React.ReactNode;
}> = ({ activeModule, onSelectModule, children }) => {
  const { currentUser, logout, resetDemoData, automationBanner, dismissBanner } = useERP();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!currentUser) return null;

  const allowedNav = NAV_ITEMS.filter((item) => currentUser.allowedModules.includes(item.id));

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-sky-100 w-64">
      <div className="px-5 py-4 border-b border-sky-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs shadow-sky-200">
          <Utensils className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900 truncate">Yummy Catering</div>
          <div className="text-[11px] text-sky-600 font-medium">ERP Demo v1.0</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {allowedNav.map((item) => {
          const active = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectModule(item.id);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
                active
                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                  : 'text-slate-600 hover:bg-sky-50/50 hover:text-slate-900 border border-transparent'
              }`}
            >
              <span className={active ? 'text-sky-600' : 'text-slate-400'}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sky-100">
        <button
          onClick={resetDemoData}
          title="Reset Demo Data"
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-sky-700 bg-sky-50/50 border border-sky-100 rounded-xl hover:bg-sky-50 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Demo Data
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block shrink-0">{sidebarContent}</aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/20" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10">{sidebarContent}</div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <header className="h-14 border-b border-sky-100 bg-white px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-lg border border-sky-200 text-slate-600"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-block w-2 h-2 rounded-full bg-sky-500" />
              <span>
                Department: <strong className="text-slate-800">{currentUser.department}</strong>
              </span>
            </div>
          </div>

          {/* User Details in Top Right */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 bg-sky-50/70 border border-sky-100 rounded-xl px-3 py-1.5">
              <div className="w-6 h-6 rounded-full bg-sky-500 text-white text-[11px] font-semibold flex items-center justify-center">
                {currentUser.name.charAt(0)}
              </div>
              <div className="leading-tight">
                <div className="text-xs font-semibold text-slate-800">{currentUser.name}</div>
                <div className="text-[10px] text-sky-700">{currentUser.title}</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-white border border-slate-200 rounded-xl hover:bg-rose-50 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {automationBanner && (
            <div className="mb-6 bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{automationBanner.title}</h4>
                  <ul className="mt-1.5 space-y-1">
                    {automationBanner.steps.map((s, idx) => (
                      <li key={idx} className="text-xs text-slate-700">
                        • {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <button
                onClick={dismissBanner}
                className="p-1 text-sky-700 hover:bg-sky-100 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};
