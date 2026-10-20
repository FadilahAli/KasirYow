export type Category = 'all' | 'kopi' | 'non-kopi' | 'makanan' | 'camilan' | 'paket';

export interface Product {
  id: string;
  name: string;
  category: Category;
  categoryName: string;
  price: number;
  costPrice?: number;
  stock: number;
  image: string;
  badge?: string;
  description?: string;
  isPopular?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
  extraIce?: boolean;
  extraShot?: boolean;
}

export type PaymentMethod = 'cash' | 'qris' | 'card' | 'transfer';
export type OrderType = 'dine_in' | 'take_away' | 'delivery';

export interface Order {
  id: string;
  invoiceNumber: string;
  items: CartItem[];
  subtotal: number;
  discount: number; // percentage or fixed
  discountAmount: number;
  taxRate: number; // e.g. 10
  taxAmount: number;
  serviceFeeRate: number; // e.g. 5
  serviceFeeAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  customerName: string;
  tableNumber?: string;
  orderType: OrderType;
  timestamp: string;
  cashierName: string;
  notes?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  instagram: string;
  wifiName: string;
  wifiPassword: string;
  footerNote: string;
  taxRate: number; // %
  serviceFeeRate: number; // %
  paperWidth: '58mm' | '80mm';
  currencySymbol: string;
  showLogo: boolean;
  showBarcode: boolean;
  showWifi: boolean;
  cashierName: string;
}
