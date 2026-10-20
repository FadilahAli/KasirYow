import React from 'react';
import { Coffee, CupSoda, Utensils, Cookie, Tag, LayoutGrid } from 'lucide-react';
import { Category } from '../types/pos.ts';
import { sound } from '../utils/sound.ts';

interface CategoryFilterProps {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
  categoryCounts: Record<Category, number>;
}

interface CategoryOption {
  id: Category;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORIES: CategoryOption[] = [
  { id: 'all', label: 'Semua', icon: LayoutGrid },
  { id: 'kopi', label: 'Kopi', icon: Coffee },
  { id: 'non-kopi', label: 'Non-Kopi', icon: CupSoda },
  { id: 'makanan', label: 'Makanan', icon: Utensils },
  { id: 'camilan', label: 'Camilan', icon: Cookie },
  { id: 'paket', label: 'Paket Hemat', icon: Tag },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isSelected = selectedCategory === cat.id;
        const count = categoryCounts[cat.id] || 0;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              onSelectCategory(cat.id);
              sound.playTap();
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-150 select-none ${
              isSelected
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25 scale-[1.02]'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Icon
              className={`w-3.5 h-3.5 ${
                isSelected ? 'text-white' : 'text-amber-600'
              }`}
            />
            <span>{cat.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isSelected
                  ? 'bg-amber-700/60 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
