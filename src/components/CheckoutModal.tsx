import React, { useState, useEffect } from 'react';
import {
  X,
  Banknote,
  QrCode,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertCircle,
  Printer,
  Sparkles,
} from 'lucide-react';
import { CartItem, PaymentMethod, OrderType, StoreSettings, Order } from '../types/pos.ts';
import {
  formatRupiah,
  calculateCartTotals,
  calculateChange,
  getQuickCashSuggestions,
  generateInvoiceNumber,
} from '../utils/posLogic.ts';
import { sound } from '../utils/sound.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  settings: StoreSettings;
  orderType: OrderType;
  customerName: string;
  tableNumber: string;
  discountPercent: number;
  orderCount: number;
  onSuccess: (completedOrder: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  settings,
  orderType,
  customerName,
  tableNumber,
  discountPercent,
  orderCount,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const totals = calculateCartTotals(
    cart,
    discountPercent,
    settings.taxRate,
    settings.serviceFeeRate
  );

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashPaidInput, setCashPaidInput] = useState<string>('');
  const [qrisPaidSimulated, setQrisPaidSimulated] = useState<boolean>(false);
  const [transactionNote, setTransactionNote] = useState<string>('');

  const cashPaidAmount = parseFloat(cashPaidInput) || 0;
  const changeAmount = calculateChange(totals.total, cashPaidAmount);
  const isCashSufficient = cashPaidAmount >= totals.total;

  const quickCashOptions = getQuickCashSuggestions(totals.total);

  // Set default cash paid to exact amount or first suggestion
  useEffect(() => {
    if (paymentMethod === 'cash' && !cashPaidInput) {
      setCashPaidInput(totals.total.toString());
    }
  }, [paymentMethod, totals.total, cashPaidInput]);

  const handleSelectQuickCash = (amount: number) => {
    sound.playTap();
    setCashPaidInput(amount.toString());
  };

  const handleCompleteOrder = () => {
    if (paymentMethod === 'cash' && !isCashSufficient) {
      return;
    }

    const orderTimestamp = new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(orderCount + 1),
      items: [...cart],
      subtotal: totals.subtotal,
      discount: totals.discountPercent,
      discountAmount: totals.discountAmount,
      taxRate: totals.taxRate,
      taxAmount: totals.taxAmount,
      serviceFeeRate: totals.serviceFeeRate,
      serviceFeeAmount: totals.serviceFeeAmount,
      total: totals.total,
      paymentMethod,
      amountPaid: paymentMethod === 'cash' ? cashPaidAmount : totals.total,
      change: paymentMethod === 'cash' ? Math.max(0, changeAmount) : 0,
      customerName: customerName || 'Pelanggan Umum',
      tableNumber: tableNumber || (orderType === 'dine_in' ? 'Meja 01' : 'Take Away'),
      orderType,
      timestamp: orderTimestamp,
      cashierName: settings.cashierName,
      notes: transactionNote,
    };

    sound.playSuccess();
    onSuccess(newOrder);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-600 to-orange-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Pembayaran Kasir</h3>
              <p className="text-xs text-amber-100">
                Pilih metode pembayaran & cetak struk
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Total Payable Box */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 text-center">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Total yang harus dibayar
            </span>
            <div className="text-3xl font-black text-amber-900 mt-1">
              {formatRupiah(totals.total)}
            </div>
            <div className="text-xs text-amber-700/80 mt-1 flex items-center justify-center gap-2">
              <span>{cart.length} macam menu</span>
              <span>•</span>
              <span>{orderType === 'dine_in' ? 'Dine In' : 'Take Away'}</span>
              {customerName && (
                <>
                  <span>•</span>
                  <span className="font-semibold">{customerName}</span>
                </>
              )}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('cash');
                  sound.playTap();
                }}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === 'cash'
                    ? 'border-amber-500 bg-amber-50/60 text-amber-900 ring-2 ring-amber-500/20 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-600" />
                <span className="text-xs">Tunai (Cash)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('qris');
                  sound.playTap();
                }}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === 'qris'
                    ? 'border-amber-500 bg-amber-50/60 text-amber-900 ring-2 ring-amber-500/20 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <QrCode className="w-5 h-5 text-rose-600" />
                <span className="text-xs">QRIS Instan</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('card');
                  sound.playTap();
                }}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === 'card'
                    ? 'border-amber-500 bg-amber-50/60 text-amber-900 ring-2 ring-amber-500/20 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span className="text-xs">Kartu Debit</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('transfer');
                  sound.playTap();
                }}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === 'transfer'
                    ? 'border-amber-500 bg-amber-50/60 text-amber-900 ring-2 ring-amber-500/20 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Building2 className="w-5 h-5 text-purple-600" />
                <span className="text-xs">Transfer Bank</span>
              </button>
            </div>
          </div>

          {/* CASH DETAILS */}
          {paymentMethod === 'cash' && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Uang Diterima dari Pelanggan
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={cashPaidInput}
                    onChange={(e) => setCashPaidInput(e.target.value)}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl font-mono text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div>
                <span className="text-[11px] text-slate-400 font-medium block mb-1">
                  Pilihan Cepat Pecahan:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {quickCashOptions.map((amount) => {
                    const isExact = amount === totals.total;
                    return (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => handleSelectQuickCash(amount)}
                        className={`text-xs px-2.5 py-1.5 rounded-xl font-bold border transition-all ${
                          cashPaidAmount === amount
                            ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400'
                        }`}
                      >
                        {isExact ? `Uang Pas (${formatRupiah(amount)})` : formatRupiah(amount)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Kembalian / Change calculation box */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  isCashSufficient
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isCashSufficient ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                  )}
                  <div>
                    <span className="text-xs font-bold block">
                      {isCashSufficient ? 'Uang Kembalian' : 'Uang Kurang'}
                    </span>
                    <span className="text-[11px] opacity-80">
                      {isCashSufficient
                        ? 'Harap serahkan ke pelanggan'
                        : `Kurang ${formatRupiah(Math.abs(changeAmount))}`}
                    </span>
                  </div>
                </div>

                <div className="text-lg font-mono font-black">
                  {isCashSufficient
                    ? formatRupiah(changeAmount)
                    : `-${formatRupiah(Math.abs(changeAmount))}`}
                </div>
              </div>
            </div>
          )}

          {/* QRIS DETAILS */}
          {paymentMethod === 'qris' && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="inline-block bg-white p-3 rounded-2xl border-2 border-slate-800 shadow-sm">
                {/* Simulated aesthetic SVG QR code */}
                <svg
                  className="w-36 h-36 mx-auto"
                  viewBox="0 0 120 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="120" height="120" fill="white" />
                  {/* Top Left Finder */}
                  <rect x="8" y="8" width="32" height="32" rx="4" fill="black" />
                  <rect x="14" y="14" width="20" height="20" fill="white" />
                  <rect x="18" y="18" width="12" height="12" rx="2" fill="black" />
                  {/* Top Right Finder */}
                  <rect x="80" y="8" width="32" height="32" rx="4" fill="black" />
                  <rect x="86" y="14" width="20" height="20" fill="white" />
                  <rect x="90" y="18" width="12" height="12" rx="2" fill="black" />
                  {/* Bottom Left Finder */}
                  <rect x="8" y="80" width="32" height="32" rx="4" fill="black" />
                  <rect x="14" y="86" width="20" height="20" fill="white" />
                  <rect x="18" y="90" width="12" height="12" rx="2" fill="black" />
                  {/* Data patterns */}
                  <rect x="46" y="12" width="8" height="8" fill="black" />
                  <rect x="58" y="12" width="6" height="14" fill="black" />
                  <rect x="68" y="20" width="6" height="6" fill="black" />
                  <rect x="46" y="26" width="10" height="6" fill="black" />
                  <rect x="12" y="46" width="6" height="12" fill="black" />
                  <rect x="24" y="46" width="14" height="6" fill="black" />
                  <rect x="44" y="44" width="32" height="32" rx="6" fill="#f59e0b" />
                  <circle cx="60" cy="60" r="10" fill="white" />
                  <path d="M57 56h6v8h-6z" fill="#d97706" />
                  <rect x="82" y="46" width="10" height="10" fill="black" />
                  <rect x="98" y="46" width="14" height="6" fill="black" />
                  <rect x="82" y="62" width="28" height="6" fill="black" />
                  <rect x="46" y="82" width="12" height="8" fill="black" />
                  <rect x="62" y="82" width="8" height="18" fill="black" />
                  <rect x="46" y="96" width="10" height="16" fill="black" />
                  <rect x="76" y="82" width="10" height="10" fill="black" />
                  <rect x="92" y="82" width="20" height="10" fill="black" />
                  <rect x="76" y="98" width="36" height="14" fill="black" />
                </svg>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-800">
                  Scan QRIS dengan GoPay, OVO, Dana, BCA, atau ShopeePay
                </span>
                <p className="text-[11px] text-slate-400">
                  NMID: ID1020304050607 • {settings.storeName}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setQrisPaidSimulated(true);
                  sound.playSuccess();
                }}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition-all ${
                  qrisPaidSimulated
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                {qrisPaidSimulated
                  ? '✓ Status: Lunas Terverifikasi'
                  : 'Klik Disini: Simulasi Pembayaran QR Berhasil'}
              </button>
            </div>
          )}

          {/* CARD DETAILS */}
          {paymentMethod === 'card' && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <p className="text-xs text-slate-600 font-medium">
                Silakan gesek atau tap kartu pelanggan pada mesin EDC (Mandiri, BCA, atau BRI).
              </p>
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-500">Nomor Approval / Trace:</span>
                <span className="font-mono font-bold text-slate-800">
                  TRC-{Math.floor(100000 + Math.random() * 900000)}
                </span>
              </div>
            </div>
          )}

          {/* TRANSFER DETAILS */}
          {paymentMethod === 'transfer' && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <p className="text-xs text-slate-600 font-medium">
                Rekening tujuan transfer toko:
              </p>
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-blue-600 block">Bank Central Asia (BCA)</span>
                  <span className="font-mono font-bold text-slate-800">880-1234-5678</span>
                </div>
                <span className="text-[11px] text-slate-400">a/n {settings.storeName}</span>
              </div>
            </div>
          )}

          {/* Optional Note */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
              Catatan Transaksi (Opsional)
            </label>
            <input
              type="text"
              value={transactionNote}
              onChange={(e) => setTransactionNote(e.target.value)}
              placeholder="Contoh: Pesanan atas nama kantor, minta split bill"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={paymentMethod === 'cash' && !isCashSufficient}
            onClick={handleCompleteOrder}
            className={`flex-1 py-3 px-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
              paymentMethod === 'cash' && !isCashSufficient
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 active:scale-[0.99]'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Selesaikan & Cetak Resi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
