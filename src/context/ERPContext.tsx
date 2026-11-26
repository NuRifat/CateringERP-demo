import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  INITIAL_ACCOUNTS,
  INITIAL_ASSETS,
  INITIAL_BATCHES,
  INITIAL_CUSTOMERS,
  INITIAL_INVENTORY,
  INITIAL_INVOICES,
  INITIAL_KOTS,
  INITIAL_LOGS,
  INITIAL_MOVEMENTS,
  INITIAL_ORDERS,
  INITIAL_POS,
  INITIAL_PRS,
  INITIAL_RECIPES,
  INITIAL_SUPPLIERS,
  INITIAL_TRIPS,
  INITIAL_VEHICLES,
  USER_ACCOUNTS,
} from '../data/seedData';
import type {
  AccountEntry,
  ActivityLog,
  CateringOrder,
  Customer,
  DeliveryTrip,
  FixedAsset,
  InventoryItem,
  KitchenOrderTicket,
  ProductionBatch,
  PurchaseInvoice,
  PurchaseOrder,
  PurchaseRequisition,
  RecipeBOM,
  Role,
  StockMovement,
  Supplier,
  UserAccount,
  Vehicle,
} from '../types/erp';

interface AutomationSummary {
  title: string;
  steps: string[];
  timestamp: string;
}

interface ERPState {
  currentUser: UserAccount | null;
  users: UserAccount[];
  logs: ActivityLog[];
  suppliers: Supplier[];
  inventory: InventoryItem[];
  movements: StockMovement[];
  recipes: RecipeBOM[];
  batches: ProductionBatch[];
  kots: KitchenOrderTicket[];
  customers: Customer[];
  orders: CateringOrder[];
  prs: PurchaseRequisition[];
  pos: PurchaseOrder[];
  invoices: PurchaseInvoice[];
  accounts: AccountEntry[];
  vehicles: Vehicle[];
  trips: DeliveryTrip[];
  assets: FixedAsset[];
}

interface ERPContextValue extends ERPState {
  automationBanner: AutomationSummary | null;
  dismissBanner: () => void;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  loginAsRole: (role: Role) => void;
  logout: () => void;
  resetDemoData: () => void;
  createOrder: (input: {
    customerId: string;
    eventName: string;
    eventDate: string;
    venue: string;
    guestCount: number;
    recipeIds: string[];
    advancePaid: number;
    confirmImmediately?: boolean;
  }) => string;
  confirmOrder: (orderId: string) => void;
  recordOrderPayment: (orderId: string, amount: number) => void;
  updateKOTStatus: (kotId: string, status: KitchenOrderTicket['status']) => void;
  updateBatchStatus: (batchId: string, status: ProductionBatch['status']) => void;
  transferStock: (
    itemId: string,
    fromWh: keyof InventoryItem['warehouseStock'],
    toWh: keyof InventoryItem['warehouseStock'],
    qty: number
  ) => void;
  recordWastage: (
    itemId: string,
    warehouse: keyof InventoryItem['warehouseStock'],
    qty: number,
    reason: string
  ) => void;
  createPR: (itemId: string, quantity: number, reason: string) => void;
  convertPRtoPO: (prId: string, supplierId: string) => void;
  receivePO: (poId: string) => void;
  payInvoice: (invoiceId: string) => void;
  addManualAccountEntry: (entry: Omit<AccountEntry, 'id' | 'date'>) => void;
  dispatchDelivery: (orderId: string, vehicleId: string) => void;
  completeDelivery: (tripId: string, podNote: string) => void;
  addAsset: (asset: Omit<FixedAsset, 'id' | 'maintenanceHistory'>) => void;
  addAssetMaintenance: (assetId: string, note: string, cost: number) => void;
}

const STORAGE_KEY = 'subrat_ali_catering_erp_v1';

