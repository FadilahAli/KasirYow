import React, { useState } from 'react';
import {
  X,
  Package,
  Plus,
  Trash2,
  Edit2,
  Check,
} from 'lucide-react';
import { Product, Category } from '../types/pos.ts';
import { formatRupiah } from '../utils/posLogic.ts';
import { sound } from '../utils/sound.ts';

interface ProductManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const ProductManagerModal: React.FC<ProductManagerModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('kopi');
  const [price, setPrice] = useState<number>(20000);
  const [costPrice, setCostPrice] = useState<number>(8000);
  const [stock, setStock] = useState<number>(30);
  const [image, setImage] = useState('');
  const [badge, setBadge] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setCategory('kopi');
    setPrice(20000);
    setCostPrice(8000);
    setStock(30);
    setImage('');
    setBadge('');
    setDescription('');
    setIsAddingNew(false);
    setEditingProduct(null);
  };

  const handleStartEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategory(prod.category);
    setPrice(prod.price);
    setCostPrice(prod.costPrice || 0);
    setStock(prod.stock);
    setImage(prod.image);
    setBadge(prod.badge || '');
    setDescription(prod.description || '');
    setIsAddingNew(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const categoryNames: Record<Category, string> = {
      all: 'Semua',
      kopi: 'Kopi',
      'non-kopi': 'Non-Kopi',
      makanan: 'Makanan Utama',
      camilan: 'Camilan',
      paket: 'Paket Promo',
    };

    const finalImage =
      image.trim() ||
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80';

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        name: name.trim(),
        category,
        categoryName: categoryNames[category] || 'Menu',
        price: Number(price),
        costPrice: Number(costPrice),
        stock: Number(stock),
        image: finalImage,
        badge: badge.trim() || undefined,
        description: description.trim() || undefined,
      };
      onUpdateProduct(updated);
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name: name.trim(),
        category,
        categoryName: categoryNames[category] || 'Menu',
        price: Number(price),
        costPrice: Number(costPrice),
        stock: Number(stock),
        image: finalImage,
        badge: badge.trim() || undefined,
        description: description.trim() || undefined,
      };
      onAddProduct(newProd);
    }

    sound.playSuccess();
    resetForm();
  };

  const handleAdjustStock = (prod: Product, delta: number) => {
    sound.playTap();
    onUpdateProduct({
      ...prod,
      stock: Math.max(0, prod.stock + delta),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Kelola Menu & Stok Produk</h3>
              <p className="text-xs text-emerald-100">
                Tambah menu baru, atur harga, dan perbarui sisa stok kasir
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

        {/* Action Toggle */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-semibold">
            Total {products.length} item menu terdaftar
          </div>

          <button
            type="button"
            onClick={() => {
              if (isAddingNew) {
                resetForm();
              } else {
                setIsAddingNew(true);
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
          >
            {isAddingNew ? (
              <>
                <X className="w-3.5 h-3.5" />
                <span>Batal Input</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Menu Baru</span>
              </>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Add / Edit Form */}
          {isAddingNew && (
            <form
              onSubmit={handleSave}
              className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 space-y-3"
            >
              <h4 className="font-bold text-xs text-emerald-900 uppercase tracking-wider">
                {editingProduct ? 'Edit Informasi Menu' : 'Form Tambah Menu Baru'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Menu Produk *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kopi Susu Pandan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kategori Menu
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="kopi">Kopi</option>
                    <option value="non-kopi">Non-Kopi</option>
                    <option value="makanan">Makanan Utama</option>
                    <option value="camilan">Camilan</option>
                    <option value="paket">Paket Promo</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Harga Jual (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={500}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Stok Awal
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    URL Foto Produk (Unsplash / Web)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Badge Khusus (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Best Seller, Favorit, Baru"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi / Komposisi
                </label>
                <input
                  type="text"
                  placeholder="Keterangan singkat rasa atau isi menu"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs text-white bg-emerald-600 hover:bg-emerald-700 font-bold flex items-center gap-1 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingProduct ? 'Perbarui Menu' : 'Simpan Menu'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Products List Table */}
          <div className="space-y-2">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl p-3 border border-slate-200/80 hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80';
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-800">
                        {prod.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md font-semibold bg-slate-100 text-slate-600">
                        {prod.categoryName}
                      </span>
                      {prod.badge && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md font-bold bg-amber-100 text-amber-700">
                          {prod.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono font-bold text-slate-900 mt-0.5">
                      {formatRupiah(prod.price)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Stock quick buttons */}
                  <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-xl border border-slate-200 text-xs">
                    <span className="text-slate-400 font-semibold text-[10px] mr-1">
                      Stok:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAdjustStock(prod, -1)}
                      className="w-5 h-5 rounded bg-white text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 shadow-xs"
                    >
                      -
                    </button>
                    <span className="font-bold font-mono px-1.5 text-slate-800">
                      {prod.stock}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAdjustStock(prod, 5)}
                      className="w-5 h-5 rounded bg-white text-emerald-700 font-bold flex items-center justify-center hover:bg-slate-100 shadow-xs"
                      title="Tambah 5 stok"
                    >
                      +5
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(prod)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                      title="Edit menu"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Hapus menu "${prod.name}"?`)) {
                          onDeleteProduct(prod.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Hapus menu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
