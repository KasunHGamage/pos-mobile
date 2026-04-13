export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  MainTabs: undefined;
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
  SalesAnalytics: undefined;
  DownloadReport: undefined;
};

export type MainTabParamList = {
  Shop: undefined;
  Invoice: undefined;
  Scanner: undefined;
  Inventory: undefined;
  Profile: undefined;
};
