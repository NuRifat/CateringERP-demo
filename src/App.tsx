import React, { useEffect, useState } from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import { LoginPage } from './components/LoginPage';
import { Layout } from './components/Layout';
import type { ModuleId } from './types/erp';
import { DashboardModule } from './modules/DashboardModule';
import { CRMModule } from './modules/CRMModule';
import { KitchenModule } from './modules/KitchenModule';
import { ProductionModule } from './modules/ProductionModule';
import { InventoryModule } from './modules/InventoryModule';
import { ProcurementModule } from './modules/ProcurementModule';
import { AccountsModule } from './modules/AccountsModule';
import { DeliveryModule } from './modules/DeliveryModule';
import { AssetsModule } from './modules/AssetsModule';
import { AdminModule } from './modules/AdminModule';

const ERPShell: React.FC = () => {
  const { currentUser } = useERP();
  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');

  useEffect(() => {
    if (currentUser && !currentUser.allowedModules.includes(activeModule)) {
      setActiveModule(currentUser.allowedModules[0] ?? 'dashboard');
    }
  }, [currentUser, activeModule]);

  if (!currentUser) {
    return <LoginPage />;
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardModule onNavigate={setActiveModule} />;
      case 'crm':
        return <CRMModule />;
      case 'kitchen':
        return <KitchenModule />;
      case 'production':
        return <ProductionModule />;
      case 'inventory':
        return <InventoryModule />;
      case 'procurement':
        return <ProcurementModule />;
      case 'accounts':
        return <AccountsModule />;
      case 'delivery':
        return <DeliveryModule />;
      case 'assets':
        return <AssetsModule />;
      case 'admin':
        return <AdminModule />;
      default:
        return <DashboardModule onNavigate={setActiveModule} />;
    }
  };

  return (
    <Layout activeModule={activeModule} onSelectModule={setActiveModule}>
      {renderModule()}
    </Layout>
  );
};

export function App() {
  return (
    <ERPProvider>
      <ERPShell />
    </ERPProvider>
  );
}

export default App;
