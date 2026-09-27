'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowLeft, ShieldCheck, Check, Package, MapPin, Phone, User, Printer } from 'lucide-react';

export default function CartCheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem('sb_cart') || '[]');
      setCart(Array.isArray(savedCart) ? savedCart : []);
      
      const savedUser = JSON.parse(localStorage.getItem('sb_user') || 'null');
      if (savedUser) {
        if (savedUser.name) setName(savedUser.name);
        if (savedUser.phone) setPhone(savedUser.phone);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const updateQuantity = (cartId: any, delta: number) => {
    const updated = cart.map(item => {
      if (item.cartId === cartId) {
        const newQty = (Number(item.quantity) || 1) + delta;
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0);

    setCart(updated);
    localStorage.setItem('sb_cart', JSON.stringify(updated));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (Number(item.price) * (Number(item.quantity) || 1)), 0);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSuccessfulPaymentCompletion = async (paymentId: string) => {
    setLoading(true);
    const totalAmount = calculateTotal();
    const orderId = `SBJ-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const itemsSummary = cart.map(i => `${i.name} (Qty: ${i.quantity}${i.selectedSize ? `, Size: ${i.selectedSize}` : ''})`).join(' | ');
      
      const orderPayload = {
        OrderId: orderId,
        Date: new Date().toLocaleString(),
        CustomerName: name,
        Phone: phone,
        HouseNo: houseNo,
        Street: street,
        City: city,
        State: state,
        Country: 'India',
        Pincode: pincode,
        Items: itemsSummary,
        TotalAmount: totalAmount,
        PaymentId: paymentId,
        Status: 'Confirmed'
      };

      const res = await fetch('/api/save-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (!data.success) {
        console.error("Failed to save order to sheet:", data.error);
        showToast('Payment successful, but failed to log order to sheet.');
        setLoading(false);
        return;
      }

      localStorage.removeItem('sb_cart');
      setCart([]);
      
      setConfirmedOrder(orderPayload);
      showToast('Payment successful! Order confirmed.');

      // Automatically open WhatsApp message alongside
      const formattedPhone = phone.startsWith('91') ? phone : `91${phone}`;
      const message = `✨ *Order Confirmation - SB Jewels* ✨\n\n` +
        `Hello ${name},\nThank you for your purchase! Your order has been successfully placed.\n\n` +
        `🆔 *Order ID:* ${orderId}\n` +
        `🛍️ *Items:* ${itemsSummary}\n` +
        `💰 *Total Amount:* ₹${Number(totalAmount).toLocaleString()}\n` +
        `📍 *Shipping To:* ${houseNo}, ${street}, ${city}, ${state} - ${pincode}\n` +
        `🔒 *Payment ID:* ${paymentId}\n\n` +
        `We will notify you once your luxury items ship!`;

      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

    } catch (err) {
      console.error("Error saving order:", err);
      showToast('Payment successful, but error saving order record.');
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      showToast('Your cart is empty.');
      return;
    }

    if (!name || !phone || !houseNo || !street || !city || !state || !pincode) {
      showToast('Please fill in all shipping details.');
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      showToast('Please enter a valid 10-digit phone number.');
      return;
    }

    setLoading(true);
    const res = await loadRazorpayScript();

    if (!res) {
      showToast('Razorpay SDK failed to load.');
      setLoading(false);
      return;
    }

    const options: any = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TgutpOYZOrsGj2',
      amount: calculateTotal() * 100,
      currency: 'INR',
      name: 'SB Jewels',
      description: 'Luxury Gold Jewelry Purchase',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=200&auto=format&fit=crop',
      handler: function (response: any) {
        handleSuccessfulPaymentCompletion(response.razorpay_payment_id);
      },
      prefill: {
        name: name,
        email: 'customer@sbjewels.com',
        contact: phone
      },
      theme: {
        color: '#4A1525'
      }
    };

    const paymentWindow = new (window as any).Razorpay(options);
    paymentWindow.open();
    setLoading(false);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-gray-800 p-4 md:p-12 flex flex-col items-center justify-center space-y-4">
        
        {toastMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
            <div className="bg-[#4A1525] text-amber-100 px-6 py-3.5 rounded-2xl shadow-2xl border border-amber-300/30 flex items-center gap-3">
              <Check className="w-5 h-5 text-amber-300 flex-shrink-0" />
              <span className="text-xs md:text-sm font-bold">{toastMessage}</span>
            </div>
          </div>
        )}

        <div className="max-w-xl w-full bg-white rounded-3xl shadow-lg border border-gray-200 p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">Order Placed Successfully!</h1>
            <p className="text-xs text-gray-500">Thank you for shopping with SB Jewels. Your order has been logged.</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3 text-xs">
            <div className="flex justify-between pb-2 border-b border-gray-200">
              <span className="font-bold text-gray-500">Order ID:</span>
              <span className="font-extrabold text-gray-900">{confirmedOrder.OrderId}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-gray-200">
              <span className="font-bold text-gray-500">Date & Time:</span>
              <span className="font-bold text-gray-800">{confirmedOrder.Date}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-gray-200">
              <span className="font-bold text-gray-500">Payment ID:</span>
              <span className="font-mono font-bold text-gray-900">{confirmedOrder.PaymentId}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-gray-200">
              <span className="font-bold text-gray-500">Status:</span>
              <span className="bg-green-100 text-green-800 font-extrabold px-2 py-0.5 rounded-full text-[10px]">
                {confirmedOrder.Status}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-extrabold text-gray-900 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-gray-700" />
              <span>Purchased Items</span>
            </h4>
            <p className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700 font-medium leading-relaxed">
              {confirmedOrder.Items}
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-extrabold text-gray-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gray-700" />
              <span>Shipping Address</span>
            </h4>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700 space-y-1">
              <p className="font-bold text-gray-900 flex items-center gap-1">
                <User className="w-3 h-3" /> {confirmedOrder.CustomerName}
              </p>
              <p className="flex items-center gap-1">
                <Phone className="w-3 h-3" /> {confirmedOrder.Phone}
              </p>
              <p>{confirmedOrder.HouseNo}, {confirmedOrder.Street}</p>
              <p>{confirmedOrder.City}, {confirmedOrder.State} - {confirmedOrder.Pincode}</p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-gray-200">
            <span className="font-bold text-sm text-gray-700">Total Paid:</span>
            <span className="text-xl font-extrabold text-gray-900">₹{Number(confirmedOrder.TotalAmount).toLocaleString()}</span>
          </div>
        </div>

        <div className="max-w-xl w-full space-y-3 bg-amber-50 p-4 rounded-2xl border border-amber-200 text-center">
          <p className="text-xs font-bold text-amber-950">
            👇 Click below to print or save your official order receipt as a PDF:
          </p>
          
          <button 
            onClick={handlePrintReceipt}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-2xl text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save Receipt as PDF</span>
          </button>

          <button 
            onClick={() => router.push(`/?orderSuccess=${confirmedOrder.OrderId}`)}
            className="w-full bg-[#4A1525] hover:bg-[#320D18] text-amber-100 font-extrabold py-3.5 rounded-2xl text-xs transition shadow-lg cursor-pointer"
          >
            Back to Store Collections
          </button>
        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-gray-800 p-4 md:p-12">
      
      {toastMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
          <div className="bg-[#4A1525] text-amber-100 px-6 py-3.5 rounded-2xl shadow-2xl border border-amber-300/30 flex items-center gap-3">
            <Check className="w-5 h-5 text-amber-300 flex-shrink-0" />
            <span className="text-xs md:text-sm font-bold">{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-8">
        
        <button 
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 text-xs font-bold text-amber-900 bg-white px-4 py-2 rounded-xl shadow-sm border border-amber-200 hover:bg-amber-50 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </button>

        <h1 className="text-2xl font-extrabold text-amber-950">Shopping Cart & Secure Checkout</h1>

        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-amber-100 space-y-4 shadow-sm">
            <ShoppingBag className="w-12 h-12 text-amber-800 mx-auto opacity-50" />
            <p className="text-sm font-bold text-gray-900">Your cart is currently empty</p>
            <button onClick={() => router.push('/')} className="bg-amber-900 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow">
              Explore Collections
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <div className="bg-white rounded-3xl shadow-sm border border-amber-100 p-6 space-y-4 h-fit">
              <h3 className="font-extrabold text-amber-950 text-base pb-2 border-b border-gray-100">Review Items ({cart.length})</h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.cartId} className="flex items-center justify-between gap-4 p-3 bg-amber-50/40 rounded-2xl border border-amber-100">
                    <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-xl" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-gray-900 truncate">{item.name}</h4>
                      <p className="text-[10px] text-gray-500">{item.selectedSize ? `Size: ${item.selectedSize} • ` : ''}₹{Number(item.price)} each</p>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white border border-amber-200 rounded-lg px-2 py-1">
                      <button onClick={() => updateQuantity(item.cartId, -1)} className="text-gray-500 hover:text-red-600 font-extrabold text-xs">-</button>
                      <span className="font-extrabold text-xs px-1">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartId, 1)} className="text-gray-500 hover:text-amber-900 font-extrabold text-xs">+</button>
                    </div>

                    <span className="font-extrabold text-amber-950 text-xs w-16 text-right">
                      ₹{Number(item.price) * Number(item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                <span className="font-bold">Total Amount:</span>
                <span className="text-xl font-extrabold text-amber-950">₹{calculateTotal().toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleRazorpayPayment} className="bg-white rounded-3xl shadow-sm border border-amber-100 p-6 space-y-4">
              <h3 className="font-extrabold text-amber-950 text-base pb-2 border-b border-gray-100">Shipping Address & Payment</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="Sanjeev Dasari" 
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-amber-900" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Mobile Number</label>
                  <input 
                    type="tel" 
                    maxLength={10} 
                    required 
                    value={phone} 
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} 
                    placeholder="7981658289" 
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-amber-900" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">House / Flat No</label>
                  <input 
                    type="text" 
                    required 
                    value={houseNo} 
                    onChange={e => setHouseNo(e.target.value)} 
                    placeholder="Flat 402" 
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-amber-900" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Street / Area</label>
                  <input 
                    type="text" 
                    required 
                    value={street} 
                    onChange={e => setStreet(e.target.value)} 
                    placeholder="Banjara Hills" 
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-amber-900" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">City</label>
                  <input 
                    type="text" 
                    required 
                    value={city} 
                    onChange={e => setCity(e.target.value)} 
                    placeholder="Hyderabad" 
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-amber-900" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">State</label>
                  <input 
                    type="text" 
                    required 
                    value={state} 
                    onChange={e => setState(e.target.value)} 
                    placeholder="Telangana" 
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-amber-900" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Pincode</label>
                  <input 
                    type="text" 
                    maxLength={6} 
                    required 
                    value={pincode} 
                    onChange={e => setPincode(e.target.value.replace(/\D/g, ''))} 
                    placeholder="500034" 
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-amber-900" 
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#4A1525] hover:bg-[#320D18] text-amber-100 font-extrabold py-3.5 rounded-2xl text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>{loading ? 'Processing...' : `Pay ₹${calculateTotal().toLocaleString()} with Razorpay`}</span>
                </button>
              </div>

            </form>

          </div>
        )}

      </div>
    </div>
  );
}