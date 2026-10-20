import React, { useState } from 'react';
import {
  Printer,
  X,
  Share2,
  Copy,
  Check,
  RotateCcw,
  Wifi,
  Sparkles,
  Download,
  Store,
} from 'lucide-react';
import { Order, StoreSettings } from '../types/pos.ts';
import {
  formatRupiah,
  getPaymentMethodLabel,
  formatReceiptText,
} from '../utils/posLogic.ts';
import { sound } from '../utils/sound.ts';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  settings: StoreSettings;
  onNewTransaction: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
  settings,
  onNewTransaction,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>(
    settings.paperWidth || '58mm'
  );

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    sound.playTap();
    window.print();
  };

  const handleCopyText = async () => {
    const text = formatReceiptText({
      invoiceNumber: order.invoiceNumber,
      storeName: settings.storeName,
      timestamp: order.timestamp,
      customerName: order.customerName,
      tableNumber: order.tableNumber,
      items: order.items,
      subtotal: order.subtotal,
      discountAmount: order.discountAmount,
      taxAmount: order.taxAmount,
      total: order.total,
      paymentMethod: order.paymentMethod,
      amountPaid: order.amountPaid,
      change: order.change,
      footerNote: settings.footerNote,
    });

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      sound.playTap();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleShareWhatsApp = () => {
    const text = formatReceiptText({
      invoiceNumber: order.invoiceNumber,
      storeName: settings.storeName,
      timestamp: order.timestamp,
      customerName: order.customerName,
      tableNumber: order.tableNumber,
      items: order.items,
      subtotal: order.subtotal,
      discountAmount: order.discountAmount,
      taxAmount: order.taxAmount,
      total: order.total,
      paymentMethod: order.paymentMethod,
      amountPaid: order.amountPaid,
      change: order.change,
      footerNote: settings.footerNote,
    });

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleDownloadTxt = () => {
    const text = formatReceiptText({
      invoiceNumber: order.invoiceNumber,
      storeName: settings.storeName,
      timestamp: order.timestamp,
      customerName: order.customerName,
      tableNumber: order.tableNumber,
      items: order.items,
      subtotal: order.subtotal,
      discountAmount: order.discountAmount,
      taxAmount: order.taxAmount,
      total: order.total,
      paymentMethod: order.paymentMethod,
      amountPaid: order.amountPaid,
      change: order.change,
      footerNote: settings.footerNote,
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Struk-${order.invoiceNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative max-w-xl w-full my-auto flex flex-col md:flex-row gap-4 items-center md:items-start justify-center">
        {/* ===================== THE RECEIPT PREVIEW (PRINTABLE) ===================== */}
        <div className="w-full flex justify-center">
          <div
            id="receipt-printable"
            className={`bg-white text-slate-800 shadow-2xl rounded-2xl p-5 border border-slate-200/60 font-mono-receipt text-xs transition-all relative ${
              paperWidth === '58mm' ? 'max-w-[320px] w-full' : 'max-w-[380px] w-full'
            }`}
          >
            {/* Top saw-tooth / paper tear effect in screen view */}
            <div className="no-print -mt-5 -mx-5 h-3 receipt-tear-top border-b border-dashed border-slate-200 mb-3" />

            {/* Store Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              {settings.showLogo && (
                <div className="w-10 h-10 mx-auto rounded-full bg-slate-900 text-white flex items-center justify-center mb-1.5 shadow-xs">
                  <Store className="w-5 h-5" />
                </div>
              )}
              <h2 className="text-sm font-black tracking-tight uppercase text-slate-900">
                {settings.storeName}
              </h2>
              {settings.tagline && (
                <p className="text-[10px] text-slate-500 font-sans italic">
                  {settings.tagline}
                </p>
              )}
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                {settings.address}
              </p>
              <p className="text-[10px] text-slate-500">Telp: {settings.phone}</p>
            </div>

            {/* Transaction Metadata */}
            <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px] space-y-0.5">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Nota</span>
                <span className="font-bold text-slate-800">{order.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal</span>
                <span>{order.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kasir</span>
                <span>{order.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pelanggan</span>
                <span className="font-semibold">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tipe / Meja</span>
                <span className="font-semibold uppercase text-slate-800">
                  {order.orderType === 'dine_in' ? 'Dine In' : 'Take Away'} • {order.tableNumber}
                </span>
              </div>
            </div>

            {/* Itemized List */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-2">
              {order.items.map((item, idx) => {
                const itemTotal = item.product.price * item.quantity;
                return (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between font-semibold text-slate-900">
                      <span className="pr-2 leading-tight">{item.product.name}</span>
                      <span className="shrink-0">{formatRupiah(itemTotal)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>
                        {item.quantity} x {formatRupiah(item.product.price)}
                      </span>
                    </div>
                    {item.notes && (
                      <p className="text-[9.5px] italic text-slate-500 pl-2 border-l border-amber-300">
                        * {item.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Price Calculations */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span>{formatRupiah(order.subtotal)}</span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>Diskon ({order.discount}%)</span>
                  <span>-{formatRupiah(order.discountAmount)}</span>
                </div>
              )}

              {order.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">PB1 Pajak ({order.taxRate}%)</span>
                  <span>+{formatRupiah(order.taxAmount)}</span>
                </div>
              )}

              {order.serviceFeeAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Layanan ({order.serviceFeeRate}%)
                  </span>
                  <span>+{formatRupiah(order.serviceFeeAmount)}</span>
                </div>
              )}

              <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-400 text-slate-950">
                <span>TOTAL</span>
                <span>{formatRupiah(order.total)}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Metode Bayar</span>
                <span className="font-bold uppercase">
                  {order.paymentMethod === 'cash'
                    ? 'TUNAI'
                    : order.paymentMethod === 'qris'
                    ? 'QRIS'
                    : order.paymentMethod === 'card'
                    ? 'KARTU DEBIT'
                    : 'TRANSFER BANK'}
                </span>
              </div>

              {order.paymentMethod === 'cash' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bayar (Tunai)</span>
                    <span>{formatRupiah(order.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>Kembali</span>
                    <span>{formatRupiah(order.change)}</span>
                  </div>
                </>
              )}

              {order.paymentMethod !== 'cash' && (
                <div className="flex justify-between font-bold text-emerald-700">
                  <span>Status Pembayaran</span>
                  <span>LUNAS (PAID)</span>
                </div>
              )}
            </div>

            {/* Wi-Fi & Friendly Info */}
            {settings.showWifi && settings.wifiName && (
              <div className="py-2 border-b border-dashed border-slate-200 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
                <Wifi className="w-3 h-3 text-slate-400" />
                <span>
                  Wi-Fi: <strong className="text-slate-700">{settings.wifiName}</strong> | Pass:{' '}
                  <strong className="text-slate-700">{settings.wifiPassword}</strong>
                </span>
              </div>
            )}

            {/* Simulated Barcode */}
            {settings.showBarcode && (
              <div className="py-3 text-center">
                <div className="flex justify-center items-center gap-[2px] h-9 mx-auto max-w-[200px]">
                  {[3, 1, 2, 4, 1, 3, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 3, 1, 2].map(
                    (w, i) => (
                      <div
                        key={i}
                        className="bg-black h-full"
                        style={{ width: `${w}px` }}
                      />
                    )
                  )}
                </div>
                <span className="text-[9px] tracking-widest text-slate-400 mt-1 block">
                  {order.invoiceNumber}
                </span>
              </div>
            )}

            {/* Footer friendly message */}
            <div className="text-center pt-2 text-[10px] text-slate-500 whitespace-pre-line font-sans leading-relaxed">
              {settings.footerNote}
            </div>

            {/* Bottom saw-tooth / paper tear effect in screen view */}
            <div className="no-print -mb-5 -mx-5 h-3 receipt-tear-bottom border-t border-dashed border-slate-200 mt-4" />
          </div>
        </div>

        {/* ===================== CONTROL ACTIONS SIDEBAR ===================== */}
        <div className="w-full md:w-64 space-y-3 no-print">
          {/* Action Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> Cetak & Bagikan
              </span>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Paper Width Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Lebar Kertas Thermal
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPaperWidth('58mm')}
                  className={`py-1.5 rounded-lg transition-all ${
                    paperWidth === '58mm'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  58mm (Mini POS)
                </button>
                <button
                  type="button"
                  onClick={() => setPaperWidth('80mm')}
                  className={`py-1.5 rounded-lg transition-all ${
                    paperWidth === '80mm'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  80mm (Standar)
                </button>
              </div>
            </div>

            {/* Primary Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-extrabold text-xs shadow-md shadow-amber-600/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Struk Sekarang</span>
            </button>

            {/* Share to WhatsApp */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs border border-emerald-200 flex items-center justify-center gap-2 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Kirim Struk via WhatsApp</span>
            </button>

            {/* Copy & Download Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyText}
                className="py-2 px-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Salin Teks</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadTxt}
                className="py-2 px-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Unduh .txt</span>
              </button>
            </div>

            {/* New Transaction Button */}
            <button
              type="button"
              onClick={() => {
                sound.playTap();
                onNewTransaction();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors mt-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Transaksi Baru</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
