'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, PlusCircle, Package, Trash2 } from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  
  const [adminProducts, setAdminProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states supporting 5 images & original price
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newOriginalPrice, setNewOriginalPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Haram');
  const [newImage1, setNewImage1] = useState('');
  const [newImage2, setNewImage2] = useState('');
  const [newImage3, setNewImage3] = useState('');
  const [newImage4, setNewImage4] = useState('');
  const [newImage5, setNewImage5] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = async () => {
    try {
      const sheetApiUrl = process.env.NEXT_PUBLIC_SHEET_URL;
      if (!sheetApiUrl) return;
      const res = await fetch(sheetApiUrl);
      const data = await res.json();
      setAdminProducts(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchInventory();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode === '1234') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect passcode! Try "1234"');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newName || !newPrice) return;

    setSubmitting(true);
    const newItem = {
      id: Date.now().toString(),
      name: newName,
      price: Number(newPrice),
      originalPrice: newOriginalPrice ? Number(newOriginalPrice) : '',
      category: newCategory,
      image1: newImage1,
      image2: newImage2,
      image3: newImage3,
      image4: newImage4,
      image5: newImage5,
      description: newDescription || 'Handcrafted gold-coated luxury jewelry piece.'
    };

    try {
      const sheetApiUrl = process.env.NEXT_PUBLIC_SHEET_URL;
      const response = await fetch(sheetApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });

      if (response.ok) {
        alert('Product successfully added to your Google Sheet with all images!');
        setNewName('');
        setNewPrice('');
        setNewOriginalPrice('');
        setNewImage1('');
        setNewImage2('');
        setNewImage3('');
        setNewImage4('');
        setNewImage5('');
        setNewDescription('');
        fetchInventory();
      } else {
        alert('Failed to save product to Google Sheet.');
      }
    } catch (error) {
      console.error('Error posting to sheet:', error);
      alert('An error occurred while connecting to the sheet.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    const itemName = item.name || item.Name;
    const confirmDelete = confirm(`Are you sure you want to delete "${itemName}"?`);
    if (!confirmDelete) return;

    try {
      const sheetApiUrl = process.env.NEXT_PUBLIC_SHEET_URL;
      const targetId = item.id || item.Id;
      
      const response = await fetch(`${sheetApiUrl}/id/${targetId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Product deleted successfully!');
        fetchInventory();
      } else {
        alert('Failed to delete from Google Sheet.');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('An error occurred during deletion.');
    }
  };

  return (
    <main className="min-h-screen bg-amber-50/30 text-gray-800 pb-16">
      <header className="bg-amber-950 text-amber-100 py-4 px-6 md:px-12 shadow-lg sticky top-0 z-50 flex justify-between items-center border-b border-amber-900">
        <Link href="/" className="inline-flex items-center gap-2 text-amber-200 hover:text-white text-xs transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </Link>
        <h1 className="text-lg font-bold text-amber-200">SB COLLECTIONS | Admin Dashboard</h1>
      </header>

      <div className="max-w-4xl mx-auto px-6 pt-12">
        {!isAuthenticated ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-amber-100 max-w-md mx-auto text-center">
            <div className="inline-flex bg-amber-100 text-amber-900 p-3 rounded-full mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-amber-950 mb-2">Restricted Access</h2>
            <p className="text-gray-500 text-xs mb-6">Please enter your admin passcode to manage inventory.</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode (Hint: 1234)"
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-amber-900 text-center tracking-widest"
              />
              <button 
                type="submit"
                className="w-full bg-amber-950 hover:bg-amber-900 text-amber-100 font-medium py-3 rounded-xl text-xs transition shadow-sm"
              >
                Login to Dashboard
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Add Product Form */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-amber-100">
              <h3 className="font-bold text-amber-950 text-base mb-4 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-900" />
                <span>Add New Item (Up to 5 Gallery Images)</span>
              </h3>

              <form onSubmit={handleAddProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input 
                  type="text" required value={newName} onChange={(e) => setNewName(e.target.value)}
                  placeholder="Item Name" className="text-xs p-3 rounded-xl border border-gray-300 focus:border-amber-900 focus:outline-none"
                />
                <input 
                  type="number" required value={newPrice} onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="Selling Price (₹)" className="text-xs p-3 rounded-xl border border-gray-300 focus:border-amber-900 focus:outline-none"
                />
                <input 
                  type="number" value={newOriginalPrice} onChange={(e) => setNewOriginalPrice(e.target.value)}
                  placeholder="Original Price for Discount (₹ e.g. 2499)" className="text-xs p-3 rounded-xl border border-gray-300 focus:border-amber-900 focus:outline-none"
                />
                <select 
                  value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                  className="text-xs p-3 rounded-xl border border-gray-300 focus:border-amber-900 focus:outline-none bg-white"
                >
                  <option value="Haram">Haram</option>
                  <option value="Chokers">Chokers</option>
                  <option value="Bangles">Bangles</option>
                  <option value="Vaddanam">Vaddanam</option>
                  <option value="Rings">Rings</option>
                  <option value="Earrings">Earrings</option>
                </select>

                <div className="sm:col-span-2 border-t border-gray-100 pt-4 mt-2">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Product Images (Paste Image URLs)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input type="url" value={newImage1} onChange={(e) => setNewImage1(e.target.value)} placeholder="Main Display Image URL (Image 1)" className="text-xs p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-amber-900" />
                    <input type="url" value={newImage2} onChange={(e) => setNewImage2(e.target.value)} placeholder="Gallery Image 2 URL" className="text-xs p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-amber-900" />
                    <input type="url" value={newImage3} onChange={(e) => setNewImage3(e.target.value)} placeholder="Gallery Image 3 URL" className="text-xs p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-amber-900" />
                    <input type="url" value={newImage4} onChange={(e) => setNewImage4(e.target.value)} placeholder="Gallery Image 4 URL" className="text-xs p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-amber-900" />
                    <input type="url" value={newImage5} onChange={(e) => setNewImage5(e.target.value)} placeholder="Gallery Image 5 URL" className="text-xs p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-amber-900 sm:col-span-2" />
                  </div>
                </div>

                <textarea 
                  value={newDescription} onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Product Description (e.g. Traditional 22K gold plated design...)" className="sm:col-span-2 text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-amber-900 h-24 mt-2"
                />

                <button 
                  type="submit" disabled={submitting}
                  className="sm:col-span-2 bg-amber-950 hover:bg-amber-900 text-amber-100 font-semibold py-3.5 rounded-xl text-xs transition shadow-md mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{submitting ? 'Publishing to Google Sheet...' : 'Publish Product to Google Sheet'}</span>
                </button>
              </form>
            </div>

            {/* Existing Inventory List */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-amber-100">
              <h3 className="font-bold text-amber-950 text-base mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-900" />
                <span>Live Google Sheet Inventory ({adminProducts.length})</span>
              </h3>

              {loading ? (
                <div className="text-center py-8 text-xs text-gray-500">Loading live sheet data...</div>
              ) : adminProducts.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-500">No products found in your sheet yet.</div>
              ) : (
                <div className="space-y-3">
                  {adminProducts.map((item, index) => {
                    const itemId = item.id || item.Id || index;
                    const itemName = item.name || item.Name || 'Unnamed Item';
                    const itemPrice = item.price || item.Price || 0;
                    const itemCat = item.category || item.Category || 'General';
                    const itemImg = item.image1 || item.image || item.Image || '';

                    return (
                      <div key={itemId} className="flex justify-between items-center p-3.5 rounded-2xl border border-amber-100 bg-amber-50/20">
                        <div className="flex items-center gap-3">
                          {itemImg ? (
                            <img src={itemImg} alt="" className="w-12 h-12 object-cover rounded-xl border border-amber-200" />
                          ) : (
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-[10px] text-amber-900">No Img</div>
                          )}
                          <div>
                            <h4 className="font-bold text-gray-900 text-xs">{itemName}</h4>
                            <p className="text-amber-900 font-extrabold text-xs mt-0.5">₹{Number(itemPrice).toLocaleString()} • <span className="text-gray-500 font-normal">{itemCat}</span></p>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleDelete(item)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </main>
  );
}