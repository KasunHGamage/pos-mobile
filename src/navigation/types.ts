import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Shop: undefined;
  Invoice: undefined;
  Scanner: undefined;
  Inventory: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  OtpVerify: { phone: string; context: 'signup' | 'login' };
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Receipt: {
    total: number;
    subTotal: number;
    itemDiscountTotal: number;
    invoiceDiscountAmt: number;
    invoiceLabel: string;
    items: any[];
    customerName?: string;
    paymentMethod?: 'Cash' | 'Credit' | 'Cheque' | 'QR';
    paidAmount?: number;
  };
  Customers: undefined;
  CustomerDetails: { customerName: string; customerInitials: string };
  ReturnBills: undefined;
  CreditSalesReport: undefined;
  UserBilling: undefined;
  PaymentDetails: undefined;
  BillInventoryHistory: undefined;
  UserSettings: undefined;
  AboutApp: undefined;
  AppSettings: undefined;
  SalesAnalytics: undefined;
  DownloadReport: undefined;
  InventoryDownloadReport: undefined;
  CategoryAnalytics: undefined;
  ProductAnalytics: undefined;
  ShopProfile: undefined;
  SubAdmins: undefined;
  SetPrivileges: undefined;
  Suppliers: undefined;
  SupplierProducts: { 
    supplierName: string; 
    supplierId: string;
    newProducts?: { id: string; productName: string; quantity: number; unitPrice: number; total: number }[];
  };
  SupplierPurchaseOrders: { supplierName: string; supplierId: string };
  CreatePurchaseOrder: { 
    supplierName: string; 
    supplierId: string;
    selectedProduct?: { id: string; name: string; price: number; brand: string; qty: number; code: string };
  };
  ProductList: { 
    supplierName: string;
    supplierId: string;
  };
  SupplierGRN: { supplierName: string; supplierId: string };
};
