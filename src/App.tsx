import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Plus,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import {
  Product,
  Category,
  CartItem,
  Order,
  OrderType,
  StoreSettings,
} from './types/pos.ts';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from './data/initialProducts.ts';
import { Header } from './components/Header.tsx';
import { CategoryFilter } from './components/CategoryFilter.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { CartSidebar } from './components/CartSidebar.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { ReceiptModal } from './components/ReceiptModal.tsx';
import { OrderHistoryModal } from './components/OrderHistoryModal.tsx';
import { ProductManagerModal } from './components/ProductManagerModal.tsx';
import { StoreSettingsModal } from './components/StoreSettingsModal.tsx';
import { calculateCartTotals, formatRupiah } from './utils/posLogic.ts';
import { sound } from './utils/sound.ts';

export default function App() {
  // Persistence with localStorage
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('kassa_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('kassa_settings');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('kassa_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('kassa_products', JSON.stringify(products));
    } catch {
      // Ignore
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('kassa_settings', JSON.stringify(settings));
    } catch {
      // Ignore
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('kassa_orders', JSON.stringify(orders));
    } catch {
      // Ignore
    }
  }, [orders]);

  // Cart & Order form states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [customerName, setCustomerName] = useState<string>('');
  const [tableNumber, setTableNumber] = useState<string>('Meja 01');
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Catalog filtering
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Navigation
  const [activeTab, setActiveTab] = useState<'pos' | 'history' | 'menu' | 'settings'>('pos');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [currentReceiptOrder, setCurrentReceiptOrder] = useState<Order | null>(null);
  const [isMenuManagerOpen, setIsMenuManagerOpen] = useState<boolean>(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Mobile cart sheet visibility
  const [isMobileCartOpen, setIsMobileCartOpen] = useState<boolean>(false);

  // Cart quantity map for quick lookup
  const cartQuantityMap = useMemo(() => {
    const map = new Map<string, number>();
    cart.forEach((item) => {
      map.set(item.product.id, item.quantity);
    });
    return map;
  }, [cart]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'all' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<Category, number> = {
      all: products.length,
      kopi: 0,
      'non-kopi': 0,
      makanan: 0,
      camilan: 0,
      paket: 0,
    };
    products.forEach((p) => {
      if (counts[p.category] !== undefined) {
        counts[p.category]++;
      }
    });
    return counts;
  }, [products]);

  // Cart Actions
  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.product.id === product.id);
      if (existing) {
        return prevCart.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleUpdateNotes = (productId: string, notes: string) => {
    setCart((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, notes } : i))
    );
  };

  const handleClearCart = () => {
    setCart([]);
    setCustomerName('');
    setTableNumber(orderType === 'dine_in' ? 'Meja 01' : 'Take Away');
    setDiscountPercent(0);
  };

  // Checkout Success Handler
  const handleOrderSuccess = (completedOrder: Order) => {
    setIsCheckoutOpen(false);
    setIsMobileCartOpen(false);
    setOrders((prev) => [completedOrder, ...prev]);

    // Update product stock
    setProducts((prev) =>
      prev.map((prod) => {
        const cartItem = completedOrder.items.find(
          (ci) => ci.product.id === prod.id
        );
        if (cartItem) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - cartItem.quantity),
          };
        }
        return prod;
      })
    );

    // Show aesthetic receipt modal immediately!
    setCurrentReceiptOrder(completedOrder);
    setIsReceiptOpen(true);

    // Reset current cart
    handleClearCart();
  };

  // Product Management Handlers
  const handleAddProduct = (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  // Keyboard shortcut (Escape to close modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCheckoutOpen(false);
        setIsReceiptOpen(false);
        setIsMenuManagerOpen(false);
        setIsOrderHistoryOpen(false);
        setIsSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const totalCartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotals = calculateCartTotals(
    cart,
    discountPercent,
    settings.taxRate,
    settings.serviceFeeRate
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Aesthetic Top Navigation Header */}
      <Header
        settings={settings}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={totalCartCount}
        orderCount={orders.length}
        openSettings={() => setIsSettingsOpen(true)}
        openMenuManager={() => setIsMenuManagerOpen(true)}
        openHistory={() => setIsOrderHistoryOpen(true)}
      />

      {/* Main POS Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
        {/* Left Side: Product Catalog (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Search bar & Quick Stats */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari menu kopi, makanan, camilan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMenuManagerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-300 text-slate-700 hover:text-amber-800 text-xs font-bold transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                <span>Tambah Menu</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="p-2.5 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-300 text-slate-600 hover:text-amber-800 transition-all shadow-xs"
                title="Pengaturan Struk"
                aria-label="Pengaturan Struk"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categoryCounts={categoryCounts}
          />

          {/* Product Cards Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/70 shadow-xs">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 text-sm">
                Menu Tidak Ditemukan
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                Tidak ada produk dengan kata kunci &quot;{searchQuery}&quot;. Coba cari
                kata kunci lain atau tambah menu baru.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-4 px-4 py-2 bg-amber-50 text-amber-700 font-bold text-xs rounded-xl border border-amber-200"
              >
                Tampilkan Semua Menu
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantityInCart={cartQuantityMap.get(product.id) || 0}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Cart Sidebar (lg:col-span-4) - Sticky on Desktop */}
        <div className="hidden lg:block lg:col-span-4 sticky top-20 h-[calc(100vh-6rem)]">
          <CartSidebar
            cart={cart}
            settings={settings}
            orderType={orderType}
            setOrderType={setOrderType}
            customerName={customerName}
            setCustomerName={setCustomerName}
            tableNumber={tableNumber}
            setTableNumber={setTableNumber}
            discountPercent={discountPercent}
            setDiscountPercent={setDiscountPercent}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onUpdateNotes={handleUpdateNotes}
            onClearCart={handleClearCart}
            onOpenCheckout={() => setIsCheckoutOpen(true)}
          />
        </div>
      </main>

      {/* Mobile Floating Cart Summary Bar */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 shadow-xl">
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setIsMobileCartOpen(true)}
              className="flex items-center gap-2.5 text-left"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                {totalCartCount}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">
                  {cart.length} item • Total
                </span>
                <p className="text-sm font-black text-slate-900 leading-tight">
                  {formatRupiah(cartTotals.total)}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playTap();
                setIsCheckoutOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 text-white font-extrabold text-xs shadow-md shadow-amber-500/30 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bayar Kasir</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Cart Sheet Modal */}
      {isMobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl max-h-[85vh] h-full flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            <div className="p-3 border-b flex justify-between items-center bg-slate-50">
              <span className="font-bold text-sm text-slate-800">
                Detail Pesanan ({totalCartCount} Item)
              </span>
              <button
                type="button"
                onClick={() => setIsMobileCartOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <CartSidebar
                cart={cart}
                settings={settings}
                orderType={orderType}
                setOrderType={setOrderType}
                customerName={customerName}
                setCustomerName={setCustomerName}
                tableNumber={tableNumber}
                setTableNumber={setTableNumber}
                discountPercent={discountPercent}
                setDiscountPercent={setDiscountPercent}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onUpdateNotes={handleUpdateNotes}
                onClearCart={handleClearCart}
                onOpenCheckout={() => {
                  setIsMobileCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        settings={settings}
        orderType={orderType}
        customerName={customerName}
        tableNumber={tableNumber}
        discountPercent={discountPercent}
        orderCount={orders.length}
        onSuccess={handleOrderSuccess}
      />

      {/* Aesthetic Thermal Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        order={currentReceiptOrder}
        settings={settings}
        onNewTransaction={() => {
          setIsReceiptOpen(false);
          setCurrentReceiptOrder(null);
        }}
      />

      {/* Order History & Reprint Modal */}
      <OrderHistoryModal
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
        orders={orders}
        settings={settings}
        onSelectOrderForReprint={(selectedOrder) => {
          setIsOrderHistoryOpen(false);
          setCurrentReceiptOrder(selectedOrder);
          setIsReceiptOpen(true);
        }}
      />

      {/* Product Management Modal */}
      <ProductManagerModal
        isOpen={isMenuManagerOpen}
        onClose={() => setIsMenuManagerOpen(false)}
        products={products}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
      />

      {/* Store Settings Modal */}
      <StoreSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
      />
    </div>
  );
}
