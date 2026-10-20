import React from 'react';
import { Plus, Check, Flame } from 'lucide-react';
import { Product } from '../types/pos.ts';
import { formatRupiah } from '../utils/posLogic.ts';
import { sound } from '../utils/sound.ts';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInCart,
  onAddToCart,
}) => {
  const isOutOfStock = product.stock <= 0;

  const handleAdd = () => {
    if (isOutOfStock) return;
    sound.playTap();
    onAddToCart(product);
  };

  return (
    <div
      onClick={handleAdd}
      className={`group relative bg-white rounded-3xl p-3 border transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden select-none ${
        isOutOfStock
          ? 'opacity-60 border-slate-200 cursor-not-allowed bg-slate-50'
          : 'border-slate-100 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-0.5 active:scale-[0.98]'
      }`}
    >
      {/* Top Image & Badges */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 mb-2.5">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80';
          }}
        />

        {/* Popular / Custom Badge */}
        {product.badge && (
          <span className="absolute top-2 left-2 bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <Flame className="w-2.5 h-2.5 fill-white" />
            {product.badge}
          </span>
        )}

        {/* Stock indicator badge */}
        <span
          className={`absolute bottom-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md ${
            isOutOfStock
              ? 'bg-rose-500 text-white'
              : product.stock <= 5
              ? 'bg-rose-100 text-rose-700 border border-rose-300'
              : 'bg-white/90 text-slate-700 shadow-sm'
          }`}
        >
          {isOutOfStock ? 'Habis' : `Stok: ${product.stock}`}
        </span>

        {/* In-cart count badge */}
        {quantityInCart > 0 && (
          <div className="absolute top-2 right-2 bg-emerald-600 text-white font-extrabold text-xs px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 animate-in zoom-in-50 duration-150">
            <Check className="w-3 h-3 stroke-[3]" />
            {quantityInCart}x
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700/80 bg-amber-50/80 px-2 py-0.5 rounded-md">
            {product.categoryName}
          </span>
          <h3 className="font-bold text-slate-800 text-sm mt-1 line-clamp-1 group-hover:text-amber-800 transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
              {product.description}
            </p>
          )}
        </div>

        {/* Price and Add button */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
          <div>
            <span className="text-[11px] text-slate-400 font-medium">Harga</span>
            <p className="text-sm font-extrabold text-slate-900 leading-tight">
              {formatRupiah(product.price)}
            </p>
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            aria-label={`Tambah ${product.name} ke keranjang`}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              isOutOfStock
                ? 'bg-slate-200 text-slate-400'
                : quantityInCart > 0
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-amber-500 text-white shadow-md shadow-amber-500/25 hover:bg-amber-600 active:scale-95'
            }`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
