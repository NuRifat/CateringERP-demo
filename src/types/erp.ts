export type Role =
  | 'management'
  | 'accounts'
  | 'purchase'
  | 'store'
  | 'kitchen'
  | 'sales'
  | 'delivery';

export type ModuleId =
  | 'dashboard'
  | 'crm'
  | 'kitchen'
  | 'production'
  | 'inventory'
  | 'procurement'
  | 'accounts'
  | 'delivery'
  | 'assets'
  | 'admin';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  department: string;
  title: string;
  allowedModules: ModuleId[];
  active: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  role: Role;
  department: string;
  action: string;
  details: string;
  automated?: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  contactPerson: string;
  phone: string;
  rating: number;
  balancePayable: number;
}

export interface PurchaseRequisition {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
  reason: string;
  sourceOrderId?: string;
  status: 'Pending' | 'Converted to PO' | 'Rejected';
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  prId?: string;
  supplierId: string;
  supplierName: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
  status: 'Ordered' | 'Received';
  createdAt: string;
  receivedAt?: string;
}

export interface PurchaseInvoice {
  id: string;
  poId: string;
  supplierName: string;
  amount: number;
  paidAmount: number;
  status: 'Unpaid' | 'Paid';
  date: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  warehouseStock: {
    'Central Store': number;
    'Cold Storage': number;
    'Kitchen Sub-Store': number;
  };
  minStock: number;
  unitCost: number; // Weighted average / FIFO cost
  wastageQty: number;
  lastUpdated: string;
}

export interface StockMovement {
  id: string;
  date: string;
  itemId: string;
  itemName: string;
  type: 'IN' | 'OUT' | 'TRANSFER' | 'WASTAGE';
  quantity: number;
  unit: string;
  warehouse: string;
  reference: string;
}

export interface RecipeIngredient {
  itemId: string;
  itemName: string;
  qtyPerGuest: number;
  unit: string;
}

export interface RecipeBOM {
  id: string;
  dishName: string;
  department: 'Main Course' | 'Tandoor & Grill' | 'Sweets & Desserts' | 'Beverages';
  pricePerGuest: number;
  prepTimeMins: number;
  ingredients: RecipeIngredient[];
}

export interface ProductionBatch {
  id: string;
  orderId: string;
  eventName: string;
  dishName: string;
  guestCount: number;
  totalIngredientCost: number;
  status: 'Scheduled' | 'In Progress' | 'Completed';
  createdAt: string;
  ingredientsConsumed: { itemName: string; qty: number; unit: string; cost: number }[];
}

export interface KitchenOrderTicket {
  id: string;
  orderId: string;
  eventName: string;
  eventDate: string;
  department: 'Main Course' | 'Tandoor & Grill' | 'Sweets & Desserts' | 'Beverages';
  dishName: string;
  guestCount: number;
  status: 'Pending' | 'Preparing' | 'Ready' | 'Dispatched';
  ingredients: { itemName: string; qty: number; unit: string }[];
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: 'Corporate' | 'Wedding / Social' | 'Private';
  totalOrders: number;
  totalSpent: number;
}

export interface CateringOrder {
  id: string;
  customerId: string;
  customerName: string;
  eventName: string;
  eventDate: string;
  venue: string;
  guestCount: number;
  recipeIds: string[];
  totalAmount: number;
  advancePaid: number;
  estimatedCost: number;
  status: 'Quotation' | 'Confirmed' | 'In Production' | 'Dispatched' | 'Delivered';
  createdAt: string;
}

export interface AccountEntry {
  id: string;
  date: string;
  type: 'Income' | 'Expense' | 'Receivable' | 'Payable' | 'COGS';
  category: string;
  description: string;
  amount: number;
  paymentMethod: 'Bank' | 'Cash' | 'Credit' | 'Internal';
  referenceId?: string;
  automated?: boolean;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  type: 'Refrigerated Van' | 'Cargo Truck' | 'Delivery Van';
  driverName: string;
  driverPhone: string;
  status: 'Available' | 'On Delivery' | 'Maintenance';
  currentLocation: string;
  fuelExpenseMTD: number;
  maintenanceCostMTD: number;
  gpsCoords: { lat: number; lng: number };
}

export interface DeliveryTrip {
  id: string;
  orderId: string;
  eventName: string;
  venue: string;
  vehicleId: string;
  plateNumber: string;
  driverName: string;
  status: 'Assigned' | 'In Transit' | 'Delivered';
  progressPct: number;
  dispatchedAt: string;
  proofOfDelivery?: string;
}

export interface FixedAsset {
  id: string;
  assetCode: string;
  name: string;
  category: 'Kitchen Equipment' | 'Vehicles' | 'Serving & Banquet' | 'IT & Cold Chain';
  department: string;
  location: string;
  purchaseDate: string;
  purchaseValue: number;
  annualDepreciationPct: number;
  status: 'Active' | 'Under Maintenance';
  maintenanceHistory: { date: string; note: string; cost: number }[];
}
