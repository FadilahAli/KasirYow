import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatRupiah,
  calculateCartTotals,
  calculateChange,
  generateInvoiceNumber,
  getQuickCashSuggestions,
  formatReceiptText,
} from './posLogic.ts';
import type { CartItem, Product } from '../types/pos.ts';

const dummyProduct1: Product = {
  id: 'prod-1',
  name: 'Kopi Susu Aren',
  category: 'kopi',
  categoryName: 'Kopi',
  price: 20000,
  stock: 50,
  image: '',
};

const dummyProduct2: Product = {
  id: 'prod-2',
  name: 'Croissant Keju',
  category: 'camilan',
  categoryName: 'Camilan',
  price: 25000,
  stock: 20,
  image: '',
};

test('formatRupiah formats values correctly', () => {
  assert.equal(formatRupiah(0), 'Rp 0');
  assert.equal(formatRupiah(15000), 'Rp 15.000');
  assert.equal(formatRupiah(1250000), 'Rp 1.250.000');
});

test('calculateCartTotals calculates subtotal, discount, and tax correctly', () => {
  const items: CartItem[] = [
    { product: dummyProduct1, quantity: 2 }, // 2 x 20.000 = 40.000
    { product: dummyProduct2, quantity: 1 }, // 1 x 25.000 = 25.000
  ];

  // Subtotal = 65.000, Discount 10% = 6.500, afterDiscount = 58.500, Tax 10% = 5.850, Total = 64.350
  const totals = calculateCartTotals(items, 10, 10, 0);

  assert.equal(totals.subtotal, 65000);
  assert.equal(totals.discountPercent, 10);
  assert.equal(totals.discountAmount, 6500);
  assert.equal(totals.afterDiscount, 58500);
  assert.equal(totals.taxAmount, 5850);
  assert.equal(totals.total, 64350);
});

test('calculateCartTotals handles empty cart and zero tax', () => {
  const totals = calculateCartTotals([], 0, 0, 0);
  assert.equal(totals.subtotal, 0);
  assert.equal(totals.total, 0);
  assert.equal(totals.discountAmount, 0);
});

test('calculateChange calculates cash change properly', () => {
  assert.equal(calculateChange(45000, 50000), 5000);
  assert.equal(calculateChange(50000, 50000), 0);
  assert.equal(calculateChange(60000, 50000), -10000); // Short by 10.000
});

test('generateInvoiceNumber includes date prefix', () => {
  const inv = generateInvoiceNumber(1);
  assert.match(inv, /^INV-\d{8}-0001$/);
});

test('getQuickCashSuggestions includes exact amount and higher denominations', () => {
  const suggestions = getQuickCashSuggestions(35000);
  assert.ok(suggestions.includes(35000), 'Must include exact amount');
  assert.ok(suggestions.some((val) => val >= 35000), 'Must include amounts higher than total');
});

test('formatReceiptText contains store name, items and total', () => {
  const text = formatReceiptText({
    invoiceNumber: 'INV-20261020-0001',
    storeName: 'Kassa Coffee',
    timestamp: '20/10/2026 14:00',
    items: [{ product: dummyProduct1, quantity: 2 }],
    subtotal: 40000,
    discountAmount: 0,
    taxAmount: 4000,
    total: 44000,
    paymentMethod: 'cash',
    amountPaid: 50000,
    change: 6000,
    footerNote: 'Terima kasih!',
  });

  assert.ok(text.includes('KASSA COFFEE'));
  assert.ok(text.includes('Kopi Susu Aren'));
  assert.ok(text.includes('Rp 44.000'));
  assert.ok(text.includes('Kembali: Rp 6.000'));
});
