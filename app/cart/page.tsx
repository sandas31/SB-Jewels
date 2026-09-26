'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Trash2, ArrowLeft, CheckCircle2, MapPin, ShieldCheck, Smartphone, QrCode } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  
  // Strict Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Telangana');
  
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('sb_cart') || '[]');
    setCart(Array.isArray(savedCart) ? savedCart : []);
  }, []);

  const handleQuantityChange = (cartId: any, delta: number) => {
    const updated = cart.map(item => {
      if (item.cartId === cartId) {
        const newQty = (Number(item.quantity) || 1) + delta;
        if (newQty < 1) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCart(updated);
    localStorage.setItem('sb_cart', JSON.stringify(updated));
  };

  const removeFromCart = (cartId: any) => {
    const updated = cart.filter(item => item.cartId !== cartId);
    setCart(updated);
    localStorage.setItem('sb_cart', JSON.stringify(updated));
  };

  const calculateTotal = () => {
    return cart.reduce((total: number, item: any) => total + (Number(item.price) * (Number(item.quantity) || 1)), 0);
  };

  const handleNameChange = (e: any) => {
    const val = e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 30);
    setName(val);
  };

  const handlePhoneChange = (e: any) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(val);
  };

  const handlePincodeChange = (e: any) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(val);
  };

  const handleApartmentChange = (e: any) => {
    const val = e.target.value.replace(/[<>]/g, '').slice(0, 40);
    setApartment(val);
  };

  const handleCityChange = (e: any) => {
    const val = e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 20);
    setCity(val);
  };

  // Step 1: Validate Form and Open Payment Gateway Modal
  const handleProceedClick = (e: any) => {
    e.preventDefault();

    if (name.trim().length < 2) {
      alert('Security Validation: Please enter a valid name (letters only).');
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      alert('Security Validation: Phone number must be exactly 10 digits.');
      return;
    }
    if (!/^\d{6}$/.test(pincode)) {
      alert('Security Validation: Pincode must be exactly 6 digits.');
      return;
    }
    if (apartment.trim().length < 5) {
      alert('Security Validation: Please enter a valid street/house address.');
      return;
    }
    if (city.trim().length < 3) {
      alert('Security Validation: Please enter a valid city name.');
      return;
    }
    if (cart.length === 0) {
      alert('Your shopping bag is empty.');
      return;
    }

    // All fields are valid! Open payment options modal.
    setShowPaymentModal(true);
  };

  // Step 2: Trigger UPI App Intent or QR verification
  const handleUpiAppPayment = (appType: string) => {
    const amount = calculateTotal();
    const payeeVpa = '7981658289@ybl';
    const payeeName = 'SB%20Jewels';
    const transactionNote = 'SB%20Jewels%20Order%20Payment';

    let finalUri = `upi://pay?pa=${payeeVpa}&pn=${payeeName}&am=${amount}&cu=INR&tn=${transactionNote}`;
    if (appType === 'phonepe') {
      finalUri = `phonepe://pay?pa=${payeeVpa}&pn=${payeeName}&am=${amount}&cu=INR&tn=${transactionNote}`;
    } else if (appType === 'gpay') {
      finalUri = `tez://upi/pay?pa=${payeeVpa}&pn=${payeeName}&am=${amount}&cu=INR&tn=${transactionNote}`;
    } else if (appType === 'paytm') {
      finalUri = `paytmmp://pay?pa=${payeeVpa}&pn=${payeeName}&am=${amount}&cu=INR&tn=${transactionNote}`;
    }

    window.location.href = finalUri;

    // Simulate completion and finalize order after app return
    setTimeout(() => {
      setShowPaymentModal(false);
      finalizeSuccessfulOrder();
    }, 3000);
  };

  const finalizeSuccessfulOrder = () => {
    const generatedId = 'SB-' + Math.floor(100000 + Math.random() * 900000);
    setOrderId(generatedId);
    setOrderPlaced(true);

    const newOrder = {
      orderId: generatedId,
      date: new Date().toLocaleDateString(),
      items: cart,
      total: calculateTotal(),
      customer: { name, phone, address: `${apartment}, ${city}, ${state}`, pincode },
      payment: { method: 'Direct UPI App', upiId: '7981658289@ybl' }
    };
    
    const existingOrders = JSON.parse(localStorage.getItem('sb_orders') || '[]');
    localStorage.setItem('sb_orders', JSON.stringify([newOrder, ...existingOrders]));
    localStorage.removeItem('sb_cart');

    const summaryText = 
      `*New Order Confirmed & Paid!* (${generatedId})\n\n` +
      `*Customer:* ${name}\n` +
      `*Phone:* +91 ${phone}\n` +
      `*Delivery Address:* ${apartment}, ${city}, ${state} - ${pincode}\n\n` +
      `*Total Amount:* ₹${calculateTotal().toLocaleString()}\n\n` +
      `Please process and dispatch my order!`;

    setTimeout(() => {
      window.open(`https://wa.me/917981658289?text=${encodeURIComponent(summaryText)}`, '_blank');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-gray-900 flex flex-col">
      <header className="bg-white py-4 px-6 md:px-12 shadow-sm border-b border-amber-100 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-10 h-10 rounded-full bg-amber-900 text-white flex items-center justify-center font-bold text-sm">SB</div>
          <div>
            <h1 className="text-sm font-extrabold tracking-wider text-amber-900">SB JEWELS</h1>
            <p className="text-[8px] text-amber-700 uppercase font-semibold">Instant UPI Checkout</p>
          </div>
        </div>

        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:text-amber-950 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </button>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10">
        {orderPlaced ? (
          <div className="bg-white rounded-3xl shadow-md border border-amber-100 p-8 md:p-12 text-center max-w-xl mx-auto space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-amber-950 mb-2">Order Paid & Confirmed!</h2>
              <p className="text-xs text-gray-500">Thank you for shopping with SB Jewels. Your order reference is <strong className="text-gray-800">{orderId}</strong>.</p>
            </div>
            
            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 text-xs text-left space-y-2">
              <p className="font-bold text-amber-950">Store Pickup / Delivery Address:</p>
              <p className="text-gray-600">Road No 10, Banjara Hills, Hyderabad, Telangana - 500004</p>
              <p className="text-[11px] text-emerald-700 font-semibold pt-1">✓ WhatsApp confirmation window has opened to notify our team instantly.</p>
            </div>

            <button
              onClick={() => router.push('/')}
              className="w-full bg-amber-900 hover:bg-amber-950 text-white font-bold py-3.5 rounded-xl text-xs transition shadow cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        ) : cart.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-amber-100 p-12 text-center max-w-md mx-auto space-y-4">
            <ShoppingBag className="w-12 h-12 text-amber-800 mx-auto opacity-50" />
            <h3 className="text-lg font-bold text-gray-900">Your Shopping Bag is Empty</h3>
            <p className="text-xs text-gray-500">Add exquisite 1g gold jewelry to your bag to proceed with secure checkout.</p>
            <button
              onClick={() => router.push('/')}
              className="bg-amber-900 text-white px-6 py-3 rounded-xl text-xs font-bold shadow hover:bg-amber-950 transition cursor-pointer"
            >
              Explore Collections
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-3xl shadow-sm border border-amber-100 p-6 md:p-8">
                <h3 className="text-lg font-extrabold text-amber-950 mb-6 pb-3 border-b border-gray-100 flex justify-between items-center">
                  <span>Your Shopping Bag Items</span>
                  <span className="text-xs bg-amber-100 text-amber-900 px-3 py-1 rounded-full font-semibold">
                    {cart.reduce((acc: number, item: any) => acc + (Number(item.quantity) || 1), 0)} items
                  </span>
                </h3>

                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                  {cart.map((item: any) => (
                    <div key={item.cartId} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50/40 border border-amber-100">
                      <div className="flex items-center gap-4">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl border border-amber-200 flex-shrink-0" />
                        ) : (
                          <div className="w-16 h-16 bg-amber-200 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold text-amber-900">Img</div>
                        )}
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                          <p className="text-[11px] text-gray-500">Size: <strong className="text-gray-700">{item.selectedSize}</strong> | Qty: {item.quantity}</p>
                          <p className="font-extrabold text-amber-950 text-sm mt-1">₹{Number(item.price).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="inline-flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm">
                          <button onClick={() => handleQuantityChange(item.cartId, -1)} className="px-3 py-1 text-gray-600 hover:bg-gray-100 font-bold text-xs cursor-pointer">-</button>
                          <span className="px-3 py-1 text-xs font-bold text-gray-900">{item.quantity}</span>
                          <button onClick={() => handleQuantityChange(item.cartId, 1)} className="px-3 py-1 text-gray-600 hover:bg-gray-100 font-bold text-xs cursor-pointer">+</button>
                        </div>

                        <button onClick={() => removeFromCart(item.cartId)} className="text-red-500 hover:text-red-700 p-2 cursor-pointer" title="Remove Item">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address Form */}
              <div className="bg-white rounded-3xl shadow-sm border border-amber-100 p-6 md:p-8 space-y-6">
                <h3 className="text-lg font-extrabold text-amber-950 pb-3 border-b border-gray-100 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-800" />
                  <span>Shipping Address</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      maxLength={30}
                      value={name}
                      onChange={handleNameChange}
                      placeholder="Enter letters only (e.g. Rahul)" 
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:border-amber-900 focus:outline-none bg-gray-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Phone Number (WhatsApp) *</label>
                    <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:border-amber-900 bg-gray-50/50">
                      <span className="bg-gray-100 px-3 py-3 text-xs font-bold text-gray-600 border-r border-gray-300">+91</span>
                      <input 
                        type="tel" 
                        maxLength={10} 
                        required 
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="9876543210" 
                        className="w-full text-xs p-3 focus:outline-none bg-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Pincode *</label>
                    <input 
                      type="text" 
                      maxLength={6} 
                      required 
                      value={pincode}
                      onChange={handlePincodeChange}
                      placeholder="500004" 
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:border-amber-900 focus:outline-none bg-gray-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Town/City *</label>
                    <input 
                      type="text" 
                      maxLength={20} 
                      required 
                      value={city}
                      onChange={handleCityChange}
                      placeholder="Hyderabad" 
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:border-amber-900 focus:outline-none bg-gray-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Flat, House no., Building, Company, Apartment *</label>
                  <input 
                    type="text" 
                    required 
                    maxLength={40}
                    value={apartment}
                    onChange={handleApartmentChange}
                    placeholder="Road No 10, Banjara Hills" 
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:border-amber-900 focus:outline-none bg-gray-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">State *</label>
                  <select 
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:border-amber-900 focus:outline-none bg-gray-50/50 font-medium"
                  >
                    <option value="Telangana">Telangana</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Col: Bill Details & Proceed Button */}
            <div className="bg-white rounded-3xl shadow-sm border border-amber-100 p-6 md:p-8 flex flex-col justify-between h-fit sticky top-24">
              <div className="space-y-5">
                <h3 className="text-base font-extrabold text-amber-950 pb-3 border-b border-gray-100">Bill Details</h3>
                
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Item Total ({cart.reduce((acc: number, item: any) => acc + (Number(item.quantity) || 1), 0)} items)</span>
                    <span className="font-bold text-gray-900">₹{calculateTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 pb-3 border-b border-gray-100">
                    <span>Delivery Fee</span>
                    <span className="text-emerald-600 font-bold">FREE</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 pb-4">
                  <span className="text-sm font-bold text-gray-900">Order Total:</span>
                  <span className="text-xl font-extrabold text-amber-950">₹{calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleProceedClick}
                  className="w-full bg-[#8B2500] hover:bg-[#6b1c00] text-white font-extrabold py-3.5 px-4 rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to UPI Payment</span>
                  <Smartphone className="w-4 h-4" />
                </button>
                
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>100% Secure Checkout</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* SECURE PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5 border border-amber-100">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-amber-950">Select UPI App</h3>
                <p className="text-[10px] text-gray-500">Payable: ₹{calculateTotal().toLocaleString()}</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleUpiAppPayment('phonepe')}
                className="w-full bg-[#5f259f] hover:bg-[#4d1d82] text-white font-extrabold py-3.5 px-4 rounded-xl text-xs transition shadow flex items-center justify-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Pay with PhonePe</span>
              </button>

              <button
                type="button"
                onClick={() => handleUpiAppPayment('gpay')}
                className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-extrabold py-3.5 px-4 rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>Pay with Google Pay</span>
              </button>

              <button
                type="button"
                onClick={() => handleUpiAppPayment('paytm')}
                className="w-full bg-[#00b9f1] hover:bg-[#009be1] text-white font-extrabold py-3.5 px-4 rounded-xl text-xs transition shadow flex items-center justify-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Pay with Paytm</span>
              </button>
            </div>

            {/* OR SCAN QR CODE FALLBACK */}
            <div className="pt-3 border-t border-gray-100 text-center space-y-2">
              <p className="text-[11px] font-bold text-gray-600">Or Scan QR Code via any UPI App:</p>
              <div className="w-32 h-32 bg-white p-2 rounded-xl border border-amber-300 shadow-sm mx-auto flex items-center justify-center overflow-hidden">
                <img src="/upi-qr.jpeg" alt="UPI QR" className="w-full h-full object-contain" />
              </div>
              <p className="text-[10px] text-gray-400">UPI ID: 7981658289@ybl</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}