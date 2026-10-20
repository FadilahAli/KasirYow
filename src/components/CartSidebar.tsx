import React, { useState } from 'react';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  UtensilsCrossed,
  ShoppingBag as TakeAwayIcon,
  MessageSquare,
  Percent,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { CartItem, OrderType, StoreSettings } from '../types/pos.ts';
import { formatRupiah, calculateCartTotals } from '../utils/posLogic.ts';
import { sound } from '../utils/sound.ts';

interface CartSidebarProps {
  cart: CartItem[];
  settings: StoreSettings;
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  tableNumber: string;
  setTableNumber: (table: string) => void;
  discountPercent: number;
  setDiscountPercent: (percent: number) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onUpdateNotes: (productId: string, notes: string) => void;
  onClearCart: () => void;
  onOpenCheckout: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
  cart,
  settings,
  orderType,
  setOrderType,
  customerName,
  setCustomerName,
  tableNumber,
  setTableNumber,
  discountPercent,
  setDiscountPercent,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateNotes,
  onClearCart,
  onOpenCheckout,
}) => {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState<string>('');

  const totals = calculateCartTotals(
    cart,
    discountPercent,
    settings.taxRate,
    settings.serviceFeeRate
  );

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleStartNote = (item: CartItem) => {
    setEditingNoteId(item.product.id);
    setTempNote(item.notes || '');
  };

  const handleSaveNote = (productId: string) => {
    onUpdateNotes(productId, tempNote.trim());
    setEditingNoteId(null);
  };

  const applyPresetDiscount = (percent: number) => {
    sound.playTap();
    setDiscountPercent(discountPercent === percent ? 0 : percent);
  };

  return (
    <aside className="bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-sm">Pesanan Sekarang</h2>
            <p className="text-[11px] text-slate-400">
              {totalItemsCount} item di keranjang
            </p>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Kosongkan semua pesanan di keranjang?')) {
                onClearCart();
              }
            }}
            className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 font-semibold hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>

      {/* Order Type & Customer Details */}
      <div className="p-3.5 bg-slate-50/70 border-b border-slate-100 space-y-2.5">
        {/* Dine In vs Take Away */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/60 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setOrderType('dine_in');
              sound.playTap();
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              orderType === 'dine_in'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600" />
            <span>Dine In (Meja)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setOrderType('take_away');
              sound.playTap();
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              orderType === 'take_away'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TakeAwayIcon className="w-3.5 h-3.5 text-orange-600" />
            <span>Bungkus / Take Away</span>
          </button>
        </div>

        {/* Customer & Table input */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">
              Pelanggan
            </label>
            <input
              type="text"
              placeholder="Contoh: Kak Dinda"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">
              {orderType === 'dine_in' ? 'No. Meja' : 'No. Antrean'}
            </label>
            <input
              type="text"
              placeholder={orderType === 'dine_in' ? 'Meja 05' : 'Antrean #12'}
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[200px]">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 mb-3 animate-pulse">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-700 text-sm">Keranjang Masih Kosong</h3>
            <p className="text-xs text-slate-400 max-w-[200px] mt-1">
              Pilih menu lezat di sebelah kiri untuk mulai transaksi
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.product.id}
              className="bg-white rounded-2xl p-2.5 border border-slate-100 hover:border-slate-200 shadow-sm transition-all"
            >
              <div className="flex items-start gap-2.5">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80';
                  }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-bold text-slate-800 text-xs truncate">
                      {item.product.name}
                    </h4>
                    <span className="font-extrabold text-xs text-slate-900 shrink-0">
                      {formatRupiah(item.product.price * item.quantity)}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    {formatRupiah(item.product.price)} / pcs
                  </p>

                  {/* Notes label */}
                  {item.notes && editingNoteId !== item.product.id && (
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                      <MessageSquare className="w-3 h-3 shrink-0" />
                      <span className="truncate">{item.notes}</span>
                    </div>
                  )}

                  {/* Note edit field */}
                  {editingNoteId === item.product.id ? (
                    <div className="mt-2 space-y-1">
                      <input
                        type="text"
                        autoFocus
                        value={tempNote}
                        onChange={(e) => setTempNote(e.target.value)}
                        placeholder="Contoh: Kurang manis, es pisah..."
                        className="w-full text-xs px-2 py-1 border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveNote(item.product.id);
                        }}
                      />
                      <div className="flex gap-1 justify-end">
                        <button
                          type="button"
                          onClick={() => setEditingNoteId(null)}
                          className="text-[10px] px-2 py-0.5 rounded text-slate-500 hover:bg-slate-100"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveNote(item.product.id)}
                          className="text-[10px] px-2 py-0.5 rounded bg-amber-600 text-white font-semibold"
                        >
                          Simpan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartNote(item)}
                      className="mt-1 text-[10px] text-slate-400 hover:text-amber-600 flex items-center gap-1 font-medium"
                    >
                      <MessageSquare className="w-2.5 h-2.5" />
                      {item.notes ? 'Ubah catatan' : '+ Tambah catatan'}
                    </button>
                  )}
                </div>
              </div>

              {/* Quantity buttons */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                <span className="text-[10px] text-slate-400">Kuantitas</span>
                <div className="flex items-center gap-1.5 bg-slate-50 p-0.5 rounded-lg border border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      if (item.quantity === 1) {
                        onRemoveItem(item.product.id);
                      } else {
                        onUpdateQuantity(item.product.id, -1);
                      }
                    }}
                    className="w-6 h-6 rounded-md bg-white text-slate-700 flex items-center justify-center hover:bg-slate-100 shadow-xs"
                    aria-label="Kurangi kuantitas"
                  >
                    {item.quantity === 1 ? (
                      <Trash2 className="w-3 h-3 text-rose-500" />
                    ) : (
                      <Minus className="w-3 h-3" />
                    )}
                  </button>

                  <span className="w-6 text-center text-xs font-bold text-slate-800">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      onUpdateQuantity(item.product.id, 1);
                    }}
                    className="w-6 h-6 rounded-md bg-white text-slate-700 flex items-center justify-center hover:bg-slate-100 shadow-xs"
                    aria-label="Tambah kuantitas"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary and Pay Footer */}
      {cart.length > 0 && (
        <div className="p-3.5 bg-slate-50/90 border-t border-slate-100 space-y-2.5">
          {/* Quick discounts */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
              <span className="flex items-center gap-1">
                <Percent className="w-3 h-3 text-amber-500" /> Diskon Promo
              </span>
              {discountPercent > 0 && (
                <span className="text-emerald-600 font-bold">
                  Aktif: {discountPercent}% (-{formatRupiah(totals.discountAmount)})
                </span>
              )}
            </div>
            <div className="flex gap-1.5">
              {[5, 10, 15, 20].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => applyPresetDiscount(pct)}
                  className={`flex-1 py-1 text-xs rounded-lg font-bold border transition-all ${
                    discountPercent === pct
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  {pct}%
                </button>
              ))}
              {discountPercent > 0 && (
                <button
                  type="button"
                  onClick={() => setDiscountPercent(0)}
                  className="px-2 py-1 text-xs text-rose-500 bg-rose-50 rounded-lg hover:bg-rose-100"
                >
                  Batal
                </button>
              )}
            </div>
          </div>

          {/* Breakdown calculation */}
          <div className="space-y-1 text-xs text-slate-500 pt-1 border-t border-slate-200/60">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-700">
                {formatRupiah(totals.subtotal)}
              </span>
            </div>

            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Diskon ({totals.discountPercent}%)</span>
                <span>-{formatRupiah(totals.discountAmount)}</span>
              </div>
            )}

            {totals.taxAmount > 0 && (
              <div className="flex justify-between">
                <span>PB1 / Pajak Resto ({totals.taxRate}%)</span>
                <span>+{formatRupiah(totals.taxAmount)}</span>
              </div>
            )}

            {totals.serviceFeeAmount > 0 && (
              <div className="flex justify-between">
                <span>Biaya Layanan ({totals.serviceFeeRate}%)</span>
                <span>+{formatRupiah(totals.serviceFeeAmount)}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-1.5 border-t border-slate-200 text-slate-900">
              <span className="font-bold text-sm">Total Tagihan</span>
              <span className="font-extrabold text-lg text-amber-700">
                {formatRupiah(totals.total)}
              </span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            type="button"
            onClick={() => {
              sound.playTap();
              onOpenCheckout();
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-extrabold text-sm shadow-lg shadow-amber-600/25 flex items-center justify-between group active:scale-[0.99] transition-all"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 fill-white/20" />
              Bayar Sekarang
            </span>
            <div className="flex items-center gap-1.5 font-black">
              <span>{formatRupiah(totals.total)}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        </div>
      )}
    </aside>
  );
};
