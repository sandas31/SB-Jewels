'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Share2, ShieldCheck, Sparkles, X, Trash2, ArrowRight, ArrowLeft, User, Shield, LogOut, Search, MapPin, Heart, Package, Gem, Crown, Feather, CheckCircle2, MessageCircle, Menu, ChevronRight, Check } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [cart, setCart] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);

  const [currentView, setCurrentView] = useState('catalog'); 
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState('US 7');
  const [productQuantity, setProductQuantity] = useState(1);

  // Order tracking lookup states
  const [lookupOrderId, setLookupOrderId] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [lookupError, setLookupError] = useState('');

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Mobile Menu Drawer State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState('phone'); 
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const banners = [
    {
      titleLine1: "HERITAGE",
      titleLine2: "IN EVERY DETAIL",
      subtitle: "Crafted to Be Cherished",
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop"
    },
    {
      titleLine1: "ROYAL",
      titleLine2: "BRIDAL SPLENDOR",
      subtitle: "Designed for Grand Celebrations",
      image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=600&auto=format&fit=crop"
    },
    {
      titleLine1: "TIMELESS",
      titleLine2: "GOLD ELEGANCE",
      subtitle: "Exquisite 1g Gold Masterpieces",
      image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const topRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const allProductsRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<any>(null); 

  const fallbackProducts = [
    { id: '1', name: 'Royal Gold Necklace Set', price: 1499, category: 'Necklace Sets', stock: 15, image1: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop', description: 'Exquisite 1g gold-coated traditional necklace set with matching earrings.' },
    { id: '2', name: 'Bridal Mangalsutra', price: 999, category: 'Mangalsutra', stock: 10, image1: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=600&auto=format&fit=crop', description: 'Stunning stone-studded close-fitting bridal mangalsutra necklace.' },
    { id: '3', name: 'Designer Gold Bangles (Set)', price: 799, category: 'Bangles', stock: 20, image1: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop', description: 'Sparkling 1g gold bangles crafted for special celebrations.' },
    { id: '4', name: 'Antique Gold Chain', price: 1299, category: 'Chains', stock: 8, image1: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop', description: 'Traditional gold chain with intricate craftsmanship.' }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const sheetApiUrl = process.env.NEXT_PUBLIC_SHEET_URL;
        if (!sheetApiUrl) {
          setProducts(fallbackProducts);
          setLoading(false);
          return;
        }
        const res = await fetch(sheetApiUrl);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else {
          setProducts(fallbackProducts);
        }
      } catch (error) {
        console.error("Error fetching sheet data, using fallback:", error);
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    try {
      const savedCart = JSON.parse(localStorage.getItem('sb_cart') || '[]');
      const savedWishlist = JSON.parse(localStorage.getItem('sb_wishlist') || '[]');
      const savedUser = JSON.parse(localStorage.getItem('sb_user') || 'null');
      setCart(Array.isArray(savedCart) ? savedCart : []);
      setWishlist(Array.isArray(savedWishlist) ? savedWishlist : []);
      setUser(savedUser);
    } catch (e) {
      console.error("LocalStorage parsing error:", e);
    }
  }, []);

  const scrollToSection = (refElement: any) => {
    setMobileMenuOpen(false);
    if (currentView !== 'catalog') {
      setCurrentView('catalog');
      setTimeout(() => {
        refElement.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      refElement.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePhoneChange = (e: any) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(val);
  };

  const handleSendOtp = (e: any) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phoneNumber)) {
      showToast('Phone number must be exactly 10 digits.');
      return;
    }
    showToast(`OTP sent to +91 ${phoneNumber}. (Use any 4 digits)`);
    setAuthStep('otp');
  };

  const handleOtpChange = (e: any) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setOtp(val);
  };

  const handleVerifyOtp = (e: any) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(otp)) {
      showToast('OTP must be exactly 4 digits.');
      return;
    }

    const cleanPhone = phoneNumber.trim();
    const isAdminNumber = cleanPhone === '7981658289';
    const loggedInUser = {
      name: isAdminNumber ? 'Sanjeev Dasari' : `Customer (${cleanPhone.slice(-4)})`,
      phone: cleanPhone,
      role: isAdminNumber ? 'admin' : 'customer'
    };

    setUser(loggedInUser);
    localStorage.setItem('sb_user', JSON.stringify(loggedInUser));
    setShowAuthModal(false);
    setAuthStep('phone');
    setPhoneNumber('');
    setOtp('');
    showToast(`Welcome back, ${loggedInUser.name}!`);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('sb_user');
    setMobileMenuOpen(false);
    showToast('Logged out successfully.');
  };

  const toggleWishlist = (product: any, e: any) => {
    if (e) e.stopPropagation();
    if (!product || typeof product !== 'object') return;
    
    const pId = product.id || product.Id;
    if (!pId) return;

    const exists = wishlist.some(item => String(item.id || item.Id) === String(pId));
    let updatedWishlist = exists 
      ? wishlist.filter(item => String(item.id || item.Id) !== String(pId))
      : [...wishlist, product];

    setWishlist(updatedWishlist);
    localStorage.setItem('sb_wishlist', JSON.stringify(updatedWishlist));
    showToast(exists ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleQuantityChange = (delta: number) => {
    const availableStock = Number(selectedProduct?.stock || selectedProduct?.Stock || 15);
    setProductQuantity(prev => {
      const nextVal = prev + delta;
      if (nextVal < 1) return 1;
      if (nextVal > availableStock) {
        showToast(`Cannot exceed available stock limit of ${availableStock}.`);
        return availableStock;
      }
      return nextVal;
    });
  };

  const handleCartItemQuantityChange = (cartId: any, delta: number) => {
    let updatedCart = cart.map(item => {
      if (item.cartId === cartId) {
        const newQty = (Number(item.quantity) || 1) + delta;
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0);

    setCart(updatedCart);
    localStorage.setItem('sb_cart', JSON.stringify(updatedCart));
  };

  const addToCartFromDetail = () => {
    if (!selectedProduct) {
      showToast('No product selected.');
      return;
    }

    const pId = selectedProduct.id || selectedProduct.Id;
    const pName = selectedProduct.name || selectedProduct.Name;
    const pPrice = Number(selectedProduct.price || selectedProduct.Price || 0);
    const pImage = selectedProduct.image1 || selectedProduct.Image || '';
    const availableStock = Number(selectedProduct.stock || selectedProduct.Stock || 15);
    const pCategory = String(selectedProduct.category || selectedProduct.Category || '');
    const isRing = pCategory.toLowerCase() === 'rings';
    const finalSize = isRing ? selectedSize : '';

    const qtyToAdd = Number(productQuantity);
    if (isNaN(qtyToAdd) || qtyToAdd < 1 || qtyToAdd > availableStock) {
      showToast(`Quantity must be between 1 and ${availableStock}.`);
      return;
    }

    const existingIndex = cart.findIndex(item => String(item.id) === String(pId) && item.selectedSize === finalSize);
    let updatedCart = [...cart];

    if (existingIndex > -1) {
      const currentQty = Number(updatedCart[existingIndex].quantity) || 1;
      const newTotalQty = currentQty + qtyToAdd;

      if (newTotalQty > availableStock) {
        showToast(`Stock Limit Reached: Max available quantity is ${availableStock}.`);
        return;
      }

      updatedCart[existingIndex] = {
        ...updatedCart[existingIndex],
        quantity: newTotalQty
      };
    } else {
      const newItem = { 
        cartId: Date.now() + Math.random(),
        id: pId, 
        name: pName, 
        price: pPrice, 
        image: pImage,
        quantity: qtyToAdd, 
        selectedSize: finalSize 
      };
      updatedCart.push(newItem);
    }

    setCart(updatedCart);
    localStorage.setItem('sb_cart', JSON.stringify(updatedCart));
    showToast('Product added to cart successfully!');
  };

  const quickAddToCart = (product: any, e: any) => {
    if (e) e.stopPropagation();
    if (!product) return;

    const pId = product.id || product.Id;
    const pName = product.name || product.Name;
    const pPrice = Number(product.price || product.Price || 0);
    const pImage = product.image1 || product.Image || '';
    const availableStock = Number(product.stock || product.Stock || 15);

    const existingIndex = cart.findIndex(item => String(item.id) === String(pId) && !item.selectedSize);
    let updatedCart = [...cart];

    if (existingIndex > -1) {
      const currentQty = Number(updatedCart[existingIndex].quantity) || 1;
      if (currentQty + 1 > availableStock) {
        showToast(`Stock Limit Reached: Max available quantity is ${availableStock}.`);
        return;
      }
      updatedCart[existingIndex] = {
        ...updatedCart[existingIndex],
        quantity: currentQty + 1
      };
    } else {
      const newItem = { 
        cartId: Date.now() + Math.random(),
        id: pId, 
        name: pName, 
        price: pPrice, 
        image: pImage,
        quantity: 1, 
        selectedSize: '' 
      };
      updatedCart.push(newItem);
    }

    setCart(updatedCart);
    localStorage.setItem('sb_cart', JSON.stringify(updatedCart));
    showToast('Product added to cart successfully!');
  };

  const calculateTotal = () => {
    return cart.reduce((total: number, item: any) => total + (Number(item.price) * (Number(item.quantity) || 1)), 0);
  };

  const categories = ['All', 'Necklace Sets', 'Mangalsutra', 'Bangles', 'Chains', 'Rings', 'Earrings'];
  
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const cat = String(p.category || p.Category || '');
      const pName = String(p.name || p.Name || '');
      
      const matchesCategory = selectedCategory === 'All' || cat.toLowerCase() === selectedCategory.toLowerCase();
      const cleanQuery = searchQuery.toLowerCase().trim();
      const matchesSearch = cleanQuery === '' || pName.toLowerCase().includes(cleanQuery);
      
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleWhatsAppShare = (product: any) => {
    if (!product) return;
    const domain = window.location.origin;
    const pId = product.id || product.Id || '';
    const pName = product.name || product.Name || 'Jewelry Piece';
    const pPrice = product.price || product.Price || '0';
    const pDesc = product.description || product.Description || 'Luxury gold-coated piece.';
    const pImage = product.image1 || product.Image || '';
    
    const productUrl = `${domain}?product=${pId}`;
    const shareText = 
      `${pImage}\n\n` +
      `SB Jewels Exclusive\n\n` +
      `Item: ${pName}\n` +
      `Price: Rs. ${pPrice}\n` +
      `Details: ${pDesc}\n\n` +
      `View & Buy Here:\n${productUrl}`;

    window.open(`https://wa.me/917981658289?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const openWhatsAppChat = () => {
    const message = `Hello SB Jewels, I would like to inquire about your luxury jewelry collections!`;
    window.open(`https://wa.me/917981658289?text=${encodeURIComponent(message)}`, '_blank');
  };

  const isAdminUser = user && (user.role === 'admin' || user.phone === '7981658289');

  const isCurrentProductRing = selectedProduct && String(selectedProduct.category || selectedProduct.Category || '').toLowerCase() === 'rings';

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-gray-800 relative pt-[68px]" ref={topRef} suppressHydrationWarning>
      
      {/* CENTERED TOAST NOTIFICATION BANNER */}
      {toastMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
          <div className="bg-[#4A1525] text-amber-100 px-6 py-3.5 rounded-2xl shadow-2xl border border-amber-300/30 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
            <Check className="w-5 h-5 text-amber-300 flex-shrink-0" />
            <span className="text-xs md:text-sm font-bold">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* FIXED TOP STICKY HEADER WITH TICKER INSIDE */}
      <header className="bg-white text-gray-900 shadow-sm z-50 flex-shrink-0 border-b border-amber-100 fixed top-0 inset-x-0">
        <div className="py-3.5 px-4 md:px-12 max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="text-amber-950 p-1 focus:outline-none cursor-pointer"
              title="Open Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="cursor-pointer text-center md:text-left" onClick={() => { setCurrentView('catalog'); setSelectedCategory('All'); topRef.current?.scrollIntoView({ behavior: 'smooth' }); }}>
              <h1 className="text-lg md:text-xl font-extrabold tracking-wider text-amber-900">SB JEWELS</h1>
              <p className="text-[8px] md:text-[9px] text-amber-700 tracking-widest uppercase font-semibold hidden sm:block">Luxury Gold Jewelry</p>
            </div>
          </div>

          <div className="hidden md:block w-96 relative">
            <input 
              type="text"
              maxLength={50}
              value={searchQuery}
              onChange={(e) => {
                const sanitized = e.target.value.replace(/[<>]/g, '');
                setSearchQuery(sanitized);
                if (currentView !== 'catalog') setCurrentView('catalog');
              }}
              placeholder="Search for necklace sets, bangles, mangalsutra..."
              className="w-full bg-amber-50/50 border border-amber-200 rounded-full py-2 pl-4 pr-10 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-600 transition"
            />
            <Search className="w-4 h-4 text-amber-700 absolute right-3.5 top-2.5 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {isAdminUser && (
              <Link 
                href="/admin" 
                className="hidden sm:flex items-center gap-1.5 bg-amber-800 hover:bg-amber-900 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Panel</span>
              </Link>
            )}

            <button 
              onClick={() => setCurrentView('wishlist')}
              className="relative bg-amber-50 hover:bg-amber-100 text-amber-900 w-9 h-9 md:w-10 md:h-10 rounded-full border border-amber-200 transition flex items-center justify-center cursor-pointer shadow-sm"
              title="View Wishlist"
            >
              <Heart className={`w-4 h-4 ${wishlist.length > 0 ? 'fill-amber-900 text-amber-900' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button 
              onClick={() => router.push('/cart')}
              className="relative bg-amber-50 hover:bg-amber-100 text-amber-900 w-9 h-9 md:w-10 md:h-10 rounded-full border border-amber-200 transition flex items-center justify-center cursor-pointer shadow-sm"
              title="View Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cart.reduce((acc: number, item: any) => acc + (Number(item.quantity) || 1), 0)}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* SCROLLING ANNOUNCEMENT TICKER FLUSH INSIDE HEADER */}
        <div className="bg-[#4A1525] text-amber-100 py-1.5 overflow-hidden whitespace-nowrap border-t border-[#320D18]">
          <div className="flex w-max animate-marquee">
            <div className="flex items-center text-[11px] font-medium tracking-wider flex-shrink-0">
              <span>SB Jewels: Handcrafted Luxury Jewelry</span>
              <span className="mx-32">•</span>
              <span>Elegant Traditional Designs & Daily Wear Collections</span>
            </div>
            <div className="flex items-center text-[11px] font-medium tracking-wider flex-shrink-0 ml-32" aria-hidden="true">
              <span>SB Jewels: Handcrafted Luxury Jewelry</span>
              <span className="mx-32">•</span>
              <span>Elegant Traditional Designs & Daily Wear Collections</span>
            </div>
          </div>
          <style jsx>{`
            @keyframes marquee {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              display: flex;
              width: max-content;
              animation: marquee 35s linear infinite;
            }
          `}</style>
        </div>
      </header>

      {/* HAMBURGER MENU WITH DISTINCT CATEGORIES LIST STYLING */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[68px] z-45 bg-white flex flex-col justify-between p-6 animate-in slide-in-from-left duration-300 overflow-y-auto" suppressHydrationWarning>
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-amber-100">
              <h3 className="text-base font-extrabold text-amber-950">SB Jewels Menu</h3>
              <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500 hover:text-gray-900 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-bold text-gray-800">
              <button onClick={() => scrollToSection(topRef)} className="w-full flex justify-between items-center py-2.5 border-b border-gray-100 text-left cursor-pointer">
                <span>HOME</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button onClick={() => scrollToSection(featuredRef)} className="w-full flex justify-between items-center py-2.5 border-b border-gray-100 text-left cursor-pointer">
                <span>FEATURED MASTERPIECES</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button 
                onClick={() => { 
                  setCurrentView('orders'); 
                  setMobileMenuOpen(false); 
                  topRef.current?.scrollIntoView({ behavior: 'smooth' }); 
                }} 
                className="w-full flex justify-between items-center py-2.5 border-b border-gray-100 text-left cursor-pointer"
              >
                <span>MY ORDERS</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              {/* DISTINCT CATEGORIES LIST IN HAMBURGER MENU */}
              <div className="pt-2">
                <p className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider mb-2">Categories</p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setMobileMenuOpen(false);
                        if (currentView !== 'catalog') {
                          setCurrentView('catalog');
                        }
                        setTimeout(() => {
                          scrollToSection(allProductsRef);
                        }, 100);
                      }}
                      className="text-left bg-amber-50/80 hover:bg-amber-100 p-2.5 rounded-xl text-xs font-bold text-amber-950 border border-amber-300 shadow-sm transition cursor-pointer"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 pb-16 mt-6">
            {user ? (
              <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                <LogOut className="w-4 h-4" /><span>Logout ({user.name})</span>
              </button>
            ) : (
              <button onClick={() => { setShowAuthModal(true); setMobileMenuOpen(false); }} className="w-full bg-[#4A1525] text-white font-bold py-3.5 rounded-xl text-xs shadow cursor-pointer">
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 px-4 md:px-6 py-4 pb-24">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {currentView === 'wishlist' ? (
            <div className="bg-white rounded-3xl shadow-sm border border-amber-100 p-6 md:p-8">
              <h3 className="text-xl font-extrabold text-amber-950 mb-4 pb-2 border-b border-amber-100 flex justify-between items-center">
                <span>My Saved Wishlist</span>
                <span className="text-xs bg-amber-100 text-amber-900 px-3 py-1 rounded-full font-semibold">{wishlist.length} items</span>
              </h3>
              
              {wishlist.length === 0 ? (
                <div className="text-center py-16 bg-amber-50/30 rounded-2xl border border-amber-100">
                  <Heart className="w-10 h-10 text-amber-800 mx-auto mb-3 opacity-60" />
                  <p className="text-sm font-bold text-gray-900 mb-1">Your wishlist is empty</p>
                  <button onClick={() => setCurrentView('catalog')} className="mt-3 bg-amber-900 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow">
                    Explore Collections
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {wishlist.map((item, index) => (
                    <div 
                      key={item.id || index} 
                      onClick={() => { setSelectedProduct(item); setProductQuantity(1); setCurrentView('detail'); topRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                      className="bg-white rounded-2xl shadow-sm border border-amber-100 p-3 cursor-pointer relative group"
                    >
                      <button onClick={(e) => toggleWishlist(item, e)} className="absolute top-2 right-2 z-10 bg-white/90 text-red-600 p-1.5 rounded-full shadow">
                        <Heart className="w-3.5 h-3.5 fill-red-600" />
                      </button>
                      <div className="h-40 rounded-xl overflow-hidden bg-amber-50/50 mb-2">
                        <img src={item.image1 || item.Image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <h4 className="font-bold text-xs truncate">{item.name}</h4>
                      <p className="font-extrabold text-amber-950 text-xs mt-1">₹{Number(item.price).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : currentView === 'orders' ? (
            <div className="max-w-xl mx-auto w-full px-4">
              <div className="bg-white rounded-3xl shadow-sm border border-amber-100 p-6 md:p-8 space-y-6">
                <h3 className="text-xl font-extrabold text-amber-950 pb-2 border-b border-amber-100">Track Your Order</h3>
                <p className="text-xs text-gray-600">Enter your Order ID (e.g., SBJ-XXXXXX) below to check your live dispatch and confirmation status from our records.</p>
                
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Enter Order ID (e.g. SBJ-123456)"
                    value={lookupOrderId}
                    onChange={(e) => { setLookupOrderId(e.target.value.toUpperCase()); setLookupError(''); }}
                    className="flex-1 text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-amber-900 font-bold uppercase tracking-wider"
                  />
                  <button 
                    onClick={async () => {
                      if (!lookupOrderId.trim()) {
                        setLookupError('Please enter a valid Order ID.');
                        return;
                      }
                      setIsSearching(true);
                      setLookupError('');
                      setSearchedOrder(null);
                      try {
                        const sheetUrl = process.env.NEXT_PUBLIC_ORDERS_SHEET_URL || 'https://script.google.com/macros/s/AKfycby69Zp3gn5KTLHDhfnEdl9ae5YLVKuU7MeD-UKo_H5qpl1mAq6fg6AEfxj3HpJbtAGVrw/exec';
                        const res = await fetch(`${sheetUrl}?orderId=${lookupOrderId.trim()}`);
                        const data = await res.json();
                        if (data && data.OrderId) {
                          setSearchedOrder(data);
                        } else {
                          setLookupError('Order not found. Please check your Order ID.');
                        }
                      } catch (err) {
                        setLookupError('Error fetching order. Please try again.');
                      } finally {
                        setIsSearching(false);
                      }
                    }}
                    className="bg-amber-900 hover:bg-amber-950 text-white font-bold px-6 py-3 rounded-xl text-xs transition cursor-pointer shadow"
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </button>
                </div>

                {lookupError && <p className="text-xs text-red-600 font-semibold">{lookupError}</p>}

                {searchedOrder && (
                  <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-200 space-y-3 text-xs animate-in fade-in duration-200">
                    <div className="flex justify-between items-center pb-2 border-b border-amber-200">
                      <span className="font-extrabold text-amber-950 text-sm">{searchedOrder.OrderId}</span>
                      <span className="bg-emerald-100 text-emerald-800 px-3 py-0.5 rounded-full font-bold text-[10px]">{searchedOrder.Status || 'Confirmed'}</span>
                    </div>
                    <div className="space-y-1.5 text-gray-700">
                      <p><strong>Customer:</strong> {searchedOrder.CustomerName} ({searchedOrder.Phone})</p>
                      <p><strong>Date:</strong> {searchedOrder.Date}</p>
                      <p><strong>Items:</strong> {searchedOrder.Items}</p>
                      <p><strong>Delivery Address:</strong> {searchedOrder.HouseNo}, {searchedOrder.Street}, {searchedOrder.City}, {searchedOrder.State} - {searchedOrder.Pincode}</p>
                      <p className="text-sm font-extrabold text-amber-950 pt-2 border-t border-amber-200">Total Paid: ₹{Number(searchedOrder.TotalAmount).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : currentView === 'detail' && selectedProduct ? (
            <div className="space-y-6 pb-24" suppressHydrationWarning>
              
              <button 
                onClick={() => setCurrentView('catalog')} 
                className="inline-flex items-center gap-2 text-xs font-bold text-amber-900 bg-white px-4 py-2 rounded-xl shadow-sm border border-amber-200 hover:bg-amber-50 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Category</span>
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* SINGLE IMAGE PREVIEW */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-amber-100 p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="relative rounded-2xl overflow-hidden bg-amber-50/50 border border-amber-200 flex items-center justify-center h-[320px]">
                      <img 
                        src={
                          selectedProduct.image1 || 
                          selectedProduct.Image || 
                          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop'
                        } 
                        alt={selectedProduct.name || selectedProduct.Name} 
                        className="w-full h-full object-cover" 
                      />
                      <button onClick={(e) => toggleWishlist(selectedProduct, e)} className="absolute top-4 right-4 bg-white/90 text-red-600 p-2.5 rounded-full shadow cursor-pointer">
                        <Heart className={`w-4 h-4 ${wishlist.some(i => String(i.id || i.Id) === String(selectedProduct.id || selectedProduct.Id)) ? 'fill-red-600 text-red-600' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <div>
                      <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-2">{selectedProduct.name || selectedProduct.Name}</h2>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-xl md:text-2xl font-extrabold text-amber-950">₹{Number(selectedProduct.price || selectedProduct.Price).toLocaleString()}</span>
                        <span className="text-xs text-gray-400 line-through">₹{Math.round(Number(selectedProduct.price || selectedProduct.Price) * 1.1).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-600 text-xs leading-relaxed mb-4">{selectedProduct.description || selectedProduct.Description}</p>

                      {/* SIZE SELECTOR (ONLY SHOWN FOR RINGS) */}
                      {isCurrentProductRing && (
                        <div className="mb-4">
                          <label className="block text-xs font-bold text-gray-700 mb-1.5">Select Ring Size:</label>
                          <div className="flex flex-wrap gap-2">
                            {['US 6', 'US 7', 'US 8', 'US 9', 'US 10'].map((size) => (
                              <button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${selectedSize === size ? 'bg-amber-900 text-white border-amber-900' : 'bg-white text-gray-700 border-gray-200 cursor-pointer'}`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Quantity:</label>
                        <div className="inline-flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm">
                          <button onClick={() => handleQuantityChange(-1)} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 font-bold text-xs cursor-pointer">-</button>
                          <span className="px-4 py-1.5 text-xs font-bold text-gray-900">{productQuantity}</span>
                          <button onClick={() => handleQuantityChange(1)} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 font-bold text-xs cursor-pointer">+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-amber-100 p-6 flex flex-col justify-between h-fit">
                  <div>
                    <h3 className="text-base font-bold text-amber-950 mb-4 pb-2 border-b border-gray-100">Order Summary</h3>
                    
                    {cart.length === 0 ? (
                      <p className="text-xs text-gray-400 py-6 text-center">Your order summary is empty.</p>
                    ) : (
                      <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                        {cart.map((item: any) => (
                          <div key={item.cartId} className="flex justify-between items-center text-xs p-2.5 bg-amber-50/40 rounded-xl gap-2 border border-amber-100/60">
                            <div className="truncate flex-1">
                              <span className="font-bold block truncate">{item.name}</span>
                              <span className="text-[10px] text-gray-500">
                                {item.selectedSize ? `${item.selectedSize} • ` : ''}₹{Number(item.price)} each
                              </span>
                            </div>

                            {/* IN-SUMMARY QUANTITY CONTROLS */}
                            <div className="flex items-center gap-1.5 bg-white border border-amber-200 rounded-lg px-1.5 py-0.5 flex-shrink-0">
                              <button 
                                onClick={() => handleCartItemQuantityChange(item.cartId, -1)} 
                                className="text-gray-500 hover:text-red-600 font-extrabold px-1 text-xs cursor-pointer"
                              >
                                -
                              </button>
                              <span className="font-extrabold text-amber-950 text-xs px-1">{item.quantity}</span>
                              <button 
                                onClick={() => handleCartItemQuantityChange(item.cartId, 1)} 
                                className="text-gray-500 hover:text-amber-900 font-extrabold px-1 text-xs cursor-pointer"
                              >
                                +
                              </button>
                            </div>

                            <span className="font-extrabold text-amber-950 flex-shrink-0 w-12 text-right">
                              ₹{Number(item.price) * (Number(item.quantity) || 1)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-3 border-t border-gray-100 flex justify-between items-center mb-6">
                      <span className="text-sm font-bold">Total:</span>
                      <span className="text-lg font-extrabold text-amber-950">₹{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                  <button onClick={() => router.push('/cart')} className="w-full bg-amber-900 text-white font-bold py-3 rounded-xl text-xs shadow flex items-center justify-center gap-2 cursor-pointer">
                    <span>Proceed to Checkout</span><ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl z-50 flex items-center gap-3">
                <button onClick={addToCartFromDetail} className="flex-1 bg-[#8B2500] hover:bg-[#6b1c00] text-white font-extrabold py-3.5 rounded-xl text-xs transition shadow flex items-center justify-center gap-2 cursor-pointer">
                  <ShoppingBag className="w-4 h-4" /><span>Add To Cart</span>
                </button>
                <button onClick={() => handleWhatsAppShare(selectedProduct)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer">
                  <Share2 className="w-4 h-4" /><span>Share on WhatsApp</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="space-y-8">
              
              {/* RECTANGULAR EDGE-TO-EDGE HERO BANNER */}
              <section className="bg-gradient-to-r from-[#4A1525] via-[#5c1c2f] to-[#360f1b] text-white py-6 px-6 md:px-12 md:rounded-2xl shadow-xl border-y md:border border-amber-900/50 relative overflow-hidden -mx-4 md:mx-0">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                  <div className="space-y-2">
                    <h2 className="text-2xl md:text-3xl font-serif tracking-wider font-extrabold text-amber-100 leading-tight">
                      {banners[currentBannerIndex].titleLine1} <span className="text-amber-300">{banners[currentBannerIndex].titleLine2}</span>
                    </h2>
                    <p className="text-amber-200/80 text-[11px] md:text-xs tracking-widest uppercase font-medium">
                      {banners[currentBannerIndex].subtitle}
                    </p>
                  </div>

                  <div>
                    <button 
                      onClick={() => scrollToSection(allProductsRef)}
                      className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-extrabold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider shadow-md transition transform hover:scale-105 inline-flex items-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Shop Now</span>
                    </button>
                  </div>
                </div>

                <div className="absolute bottom-1.5 left-0 right-0 flex justify-center gap-1.5">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentBannerIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        currentBannerIndex === idx ? 'w-5 bg-amber-300' : 'w-1.5 bg-amber-700/60'
                      }`}
                    />
                  ))}
                </div>
              </section>

              {/* HORIZONTAL SWIPEABLE CATEGORIES */}
              <div ref={categoriesRef} className="pt-2">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-amber-200">
                  <h3 className="text-lg md:text-xl font-extrabold text-amber-950 tracking-wide">Categories</h3>
                </div>
                <div className="flex overflow-x-auto scrollbar-none gap-3 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); scrollToSection(allProductsRef); }}
                      className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold border transition cursor-pointer shadow-sm whitespace-nowrap ${
                        selectedCategory === cat 
                          ? 'bg-amber-900 text-white border-amber-900' 
                          : 'bg-white text-amber-950 border-amber-200 hover:bg-amber-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* FEATURED PRODUCTS (HORIZONTAL SWIPEABLE CAROUSEL) */}
              <div ref={featuredRef} className="pt-2 scroll-mt-[130px]">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-amber-200">
                  <h3 className="text-lg md:text-xl font-extrabold text-amber-950 tracking-wide flex items-center gap-2">
                    <span>Featured Masterpieces</span>
                  </h3>
                </div>

                {loading ? (
                  <div className="text-center py-8 text-amber-900 text-xs">Loading featured...</div>
                ) : (
                  <div className="flex overflow-x-auto scrollbar-none gap-4 pb-3 -mx-4 px-4 md:mx-0 md:px-0">
                    {products.slice(0, 6).map((product: any, index: number) => {
                      const pId = product.id || product.Id || index;
                      const pName = product.name || product.Name || 'Jewelry Piece';
                      const pPrice = product.price || product.Price || 0;
                      const pCategory = product.category || product.Category || 'General';
                      const pImage = product.image1 || product.Image || '';
                      const isWishlisted = wishlist.some(i => String(i.id || i.Id) === String(pId));

                      return (
                        <div 
                          key={`feat-${pId}`} 
                          onClick={() => { setSelectedProduct(product); setProductQuantity(1); setCurrentView('detail'); topRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                          className="w-48 md:w-56 flex-shrink-0 bg-white rounded-2xl shadow-sm hover:shadow-xl transition overflow-hidden border border-amber-100 flex flex-col justify-between cursor-pointer relative group"
                        >
                          <button onClick={(e) => toggleWishlist(product, e)} className="absolute top-2 right-2 z-10 bg-white/90 text-red-600 p-1.5 rounded-full shadow">
                            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-red-600 text-red-600' : ''}`} />
                          </button>

                          <div>
                            <div className="relative overflow-hidden flex items-center justify-center bg-amber-50/50 h-40 md:h-48">
                              {pImage ? (
                                <img src={pImage} alt={pName} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                              ) : (
                                <span className="text-xs text-amber-900">No Image</span>
                              )}
                              <span className="absolute top-2 left-2 bg-white/90 text-amber-900 text-[9px] px-2 py-0.5 rounded font-bold shadow-sm">
                                Featured
                              </span>
                            </div>
                            <div className="p-3">
                              <h4 className="font-bold text-gray-900 text-xs mb-1 truncate">{pName}</h4>
                              <p className="text-amber-950 font-extrabold text-sm">₹{Number(pPrice).toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="p-3 pt-0 flex gap-1.5">
                            <button onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setProductQuantity(1); setCurrentView('detail'); topRef.current?.scrollIntoView({ behavior: 'smooth' }); }} className="flex-1 bg-[#8B2500] hover:bg-[#6b1c00] text-white font-bold py-1.5 rounded-xl text-[10px] transition">
                              View
                            </button>
                            <button onClick={(e) => quickAddToCart(product, e)} className="flex-1 bg-amber-900 hover:bg-amber-950 text-white font-bold py-1.5 rounded-xl text-[10px] transition">
                              Add
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ALL PRODUCTS CATALOG GRID */}
              <div ref={allProductsRef} className="pt-2 scroll-mt-[130px]">
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-amber-200">
                  <h3 className="text-lg md:text-xl font-extrabold text-amber-950 tracking-wide flex items-center gap-2">
                    <span>{selectedCategory === 'All' ? 'All Products' : `${selectedCategory} Collection`}</span>
                    <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-semibold">{filteredProducts.length}</span>
                  </h3>
                </div>

                {loading ? (
                  <div className="text-center py-16 text-amber-900 font-medium">Loading collection...</div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-16 text-gray-500 bg-white rounded-2xl border border-amber-100">No products found.</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {filteredProducts.map((product: any, index: number) => {
                      const pId = product.id || product.Id || index;
                      const pName = product.name || product.Name || 'Jewelry Piece';
                      const pPrice = product.price || product.Price || 0;
                      const pCategory = product.category || product.Category || 'General';
                      const pImage = product.image1 || product.Image || '';
                      const isWishlisted = wishlist.some(i => String(i.id || i.Id) === String(pId));

                      return (
                        <div 
                          key={pId} 
                          onClick={() => { setSelectedProduct(product); setProductQuantity(1); setCurrentView('detail'); topRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                          className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition overflow-hidden border border-amber-100 flex flex-col justify-between cursor-pointer relative group"
                        >
                          <button onClick={(e) => toggleWishlist(product, e)} className="absolute top-2 right-2 z-10 bg-white/90 text-red-600 p-1.5 rounded-full shadow">
                            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-red-600 text-red-600' : ''}`} />
                          </button>

                          <div>
                            <div className="relative overflow-hidden flex items-center justify-center bg-amber-50/50 h-44 md:h-56">
                              {pImage ? (
                                <img src={pImage} alt={pName} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                              ) : (
                                <span className="text-xs text-amber-900">No Image</span>
                              )}
                              <span className="absolute top-2 left-2 bg-white/90 text-amber-900 text-[9px] px-2 py-0.5 rounded font-bold shadow-sm">
                                {pCategory}
                              </span>
                            </div>
                            
                            <div className="p-3">
                              <h4 className="font-bold text-gray-900 text-xs mb-1 truncate">{pName}</h4>
                              <p className="text-amber-950 font-extrabold text-sm">₹{Number(pPrice).toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="p-3 pt-0 flex gap-2">
                            <button onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setProductQuantity(1); setCurrentView('detail'); topRef.current?.scrollIntoView({ behavior: 'smooth' }); }} className="flex-1 bg-[#8B2500] hover:bg-[#6b1c00] text-white font-bold py-2 rounded-xl text-[11px] transition shadow-sm">
                              View
                            </button>
                            <button onClick={(e) => quickAddToCart(product, e)} className="flex-1 bg-amber-900 hover:bg-amber-950 text-white font-bold py-2 rounded-xl text-[11px] transition shadow-sm">
                              Add Cart
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>

      {/* FLUSH BOTTOM FOOTER */}
      <footer className="bg-[#2B0C15] text-amber-100 py-8 px-6 md:px-12 mt-auto border-t border-amber-950 w-full">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-xs items-center">
          
          <div className="space-y-1.5">
            <h4 className="font-bold text-amber-300 uppercase tracking-wider text-xs">About Us</h4>
            <p className="text-amber-100/80 leading-relaxed font-light text-[11px]">
              Exquisite 1g gold-plated luxury jewelry blending traditional craftsmanship with timeless elegance.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-amber-300 uppercase tracking-wider text-xs">Enquiry & Support</h4>
            <p className="text-amber-200/80 text-[11px]">Road No 10, Banjara Hills, Hyderabad</p>
            <div className="flex items-center gap-4 pt-1">
              <span className="flex items-center gap-1 cursor-pointer hover:text-white transition font-bold text-emerald-400 text-[11px]" onClick={openWhatsAppChat}>
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </span>
              <span className="flex items-center gap-1 cursor-pointer hover:text-white transition font-bold text-pink-400 text-[11px]" onClick={() => window.open('https://instagram.com', '_blank')}>
                <Instagram className="w-3.5 h-3.5" /> Instagram
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-amber-300 uppercase tracking-wider text-xs">Accepted Payments</h4>
            <div className="flex flex-wrap items-center gap-1.5 pt-1 font-bold text-[10px] tracking-wider text-amber-100">
              <span className="bg-amber-950/80 px-2.5 py-1 rounded border border-amber-900">UPI</span>
              <span className="bg-amber-950/80 px-2.5 py-1 rounded border border-amber-900">PHONEPE</span>
              <span className="bg-amber-950/80 px-2.5 py-1 rounded border border-amber-900">GPAY</span>
              <span className="bg-amber-950/80 px-2.5 py-1 rounded border border-amber-900">PAYTM</span>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 mt-6 border-t border-amber-950/80 text-center text-[10px] text-amber-400/60">
          © 2026 SB Jewels. All Rights Reserved.
        </div>
      </footer>

      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4 border border-amber-100">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-amber-950">Login with Mobile</h3>
              <button onClick={() => { setShowAuthModal(false); setAuthStep('phone'); }} className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {authStep === 'phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-4 pt-2">
                <p className="text-xs text-gray-500">Enter your 10-digit mobile number.</p>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Number</label>
                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:border-amber-900">
                    <span className="bg-gray-50 px-3 py-3 text-xs font-bold text-gray-600 border-r border-gray-300">+91</span>
                    <input 
                      type="tel" 
                      maxLength={10} 
                      required 
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="9876543210" 
                      className="w-full text-xs p-3 focus:outline-none bg-transparent"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-amber-900 hover:bg-amber-950 text-white font-bold py-3 rounded-xl text-xs transition shadow cursor-pointer"
                >
                  Send OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
                <p className="text-xs text-gray-500">Enter the 4-digit verification code sent to <strong className="text-gray-800">+91 {phoneNumber}</strong>.</p>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Verification OTP</label>
                  <input 
                    type="text" 
                    maxLength={4} 
                    required 
                    value={otp}
                    onChange={handleOtpChange}
                    placeholder="1234" 
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:border-amber-900 focus:outline-none tracking-widest text-center font-bold text-base"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition shadow cursor-pointer"
                >
                  Verify & Login
                </button>
                <button
                  type="button"
                  onClick={() => setAuthStep('phone')}
                  className="w-full text-center text-[11px] text-amber-900 hover:underline pt-1 cursor-pointer"
                >
                  Change Mobile Number
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <button 
        onClick={openWhatsAppChat}
        className="fixed bottom-6 right-6 z-50 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer"
        title="Chat on WhatsApp"
      >
        <MessageCircle className="w-7 h-7 fill-white text-emerald-500" />
      </button>

    </div>
  );
}

function Instagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}