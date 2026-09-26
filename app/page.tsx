'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Share2, ShieldCheck, Sparkles, X, Trash2, ArrowRight, ArrowLeft, User, Shield, LogOut, Search, MapPin, Heart, Package, Gem, Crown, Feather, CheckCircle2, MessageCircle } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [pincode, setPincode] = useState('');
  const [pincodeChecked, setPincodeChecked] = useState(false);
  
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  // Single-Page View States ('catalog' | 'detail' | 'orders' | 'wishlist')
  const [currentView, setCurrentView] = useState('catalog'); 
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('18 inches');
  const [productQuantity, setProductQuantity] = useState(1);

  // Phone + OTP Login States with Strict Validation
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState('phone'); // 'phone' or 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');

  // Banner Carousel State
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

  const topRef = useRef(null);
  const featuredRef = useRef(null);
  const categoriesRef = useRef(null);
  const collectionsRef = useRef(null);
  const allProductsRef = useRef(null);

  const [user, setUser] = useState(null); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fallbackProducts = [
    { id: '1', name: 'Royal Gold Haram Set', price: 1499, category: 'Haram', image1: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop', description: 'Exquisite 1g gold-coated traditional haram set with matching earrings.' },
    { id: '2', name: 'Bridal Kundan Choker', price: 999, category: 'Chokers', image1: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=600&auto=format&fit=crop', description: 'Stunning stone-studded close-fitting bridal choker necklace.' },
    { id: '3', name: 'Designer Gold Bangles (Set)', price: 799, category: 'Bangles', image1: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop', description: 'Sparkling 1g gold bangles crafted for special celebrations.' },
    { id: '4', name: 'Antique Lakshmi Vaddanam', price: 1299, category: 'Vaddanam', image1: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop', description: 'Traditional Goddess Lakshmi waist belt with intricate craftsmanship.' }
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

    const savedCart = JSON.parse(localStorage.getItem('sb_cart')) || [];
    setCart(savedCart);

    const savedWishlist = JSON.parse(localStorage.getItem('sb_wishlist')) || [];
    setWishlist(savedWishlist);

    const savedUser = JSON.parse(localStorage.getItem('sb_user')) || null;
    setUser(savedUser);
  }, []);

  const scrollToSection = (refElement) => {
    if (currentView !== 'catalog') {
      setCurrentView('catalog');
      setTimeout(() => {
        refElement.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      refElement.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Positive/Negative validation case for Phone Input
  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10); // Negative case: block non-digits and length > 10
    setPhoneNumber(val);
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (phoneNumber.length !== 10) {
      alert('Negative Case: Please enter a valid 10-digit mobile number.');
      return;
    }
    alert(`Positive Case: OTP sent successfully to +91 ${phoneNumber}. (Enter any 4 digits to verify)`);
    setAuthStep('otp');
  };

  // Positive/Negative validation case for OTP Input
  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4); // Negative case: block non-digits and length > 4
    setOtp(val);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length !== 4) {
      alert('Negative Case: Please enter a valid 4-digit OTP.');
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
    alert(`Positive Case: Welcome back, ${loggedInUser.name}!`);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('sb_user');
    setIsDropdownOpen(false);
    alert('Logged out successfully.');
  };

  // Positive/Negative validation case for Pincode
  const handlePincodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6); // Negative case: strictly numbers, max 6 digits
    setPincode(val);
    setPincodeChecked(val.length === 6);
  };

  const toggleWishlist = (product, e) => {
    if (e) e.stopPropagation();
    const pId = product.id || product.Id;
    const exists = wishlist.some(item => String(item.id || item.Id) === String(pId));

    let updatedWishlist;
    if (exists) {
      updatedWishlist = wishlist.filter(item => String(item.id || item.Id) !== String(pId));
    } else {
      updatedWishlist = [...wishlist, product];
    }

    setWishlist(updatedWishlist);
    localStorage.setItem('sb_wishlist', JSON.stringify(updatedWishlist));
  };

  const addToCartFromDetail = () => {
    if (!selectedProduct) return;
    const pId = selectedProduct.id || selectedProduct.Id;
    const pName = selectedProduct.name || selectedProduct.Name;
    const pPrice = selectedProduct.price || selectedProduct.Price;
    const pImage = selectedProduct.image1 || selectedProduct.image || selectedProduct.Image || '';
    const availableStock = Number(selectedProduct.stock || selectedProduct.Stock || 10);

    // Negative case check: Quantity bounds validation
    const qtyToAdd = Number(productQuantity);
    if (isNaN(qtyToAdd) || qtyToAdd < 1) {
      alert('Negative Case: Quantity must be at least 1.');
      return;
    }

    const existingIndex = cart.findIndex(item => String(item.id) === String(pId) && item.selectedSize === selectedSize);
    let updatedCart = [...cart];

    if (existingIndex > -1) {
      const currentQty = Number(updatedCart[existingIndex].quantity) || 1;
      const newTotalQty = currentQty + qtyToAdd;

      if (newTotalQty > availableStock) {
        alert(`Negative Case: Cannot add more. Maximum available stock is ${availableStock}.`);
        return;
      }

      updatedCart[existingIndex] = {
        ...updatedCart[existingIndex],
        quantity: newTotalQty
      };
    } else {
      if (qtyToAdd > availableStock) {
        alert(`Negative Case: Cannot add more. Maximum available stock is ${availableStock}.`);
        return;
      }

      const newItem = { 
        cartId: Date.now() + Math.random(),
        id: pId, 
        name: pName, 
        price: Number(pPrice), 
        image: pImage,
        quantity: qtyToAdd, 
        selectedSize: selectedSize 
      };
      updatedCart.push(newItem);
    }

    setCart(updatedCart);
    localStorage.setItem('sb_cart', JSON.stringify(updatedCart));
    alert('Positive Case: Product added to cart successfully!');
  };

  const removeFromCart = (cartId) => {
    const updatedCart = cart.filter(item => item.cartId !== cartId);
    setCart(updatedCart);
    localStorage.setItem('sb_cart', JSON.stringify(updatedCart));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (Number(item.price) * (Number(item.quantity) || 1)), 0);
  };

  const categories = ['All', 'Haram', 'Chokers', 'Bangles', 'Vaddanam', 'Rings', 'Earrings'];
  
  // Positive/Negative search filter case (sanitizing text inputs against injection/overflow)
  const filteredProducts = products.filter(p => {
    const cat = p.category || p.Category || '';
    const pName = p.name || p.Name || '';
    
    const matchesCategory = selectedCategory === 'All' || cat.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = pName.toLowerCase().includes(searchQuery.toLowerCase().trim());
    
    return matchesCategory && matchesSearch;
  });

  const featuredProducts = products.slice(0, 4);

  const relatedProducts = products.filter(p => {
    if (!selectedProduct) return false;
    const pCat = p.category || p.Category || '';
    const selCat = selectedProduct.category || selectedProduct.Category || '';
    const pId = p.id || p.Id;
    const selId = selectedProduct.id || selectedProduct.Id;
    return pCat.toLowerCase() === selCat.toLowerCase() && String(pId) !== String(selId);
  }).slice(0, 4);

  const handleWhatsAppShare = (product) => {
    const domain = window.location.origin;
    const pId = product.id || product.Id || '';
    const pName = product.name || product.Name || 'Jewelry Piece';
    const pPrice = product.price || product.Price || '0';
    const pDesc = product.description || product.Description || 'Luxury gold-coated piece.';
    const pImage = product.image1 || product.image || product.Image || '';
    
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

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-gray-800 relative" ref={topRef}>
      
      {/* 1. TOPMOST HORIZONTAL SCROLLING ANNOUNCEMENT TICKER */}
      <div className="bg-[#4A1525] text-amber-100 py-1.5 overflow-hidden whitespace-nowrap shadow-sm flex-shrink-0 z-50 border-b border-[#320D18] relative">
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

      {/* 2. PERSISTENT TOP NAVBAR */}
      <header className="bg-white text-gray-900 py-3.5 px-6 md:px-12 shadow-sm z-50 flex-shrink-0 border-b border-amber-100 sticky top-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="cursor-pointer" onClick={() => { setCurrentView('catalog'); setSelectedCategory('All'); topRef.current?.scrollIntoView({ behavior: 'smooth' }); }}>
              <h1 className="text-xl font-extrabold tracking-wider text-amber-900">SB JEWELS</h1>
              <p className="text-[9px] text-amber-700 tracking-widest uppercase font-semibold">Luxury Gold Jewelry</p>
            </div>
          </div>

          <div className="w-full md:w-96 relative">
            <input 
              type="text"
              maxLength={50} // Negative case: Prevent query string buffer overflow attacks
              value={searchQuery}
              onChange={(e) => {
                const sanitized = e.target.value.replace(/[<>]/g, ''); // Negative case: Strip dangerous HTML/script characters
                setSearchQuery(sanitized);
                if (currentView !== 'catalog') setCurrentView('catalog');
              }}
              placeholder="Search for haram, chokers, bangles..."
              className="w-full bg-amber-50/50 border border-amber-200 rounded-full py-2 pl-4 pr-10 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-600 transition"
            />
            <Search className="w-4 h-4 text-amber-700 absolute right-3.5 top-2.5 pointer-events-none" />
          </div>

          <div className="flex items-center gap-3">
            {isAdminUser && (
              <Link 
                href="/admin" 
                className="hidden sm:flex items-center gap-1.5 bg-amber-800 hover:bg-amber-900 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Panel</span>
              </Link>
            )}

            <div className="hidden lg:flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
              <MapPin className="w-3.5 h-3.5 text-amber-700" />
              <div className="text-[10px]">
                <p className="text-gray-500 leading-none">Deliver to</p>
                <input 
                  type="text" 
                  maxLength={6}
                  value={pincode}
                  onChange={handlePincodeChange}
                  placeholder="Enter Pincode"
                  className="bg-transparent text-gray-800 font-bold focus:outline-none w-20 text-[11px]"
                />
              </div>
              {pincodeChecked && <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded">Valid</span>}
            </div>

            {/* Login / User Avatar Button in Circle */}
            <div 
              className="relative"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button className="bg-amber-50 hover:bg-amber-100 text-amber-900 w-10 h-10 rounded-full border border-amber-200 transition flex items-center justify-center cursor-pointer shadow-sm">
                <User className="w-4 h-4" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-1 w-72 bg-white rounded-2xl shadow-xl border border-amber-100 p-5 text-gray-800 z-50">
                  {user ? (
                    <div>
                      <div className="mb-4 pb-3 border-b border-gray-100">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Your Account</p>
                        <p className="text-sm font-bold text-amber-950 truncate">{user.name}</p>
                        <p className="text-[11px] text-gray-500 font-medium">+91 {user.phone}</p>
                      </div>
                      {isAdminUser && (
                        <Link href="/admin" className="w-full mb-2 flex items-center justify-center gap-2 bg-amber-900 text-white py-2.5 rounded-xl text-xs font-semibold shadow hover:bg-amber-950 transition">
                          <Shield className="w-4 h-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Your Account</h3>
                      <p className="text-xs text-gray-500 mb-5">Access account & manage your orders.</p>
                      <button 
                        onClick={() => { setShowAuthModal(true); setIsDropdownOpen(false); }} 
                        className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-amber-900 hover:bg-amber-950 shadow transition cursor-pointer"
                      >
                        Login with Mobile
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist Button in Circle */}
            <button 
              onClick={() => setCurrentView('wishlist')}
              className="relative bg-amber-50 hover:bg-amber-100 text-amber-900 w-10 h-10 rounded-full border border-amber-200 transition flex items-center justify-center cursor-pointer shadow-sm"
              title="View Wishlist"
            >
              <Heart className={`w-4 h-4 ${wishlist.length > 0 ? 'fill-amber-900 text-amber-900' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button in Circle */}
            <button 
              onClick={() => router.push('/cart')}
              className="relative bg-amber-50 hover:bg-amber-100 text-amber-900 w-10 h-10 rounded-full border border-amber-200 transition flex items-center justify-center cursor-pointer shadow-sm"
              title="View Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cart.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0)}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* 3. NAVIGATION SUB-BAR WITH FIXED AUTO-SCROLL */}
      <div className="flex-shrink-0 z-30 bg-white text-gray-800 py-3 px-6 shadow-sm border-b border-amber-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto scrollbar-none gap-6 text-xs font-bold tracking-wide">
          <div className="flex items-center gap-6 whitespace-nowrap">
            
            <button onClick={() => scrollToSection(topRef)} className="text-gray-700 hover:text-amber-900 transition cursor-pointer">
              HOME
            </button>
            <button onClick={() => scrollToSection(featuredRef)} className="text-gray-700 hover:text-amber-900 transition cursor-pointer">
              FEATURED PRODUCTS
            </button>
            <button onClick={() => scrollToSection(categoriesRef)} className="text-gray-700 hover:text-amber-900 transition cursor-pointer">
              CATEGORIES
            </button>
            <button onClick={() => scrollToSection(collectionsRef)} className="text-gray-700 hover:text-amber-900 transition cursor-pointer">
              COLLECTIONS
            </button>
            <button onClick={() => setCurrentView('wishlist')} className="text-gray-700 hover:text-amber-900 transition flex items-center gap-1 cursor-pointer">
              <Heart className="w-3.5 h-3.5" />
              <span>MY WISHLIST</span>
            </button>
            <button onClick={() => setCurrentView('orders')} className="text-gray-700 hover:text-amber-900 transition flex items-center gap-1 cursor-pointer">
              <Package className="w-3.5 h-3.5" />
              <span>MY ORDERS</span>
            </button>
            <button onClick={() => scrollToSection(allProductsRef)} className="text-gray-700 hover:text-amber-900 transition cursor-pointer">
              ALL PRODUCTS
            </button>

          </div>

          {currentView !== 'catalog' && (
            <button 
              onClick={() => setCurrentView('catalog')}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:text-amber-950 transition whitespace-nowrap ml-4 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. MAIN DYNAMIC CONTENT AREA */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {currentView === 'wishlist' ? (
            /* WISHLIST VIEW */
            <div className="bg-white rounded-3xl shadow-sm border border-amber-100 p-8">
              <h3 className="text-xl font-extrabold text-amber-950 mb-4 pb-2 border-b border-amber-100 flex justify-between items-center">
                <span>My Saved Wishlist</span>
                <span className="text-xs bg-amber-100 text-amber-900 px-3 py-1 rounded-full font-semibold">
                  {wishlist.length} items
                </span>
              </h3>
              <p className="text-xs text-gray-500 mb-6">Your favorite luxury pieces saved for later.</p>
              
              {wishlist.length === 0 ? (
                <div className="text-center py-16 bg-amber-50/30 rounded-2xl border border-amber-100">
                  <Heart className="w-10 h-10 text-amber-800 mx-auto mb-3 opacity-60" />
                  <p className="text-sm font-bold text-gray-900 mb-1">Your wishlist is empty</p>
                  <p className="text-xs text-gray-500 mb-4">Click the heart icon on any product to save it here.</p>
                  <button 
                    onClick={() => setCurrentView('catalog')}
                    className="bg-amber-900 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow hover:bg-amber-950 transition cursor-pointer"
                  >
                    Explore Collections
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {wishlist.map((item, index) => {
                    const wId = item.id || item.Id || index;
                    const wName = item.name || item.Name;
                    const wPrice = item.price || item.Price;
                    const wImage = item.image1 || item.image || item.Image || '';

                    return (
                      <div 
                        key={wId} 
                        onClick={() => { setSelectedProduct(item); setProductQuantity(1); setCurrentView('detail'); topRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                        className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition duration-300 overflow-hidden border border-amber-100 flex flex-col justify-between cursor-pointer group text-gray-900 relative"
                      >
                        <button 
                          onClick={(e) => toggleWishlist(item, e)}
                          className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white text-red-600 p-2 rounded-full shadow-md transition"
                          title="Remove from Wishlist"
                        >
                          <Heart className="w-4 h-4 fill-red-600" />
                        </button>
                        
                        <div>
                          <div className="relative overflow-hidden flex items-center justify-center bg-amber-50/50 h-60">
                            {wImage ? (
                              <img src={wImage} alt={wName} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                            ) : (
                              <span className="text-xs text-amber-900 font-medium">No Image</span>
                            )}
                          </div>
                          
                          <div className="p-4">
                            <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{wName}</h4>
                            <p className="text-amber-950 font-extrabold text-base mb-4">₹{Number(wPrice).toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="p-4 pt-0">
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setSelectedProduct(item);
                              setProductQuantity(1);
                              setCurrentView('detail');
                              topRef.current?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="w-full bg-amber-900 hover:bg-amber-950 text-white font-semibold py-2.5 px-3 rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>View & Add to Cart</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : currentView === 'orders' ? (
            /* MY ORDERS VIEW */
            <div className="bg-white rounded-3xl shadow-sm border border-amber-100 p-8">
              <h3 className="text-xl font-extrabold text-amber-950 mb-4 pb-2 border-b border-amber-100">My Orders & Purchase History</h3>
              <p className="text-xs text-gray-500 mb-6">Track your active gold jewelry shipments and past orders here.</p>
              
              <div className="text-center py-16 bg-amber-50/30 rounded-2xl border border-amber-100">
                <Package className="w-10 h-10 text-amber-800 mx-auto mb-3 opacity-60" />
                <p className="text-sm font-bold text-gray-900 mb-1">No orders placed yet</p>
                <p className="text-xs text-gray-500 mb-4">Complete a checkout to view your orders live from your account.</p>
                <button 
                  onClick={() => setCurrentView('catalog')}
                  className="bg-amber-900 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow hover:bg-amber-950 transition cursor-pointer"
                >
                  Explore Collections
                </button>
              </div>
            </div>
          ) : currentView === 'detail' && selectedProduct ? (
            /* PRODUCT DETAILS VIEW WITH RELATED PRODUCTS */
            <div className="space-y-16">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-amber-100 p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="relative rounded-2xl overflow-hidden bg-amber-50/50 border border-amber-200 flex items-center justify-center h-[380px]">
                    {selectedProduct.image1 || selectedProduct.image || selectedProduct.Image ? (
                      <img src={selectedProduct.image1 || selectedProduct.image || selectedProduct.Image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm text-amber-900 font-medium">No Image Available</span>
                    )}
                    <span className="absolute top-4 left-4 bg-white/90 text-amber-900 text-xs px-3 py-1 rounded-md backdrop-blur-sm font-bold shadow-sm">
                      {selectedProduct.category || selectedProduct.Category}
                    </span>
                    <button 
                      onClick={(e) => toggleWishlist(selectedProduct, e)}
                      className="absolute top-4 right-4 bg-white/90 hover:bg-white text-red-600 p-2.5 rounded-full shadow-md transition cursor-pointer"
                    >
                      <Heart className={`w-4 h-4 ${wishlist.some(i => String(i.id || i.Id) === String(selectedProduct.id || selectedProduct.Id)) ? 'fill-red-600 text-red-600' : ''}`} />
                    </button>
                  </div>

                  <div className="flex flex-col justify-between">
                    <div>
                      <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{selectedProduct.name || selectedProduct.Name}</h2>
                      
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl font-extrabold text-amber-950">₹{Number(selectedProduct.price || selectedProduct.Price).toLocaleString()}</span>
                        <span className="text-sm text-gray-400 line-through">₹{Math.round(Number(selectedProduct.price || selectedProduct.Price) * 1.1).toLocaleString()}</span>
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded">10% OFF</span>
                      </div>

                      <p className="text-gray-600 text-xs leading-relaxed mb-4">{selectedProduct.description || selectedProduct.Description}</p>

                      <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Select Chain Length / Size:</label>
                        <div className="flex flex-wrap gap-2">
                          {['16 inches', '18 inches', '20 inches', '24 inches'].map((size) => (
                            <button
                              key={size}
                              onClick={() => setSelectedSize(size)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                selectedSize === size 
                                  ? 'bg-amber-900 text-white border-amber-900 shadow-sm' 
                                  : 'bg-white text-gray-700 border-gray-200 hover:border-amber-600'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Quantity:</label>
                        <div className="inline-flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white">
                          <button onClick={() => setProductQuantity(Math.max(1, productQuantity - 1))} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 font-bold text-xs cursor-pointer">-</button>
                          <span className="px-4 py-1.5 text-xs font-bold text-gray-900">{productQuantity}</span>
                          <button onClick={() => setProductQuantity(productQuantity + 1)} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 font-bold text-xs cursor-pointer">+</button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={addToCartFromDetail}
                        className="w-full bg-amber-900 hover:bg-amber-950 text-white font-bold py-3 px-4 rounded-xl text-xs transition shadow flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </button>

                      <button
                        onClick={() => handleWhatsAppShare(selectedProduct)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share on WhatsApp</span>
                      </button>
                    </div>

                  </div>
                </div>

                {/* Right Column: Order Summary Cart Box */}
                <div className="bg-white rounded-3xl shadow-sm border border-amber-100 p-6 flex flex-col justify-between h-fit">
                  <div>
                    <h3 className="text-base font-bold text-amber-950 mb-4 pb-2 border-b border-gray-100 flex justify-between items-center">
                      <span>Order Summary</span>
                      <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
                        {cart.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0)} items
                      </span>
                    </h3>
                    
                    {cart.length === 0 ? (
                      <p className="text-xs text-gray-400 py-6 text-center">Your cart is empty. Click "Add to Cart" above.</p>
                    ) : (
                      <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-1">
                        {cart.map((item) => (
                          <div key={item.cartId} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-50/40 border border-amber-100 text-xs">
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-gray-900 truncate">{item.name}</p>
                              <p className="text-[10px] text-gray-500">Size: {item.selectedSize} | Qty: {item.quantity}</p>
                              <p className="font-extrabold text-amber-950 mt-0.5">₹{(Number(item.price) * (Number(item.quantity) || 1)).toLocaleString()}</p>
                            </div>
                            <button onClick={() => removeFromCart(item.cartId)} className="text-red-500 hover:text-red-700 p-1 cursor-pointer">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-2 text-xs text-gray-600 pt-4 border-t border-gray-100 mb-4">
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span className="text-emerald-600 font-semibold">FREE</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex justify-between items-center mb-6">
                      <span className="text-sm font-bold text-gray-900">Order Total:</span>
                      <span className="text-xl font-extrabold text-amber-950">₹{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => router.push('/cart')}
                      className="w-full bg-amber-900 hover:bg-amber-950 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition shadow flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                      <span>100% Secure Checkout</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* RELATED PRODUCTS SECTION */}
              {relatedProducts.length > 0 && (
                <div className="pt-8 border-t border-amber-200">
                  <div className="flex items-center justify-between mb-6 pb-2 border-b border-amber-200">
                    <h3 className="text-xl font-extrabold text-amber-950 tracking-wide">You May Also Like (Related Products)</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {relatedProducts.map((item, idx) => {
                      const rId = item.id || item.Id || idx;
                      const rName = item.name || item.Name;
                      const rPrice = item.price || item.Price;
                      const rImage = item.image1 || item.image || item.Image || '';
                      const isWishlisted = wishlist.some(i => String(i.id || i.Id) === String(rId));

                      return (
                        <div 
                          key={rId}
                          onClick={() => { setSelectedProduct(item); setProductQuantity(1); topRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                          className="bg-white rounded-2xl shadow-sm border border-amber-100 p-4 cursor-pointer hover:shadow-md transition group relative"
                        >
                          <button 
                            onClick={(e) => toggleWishlist(item, e)}
                            className="absolute top-6 right-6 z-10 bg-white/90 hover:bg-white text-red-600 p-2 rounded-full shadow-md transition cursor-pointer"
                          >
                            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-600 text-red-600' : ''}`} />
                          </button>
                          <div className="h-48 rounded-xl overflow-hidden bg-amber-50/50 mb-3 flex items-center justify-center">
                            {rImage ? (
                              <img src={rImage} alt={rName} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                            ) : (
                              <span className="text-xs text-amber-900">No Image</span>
                            )}
                          </div>
                          <h4 className="font-bold text-xs text-gray-900 truncate mb-1">{rName}</h4>
                          <p className="font-extrabold text-amber-950 text-sm">₹{Number(rPrice).toLocaleString()}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* CATALOG VIEW WITH REFERENCE BANNER & ABOUT US BANNER */
            <div className="space-y-16">
              
              {/* REFERENCE-MATCHING HERITAGE BANNER CAROUSEL */}
              <section className="bg-gradient-to-r from-[#4A1525] via-[#5c1c2f] to-[#360f1b] text-white py-12 px-8 md:px-16 rounded-3xl shadow-xl border border-amber-900/50 relative overflow-hidden transition-all duration-700">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  
                  <div className="space-y-6 text-center lg:text-left transition-all duration-700">
                    <div>
                      <h2 className="text-3xl md:text-5xl font-serif tracking-wider font-extrabold text-amber-100 drop-shadow-sm leading-tight">
                        {banners[currentBannerIndex].titleLine1} <br />
                        <span className="text-amber-300">{banners[currentBannerIndex].titleLine2}</span>
                      </h2>
                      <p className="text-amber-200/80 text-xs md:text-sm tracking-widest uppercase mt-2 font-medium">
                        {banners[currentBannerIndex].subtitle}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-amber-950/60">
                      <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                        <Crown className="w-5 h-5 text-amber-300 mb-1" />
                        <span className="text-[11px] font-bold text-amber-100">Intricate Craftsmanship</span>
                      </div>
                      <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                        <Gem className="w-5 h-5 text-amber-300 mb-1" />
                        <span className="text-[11px] font-bold text-amber-100">Traditional Design</span>
                      </div>
                      <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                        <Feather className="w-5 h-5 text-amber-300 mb-1" />
                        <span className="text-[11px] font-bold text-amber-100">Lightweight Comfort</span>
                      </div>
                      <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                        <CheckCircle2 className="w-5 h-5 text-amber-300 mb-1" />
                        <span className="text-[11px] font-bold text-amber-100">Long-Lasting Finish</span>
                      </div>
                    </div>

                    <div>
                      <button 
                        onClick={() => allProductsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                        className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-extrabold py-3 px-8 rounded-xl text-xs uppercase tracking-wider shadow-lg transition transform hover:scale-105 inline-flex items-center gap-2 cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Shop Now</span>
                      </button>
                    </div>
                  </div>

                  <div className="hidden lg:flex justify-center items-center relative">
                    <div className="w-72 h-72 rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-2xl relative group">
                      <img 
                        src={banners[currentBannerIndex].image} 
                        alt="Luxury Jewelry" 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                    </div>
                  </div>

                </div>

                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentBannerIndex(idx)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        currentBannerIndex === idx ? 'w-6 bg-amber-300' : 'w-2 bg-amber-700/60'
                      }`}
                    />
                  ))}
                </div>
              </section>

              {/* FEATURED PRODUCTS SECTION */}
              <div ref={featuredRef} className="pt-4">
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-amber-200">
                  <h3 className="text-xl font-extrabold text-amber-950 tracking-wide">Featured Products</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {featuredProducts.map((item, idx) => {
                    const fId = item.id || item.Id || idx;
                    const fName = item.name || item.Name;
                    const fPrice = item.price || item.Price;
                    const fImage = item.image1 || item.image || item.Image || '';
                    const isWishlisted = wishlist.some(i => String(i.id || i.Id) === String(fId));

                    return (
                      <div 
                        key={fId}
                        onClick={() => { setSelectedProduct(item); setProductQuantity(1); setCurrentView('detail'); topRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                        className="bg-white rounded-2xl shadow-sm border border-amber-100 p-4 cursor-pointer hover:shadow-md transition group relative"
                      >
                        <button 
                          onClick={(e) => toggleWishlist(item, e)}
                          className="absolute top-6 right-6 z-10 bg-white/90 hover:bg-white text-red-600 p-2 rounded-full shadow-md transition cursor-pointer"
                        >
                          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-600 text-red-600' : ''}`} />
                        </button>
                        <div className="h-48 rounded-xl overflow-hidden bg-amber-50/50 mb-3 flex items-center justify-center">
                          {fImage ? (
                            <img src={fImage} alt={fName} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                          ) : (
                            <span className="text-xs text-amber-900">No Image</span>
                          )}
                        </div>
                        <h4 className="font-bold text-xs text-gray-900 truncate mb-1">{fName}</h4>
                        <p className="font-extrabold text-amber-950 text-sm">₹{Number(fPrice).toLocaleString()}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CATEGORIES SECTION */}
              <div ref={categoriesRef} className="pt-4">
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-amber-200">
                  <h3 className="text-xl font-extrabold text-amber-950 tracking-wide">Categories</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {categories.filter(c => c !== 'All').map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); allProductsRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                      className="bg-white hover:bg-amber-900 hover:text-white text-amber-950 border border-amber-200 p-4 rounded-2xl font-bold text-xs shadow-sm transition text-center cursor-pointer"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* COLLECTIONS SECTION */}
              <div ref={collectionsRef} className="pt-4">
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-amber-200">
                  <h3 className="text-xl font-extrabold text-amber-950 tracking-wide">Luxury Collections</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div onClick={() => { setSelectedCategory('Haram'); allProductsRef.current?.scrollIntoView({ behavior: 'smooth' }); }} className="bg-amber-900 text-white rounded-3xl p-8 cursor-pointer shadow-md hover:bg-amber-950 transition">
                    <h4 className="text-lg font-bold mb-1">Royal Haram Sets</h4>
                    <p className="text-xs text-amber-200 mb-4">Intricate wedding & festive gold-plated harams.</p>
                    <span className="text-xs font-bold underline">Explore Collection</span>
                  </div>
                  <div onClick={() => { setSelectedCategory('Chokers'); allProductsRef.current?.scrollIntoView({ behavior: 'smooth' }); }} className="bg-amber-800 text-white rounded-3xl p-8 cursor-pointer shadow-md hover:bg-amber-900 transition">
                    <h4 className="text-lg font-bold mb-1">Bridal Chokers</h4>
                    <p className="text-xs text-amber-200 mb-4">Stunning stone-studded close-fitting neckpieces.</p>
                    <span className="text-xs font-bold underline">Explore Collection</span>
                  </div>
                  <div onClick={() => { setSelectedCategory('Bangles'); allProductsRef.current?.scrollIntoView({ behavior: 'smooth' }); }} className="bg-amber-950 text-white rounded-3xl p-8 cursor-pointer shadow-md hover:bg-black transition">
                    <h4 className="text-lg font-bold mb-1">Designer Bangles</h4>
                    <p className="text-xs text-amber-200 mb-4">Sparkling 1g gold bangles for every celebration.</p>
                    <span className="text-xs font-bold underline">Explore Collection</span>
                  </div>
                </div>
              </div>

              {/* ALL PRODUCTS SECTION */}
              <div ref={allProductsRef} className="pt-4">
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-amber-200">
                  <h3 className="text-xl font-extrabold text-amber-950 tracking-wide flex items-center gap-2">
                    <span>{selectedCategory === 'All' ? 'All Products' : `${selectedCategory} Collection`}</span>
                    <span className="text-xs bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300 font-semibold">
                      {filteredProducts.length} items
                    </span>
                  </h3>
                </div>

                {loading ? (
                  <div className="text-center py-16 text-amber-900 font-medium">Loading your luxury collection...</div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-16 text-gray-500 bg-white rounded-2xl border border-amber-100 shadow-sm">No products found matching your search.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((product, index) => {
                      const pId = product.id || product.Id || index;
                      const pName = product.name || product.Name || 'Unnamed Product';
                      const pPrice = product.price || product.Price || 0;
                      const pCategory = product.category || product.Category || 'General';
                      const pImage = product.image1 || product.image || product.Image || '';
                      const pDesc = product.description || product.Description || '';
                      const isWishlisted = wishlist.some(i => String(i.id || i.Id) === String(pId));

                      return (
                        <div 
                          key={pId} 
                          onClick={() => { setSelectedProduct(product); setProductQuantity(1); setCurrentView('detail'); topRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                          className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition duration-300 overflow-hidden border border-amber-100 flex flex-col justify-between cursor-pointer group text-gray-900 relative"
                        >
                          <button 
                            onClick={(e) => toggleWishlist(product, e)}
                            className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white text-red-600 p-2 rounded-full shadow-md transition cursor-pointer"
                          >
                            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-600 text-red-600' : ''}`} />
                          </button>

                          <div>
                            <div className="relative overflow-hidden flex items-center justify-center bg-amber-50/50 h-60">
                              {pImage ? (
                                <img src={pImage} alt={pName} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                              ) : (
                                <span className="text-xs text-amber-900 font-medium">No Image</span>
                              )}
                              <span className="absolute top-3 left-3 bg-white/90 text-amber-900 text-[10px] px-2.5 py-1 rounded-md backdrop-blur-sm font-bold shadow-sm">
                                {pCategory}
                              </span>
                              <span className="absolute top-3 right-14 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded font-bold shadow-sm">
                                10% OFF
                              </span>
                            </div>
                            
                            <div className="p-4">
                              <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{pName}</h4>
                              <div className="flex items-center gap-2 mb-2">
                                <p className="text-amber-950 font-extrabold text-base">₹{Number(pPrice).toLocaleString()}</p>
                                <p className="text-gray-400 text-xs line-through">₹{Math.round(Number(pPrice) * 1.1).toLocaleString()}</p>
                              </div>
                              <p className="text-gray-500 text-xs line-clamp-2 mb-4">{pDesc}</p>
                            </div>
                          </div>

                          <div className="p-4 pt-0 flex flex-col gap-2">
                            <button
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setSelectedProduct(product);
                                setProductQuantity(1);
                                setCurrentView('detail');
                                topRef.current?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="w-full bg-amber-900 hover:bg-amber-950 text-white font-semibold py-2.5 px-3 rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>View Details & Buy</span>
                            </button>

                            <button
                              onClick={(e) => { e.stopPropagation(); handleWhatsAppShare(product); }}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span>Share on WhatsApp</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ABOUT US BANNER MATCHING REFERENCE */}
              <section className="bg-gradient-to-r from-[#2B0C15] via-[#4A1525] to-[#2B0C15] text-amber-100 py-12 px-8 md:px-16 rounded-3xl shadow-xl border border-amber-900/40 relative overflow-hidden mt-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                  
                  <div className="space-y-6 text-center lg:text-left">
                    <div>
                      <h2 className="text-3xl md:text-5xl font-serif tracking-widest font-extrabold text-amber-100 drop-shadow-sm uppercase">
                        About Us
                      </h2>
                      <p className="text-xs text-amber-300 tracking-widest uppercase mt-1 font-semibold">
                        About SB Jewels
                      </p>
                    </div>

                    <p className="text-amber-100/80 text-xs md:text-sm leading-relaxed font-light">
                      At SB Jewels, we believe luxury should be timeless yet accessible. We bring you premium jewellery that blends traditional artistry with contemporary elegance, crafted with attention to detail and lasting quality. Our thoughtfully designed pieces offer a luxurious look at an affordable price, making fine jewellery a part of every celebration and cherished moment.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-amber-900/60">
                      <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                        <Gem className="w-5 h-5 text-amber-300 mb-1" />
                        <span className="text-[11px] font-bold text-amber-100">Timeless Designs</span>
                      </div>
                      <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                        <Crown className="w-5 h-5 text-amber-300 mb-1" />
                        <span className="text-[11px] font-bold text-amber-100">Premium Craftsmanship</span>
                      </div>
                      <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                        <Sparkles className="w-5 h-5 text-amber-300 mb-1" />
                        <span className="text-[11px] font-bold text-amber-100">Inspired by Tradition</span>
                      </div>
                      <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                        <ShieldCheck className="w-5 h-5 text-amber-300 mb-1" />
                        <span className="text-[11px] font-bold text-amber-100">Quality You Can Trust</span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden lg:flex justify-center items-center">
                    <div className="w-80 h-72 rounded-2xl overflow-hidden border border-amber-500/30 shadow-2xl relative">
                      <img 
                        src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop" 
                        alt="About SB Jewels Necklace" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                    </div>
                  </div>

                </div>
              </section>

            </div>
          )}

        </div>
      </div>

      {/* 5. PROFESSIONAL REFERENCE-MATCHING FOOTER */}
      <footer className="bg-[#2B0C15] text-amber-100 pt-16 pb-12 px-6 md:px-12 mt-20 border-t border-amber-950">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 mb-16 text-xs">
          
          {/* Column 1: Know Your Jewellery */}
          <div className="space-y-3">
            <h4 className="font-bold text-amber-300 uppercase tracking-wider mb-4 text-sm">Know Your Jewellery</h4>
            <p className="hover:text-white cursor-pointer transition">Diamond guide</p>
            <p className="hover:text-white cursor-pointer transition">Jewellery guide</p>
            <p className="hover:text-white cursor-pointer transition">Gemstones guide</p>
            <p className="hover:text-white cursor-pointer transition">Gold rate</p>
            <p className="hover:text-white cursor-pointer transition">Treasure chest</p>
            <p className="hover:text-white cursor-pointer transition">Glossary</p>
          </div>

          {/* Column 2: SB Jewels Advantage */}
          <div className="space-y-3">
            <h4 className="font-bold text-amber-300 uppercase tracking-wider mb-4 text-sm">SB Jewels Advantage</h4>
            <p className="hover:text-white cursor-pointer transition">15-day returns</p>
            <p className="hover:text-white cursor-pointer transition">Free shipping</p>
            <p className="hover:text-white cursor-pointer transition">Postcards</p>
            <p className="hover:text-white cursor-pointer transition">Gold exchange</p>
            <p className="hover:text-white cursor-pointer transition">Gift cards</p>
            <p className="hover:text-white cursor-pointer transition">Digital gold</p>
          </div>

          {/* Column 3: Customer Service */}
          <div className="space-y-3">
            <h4 className="font-bold text-amber-300 uppercase tracking-wider mb-4 text-sm">Customer Service</h4>
            <p className="hover:text-white cursor-pointer transition">Return policy</p>
            <p onClick={() => setCurrentView('orders')} className="hover:text-white cursor-pointer transition">Order status</p>
            <p onClick={openWhatsAppChat} className="hover:text-white cursor-pointer transition">Enquiries & Support</p>
          </div>

          {/* Column 4: About Us */}
          <div className="space-y-3">
            <h4 className="font-bold text-amber-300 uppercase tracking-wider mb-4 text-sm">About Us</h4>
            <p className="hover:text-white cursor-pointer transition">Our story</p>
            <p className="hover:text-white cursor-pointer transition">Press</p>
            <p className="hover:text-white cursor-pointer transition">Blog</p>
            <p className="hover:text-white cursor-pointer transition">Careers</p>
          </div>

          {/* Column 5: Contact Us & Address */}
          <div className="space-y-3">
            <h4 className="font-bold text-amber-300 uppercase tracking-wider mb-4 text-sm">Contact Us</h4>
            <p className="font-semibold text-white">SB Jewels Luxury Store</p>
            <p className="text-amber-200/80 leading-relaxed">Road No 10, Banjara Hills,<br />Hyderabad, Telangana 500004</p>
            
            <div className="pt-3 space-y-1">
              <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wide">24x7 Enquiry Support</p>
              <p className="text-amber-100">General & DM Enquiries: WhatsApp & Instagram</p>
            </div>

            <div className="flex items-center gap-4 pt-3 text-amber-200">
              <span className="flex items-center gap-1.5 cursor-pointer hover:text-white transition" onClick={openWhatsAppChat}>
                <MessageCircle className="w-4 h-4 text-emerald-400" /> WhatsApp
              </span>
              <span className="flex items-center gap-1.5 cursor-pointer hover:text-white transition" onClick={() => window.open('https://instagram.com', '_blank')}>
                <Instagram className="w-4 h-4 text-pink-400" /> Instagram
              </span>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-amber-950 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-amber-300/80">
          <div>
            <p className="font-semibold text-amber-200">Find Us On</p>
            <div className="flex items-center gap-4 mt-3">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-amber-950 flex items-center justify-center hover:bg-amber-900 text-amber-200 transition" title="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://wa.me/917981658289" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-amber-950 flex items-center justify-center hover:bg-amber-900 text-amber-200 transition" title="WhatsApp">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="text-center md:text-right">
            <p className="font-semibold text-amber-200 mb-2">Accepted Payments (UPI & Wallets)</p>
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 font-bold text-[11px] tracking-widest text-amber-100">
              <span className="bg-amber-950/80 px-2.5 py-1 rounded border border-amber-900">UPI</span>
              <span className="bg-amber-950/80 px-2.5 py-1 rounded border border-amber-900">PHONEPE</span>
              <span className="bg-amber-950/80 px-2.5 py-1 rounded border border-amber-900">GPAY</span>
              <span className="bg-amber-950/80 px-2.5 py-1 rounded border border-amber-900">PAYTM</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 text-center text-[10px] text-amber-400/60">
          © 2026 SB Jewels. All Rights Reserved. Crafted for Luxury & Tradition.
        </div>
      </footer>

      {/* PHONE & OTP LOGIN MODAL */}
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

      {/* FLOATING WHATSAPP ICON BUTTON AT BOTTOM RIGHT */}
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

function Instagram({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}