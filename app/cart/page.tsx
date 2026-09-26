'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowLeft, Trash2, ShieldCheck, MapPin, Check, MessageCircle } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [state, setState] = useState('Telangana');
  const [country, setCountry] = useState('India');
  const [pincode, setPincode] = useState('');

  // Inline validation error states
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [houseError, setHouseError] = useState('');
  const [streetError, setStreetError] = useState('');
  const [cityError, setCityError] = useState('');
  const [stateError, setStateError] = useState('');
  const [countryError, setCountryError] = useState('');
  const [pincodeError, setPincodeError] = useState('');

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem('sb_cart') || '[]');
      setCart(Array.isArray(savedCart) ? savedCart : []);
    } catch (e) {
      console.error("Cart loading error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQuantity = (cartId: any, delta: number) => {
    const updated = cart.map(item => {
      if (item.cartId === cartId) {
        const newQty = (Number(item.quantity) || 1) + delta;
        return { ...item, quantity: newQty < 1 ? 1 : newQty };
      }
      return item;
    });
    setCart(updated);
    localStorage.setItem('sb_cart', JSON.stringify(updated));
  };

  const removeItem = (cartId: any) => {
    const updated = cart.filter(item => item.cartId !== cartId);
    setCart(updated);
    localStorage.setItem('sb_cart', JSON.stringify(updated));
  };

  const calculateTotal = () => {
    return cart.reduce((total: number, item: any) => total + (Number(item.price) * (Number(item.quantity) || 1)), 0);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    let isValid = true;

    // Reset errors
    setNameError('');
    setPhoneError('');
    setHouseError('');
    setStreetError('');
    setCityError('');
    setStateError('');
    setCountryError('');
    setPincodeError('');

    if (!name.trim() || !/^[a-zA-Z\s]+$/.test(name)) {
      setNameError('Please enter a valid name (letters only).');
      isValid = false;
    }

    if (!phone.trim() || !/^\d{10}$/.test(phone)) {
      setPhoneError('Phone number must be exactly 10 digits.');
      isValid = false;
    }

    if (!houseNo.trim()) {
      setHouseError('Please enter House/Flat No.');
      isValid = false;
    }

    if (!street.trim()) {
      setStreetError('Please enter Street or Locality.');
      isValid = false;
    }

    if (!city.trim()) {
      setCityError('Please enter City.');
      isValid = false;
    }

    if (!state.trim()) {
      setStateError('Please enter State.');
      isValid = false;
    }

    if (!country.trim()) {
      setCountryError('Please enter Country.');
      isValid = false;
    }

    if (!pincode.trim() || !/^\d{6}$/.test(pincode)) {
      setPincodeError('Pincode must be exactly 6 digits.');
      isValid = false;
    }

    if (!isValid) return;

    setIsSubmitting(true);

    const orderId = 'SBJ-' + Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toLocaleString();
    const itemsSummary = cart.map(i => `${i.name} (Qty: ${i.quantity}, Size: ${i.selectedSize || '18 in'})`).join(', ');
    const totalAmount = calculateTotal();

    const orderData = {
      action: 'createOrder',
      orderId,
      date: dateStr,
      customerName: name,
      phone,
      houseNo,
      street,
      city,
      state,
      country,
      pincode,
      items: itemsSummary,
      totalAmount,
      status: 'Confirmed'
    };

    try {
      const sheetUrl = process.env.NEXT_PUBLIC_ORDERS_SHEET_URL || 'https://script.google.com/macros/s/AKfycby69Zp3gn5KTLHDhfnEdl9ae5YLVKuU7MeD-UKo_H5qpl1mAq6fg6AEfxj3HpJbtAGVrw/exec';
      await fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
    } catch (err) {
      console.error("Error saving to Google Sheet:", err);
    }

    // Save order locally for backup tracking
    try {
      const userOrders = JSON.parse(localStorage.getItem('sb_my_orders') || '[]');
      userOrders.push(orderData);
      localStorage.setItem('sb_my_orders', JSON.stringify(userOrders));
    } catch (e) {}

    setCreatedOrderId(orderId);
    setOrderPlaced(true);
    localStorage.removeItem('sb_cart');
    setCart([]);
    setIsSubmitting(false);

    // Trigger WhatsApp confirmation message
    const waMessage = `Hello ${name}, thank you for your order with SB Jewels!\n\nOrder ID: ${orderId}\nTotal: ₹${totalAmount}\nStatus: Confirmed\n\nWe will dispatch your exquisite jewelry soon!`;
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(waMessage)}`, '_blank');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] text-amber-900 font-medium text-xs">Loading cart...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-gray-800">
      
      <header className="bg-white text-gray-900 py-3.5 px-4 md:px-12 shadow-sm z-50 border-b border-amber-100 sticky top-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => router.push('/')} className="inline-flex items-center gap-2 text-xs font-bold text-amber-900 cursor-pointer">
            <ArrowLeft className="w-4 h-4" /><span>Back to Shop</span>
          </button>
          <h1 className="text-base font-extrabold tracking-wider text-amber-900">SB JEWELS CHECKOUT</h1>
          <div className="w-16"></div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8">
        {orderPlaced ? (
          <div className="bg-white rounded-3xl shadow-sm border border-amber-100 p-8 md:p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-amber-950">Order Placed Successfully!</h2>
            <p className="text-xs text-gray-600 leading-relaxed">Your Order ID is <strong className="text-amber-900">{createdOrderId}</strong>. A confirmation message has been sent to your WhatsApp.</p>
            <button onClick={() => router.push('/')} className="w-full bg-amber-900 hover:bg-amber-950 text-white font-bold py-3 rounded-xl text-xs shadow transition cursor-pointer">
              Continue Shopping
            </button>
          </div>
        ) : cart.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-amber-100 p-12 text-center max-w-md mx-auto space-y-4">
            <ShoppingBag className="w-12 h-12 text-amber-800 mx-auto opacity-50" />
            <h3 className="text-base font-bold text-gray-900">Your Cart is Empty</h3>
            <p className="text-xs text-gray-500">Explore our luxury gold collections and add items to your cart.</p>
            <button onClick={() => router.push('/')} className="bg-amber-900 text-white px-6 py-2.5 rounded-xl text-xs font-semibold shadow cursor-pointer">
              Explore Collections
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <div className="bg-white rounded-3xl shadow-sm border border-amber-100 p-6 space-y-4 h-fit">
              <h3 className="text-base font-extrabold text-amber-950 pb-3 border-b border-gray-100">Review Bag ({cart.length} items)</h3>
              
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.cartId} className="flex items-center justify-between gap-4 p-3 bg-amber-50/40 rounded-2xl border border-amber-100/50">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white flex-shrink-0 border border-amber-200 flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-amber-900 font-bold">No Image</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-gray-900 truncate">{item.name}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">Size: {item.selectedSize || '18 inches'}</p>
                      <p className="font-extrabold text-amber-950 text-xs mt-1">₹{Number(item.price).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                        <button onClick={() => updateQuantity(item.cartId, -1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100 font-bold text-xs cursor-pointer">-</button>
                        <span className="px-3 py-1 text-xs font-bold text-gray-900">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.cartId, 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100 font-bold text-xs cursor-pointer">+</button>
                      </div>
                      <button onClick={() => removeItem(item.cartId)} className="text-red-500 hover:text-red-700 p-1.5 cursor-pointer" title="Remove">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-sm font-bold">
                <span>Total Amount:</span>
                <span className="text-lg font-extrabold text-amber-950">₹{calculateTotal().toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-amber-100 p-6 space-y-4">
              <h3 className="text-base font-extrabold text-amber-950 pb-3 border-b border-gray-100">Shipping & Secure UPI Payment</h3>
              
              <form onSubmit={handlePayment} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => { setName(e.target.value); setNameError(''); }}
                    placeholder="Sanjeev Dasari"
                    className={`w-full text-xs p-3 rounded-xl border focus:outline-none transition ${nameError ? 'border-red-500 bg-red-50/20' : 'border-gray-300 focus:border-amber-900'}`}
                  />
                  {nameError && <p className="text-[11px] text-red-600 font-semibold mt-1">{nameError}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number</label>
                  <div className={`flex items-center border rounded-xl overflow-hidden focus-within:border-amber-900 ${phoneError ? 'border-red-500 bg-red-50/20' : 'border-gray-300'}`}>
                    <span className="bg-gray-50 px-3 py-3 text-xs font-bold text-gray-600 border-r border-gray-300">+91</span>
                    <input 
                      type="tel" 
                      maxLength={10}
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '')); setPhoneError(''); }}
                      placeholder="9876543210"
                      className="w-full text-xs p-3 focus:outline-none bg-transparent"
                    />
                  </div>
                  {phoneError && <p className="text-[11px] text-red-600 font-semibold mt-1">{phoneError}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">House / Flat / Apartment No.</label>
                  <input 
                    type="text" 
                    value={houseNo}
                    onChange={(e) => { setHouseNo(e.target.value); setHouseError(''); }}
                    placeholder="Flat 402, Royal Residency"
                    className={`w-full text-xs p-3 rounded-xl border focus:outline-none transition ${houseError ? 'border-red-500 bg-red-50/20' : 'border-gray-300 focus:border-amber-900'}`}
                  />
                  {houseError && <p className="text-[11px] text-red-600 font-semibold mt-1">{houseError}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Street / Locality / Landmark</label>
                  <input 
                    type="text" 
                    value={street}
                    onChange={(e) => { setStreet(e.target.value); setStreetError(''); }}
                    placeholder="Road No 10, Near Jubilee Hills Checkpost"
                    className={`w-full text-xs p-3 rounded-xl border focus:outline-none transition ${streetError ? 'border-red-500 bg-red-50/20' : 'border-gray-300 focus:border-amber-900'}`}
                  />
                  {streetError && <p className="text-[11px] text-red-600 font-semibold mt-1">{streetError}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
                    <input 
                      type="text" 
                      value={city}
                      onChange={(e) => { setCity(e.target.value); setCityError(''); }}
                      placeholder="Hyderabad"
                      className={`w-full text-xs p-3 rounded-xl border focus:outline-none transition ${cityError ? 'border-red-500 bg-red-50/20' : 'border-gray-300 focus:border-amber-900'}`}
                    />
                    {cityError && <p className="text-[11px] text-red-600 font-semibold mt-1">{cityError}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">State</label>
                    <input 
                      type="text" 
                      value={state}
                      onChange={(e) => { setState(e.target.value); setStateError(''); }}
                      placeholder="Telangana"
                      className={`w-full text-xs p-3 rounded-xl border focus:outline-none transition ${stateError ? 'border-red-500 bg-red-50/20' : 'border-gray-300 focus:border-amber-900'}`}
                    />
                    {stateError && <p className="text-[11px] text-red-600 font-semibold mt-1">{stateError}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Country</label>
                    <input 
                      type="text" 
                      value={country}
                      onChange={(e) => { setCountry(e.target.value); setCountryError(''); }}
                      placeholder="India"
                      className={`w-full text-xs p-3 rounded-xl border focus:outline-none transition ${countryError ? 'border-red-500 bg-red-50/20' : 'border-gray-300 focus:border-amber-900'}`}
                    />
                    {countryError && <p className="text-[11px] text-red-600 font-semibold mt-1">{countryError}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Pincode</label>
                    <input 
                      type="text" 
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '')); setPincodeError(''); }}
                      placeholder="500034"
                      className={`w-full text-xs p-3 rounded-xl border focus:outline-none transition ${pincodeError ? 'border-red-500 bg-red-50/20' : 'border-gray-300 focus:border-amber-900'}`}
                    />
                    {pincodeError && <p className="text-[11px] text-red-600 font-semibold mt-1">{pincodeError}</p>}
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#8B2500] hover:bg-[#6b1c00] text-white font-extrabold py-3.5 rounded-xl text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isSubmitting ? 'Processing Order...' : `Pay ₹${calculateTotal().toLocaleString()} Securely via UPI`}</span>
                  </button>
                </div>

              </form>
            </div>

          </div>
        )}
      </main>

    </div>
  );
}