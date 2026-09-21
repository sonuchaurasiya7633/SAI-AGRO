'use client';

import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Upload, 
  X, 
  CheckCircle2, 
  Sparkles, 
  Image as ImageIcon,
  Loader2,
  Eye
} from 'lucide-react';

interface ProductItem {
  _id: string;
  name: string;
  slug: string;
  category: string;
  subCategory?: string;
  tagline: string;
  description: string;
  composition: string;
  targetCrops: string[];
  benefits: string[];
  dosageAndApplication: {
    foliarSpray?: string;
    dripIrrigation?: string;
    soilApplication?: string;
    seedTreatment?: string;
  };
  packagingSizes: string[];
  images: string[];
  isFeatured: boolean;
  inStock: boolean;
}

const defaultCategories = [
  'Bio-Fertilizers & Inoculants',
  'Plant Growth Regulators & Promoters',
  'Chelated Micronutrients',
  'Bio-Fungicides & Crop Protectors',
  'Soil Conditioners & Humic Formulations',
  'Specialty Bio-Granules',
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: defaultCategories[0],
    subCategory: '',
    tagline: '',
    description: '',
    composition: '',
    targetCropsStr: '',
    benefitsStr: '',
    foliarSpray: '',
    dripIrrigation: '',
    soilApplication: '',
    seedTreatment: '',
    packagingSizesStr: '',
    images: [] as string[],
    isFeatured: false,
    inStock: true,
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch('/api/products?limit=100');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: defaultCategories[0],
      subCategory: '',
      tagline: '',
      description: '',
      composition: '',
      targetCropsStr: 'Paddy, Wheat, Sugarcane, Vegetables',
      benefitsStr: 'Boosts plant vigor\nEnhances root absorption\nPrevents flower drop',
      foliarSpray: '2 ml per litre of water',
      dripIrrigation: '1 Litre per acre',
      soilApplication: '',
      seedTreatment: '',
      packagingSizesStr: '500 ml, 1 Litre, 5 Litres',
      images: [],
      isFeatured: true,
      inStock: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: ProductItem) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      category: prod.category,
      subCategory: prod.subCategory || '',
      tagline: prod.tagline || '',
      description: prod.description,
      composition: prod.composition || '',
      targetCropsStr: prod.targetCrops?.join(', ') || '',
      benefitsStr: prod.benefits?.join('\n') || '',
      foliarSpray: prod.dosageAndApplication?.foliarSpray || '',
      dripIrrigation: prod.dosageAndApplication?.dripIrrigation || '',
      soilApplication: prod.dosageAndApplication?.soilApplication || '',
      seedTreatment: prod.dosageAndApplication?.seedTreatment || '',
      packagingSizesStr: prod.packagingSizes?.join(', ') || '',
      images: prod.images || [],
      isFeatured: prod.isFeatured ?? false,
      inStock: prod.inStock ?? true,
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'sai_agro_products');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setFormData((prev) => ({
          ...prev,
          images: [data.url, ...prev.images],
        }));
      }
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: formData.name,
      category: formData.category,
      subCategory: formData.subCategory,
      tagline: formData.tagline,
      description: formData.description,
      composition: formData.composition,
      targetCrops: formData.targetCropsStr.split(',').map((s) => s.trim()).filter(Boolean),
      benefits: formData.benefitsStr.split('\n').map((s) => s.trim()).filter(Boolean),
      dosageAndApplication: {
        foliarSpray: formData.foliarSpray,
        dripIrrigation: formData.dripIrrigation,
        soilApplication: formData.soilApplication,
        seedTreatment: formData.seedTreatment,
      },
      packagingSizes: formData.packagingSizesStr.split(',').map((s) => s.trim()).filter(Boolean),
      images: formData.images,
      isFeatured: formData.isFeatured,
      inStock: formData.inStock,
    };

    try {
      let res;
      if (editingProduct) {
        res = await fetch(`/api/products/${editingProduct._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setIsModalOpen(false);
        fetchProducts();
      }
    } catch (err) {
      console.error('Error saving product:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts();
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!search.trim()) return true;
    return (
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.composition?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Product Formulations Management</h1>
          <p className="text-xs text-slate-400">Add, edit, upload images to Cloudinary, and manage live agricultural catalog.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg self-start sm:self-auto hover:scale-105 transition"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search products by name or active composition..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07170c] border border-emerald-900 text-white text-xs focus:border-lime-400 focus:outline-none"
        />
      </div>

      {/* Products Table */}
      <div className="glass-panel rounded-3xl border border-emerald-500/20 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-xs">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No products found. Click "Add New Product" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#040e07] border-b border-emerald-950 text-slate-400">
                  <th className="py-3 px-4">Image</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Active Formulation</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/60">
                {filteredProducts.map((prod) => (
                  <tr key={prod._id} className="hover:bg-emerald-950/30 transition">
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 rounded-xl bg-[#040e07] border border-emerald-900 p-1 flex items-center justify-center overflow-hidden">
                        {prod.images?.[0] ? (
                          <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-contain" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm">{prod.name}</div>
                      <div className="text-[11px] text-emerald-400 truncate max-w-[200px]">{prod.tagline}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-[11px] font-medium text-lime-300">
                        {prod.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 truncate max-w-[200px]">
                      {prod.composition || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      {prod.isFeatured ? (
                        <span className="text-lime-400 font-bold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> Yes
                        </span>
                      ) : (
                        <span className="text-slate-500">No</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 rounded-lg bg-emerald-950 text-lime-400 hover:bg-emerald-900 transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod._id)}
                          className="p-1.5 rounded-lg bg-red-950 text-red-400 hover:bg-red-900 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8 rounded-3xl glass-panel p-6 sm:p-8 border border-emerald-500/40 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-emerald-950 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleSaveProduct} className="space-y-5">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {editingProduct ? 'Edit Agricultural Product' : 'Add New Agricultural Formulation'}
                </h3>
                <p className="text-xs text-slate-400">Specify details, composition, dosage, and images.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs focus:border-lime-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs focus:border-lime-400 focus:outline-none"
                  >
                    {defaultCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tagline / Key Highlight</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="e.g. 100% Water Soluble EDTA Chelated Zinc"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs focus:border-lime-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Active Formulation / CFU</label>
                  <input
                    type="text"
                    value={formData.composition}
                    onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
                    placeholder="e.g. Bacillus megaterium (1 x 10^8 cells/ml)"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs focus:border-lime-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs focus:border-lime-400 focus:outline-none resize-none"
                />
              </div>

              {/* Dosage Fields */}
              <div className="p-4 rounded-2xl bg-[#040e07] border border-emerald-900 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-lime-400">
                  Dosage & Application Schedules
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Foliar Spray</label>
                    <input
                      type="text"
                      value={formData.foliarSpray}
                      onChange={(e) => setFormData({ ...formData, foliarSpray: e.target.value })}
                      placeholder="e.g. 2 ml per litre water"
                      className="w-full px-3 py-1.5 rounded-lg bg-[#07170c] border border-emerald-900 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Drip Fertigation</label>
                    <input
                      type="text"
                      value={formData.dripIrrigation}
                      onChange={(e) => setFormData({ ...formData, dripIrrigation: e.target.value })}
                      placeholder="e.g. 1L to 2L per acre"
                      className="w-full px-3 py-1.5 rounded-lg bg-[#07170c] border border-emerald-900 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Soil / Basal Application</label>
                    <input
                      type="text"
                      value={formData.soilApplication}
                      onChange={(e) => setFormData({ ...formData, soilApplication: e.target.value })}
                      placeholder="e.g. 2.5 kg mixed with 100 kg compost"
                      className="w-full px-3 py-1.5 rounded-lg bg-[#07170c] border border-emerald-900 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Seed Treatment</label>
                    <input
                      type="text"
                      value={formData.seedTreatment}
                      onChange={(e) => setFormData({ ...formData, seedTreatment: e.target.value })}
                      placeholder="e.g. 10 ml per kg seed"
                      className="w-full px-3 py-1.5 rounded-lg bg-[#07170c] border border-emerald-900 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Target Crops & Packaging */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Target Crops (Comma-separated)</label>
                  <input
                    type="text"
                    value={formData.targetCropsStr}
                    onChange={(e) => setFormData({ ...formData, targetCropsStr: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Packaging Sizes (Comma-separated)</label>
                  <input
                    type="text"
                    value={formData.packagingSizesStr}
                    onChange={(e) => setFormData({ ...formData, packagingSizesStr: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs"
                  />
                </div>
              </div>

              {/* Benefits Multiline */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Key Agronomic Benefits (One per line)</label>
                <textarea
                  rows={2}
                  value={formData.benefitsStr}
                  onChange={(e) => setFormData({ ...formData, benefitsStr: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs resize-none"
                />
              </div>

              {/* Image Upload to Cloudinary */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">Upload Product Image (Cloudinary Direct)</label>
                <div className="flex items-center gap-3">
                  <label className="px-4 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-lime-300 text-xs font-bold cursor-pointer flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>{uploadingImage ? 'Uploading to Cloudinary...' : 'Select File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-slate-400">{formData.images.length} images uploaded</span>
                </div>

                {formData.images.length > 0 && (
                  <div className="flex gap-2 flex-wrap pt-2">
                    {formData.images.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-xl border border-emerald-800 bg-[#040e07] p-1">
                        <img src={img} alt="img" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, images: formData.images.filter((_, idx) => idx !== i) })}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Flags */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-200">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded accent-lime-400"
                  />
                  <span>Show as Featured on Home Page</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-400 text-slate-950 font-bold text-sm shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
