import React from 'react';
import { CURRENCY } from '../data/seedData';

export const formatMoney = (n: number) => `${CURRENCY}${Math.round(n).toLocaleString()}`;

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}> = ({ children, className = '', title, subtitle, action }) => (
  <div className={`bg-white border border-sky-100 rounded-xl overflow-hidden shadow-xs shadow-slate-100 ${className}`}>
    {(title || action) && (
      <div className="px-5 py-3.5 bg-sky-50/80 border-b border-sky-100 flex items-center justify-between gap-4">
        <div>
          {title && <h3 className="text-sm font-semibold text-slate-900">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-600 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    )}
    <div className="p-5">{children}</div>
  </div>
);

export const StatCard: React.FC<{
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  tone?: 'default' | 'emerald' | 'amber' | 'rose' | 'blue';
}> = ({ label, value, sub, icon, tone = 'default' }) => {
  const cardTone: Record<string, string> = {
    default: 'bg-indigo-50/60 border-indigo-200/80 hover:bg-indigo-100/70 hover:border-indigo-300',
    emerald: 'bg-emerald-50/70 border-emerald-200/80 hover:bg-emerald-100/70 hover:border-emerald-300',
    amber: 'bg-amber-50/70 border-amber-200/80 hover:bg-amber-100/70 hover:border-amber-300',
    rose: 'bg-rose-50/70 border-rose-200/80 hover:bg-rose-100/70 hover:border-rose-300',
    blue: 'bg-sky-50/80 border-sky-200/80 hover:bg-sky-100/80 hover:border-sky-300',
  };
  const iconTone: Record<string, string> = {
    default: 'bg-indigo-500 text-white shadow-xs shadow-indigo-200',
    emerald: 'bg-emerald-500 text-white shadow-xs shadow-emerald-200',
    amber: 'bg-amber-500 text-white shadow-xs shadow-amber-200',
    rose: 'bg-rose-500 text-white shadow-xs shadow-rose-200',
    blue: 'bg-sky-500 text-white shadow-xs shadow-sky-200',
  };
  return (
    <div className={`border rounded-xl p-4 flex items-start justify-between gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm cursor-default ${cardTone[tone]}`}>
      <div>
        <p className="text-xs font-medium text-slate-600">{label}</p>
        <p className="text-xl font-semibold text-slate-900 mt-1 tracking-tight">{value}</p>
        {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
      </div>
      {icon && <div className={`p-2.5 rounded-xl ${iconTone[tone]}`}>{icon}</div>}
    </div>
  );
};

export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'gray' | 'green' | 'amber' | 'red' | 'blue';
}> = ({ children, variant = 'gray' }) => {
  const styles: Record<string, string> = {
    gray: 'bg-slate-100 text-slate-700 border-slate-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-rose-50 text-rose-700 border-rose-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${styles[variant]}`}>
      {children}
    </span>
  );
};

export const PageHeader: React.FC<{
  title: string;
  description: string;
  action?: React.ReactNode;
}> = ({ title, description, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
    <div>
      <h1 className="text-xl font-semibold text-slate-900 tracking-tight">{title}</h1>
      <p className="text-sm text-slate-500 mt-0.5">{description}</p>
    </div>
    {action && <div className="flex items-center gap-2">{action}</div>}
  </div>
);
