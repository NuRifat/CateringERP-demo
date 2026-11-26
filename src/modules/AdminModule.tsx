import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { Badge, Card, PageHeader } from '../components/UI';

export const AdminModule: React.FC = () => {
  const { users, logs, loginAsRole, currentUser } = useERP();

  return (
    <div>
      <PageHeader
        title="User Roles, Permissions & Audit Trail"
        description="Departmental access control matrix and immutable cross-department activity logs."
      />

      <Card title="Departmental Roles & Access Control" className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium text-slate-500">
                <th className="py-3 pr-4">User &amp; Title</th>
                <th className="py-3 pr-4">Department</th>
                <th className="py-3 pr-4">Allowed Modules</th>
                <th className="py-3 text-right">Demo Switch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="py-3 pr-4">
                    <div className="font-semibold text-slate-900">{u.name}</div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                  </td>
                  <td className="py-3 pr-4 text-xs">
                    <div className="font-medium text-slate-800">{u.department}</div>
                    <div className="text-slate-500">{u.title}</div>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {u.allowedModules.map((m) => (
                        <Badge key={m}>{m}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    {currentUser?.id === u.id ? (
                      <Badge variant="green">Active</Badge>
                    ) : (
                      <button
                        onClick={() => loginAsRole(u.role)}
                        className="px-2.5 py-1 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        Switch Role
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="System Activity & Audit Logs">
        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-900">{log.action}</span>
                  <Badge variant={log.automated ? 'green' : 'gray'}>{log.department}</Badge>
                </div>
                <p className="text-slate-600 mt-1">{log.details}</p>
              </div>
              <div className="text-right text-slate-400 shrink-0">
                <div>{log.user}</div>
                <div>{log.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