const getInitialState = (): ERPState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore storage errors
  }
  return {
    currentUser: null,
    users: USER_ACCOUNTS,
    logs: INITIAL_LOGS,
    suppliers: INITIAL_SUPPLIERS,
    inventory: INITIAL_INVENTORY,
    movements: INITIAL_MOVEMENTS,
    recipes: INITIAL_RECIPES,
    batches: INITIAL_BATCHES,
    kots: INITIAL_KOTS,
    customers: INITIAL_CUSTOMERS,
    orders: INITIAL_ORDERS,
    prs: INITIAL_PRS,
    pos: INITIAL_POS,
    invoices: INITIAL_INVOICES,
    accounts: INITIAL_ACCOUNTS,
    vehicles: INITIAL_VEHICLES,
    trips: INITIAL_TRIPS,
    assets: INITIAL_ASSETS,
  };
};

const ERPContext = createContext<ERPContextValue | null>(null);

const nowTime = () => {
  const d = new Date();
  return `${d.toISOString().slice(0, 10)} ${d.toTimeString().slice(0, 5)}`;
};

const todayDate = () => new Date().toISOString().slice(0, 10);

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ERPState>(getInitialState);
  const [automationBanner, setAutomationBanner] = useState<AutomationSummary | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  const makeLog = (
    department: string,
    action: string,
    details: string,
    automated = false,
    userOverride?: UserAccount | null
  ): ActivityLog => {
    const u = userOverride ?? state.currentUser;
    return {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: nowTime(),
      user: automated ? 'System Automation' : u?.name ?? 'System',
      role: u?.role ?? 'management',
      department,
      action,
      details,
      automated,
    };
  };

  const login = (email: string, password: string) => {
    const q = email.trim().toLowerCase();
    const found = state.users.find(
      (u) =>
        (u.email.toLowerCase() === q ||
          u.role.toLowerCase() === q ||
          (q === 'admin' && u.role === 'management')) &&
        u.password === password
    );
    if (!found) {
      return { ok: false, error: 'Invalid username/email or password. (Demo password: demo)' };
    }
    setState((prev) => ({
      ...prev,
      currentUser: found,
      logs: [
        makeLog(found.department, 'User Login', `${found.name} signed in (${found.title})`, false, found),
        ...prev.logs,
      ],
    }));
    return { ok: true };
  };

  const loginAsRole = (role: Role) => {
    const found = state.users.find((u) => u.role === role);
    if (!found) return;
    setState((prev) => ({
      ...prev,
      currentUser: found,
      logs: [
        makeLog(found.department, 'Quick Demo Login', `${found.name} signed in as ${found.role}`, false, found),
        ...prev.logs,
      ],
    }));
  };

  const logout = () => {
    setState((prev) => ({ ...prev, currentUser: null }));
    setAutomationBanner(null);
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      currentUser: state.currentUser,
      users: USER_ACCOUNTS,
      logs: INITIAL_LOGS,
      suppliers: INITIAL_SUPPLIERS,
      inventory: INITIAL_INVENTORY,
      movements: INITIAL_MOVEMENTS,
      recipes: INITIAL_RECIPES,
      batches: INITIAL_BATCHES,
      kots: INITIAL_KOTS,
      customers: INITIAL_CUSTOMERS,
      orders: INITIAL_ORDERS,
      prs: INITIAL_PRS,
      pos: INITIAL_POS,
      invoices: INITIAL_INVOICES,
      accounts: INITIAL_ACCOUNTS,
      vehicles: INITIAL_VEHICLES,
      trips: INITIAL_TRIPS,
      assets: INITIAL_ASSETS,
    });
    setAutomationBanner({
      title: 'Demo Data Restored',
      steps: ['All 10 departments have been reset to clean initial sample data.'],
      timestamp: nowTime(),
    });
  };

  const runOrderConfirmationCascade = (prev: ERPState, order: CateringOrder): { next: ERPState; steps: string[] } => {
    const steps: string[] = [];
    const newKots: KitchenOrderTicket[] = [];
    const newBatches: ProductionBatch[] = [];
    const newMovements: StockMovement[] = [];
    const newPRs: PurchaseRequisition[] = [];
    const newAccounts: AccountEntry[] = [];
    const updatedInventory = prev.inventory.map((item) => ({
      ...item,
      warehouseStock: { ...item.warehouseStock },
    }));

    let totalProductionCost = 0;

    order.recipeIds.forEach((recId, idx) => {
      const recipe = prev.recipes.find((r) => r.id === recId);
      if (!recipe) return;

      const scaledIngredients = recipe.ingredients.map((ing) => ({
        itemId: ing.itemId,
        itemName: ing.itemName,
        qty: Number((ing.qtyPerGuest * order.guestCount).toFixed(2)),
        unit: ing.unit,
      }));

      // 1. Generate KOT
      const kotId = `KOT-${Math.floor(100 + Math.random() * 899)}-${idx + 1}`;
      newKots.push({
        id: kotId,
        orderId: order.id,
        eventName: order.eventName,
        eventDate: order.eventDate,
        department: recipe.department,
        dishName: recipe.dishName,
        guestCount: order.guestCount,
        status: 'Pending',
        ingredients: scaledIngredients.map(({ itemName, qty, unit }) => ({ itemName, qty, unit })),
        createdAt: nowTime(),
      });

      // 2. Calculate Production Batch & Deduct Inventory
      const batchId = `BATCH-${Math.floor(510 + Math.random() * 480)}-${idx + 1}`;
      let batchCost = 0;
      const consumedDetails: { itemName: string; qty: number; unit: string; cost: number }[] = [];

      scaledIngredients.forEach((req) => {
        const invItem = updatedInventory.find((i) => i.id === req.itemId);
        if (!invItem) return;

        const itemCost = Math.round(req.qty * invItem.unitCost);
        batchCost += itemCost;
        consumedDetails.push({
          itemName: req.itemName,
          qty: req.qty,
          unit: req.unit,
          cost: itemCost,
        });

        // Deduct from Kitchen Sub-Store -> Central Store -> Cold Storage
        let remainingToDeduct = req.qty;
        const warehouses: (keyof InventoryItem['warehouseStock'])[] = [
          'Kitchen Sub-Store',
          'Central Store',
          'Cold Storage',
        ];
        warehouses.forEach((wh) => {
          if (remainingToDeduct <= 0) return;
          const avail = invItem.warehouseStock[wh];
          if (avail > 0) {
            const take = Math.min(avail, remainingToDeduct);
            invItem.warehouseStock[wh] = Number((avail - take).toFixed(2));
            remainingToDeduct = Number((remainingToDeduct - take).toFixed(2));
          }
        });
        invItem.lastUpdated = todayDate();

        newMovements.push({
          id: `MOV-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          date: todayDate(),
          itemId: invItem.id,
          itemName: invItem.name,
          type: 'OUT',
          quantity: req.qty,
          unit: req.unit,
          warehouse: 'Kitchen Sub-Store / Central',
          reference: `${batchId} (${order.id})`,
        });

        // Check total remaining stock vs minStock or shortage
        const totalRemaining =
          invItem.warehouseStock['Central Store'] +
          invItem.warehouseStock['Cold Storage'] +
          invItem.warehouseStock['Kitchen Sub-Store'];

        const alreadyHasPendingPR =
          prev.prs.some((p) => p.itemId === invItem.id && p.status === 'Pending') ||
          newPRs.some((p) => p.itemId === invItem.id);

        if ((totalRemaining < invItem.minStock || remainingToDeduct > 0) && !alreadyHasPendingPR) {
          const orderQty = Math.max(invItem.minStock * 1.5 - totalRemaining, remainingToDeduct + 25);
          const roundedQty = Math.ceil(orderQty);
          newPRs.push({
            id: `PR-${Math.floor(310 + Math.random() * 680)}`,
            itemId: invItem.id,
            itemName: invItem.name,
            quantity: roundedQty,
            unit: invItem.unit,
            estimatedCost: Math.round(roundedQty * invItem.unitCost),
            reason:
              remainingToDeduct > 0
                ? `Shortage of ${remainingToDeduct} ${invItem.unit} for ${order.id}`
                : `Stock (${totalRemaining} ${invItem.unit}) fell below min alert (${invItem.minStock} ${invItem.unit})`,
            sourceOrderId: order.id,
            status: 'Pending',
            createdAt: todayDate(),
          });
        }
      });

      totalProductionCost += batchCost;
      newBatches.push({
        id: batchId,
        orderId: order.id,
        eventName: order.eventName,
        dishName: recipe.dishName,
        guestCount: order.guestCount,
        totalIngredientCost: batchCost,
        status: 'Scheduled',
        createdAt: todayDate(),
        ingredientsConsumed: consumedDetails,
      });
    });

    steps.push(`Kitchen: Generated ${newKots.length} KOT(s) across kitchen departments.`);
    steps.push(`Production: Created ${newBatches.length} production batch(es) (Est. COGS: ৳${totalProductionCost.toLocaleString()}).`);
    steps.push(`Inventory: Deducted raw materials for ${order.guestCount} guests & logged ${newMovements.length} stock movements.`);
    if (newPRs.length > 0) {
      steps.push(
        `Procurement: Auto-raised ${newPRs.length} Purchase Requisition(s) for low-stock/shortage items (${newPRs.map((p) => p.itemName).join(', ')}).`
      );
    }

    // 3. Post Accounting Entries
    if (order.advancePaid > 0) {
      newAccounts.push({
        id: `ACC-${Date.now()}-1`,
        date: todayDate(),
        type: 'Income',
        category: 'Advance Received',
        description: `Advance for ${order.eventName} (${order.id})`,
        amount: order.advancePaid,
        paymentMethod: 'Bank',
        referenceId: order.id,
        automated: true,
      });
    }
    const dueAmount = order.totalAmount - order.advancePaid;
    if (dueAmount > 0) {
      newAccounts.push({
        id: `ACC-${Date.now()}-2`,
        date: todayDate(),
        type: 'Receivable',
        category: 'Customer Due',
        description: `Receivable balance for ${order.eventName} (${order.id})`,
        amount: dueAmount,
        paymentMethod: 'Credit',
        referenceId: order.id,
        automated: true,
      });
    }
    if (totalProductionCost > 0) {
      newAccounts.push({
        id: `ACC-${Date.now()}-3`,
        date: todayDate(),
        type: 'COGS',
        category: 'Kitchen Production Cost',
        description: `Auto-booked ingredient COGS for ${order.id}`,
        amount: totalProductionCost,
        paymentMethod: 'Internal',
        referenceId: order.id,
        automated: true,
      });
    }
    steps.push(`Accounts: Posted Sales/Receivable & COGS entries automatically.`);

    const autoLog = makeLog(
      'Interconnected Engine',
      `Confirmed Order ${order.id}`,
      steps.join(' | '),
      true,
      prev.currentUser
    );

    const updatedOrders = prev.orders.map((o) =>
      o.id === order.id ? { ...o, status: 'Confirmed' as const, estimatedCost: totalProductionCost } : o
    );

    return {
      steps,
      next: {
        ...prev,
        orders: updatedOrders,
        kots: [...newKots, ...prev.kots],
        batches: [...newBatches, ...prev.batches],
        inventory: updatedInventory,
        movements: [...newMovements, ...prev.movements],
        prs: [...newPRs, ...prev.prs],
        accounts: [...newAccounts, ...prev.accounts],
        logs: [autoLog, ...prev.logs],
      },
    };
  };

  const confirmOrder = (orderId: string) => {
    const target = state.orders.find((o) => o.id === orderId);
    if (!target || target.status !== 'Quotation') return;
    const { next, steps } = runOrderConfirmationCascade(state, target);
    setState(next);
    setAutomationBanner({
      title: `Order ${orderId} Confirmed — Cross-Department Automation Triggered`,
      steps,
      timestamp: nowTime(),
    });
  };

  const createOrder: ERPContextValue['createOrder'] = (input) => {
    const customer = state.customers.find((c) => c.id === input.customerId);
    const selectedRecipes = state.recipes.filter((r) => input.recipeIds.includes(r.id));
    const totalAmount = selectedRecipes.reduce((sum, r) => sum + r.pricePerGuest * input.guestCount, 0);
    const orderId = `ORD-2026-${Math.floor(104 + Math.random() * 890)}`;

    const newOrder: CateringOrder = {
      id: orderId,
      customerId: input.customerId,
      customerName: customer?.name ?? 'Walk-in Client',
      eventName: input.eventName,
      eventDate: input.eventDate,
      venue: input.venue,
      guestCount: input.guestCount,
      recipeIds: input.recipeIds,
      totalAmount,
      advancePaid: input.advancePaid,
      estimatedCost: Math.round(totalAmount * 0.54),
      status: 'Quotation',
      createdAt: todayDate(),
    };

    setState((prev) => {
      const baseState: ERPState = {
        ...prev,
        orders: [newOrder, ...prev.orders],
        customers: prev.customers.map((c) =>
          c.id === input.customerId
            ? { ...c, totalOrders: c.totalOrders + 1, totalSpent: c.totalSpent + totalAmount }
            : c
        ),
        logs: [
          makeLog('CRM & Sales', `Created ${orderId}`, `${newOrder.eventName} for ${newOrder.guestCount} guests`, false, prev.currentUser),
          ...prev.logs,
        ],
      };
      if (input.confirmImmediately) {
        const { next, steps } = runOrderConfirmationCascade(baseState, newOrder);
        setAutomationBanner({
          title: `Order ${orderId} Created & Confirmed — Full Automation Complete`,
          steps,
          timestamp: nowTime(),
        });
        return next;
      }
      return baseState;
    });

    return orderId;
  };

  const recordOrderPayment = (orderId: string, amount: number) => {
    if (amount <= 0) return;
    setState((prev) => {
      const order = prev.orders.find((o) => o.id === orderId);
      if (!order) return prev;
      return {
        ...prev,
        orders: prev.orders.map((o) =>
          o.id === orderId ? { ...o, advancePaid: Math.min(o.totalAmount, o.advancePaid + amount) } : o
        ),
        accounts: [
          {
            id: `ACC-${Date.now()}`,
            date: todayDate(),
            type: 'Income',
            category: 'Customer Payment',
            description: `Payment received for ${order.eventName} (${orderId})`,
            amount,
            paymentMethod: 'Bank',
            referenceId: orderId,
            automated: true,
          },
          ...prev.accounts,
        ],
        logs: [
          makeLog('Accounts & Finance', 'Recorded Customer Payment', `৳${amount.toLocaleString()} for ${orderId}`),
          ...prev.logs,
        ],
      };
    });
  };

  const updateKOTStatus = (kotId: string, status: KitchenOrderTicket['status']) => {
    setState((prev) => ({
      ...prev,
      kots: prev.kots.map((k) => (k.id === kotId ? { ...k, status } : k)),
      logs: [makeLog('Kitchen Operations', `Updated ${kotId}`, `Status changed to ${status}`), ...prev.logs],
    }));
  };

  const updateBatchStatus = (batchId: string, status: ProductionBatch['status']) => {
    setState((prev) => ({
      ...prev,
      batches: prev.batches.map((b) => (b.id === batchId ? { ...b, status } : b)),
      logs: [makeLog('Production', `Updated ${batchId}`, `Batch status changed to ${status}`), ...prev.logs],
    }));
  };

  const transferStock: ERPContextValue['transferStock'] = (itemId, fromWh, toWh, qty) => {
    if (qty <= 0 || fromWh === toWh) return;
    setState((prev) => {
      const item = prev.inventory.find((i) => i.id === itemId);
      if (!item || item.warehouseStock[fromWh] < qty) return prev;
      return {
        ...prev,
        inventory: prev.inventory.map((i) =>
          i.id === itemId
            ? {
                ...i,
                lastUpdated: todayDate(),
                warehouseStock: {
                  ...i.warehouseStock,
                  [fromWh]: Number((i.warehouseStock[fromWh] - qty).toFixed(2)),
                  [toWh]: Number((i.warehouseStock[toWh] + qty).toFixed(2)),
                },
              }
            : i
        ),
        movements: [
          {
            id: `MOV-${Date.now()}`,
            date: todayDate(),
            itemId,
            itemName: item.name,
            type: 'TRANSFER',
            quantity: qty,
            unit: item.unit,
            warehouse: `${fromWh} → ${toWh}`,
            reference: 'Internal Transfer',
          },
          ...prev.movements,
        ],
        logs: [
          makeLog('Inventory & Store', 'Stock Transfer', `Moved ${qty} ${item.unit} of ${item.name} (${fromWh} → ${toWh})`),
          ...prev.logs,
        ],
      };
    });
  };

  const recordWastage: ERPContextValue['recordWastage'] = (itemId, warehouse, qty, reason) => {
    if (qty <= 0) return;
    setState((prev) => {
      const item = prev.inventory.find((i) => i.id === itemId);
      if (!item) return prev;
      const deduct = Math.min(item.warehouseStock[warehouse], qty);
      return {
        ...prev,
        inventory: prev.inventory.map((i) =>
          i.id === itemId
            ? {
                ...i,
                wastageQty: Number((i.wastageQty + deduct).toFixed(2)),
                lastUpdated: todayDate(),
                warehouseStock: {
                  ...i.warehouseStock,
                  [warehouse]: Number((i.warehouseStock[warehouse] - deduct).toFixed(2)),
                },
              }
            : i
        ),
        movements: [
          {
            id: `MOV-${Date.now()}`,
            date: todayDate(),
            itemId,
            itemName: item.name,
            type: 'WASTAGE',
            quantity: deduct,
            unit: item.unit,
            warehouse,
            reference: reason || 'Spoilage / Wastage',
          },
          ...prev.movements,
        ],
        logs: [
          makeLog('Inventory & Store', 'Recorded Wastage', `${deduct} ${item.unit} of ${item.name} (${reason})`),
          ...prev.logs,
        ],
      };
    });
  };

  const createPR = (itemId: string, quantity: number, reason: string) => {
    const item = state.inventory.find((i) => i.id === itemId);
    if (!item || quantity <= 0) return;
    const pr: PurchaseRequisition = {
      id: `PR-${Math.floor(310 + Math.random() * 680)}`,
      itemId,
      itemName: item.name,
      quantity,
      unit: item.unit,
      estimatedCost: Math.round(quantity * item.unitCost),
      reason,
      status: 'Pending',
      createdAt: todayDate(),
    };
    setState((prev) => ({
      ...prev,
      prs: [pr, ...prev.prs],
      logs: [makeLog('Procurement', `Created ${pr.id}`, `Requested ${quantity} ${item.unit} of ${item.name}`), ...prev.logs],
    }));
  };

  const convertPRtoPO = (prId: string, supplierId: string) => {
    const pr = state.prs.find((p) => p.id === prId);
    const supplier = state.suppliers.find((s) => s.id === supplierId);
    const inv = state.inventory.find((i) => i.id === pr?.itemId);
    if (!pr || !supplier || !inv) return;

    const po: PurchaseOrder = {
      id: `PO-${Math.floor(410 + Math.random() * 580)}`,
      prId: pr.id,
      supplierId: supplier.id,
      supplierName: supplier.name,
      itemId: pr.itemId,
      itemName: pr.itemName,
      quantity: pr.quantity,
      unit: pr.unit,
      unitPrice: inv.unitCost,
      totalAmount: Math.round(pr.quantity * inv.unitCost),
      status: 'Ordered',
      createdAt: todayDate(),
    };

    setState((prev) => ({
      ...prev,
      prs: prev.prs.map((p) => (p.id === prId ? { ...p, status: 'Converted to PO' } : p)),
      pos: [po, ...prev.pos],
      logs: [
        makeLog('Procurement', `Issued ${po.id}`, `Ordered ${po.quantity} ${po.unit} of ${po.itemName} from ${supplier.name}`),
        ...prev.logs,
      ],
    }));
  };

  const receivePO = (poId: string) => {
    const po = state.pos.find((p) => p.id === poId);
    if (!po || po.status === 'Received') return;

    const invoice: PurchaseInvoice = {
      id: `PINV-${Math.floor(710 + Math.random() * 280)}`,
      poId: po.id,
      supplierName: po.supplierName,
      amount: po.totalAmount,
      paidAmount: 0,
      status: 'Unpaid',
      date: todayDate(),
    };

    setState((prev) => ({
      ...prev,
      pos: prev.pos.map((p) => (p.id === poId ? { ...p, status: 'Received', receivedAt: todayDate() } : p)),
      inventory: prev.inventory.map((i) =>
        i.id === po.itemId
          ? {
              ...i,
              lastUpdated: todayDate(),
              warehouseStock: {
                ...i.warehouseStock,
                'Central Store': Number((i.warehouseStock['Central Store'] + po.quantity).toFixed(2)),
              },
            }
          : i
      ),
      movements: [
        {
          id: `MOV-${Date.now()}`,
          date: todayDate(),
          itemId: po.itemId,
          itemName: po.itemName,
          type: 'IN',
          quantity: po.quantity,
          unit: po.unit,
          warehouse: 'Central Store',
          reference: po.id,
        },
        ...prev.movements,
      ],
      invoices: [invoice, ...prev.invoices],
      accounts: [
        {
          id: `ACC-${Date.now()}`,
          date: todayDate(),
          type: 'Payable',
          category: 'Supplier Payable',
          description: `Invoice ${invoice.id} from ${po.supplierName} (${po.id})`,
          amount: po.totalAmount,
          paymentMethod: 'Credit',
          referenceId: invoice.id,
          automated: true,
        },
        ...prev.accounts,
      ],
      logs: [
        makeLog(
          'Procurement & Store',
          `Received ${po.id}`,
          `Added ${po.quantity} ${po.unit} of ${po.itemName} to Central Store & posted ${invoice.id} to Accounts`,
          true
        ),
        ...prev.logs,
      ],
    }));

    setAutomationBanner({
      title: `Purchase Order ${po.id} Received — Inventory & Accounts Updated`,
      steps: [
        `Inventory: Added +${po.quantity} ${po.unit} of ${po.itemName} to Central Store.`,
        `Accounts: Created Supplier Invoice ${invoice.id} (৳${po.totalAmount.toLocaleString()}) as Payable.`,
      ],
      timestamp: nowTime(),
    });
  };

  const payInvoice = (invoiceId: string) => {
    const inv = state.invoices.find((i) => i.id === invoiceId);
    if (!inv || inv.status === 'Paid') return;
    setState((prev) => ({
      ...prev,
      invoices: prev.invoices.map((i) =>
        i.id === invoiceId ? { ...i, status: 'Paid', paidAmount: i.amount } : i
      ),
      accounts: [
        {
          id: `ACC-${Date.now()}`,
          date: todayDate(),
          type: 'Expense',
          category: 'Raw Material Purchase',
          description: `Paid ${inv.supplierName} (${inv.id})`,
          amount: inv.amount,
          paymentMethod: 'Bank',
          referenceId: inv.id,
          automated: true,
        },
        ...prev.accounts,
      ],
      logs: [
        makeLog('Accounts & Finance', `Paid ${inv.id}`, `৳${inv.amount.toLocaleString()} paid to ${inv.supplierName}`),
        ...prev.logs,
      ],
    }));
  };

  const addManualAccountEntry: ERPContextValue['addManualAccountEntry'] = (entry) => {
    setState((prev) => ({
      ...prev,
      accounts: [{ ...entry, id: `ACC-${Date.now()}`, date: todayDate() }, ...prev.accounts],
      logs: [
        makeLog('Accounts & Finance', `Posted ${entry.type}`, `${entry.category}: ৳${entry.amount.toLocaleString()}`),
        ...prev.logs,
      ],
    }));
  };

  const dispatchDelivery = (orderId: string, vehicleId: string) => {
    const order = state.orders.find((o) => o.id === orderId);
    const vehicle = state.vehicles.find((v) => v.id === vehicleId);
    if (!order || !vehicle) return;

    const trip: DeliveryTrip = {
      id: `TRIP-${Math.floor(810 + Math.random() * 180)}`,
      orderId: order.id,
      eventName: order.eventName,
      venue: order.venue,
      vehicleId: vehicle.id,
      plateNumber: vehicle.plateNumber,
      driverName: vehicle.driverName,
      status: 'In Transit',
      progressPct: 35,
      dispatchedAt: nowTime(),
    };

    setState((prev) => ({
      ...prev,
      trips: [trip, ...prev.trips],
      orders: prev.orders.map((o) => (o.id === orderId ? { ...o, status: 'Dispatched' } : o)),
      vehicles: prev.vehicles.map((v) =>
        v.id === vehicleId
          ? { ...v, status: 'On Delivery', currentLocation: `En route to ${order.venue}` }
          : v
      ),
      logs: [
        makeLog('Logistics & Fleet', `Dispatched ${trip.id}`, `${vehicle.plateNumber} assigned to ${order.id}`),
        ...prev.logs,
      ],
    }));
  };

  const completeDelivery = (tripId: string, podNote: string) => {
    const trip = state.trips.find((t) => t.id === tripId);
    if (!trip) return;
    setState((prev) => ({
      ...prev,
      trips: prev.trips.map((t) =>
        t.id === tripId
          ? { ...t, status: 'Delivered', progressPct: 100, proofOfDelivery: podNote || 'Signed by Event Coordinator' }
          : t
      ),
      orders: prev.orders.map((o) => (o.id === trip.orderId ? { ...o, status: 'Delivered' } : o)),
      vehicles: prev.vehicles.map((v) =>
        v.id === trip.vehicleId
          ? { ...v, status: 'Available', currentLocation: 'Returning to Central Kitchen Hub' }
          : v
      ),
      logs: [
        makeLog('Logistics & Fleet', `Delivered ${trip.id}`, `POD recorded for ${trip.orderId}: ${podNote}`),
        ...prev.logs,
      ],
    }));
  };

  const addAsset: ERPContextValue['addAsset'] = (asset) => {
    const newAsset: FixedAsset = {
      ...asset,
      id: `ast-${Date.now()}`,
      maintenanceHistory: [],
    };
    setState((prev) => ({
      ...prev,
      assets: [newAsset, ...prev.assets],
      logs: [makeLog('Fixed Assets', `Registered ${asset.assetCode}`, `${asset.name} (${asset.department})`), ...prev.logs],
    }));
  };

  const addAssetMaintenance = (assetId: string, note: string, cost: number) => {
    const asset = state.assets.find((a) => a.id === assetId);
    if (!asset) return;
    setState((prev) => ({
      ...prev,
      assets: prev.assets.map((a) =>
        a.id === assetId
          ? { ...a, maintenanceHistory: [{ date: todayDate(), note, cost }, ...a.maintenanceHistory] }
          : a
      ),
      accounts:
        cost > 0
          ? [
              {
                id: `ACC-${Date.now()}`,
                date: todayDate(),
                type: 'Expense',
                category: 'Asset Maintenance',
                description: `${asset.name}: ${note}`,
                amount: cost,
                paymentMethod: 'Cash',
                referenceId: asset.assetCode,
                automated: true,
              },
              ...prev.accounts,
            ]
          : prev.accounts,
      logs: [
        makeLog('Fixed Assets', `Maintenance Logged`, `${asset.assetCode}: ${note} (৳${cost.toLocaleString()})`),
        ...prev.logs,
      ],
    }));
  };

  return (
    <ERPContext.Provider
      value={{
        ...state,
        automationBanner,
        dismissBanner: () => setAutomationBanner(null),
        login,
        loginAsRole,
        logout,
        resetDemoData,
        createOrder,
        confirmOrder,
        recordOrderPayment,
        updateKOTStatus,
        updateBatchStatus,
        transferStock,
        recordWastage,
        createPR,
        convertPRtoPO,
        receivePO,
        payInvoice,
        addManualAccountEntry,
        dispatchDelivery,
        completeDelivery,
        addAsset,
        addAssetMaintenance,
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const ctx = useContext(ERPContext);
  if (!ctx) throw new Error('useERP must be used within ERPProvider');
  return ctx;
};
