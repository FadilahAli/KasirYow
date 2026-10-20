import type { CartItem, PaymentMethod } from '../types/pos.ts';

/**
 * Format a number to Indonesian Rupiah currency string.
 * Example: 25000 -> "Rp 25.000"
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0';
  }
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Rp ${formatted}`;
}

/**
 * Calculate totals for cart items
 */
export function calculateCartTotals(
  items: CartItem[],
  discountPercent: number = 0,
  taxRate: number = 10,
  serviceFeeRate: number = 0
) {
  const subtotal = items.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  const safeDiscountPercent = Math.max(0, Math.min(100, discountPercent));
  const discountAmount = Math.round((subtotal * safeDiscountPercent) / 100);
  const afterDiscount = Math.max(0, subtotal - discountAmount);

  const safeTaxRate = Math.max(0, taxRate);
  const taxAmount = Math.round((afterDiscount * safeTaxRate) / 100);

  const safeServiceRate = Math.max(0, serviceFeeRate);
  const serviceFeeAmount = Math.round((afterDiscount * safeServiceRate) / 100);

  const total = afterDiscount + taxAmount + serviceFeeAmount;

  return {
    subtotal,
    discountPercent: safeDiscountPercent,
    discountAmount,
    afterDiscount,
    taxRate: safeTaxRate,
    taxAmount,
    serviceFeeRate: safeServiceRate,
    serviceFeeAmount,
    total,
  };
}

/**
 * Calculate change (kembalian) for cash payment.
 * Returns negative if insufficient.
 */
export function calculateChange(total: number, cashPaid: number): number {
  return cashPaid - total;
}

/**
 * Generate an invoice number with date prefix
 * Example: INV-20261020-0042
 */
export function generateInvoiceNumber(orderIndex: number = 1): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const paddedIndex = String(orderIndex).padStart(4, '0');
  return `INV-${year}${month}${day}-${paddedIndex}`;
}

/**
 * Suggest quick cash denominations based on total
 */
export function getQuickCashSuggestions(total: number): number[] {
  if (total <= 0) return [10000, 20000, 50000, 100000];

  const suggestions = new Set<number>();
  // Exact amount
  suggestions.add(total);

  // Common denominations greater than total
  const standardNotes = [
    10000, 20000, 50000, 100000, 150000, 200000, 300000, 500000,
  ];

  for (const note of standardNotes) {
    if (note > total) {
      suggestions.add(note);
    }
  }

  // Next round 10k or 50k
  const nextTenThousand = Math.ceil(total / 10000) * 10000;
  if (nextTenThousand > total) suggestions.add(nextTenThousand);

  const nextFiftyThousand = Math.ceil(total / 50000) * 50000;
  if (nextFiftyThousand > total) suggestions.add(nextFiftyThousand);

  const nextHundredThousand = Math.ceil(total / 100000) * 100000;
  if (nextHundredThousand > total) suggestions.add(nextHundredThousand);

  return Array.from(suggestions)
    .sort((a, b) => a - b)
    .slice(0, 5);
}

/**
 * Translate payment method to friendly Indonesian label
 */
export function getPaymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case 'cash':
      return 'Tunai (Cash)';
    case 'qris':
      return 'QRIS (Gopay/OVO/ShopeePay)';
    case 'card':
      return 'Kartu Debit/Kredit';
    case 'transfer':
      return 'Transfer Bank';
    default:
      return method;
  }
}

/**
 * Formats receipt text for copying or sending via WhatsApp
 */
export function formatReceiptText(order: {
  invoiceNumber: string;
  storeName: string;
  timestamp: string;
  customerName?: string;
  tableNumber?: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  footerNote?: string;
}): string {
  const lines: string[] = [];
  lines.push(`🧾 *${order.storeName.toUpperCase()}*`);
  lines.push(`No: ${order.invoiceNumber}`);
  lines.push(`Tgl: ${order.timestamp}`);
  if (order.customerName) lines.push(`Pelanggan: ${order.customerName}`);
  if (order.tableNumber) lines.push(`Meja: ${order.tableNumber}`);
  lines.push('--------------------------------');

  order.items.forEach((item) => {
    const itemTotal = formatRupiah(item.product.price * item.quantity);
    lines.push(`${item.product.name}`);
    lines.push(`  ${item.quantity}x @ ${formatRupiah(item.product.price)} = ${itemTotal}`);
    if (item.notes) lines.push(`  (Catatan: ${item.notes})`);
  });

  lines.push('--------------------------------');
  lines.push(`Subtotal: ${formatRupiah(order.subtotal)}`);
  if (order.discountAmount > 0) {
    lines.push(`Diskon: -${formatRupiah(order.discountAmount)}`);
  }
  if (order.taxAmount > 0) {
    lines.push(`Pajak: ${formatRupiah(order.taxAmount)}`);
  }
  lines.push(`*TOTAL: ${formatRupiah(order.total)}*`);
  lines.push(`Metode: ${getPaymentMethodLabel(order.paymentMethod)}`);
  if (order.paymentMethod === 'cash') {
    lines.push(`Bayar: ${formatRupiah(order.amountPaid)}`);
    lines.push(`Kembali: ${formatRupiah(order.change)}`);
  }
  lines.push('--------------------------------');
  if (order.footerNote) {
    lines.push(order.footerNote);
  }
  return lines.join('\n');
}
