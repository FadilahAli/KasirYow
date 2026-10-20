import React, { useState } from 'react';
import {
  X,
  History,
  Search,
  Printer,
  Calendar,
  DollarSign,
  TrendingUp,
  Receipt,
  User,
} from 'lucide-react';
import { Order, StoreSettings } from '../types/pos.ts';
import { formatRupiah, getPaymentMethodLabel } from '../utils/posLogic.ts';
import { sound } from '../utils/sound.ts';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  settings: StoreSettings;
  onSelectOrderForReprint: (order: Order) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  orders,
  onSelectOrderForReprint,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase();
    return (
      order.invoiceNumber.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      (order.tableNumber && order.tableNumber.toLowerCase().includes(q))
    );
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalTransactions = orders.length;
  const averageTransaction =
    totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <History className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Riwayat Transaksi & Cetak Ulang</h3>
              <p className="text-xs text-blue-100">
                Lihat arsip nota penjualan dan cetak ulang struk kasir
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

        {/* Sales Metric Summary Cards */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 border-b border-slate-100 text-xs">
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-slate-400 font-bold flex items-center gap-1 text-[11px]">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Total Penjualan
            </span>
            <p className="font-black text-base text-slate-800 mt-0.5">
              {formatRupiah(totalRevenue)}
            </p>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-slate-400 font-bold flex items-center gap-1 text-[11px]">
              <Receipt className="w-3.5 h-3.5 text-blue-600" /> Transaksi
            </span>
            <p className="font-black text-base text-slate-800 mt-0.5">
              {totalTransactions} Nota
            </p>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-slate-400 font-bold flex items-center gap-1 text-[11px]">
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" /> Rata-rata Nota
            </span>
            <p className="font-black text-base text-slate-800 mt-0.5">
              {formatRupiah(averageTransaction)}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan No. Nota, nama pelanggan, atau nomor meja..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Receipt className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-600">Belum Ada Transaksi</p>
              <p className="text-xs text-slate-400 mt-1">
                {orders.length === 0
                  ? 'Selesaikan pembayaran di kasir untuk melihat nota di sini.'
                  : 'Tidak ada nota yang cocok dengan pencarian.'}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-3.5 border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg">
                      {order.invoiceNumber}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700">
                      {order.orderType === 'dine_in' ? 'Dine In' : 'Take Away'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
                      {getPaymentMethodLabel(order.paymentMethod).split(' ')[0]}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {order.customerName} ({order.tableNumber})
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {order.timestamp}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    {order.items
                      .map((i) => `${i.quantity}x ${i.product.name}`)
                      .join(', ')}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Total Belanja
                    </span>
                    <span className="font-black text-sm text-slate-900">
                      {formatRupiah(order.total)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      onSelectOrderForReprint(order);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 transition-colors shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Ulang</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
