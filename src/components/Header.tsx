import React, { useState, useEffect } from 'react';
import {
  Store,
  Clock,
  Volume2,
  VolumeX,
  History,
  Package,
  Settings,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { StoreSettings } from '../types/pos.ts';
import { sound } from '../utils/sound.ts';

interface HeaderProps {
  settings: StoreSettings;
  activeTab: 'pos' | 'history' | 'menu' | 'settings';
  setActiveTab: (tab: 'pos' | 'history' | 'menu' | 'settings') => void;
  cartCount: number;
  orderCount: number;
  openSettings: () => void;
  openMenuManager: () => void;
  openHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activeTab,
  setActiveTab,
  cartCount,
  orderCount,
  openSettings,
  openMenuManager,
  openHistory,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      };
      setTimeStr(now.toLocaleDateString('id-ID', options));
    };

    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  const toggleSound = () => {
    sound.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) sound.playTap();
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-amber-100/70 sticky top-0 z-30 px-4 lg:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-orange-400 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-800">
                {settings.storeName}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
                <Sparkles className="w-3 h-3 text-amber-500" /> POS Kasir
              </span>
            </div>
            <p className="text-xs text-slate-500 line-clamp-1">{settings.tagline}</p>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
          <button
            onClick={() => {
              setActiveTab('pos');
              sound.playTap();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'pos'
                ? 'bg-white text-slate-800 shadow-sm shadow-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
            <span>Kasir</span>
            {cartCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              openHistory();
              sound.playTap();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-white text-slate-800 shadow-sm shadow-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5 text-blue-600" />
            <span>Riwayat</span>
            {orderCount > 0 && (
              <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                {orderCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              openMenuManager();
              sound.playTap();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all"
          >
            <Package className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kelola Menu</span>
          </button>

          <button
            onClick={() => {
              openSettings();
              sound.playTap();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all"
          >
            <Settings className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden md:inline">Pengaturan</span>
          </button>
        </div>

        {/* Right controls: live time, audio toggle, and cashier indicator */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/50">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{timeStr}</span>
          </div>

          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Matikan suara' : 'Nyalakan suara'}
            title={soundEnabled ? 'Suara Aktif' : 'Suara Mati'}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 flex items-center justify-center text-white font-bold text-xs ring-2 ring-amber-100">
              {settings.cashierName.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-none">
                {settings.cashierName}
              </p>
              <p className="text-[10px] text-emerald-600 font-medium">Kasir Aktif</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
