import React, { useState } from 'react';
import {
  X,
  Settings,
  Store,
  FileText,
  Percent,
  Wifi,
  Check,
  RotateCcw,
} from 'lucide-react';
import { StoreSettings } from '../types/pos.ts';
import { INITIAL_SETTINGS } from '../data/initialProducts.ts';
import { sound } from '../utils/sound.ts';

interface StoreSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => void;
}

export const StoreSettingsModal: React.FC<StoreSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<'profile' | 'receipt' | 'tax'>('profile');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccess();
    onSaveSettings(formData);
    onClose();
  };

  const handleResetToDefault = () => {
    if (window.confirm('Kembalikan semua pengaturan ke nilai awal?')) {
      setFormData({ ...INITIAL_SETTINGS });
      sound.playTap();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Pengaturan Toko & Resi</h3>
              <p className="text-xs text-purple-100">
                Kustomisasi nama usaha, alamat, format struk, dan pajak kasir
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

        {/* Tab navigation */}
        <div className="flex border-b border-slate-100 px-4 bg-slate-50 gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Profil Toko</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('receipt')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'receipt'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Format Struk</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tax')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'tax'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Pajak & Layanan</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'profile' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Toko / Usaha *
                </label>
                <input
                  type="text"
                  required
                  value={formData.storeName}
                  onChange={(e) =>
                    setFormData({ ...formData, storeName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Slogan / Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) =>
                    setFormData({ ...formData, tagline: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Alamat Lengkap
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    No. Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kasir yang Bertugas
                  </label>
                  <input
                    type="text"
                    value={formData.cashierName}
                    onChange={(e) =>
                      setFormData({ ...formData, cashierName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'receipt' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pesan di Bagian Bawah Struk (Footer)
                </label>
                <textarea
                  rows={3}
                  value={formData.footerNote}
                  onChange={(e) =>
                    setFormData({ ...formData, footerNote: e.target.value })
                  }
                  placeholder="Ucapan terima kasih, info media sosial, dll."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-sans focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Lebar Kertas Standar
                  </label>
                  <select
                    value={formData.paperWidth}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paperWidth: e.target.value as '58mm' | '80mm',
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="58mm">58mm (Thermal Printer Mini)</option>
                    <option value="80mm">80mm (Thermal Printer Standard)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tampilkan Barcode
                  </label>
                  <select
                    value={formData.showBarcode ? 'yes' : 'no'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        showBarcode: e.target.value === 'yes',
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="yes">Ya, Tampilkan Barcode</option>
                    <option value="no">Sembunyikan</option>
                  </select>
                </div>
              </div>

              {/* Wi-Fi Details */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5 text-blue-500" /> Cetak Info Wi-Fi di Struk
                  </span>
                  <input
                    type="checkbox"
                    checked={formData.showWifi}
                    onChange={(e) =>
                      setFormData({ ...formData, showWifi: e.target.checked })
                    }
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                </div>

                {formData.showWifi && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                        Nama SSID Wi-Fi
                      </label>
                      <input
                        type="text"
                        value={formData.wifiName}
                        onChange={(e) =>
                          setFormData({ ...formData, wifiName: e.target.value })
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                        Password Wi-Fi
                      </label>
                      <input
                        type="text"
                        value={formData.wifiPassword}
                        onChange={(e) =>
                          setFormData({ ...formData, wifiPassword: e.target.value })
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tax' && (
            <div className="space-y-3 text-xs">
              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200/70 text-amber-900 leading-relaxed">
                Pengaturan persentase ini akan otomatis diperhitungkan di struk kasir dan keranjang transaksi.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Pajak Restoran / PB1 (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={formData.taxRate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          taxRate: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Biaya Layanan Service (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={formData.serviceFeeRate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          serviceFeeRate: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Standar</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100 font-bold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
