'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, Trash2, Plus, Edit3, RefreshCw, X, Check } from 'lucide-react';

interface Product {
  id?: string;
  Id?: string;
  name?: string;
  Name?: string;
  price?: number | string;
  Price?: number | string;
  category?: string;
  Category?: string;
  stock?: number | string;
  Stock?: number | string;
  image1?: string;
  Image?: string;
  description?: string;
  Description?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const categoriesList = ['Necklace Sets', 'Mangalsutra', 'Bangles', 'Chains', 'Rings', 'Earrings'];

  // Add Product form states (1 Image)
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Necklace Sets');
  const [newStock, setNewStock] = useState('15');
  const [img1, setImg1] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Product Modal states (1 Image)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState('Necklace Sets');
  const [editStock, setEditStock] = useState('15');
  const [editImg1, setEditImg1] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '1234') {
      setIsAuthenticated(true);
      fetchAdminData();
    } else {
      setErrorMsg('Incorrect passcode. Hint: 1234');
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const sheetUrl = process.env.NEXT_PUBLIC_SHEET_URL || '';
      if (sheetUrl) {
        const res = await fetch(sheetUrl);
        const data = await res.json();
        if (Array.isArray(data)) setProducts(data);
      }

      const ordersUrl = process.env.NEXT_PUBLIC_ORDERS_SHEET_URL || '';
      if (ordersUrl) {
        const resOrders = await fetch(ordersUrl);
        const dataOrders = await resOrders.json();
        if (Array.isArray(dataOrders)) setOrders(dataOrders);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice) {
      setErrorMsg('Please fill in product name and price.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    const newProduct = {
      id: 'SBJ-' + Date.now().toString().slice(-4),
      name: newName,
      price: Number(newPrice),
      category: newCategory,
      stock: Number(newStock) || 15,
      image1: img1 || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop',
      description: newDesc || 'Exquisite 1g gold-plated jewelry piece.'
    };

    try {
      const sheetUrl = process.env.NEXT_PUBLIC_SHEET_URL || '';
      if (sheetUrl) {
        await fetch(sheetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProduct)
        });
      }

      setProducts([newProduct, ...products]);
      setSuccessMsg('Product added successfully!');
      setNewName('');
      setNewPrice('');
      setImg1('');
      setNewDesc('');
      fetchAdminData();
    } catch (err) {
      setErrorMsg('Failed to add product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditProduct = (p: Product) => {
    setEditingProduct(p);
    setEditName(p.name || p.Name || '');
    setEditPrice(String(p.price || p.Price || ''));
    setEditCategory(p.category || p.Category || 'Necklace Sets');
    setEditStock(String(p.stock || p.Stock || '15'));
    setEditImg1(p.image1 || p.Image || '');
    setEditDesc(p.description || p.Description || '');
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const pId = editingProduct.id || editingProduct.Id;
    const updatedData = {
      name: editName,
      price: Number(editPrice),
      category: editCategory,
      stock: Number(editStock),
      image1: editImg1,
      description: editDesc
    };

    try {
      const sheetUrl = process.env.NEXT_PUBLIC_SHEET_URL || '';
      if (sheetUrl) {
        await fetch(`${sheetUrl}/id/${pId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData)
        });
      }

      setProducts(products.map(p => String(p.id || p.Id) === String(pId) ? { ...p, ...updatedData } : p));
      setSuccessMsg('Product updated successfully!');
      setEditingProduct(null);
      fetchAdminData();
    } catch (err) {
      setErrorMsg('Failed to update product.');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const sheetUrl = process.env.NEXT_PUBLIC_SHEET_URL || '';
      if (sheetUrl) {
        await fetch(`${sheetUrl}/id/${productId}`, {
          method: 'DELETE'
        });
      }

      setProducts(products.filter(p => String(p.id || p.Id) !== String(productId)));
      setSuccessMsg('Product deleted successfully.');
    } catch (err) {
      setErrorMsg('Failed to delete product.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-amber-100 max-w-sm w-full space-y-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-900 rounded-2xl flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-extrabold text-center text-amber-950">Admin Portal</h2>
          <form onSubmit={handleLogin} className="space-y-3">
            <input 
              type="password"
              required
              value={passcode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasscode(e.target.value)}
              placeholder="Enter passcode (Hint: 1234)"
              className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-amber-900 text-center font-bold"
            />
            {errorMsg && <p className="text-[11px] text-red-600 font-semibold text-center">{errorMsg}</p>}
            <button
              type="submit"
              className="w-full bg-amber-900 hover:bg-amber-950 text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer shadow"
            >
              Login to Dashboard
            </button>
          </form>
          <button onClick={() => router.push('/')} className="w-full text-center text-xs text-amber-900 font-semibold pt-2 cursor-pointer">
            Back to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-gray-800 p-4 md:p-8 relative" suppressHydrationWarning>
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-amber-100">
          <button onClick={() => router.push('/')} className="inline-flex items-center gap-2 text-xs font-bold text-amber-900 cursor-pointer">
            <ArrowLeft className="w-4 h-4" /><span>Back to Store</span>
          </button>
          <h1 className="text-sm md:text-base font-extrabold text-amber-950">SB Jewels Admin Dashboard</h1>
          <button onClick={fetchAdminData} className="flex items-center gap-1 bg-amber-50 text-amber-900 px-3.5 py-2 rounded-xl text-xs font-bold border border-amber-200 cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /><span>Refresh</span>
          </button>
        </header>

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs font-bold text-center">
            {successMsg}
          </div>
        )}

        {/* ADD PRODUCT SECTION (1 IMAGE INPUT) */}
        <div className="bg-white rounded-3xl shadow-sm border border-amber-100 p-6 md:p-8 space-y-4">
          <h2 className="text-sm font-extrabold text-amber-950 pb-2 border-b border-gray-100 flex items-center gap-2">
            <Plus className="w-4 h-4" /><span>Add New Jewelry Product</span>
          </h2>
          
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Product Name</label>
              <input 
                type="text" 
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Royal Gold Necklace Set"
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-amber-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Price (₹)</label>
              <input 
                type="number" 
                required
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="1499"
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-amber-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
              <select 
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-amber-900 bg-white"
              >
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Stock Quantity</label>
              <input 
                type="number" 
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-amber-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">Image URL</label>
              <input 
                type="url" 
                value={img1} 
                onChange={(e) => setImg1(e.target.value)} 
                placeholder="https://images.unsplash.com/..." 
                className="w-full text-xs p-3 rounded-xl border border-gray-300" 
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
              <textarea 
                rows={2}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Enter item description..."
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-amber-900"
              />
            </div>

            <div className="md:col-span-3 pt-2">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-amber-900 hover:bg-amber-950 text-white font-extrabold px-6 py-3 rounded-xl text-xs shadow transition cursor-pointer"
              >
                {isSubmitting ? 'Adding Product...' : 'Add Product to Inventory'}
              </button>
            </div>
          </form>
        </div>

        {/* CUSTOMER ORDERS */}
        <div className="bg-white rounded-3xl shadow-sm border border-amber-100 p-6 md:p-8 space-y-4">
          <h2 className="text-sm font-extrabold text-amber-950 pb-2 border-b border-gray-100">Customer Orders ({orders.length})</h2>
          {orders.length === 0 ? (
            <p className="text-xs text-gray-500 py-4 text-center">No orders recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-amber-50 text-amber-950 border-b border-amber-100">
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Items</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((ord: any, idx: number) => (
                    <tr key={idx} className="hover:bg-amber-50/30">
                      <td className="p-3 font-bold text-amber-900">{ord.OrderId}</td>
                      <td className="p-3 font-semibold">{ord.CustomerName}</td>
                      <td className="p-3">{ord.Phone}</td>
                      <td className="p-3 max-w-xs truncate">{ord.Items}</td>
                      <td className="p-3 font-extrabold">₹{Number(ord.TotalAmount).toLocaleString()}</td>
                      <td className="p-3"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[10px]">{ord.Status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* INVENTORY MANAGEMENT */}
        <div className="bg-white rounded-3xl shadow-sm border border-amber-100 p-6 md:p-8 space-y-4">
          <h2 className="text-sm font-extrabold text-amber-950 pb-2 border-b border-gray-100">Manage Inventory ({products.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((p: Product, idx: number) => {
              const pId = p.id || p.Id || idx;
              const pName = p.name || p.Name;
              const pPrice = p.price || p.Price;
              const pImage = p.image1 || p.Image;
              const pCat = p.category || p.Category;

              return (
                <div key={pId} className="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={pImage} alt={pName} className="w-12 h-12 rounded-xl object-cover border flex-shrink-0" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs truncate">{pName}</h4>
                      <p className="text-[10px] text-amber-800 font-semibold">{pCat}</p>
                      <p className="text-[11px] font-extrabold text-amber-950 mt-0.5">₹{Number(pPrice).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => startEditProduct(p)} className="text-amber-900 hover:text-amber-950 p-2 cursor-pointer" title="Edit">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteProduct(String(pId))} className="text-red-500 hover:text-red-700 p-2 cursor-pointer" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* EDIT PRODUCT MODAL (1 IMAGE) */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" suppressHydrationWarning>
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-4 border border-amber-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-base font-extrabold text-amber-950">Edit Product</h3>
              <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Product Name</label>
                <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full text-xs p-3 rounded-xl border border-gray-300" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Price (₹)</label>
                  <input type="number" required value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-full text-xs p-3 rounded-xl border border-gray-300" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white">
                    {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Stock Quantity</label>
                <input type="number" value={editStock} onChange={(e) => setEditStock(e.target.value)} className="w-full text-xs p-3 rounded-xl border border-gray-300" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Image URL</label>
                <input type="url" value={editImg1} onChange={(e) => setEditImg1(e.target.value)} className="w-full text-xs p-3 rounded-xl border border-gray-300" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea rows={2} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="w-full text-xs p-3 rounded-xl border border-gray-300" />
              </div>

              <div className="pt-2 flex gap-3">
                <button type="submit" className="flex-1 bg-amber-900 hover:bg-amber-950 text-white font-extrabold py-3 rounded-xl text-xs shadow cursor-pointer">Save Changes</button>
                <button type="button" onClick={() => setEditingProduct(null)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-3 rounded-xl text-xs cursor-pointer">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}