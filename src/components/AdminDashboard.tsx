import { useState, useEffect } from 'react';
import { apiService, Product } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Plus, Pencil, Trash2, Loader2, Download, Search, Upload, Grid3X3, Table2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const PRODUCT_STATUS = ['In Stock', 'Out of Stock', 'Newly Added', 'Back in Stock'] as const;

type ProductStatus = typeof PRODUCT_STATUS[number];

interface ImportError {
  row: number;
  name: string;
  errors: string[];
}

type FormData = {
  name: string;
  category: string;
  quantity: number;
  status: ProductStatus;
  size: string;
  price: number;
  imageUrl: string;
  websiteUrl: string;
  launchDate: string;
  tags: string;
  ribbon: string;
  releasedBatch: string;
};

type EditableProduct = Omit<Product, 'tags'> & { tags?: string | string[] };

export function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<EditableProduct | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const itemsPerPage = 120; // 6 cards per row × 20 rows

  // Form State
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: '',
    quantity: 0,
    status: 'Newly Added',
    size: '',
    price: 0,
    imageUrl: '',
    websiteUrl: '',
    launchDate: '',
    tags: '',
    ribbon: '',
    releasedBatch: ''
  });

  // Fetch products on mount and set up polling
  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await apiService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      quantity: 0,
      status: 'Newly Added',
      size: '',
      price: 0,
      imageUrl: '',
      websiteUrl: '',
      launchDate: '',
      tags: '',
      ribbon: '',
      releasedBatch: ''
    });
    setEditingProduct(null);
  };

  // Add product
  const handleAddProduct = async () => {
    if (!formData.name || !formData.category || !formData.releasedBatch) {
      toast.error('Name, category, and released batch are required');
      return;
    }

    setIsLoading(true);
    try {
      await apiService.createProduct({
        name: formData.name,
        category: formData.category,
        quantity: formData.quantity || 0,
        status: formData.status,
        size: formData.size || '',
        price: formData.price || 0,
        imageUrl: formData.imageUrl || '',
        websiteUrl: formData.websiteUrl || '',
        launchDate: formData.launchDate || null,
        tags: formData.tags ? formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        ribbon: formData.ribbon || null,
        releasedBatch: formData.releasedBatch || null,
        updatedBy: localStorage.getItem('adminEmail') || 'admin'
      });

      toast.success('✅ Product added successfully');
      setIsAddDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error('Failed to add product');
      console.error('Add product error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update product
  const handleUpdateProduct = async () => {
    if (!editingProduct?._id) return;
    if (!editingProduct.name || !editingProduct.category || !editingProduct.releasedBatch) {
      toast.error('Name, category, and released batch are required');
      return;
    }

    setIsLoading(true);
    try {
      await apiService.updateProduct(editingProduct._id, {
        name: editingProduct.name,
        category: editingProduct.category,
        quantity: editingProduct.quantity || 0,
        status: editingProduct.status,
        size: editingProduct.size || '',
        price: editingProduct.price || 0,
        imageUrl: editingProduct.imageUrl || '',
        websiteUrl: editingProduct.websiteUrl || '',
        launchDate: editingProduct.launchDate || null,
        tags: typeof editingProduct.tags === 'string'
          ? editingProduct.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
          : editingProduct.tags ?? [],
        ribbon: editingProduct.ribbon || null,
        releasedBatch: editingProduct.releasedBatch || null,
        updatedBy: localStorage.getItem('adminEmail') || 'admin'
      });

      toast.success('✅ Product updated successfully');
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update product');
      console.error('Update product error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async () => {
    if (!productToDelete?._id) return;

    setIsLoading(true);
    try {
      await apiService.deleteProduct(productToDelete._id);
      toast.success('✅ Product deleted successfully');
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
      console.error('Delete product error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Bulk import from JSON/CSV
  const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportErrors([]);
    setImportProgress({ current: 0, total: 0 });

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        let data: any[] = [];

        if (file.name.endsWith('.json')) {
          data = JSON.parse(content);
        } else if (file.name.endsWith('.csv')) {
          const lines = content.split('\n').filter(l => l.trim());
          if (lines.length < 2) {
            toast.error('CSV file is empty or missing headers');
            setIsImporting(false);
            return;
          }
          const headers = lines[0].split(',').map(h => h.trim());
          data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            return headers.reduce((obj: any, header, i) => {
              obj[header] = values[i];
              return obj;
            }, {});
          });
        }

        if (!Array.isArray(data)) {
          toast.error('Invalid file format. Expected an array of products.');
          setIsImporting(false);
          return;
        }

        const errors: ImportError[] = [];
        let successCount = 0;
        setImportProgress({ current: 0, total: data.length });

        for (let i = 0; i < data.length; i++) {
          const item = data[i];
          const rowErrors: string[] = [];
          const rowNum = i + 1;

          if (!item.name) rowErrors.push('Missing product name');
          if (!item.category) rowErrors.push('Missing category');

          if (rowErrors.length > 0) {
            errors.push({ row: rowNum, name: item.name || `Row ${rowNum}`, errors: rowErrors });
            setImportProgress(prev => ({ ...prev, current: i + 1 }));
            continue;
          }

          try {
            const quantity = item.quantity ? parseInt(item.quantity) : 0;
            const price = item.price ? parseFloat(item.price) : 0;

            const productData = {
              name: String(item.name || '').trim(),
              category: String(item.category || '').trim(),
              quantity: isNaN(quantity) ? 0 : quantity,
              status: (item.status as ProductStatus) || 'Newly Added',
              size: String(item.size || '').trim(),
              price: isNaN(price) ? 0 : price,
              imageUrl: String(item.imageUrl || '').trim(),
              websiteUrl: String(item.websiteUrl || '').trim(),
              launchDate: item.launchDate ? String(item.launchDate).trim() : null,
              tags: item.tags ? (Array.isArray(item.tags) ? item.tags : String(item.tags).split(',').map(t => t.trim())) : [],
              ribbon: String(item.ribbon || '').trim() || null,
              releasedBatch: String(item.releasedBatch || '').trim() || null,
              updatedBy: 'bulk-import'
            };

            await apiService.createProduct(productData);
            successCount++;
          } catch (err) {
            errors.push({
              row: rowNum,
              name: item.name || `Row ${rowNum}`,
              errors: [`Database error: ${err instanceof Error ? err.message : 'Unknown error'}`]
            });
          }
          setImportProgress(prev => ({ ...prev, current: i + 1 }));
        }

        setImportErrors(errors);
        if (successCount > 0) {
          toast.success(`✅ Successfully imported ${successCount} products`);
        }
        if (errors.length > 0) {
          toast.error(`⚠️ Failed to import ${errors.length} items. Check the list.`);
        } else {
          setIsImportDialogOpen(false);
        }
        fetchProducts();
      } catch (error) {
        toast.error('Failed to parse file. Ensure it matches the required format.');
        console.error('Import error:', error);
      } finally {
        setIsImporting(false);
      }
    };

    if (file.name.endsWith('.json') || file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      toast.error('Please upload a .json or .csv file');
      setIsImporting(false);
    }
  };

  // Export to JSON
  const handleExport = () => {
    const dataStr = JSON.stringify(filteredProducts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `products-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`;
    link.click();
  };

  // Download sample templates
  const downloadSampleJSON = () => {
    const sample = [
      {
        name: 'Sample Product 1',
        category: 'Electronics',
        quantity: 50,
        status: 'In Stock',
        size: '10x5x2 inches',
        price: 299.99,
        imageUrl: 'https://via.placeholder.com/400',
        websiteUrl: 'https://example.com',
        launchDate: '2024-01-01',
        tags: 'New Arrival,Premium',
        ribbon: 'Sale',
        releasedBatch: 'Batch A'
      }
    ];
    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_products.json';
    a.click();
  };

  // Filter & paginate
  const uniqueCategories = Array.from(new Set(products.map(p => p.category))).sort();

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Calculate stats
  const stats = {
    total: products.length,
    inStock: products.filter(p => p.status === 'In Stock').length,
    outOfStock: products.filter(p => p.status === 'Out of Stock').length,
    categories: uniqueCategories.length
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      quantity: product.quantity || 0,
      status: product.status,
      size: product.size || '',
      price: product.price || 0,
      imageUrl: product.imageUrl || '',
      websiteUrl: product.websiteUrl || '',
      launchDate: product.launchDate || '',
      tags: product.tags ? product.tags.join(', ') : '',
      ribbon: product.ribbon || '',
      releasedBatch: product.releasedBatch || ''
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Compact Header with Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Inventory Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your products efficiently</p>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg px-4 py-3 text-center border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-xs text-gray-600 mt-1">Total Products</div>
            </div>
            <div className="bg-white rounded-lg px-4 py-3 text-center border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{stats.inStock}</div>
              <div className="text-xs text-gray-600 mt-1">In Stock</div>
            </div>
            <div className="bg-white rounded-lg px-4 py-3 text-center border border-gray-200">
              <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
              <div className="text-xs text-gray-600 mt-1">Out of Stock</div>
            </div>
            <div className="bg-white rounded-lg px-4 py-3 text-center border border-gray-200">
              <div className="text-2xl font-bold text-purple-600">{stats.categories}</div>
              <div className="text-xs text-gray-600 mt-1">Categories</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-3 items-center flex-1 min-w-0">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={(value) => {
              setSelectedCategory(value ?? 'all');
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories ({uniqueCategories.length})</SelectItem>
                {uniqueCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 items-center">
            <div className="flex gap-1 border border-gray-300 rounded-lg p-1 bg-gray-50">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                className="gap-1"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                className="gap-1"
                onClick={() => setViewMode('table')}
              >
                <Table2 className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={handleExport} variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>

            {/* Add Product Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger>
                <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4">
                  <div className="space-y-4 pr-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Name *</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Product name"
                        />
                      </div>
                      <div>
                        <Label>Category *</Label>
                        <Input
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          placeholder="Category"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label>Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Status</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as ProductStatus })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCT_STATUS.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Size</Label>
                      <Input value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} />
                    </div>

                    <div>
                      <Label>Image URL</Label>
                      <Input value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} />
                    </div>

                    <div>
                      <Label>Website URL</Label>
                      <Input value={formData.websiteUrl} onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })} />
                    </div>

                    <div>
                      <Label>Launch Date</Label>
                      <Input type="date" value={formData.launchDate} onChange={(e) => setFormData({ ...formData, launchDate: e.target.value })} />
                    </div>

                    <div>
                      <Label>Tags (comma-separated)</Label>
                      <Input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Ribbon</Label>
                        <Input value={formData.ribbon} onChange={(e) => setFormData({ ...formData, ribbon: e.target.value })} />
                      </div>
                      <div>
                        <Label>Released Batch *</Label>
                        {/* @ts-ignore */}
                        <Select value={formData.releasedBatch || ''} onValueChange={(value) => setFormData({ ...formData, releasedBatch: value })}>
                          <SelectTrigger className="border-orange-300 focus-visible:ring-orange-500">
                            <SelectValue placeholder="Select a batch" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Batch 1">Batch 1</SelectItem>
                            <SelectItem value="Batch 2">Batch 2</SelectItem>
                            <SelectItem value="Batch 3">Batch 3</SelectItem>
                            <SelectItem value="Batch 4">Batch 4</SelectItem>
                            <SelectItem value="Batch 5">Batch 5</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddProduct} disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Bulk Import Dialog */}
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger>
                <Button size="sm" variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Bulk Import Products</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {!isImporting && importErrors.length === 0 && (
                    <div className="space-y-4">
                      <div className="p-6 border-2 border-dashed rounded-lg text-center space-y-4">
                        <div className="flex justify-center text-muted-foreground">
                          <Upload className="h-10 w-10" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Upload JSON or CSV file</p>
                          <p className="text-xs text-muted-foreground">Required: name, category</p>
                        </div>
                        <Input
                          type="file"
                          accept=".json,.csv"
                          onChange={handleBulkImport}
                          className="cursor-pointer"
                        />
                      </div>
                      <Button variant="outline" size="sm" onClick={downloadSampleJSON} className="w-full">
                        Download Sample JSON
                      </Button>
                    </div>
                  )}

                  {isImporting && (
                    <div className="py-8 flex flex-col items-center justify-center space-y-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <div className="text-center space-y-2">
                        <p className="text-sm font-semibold">Importing...</p>
                        <p className="text-xs text-muted-foreground">
                          {importProgress.current} of {importProgress.total}
                        </p>
                      </div>
                    </div>
                  )}

                  {importErrors.length > 0 && (
                    <ScrollArea className="max-h-96">
                      <div className="space-y-2">
                        {importErrors.map((err, i) => (
                          <div key={i} className="p-2 bg-red-50 border border-red-200 rounded text-xs">
                            <p className="font-semibold text-red-700">Row {err.row}: {err.name}</p>
                            <ul className="ml-2 text-red-600">
                              {err.errors.map((e, j) => (
                                <li key={j}>• {e}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={() => setIsImportDialogOpen(false)}>
                    {importErrors.length > 0 ? 'Close' : 'Done'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* GRID VIEW - 6 columns */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map(product => (
              <Card key={product._id} className="hover:shadow-md transition-all hover:scale-105 group overflow-hidden">
                {/* Product Image */}
                {product.imageUrl ? (
                  <div className="relative h-32 bg-gray-100 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image';
                      }}
                    />
                    {product.ribbon && (
                      <div className="absolute -top-2 -right-8 bg-red-500 text-white text-xs font-bold px-10 py-1 transform rotate-45">
                        {product.ribbon}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-32 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                    No Image
                  </div>
                )}

                <CardContent className="p-3 space-y-2">
                  {/* Product Name - Highlighted */}
                  <div>
                    <h3 className="font-bold text-sm line-clamp-3 text-gray-900 hover:text-blue-600 break-words">
                      {product.name}
                    </h3>
                  </div>

                  {/* Category Badge */}
                  <div className="flex items-center justify-between gap-1">
                    <Badge variant="outline" className="text-xs">{product.category}</Badge>
                    <Badge
                      variant={product.status === 'In Stock' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {product.status}
                    </Badge>
                  </div>

                  {/* Price */}
                  <div className="text-sm">
                    <p className="font-bold text-green-600">₹{product.price?.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">
                      Weight: {product.quantity ? `${product.quantity} g` : 'N/A'}
                    </p>
                  </div>

                  {/* Released Batch - Description area */}
                  <div className="bg-gradient-to-r from-orange-100 to-orange-50 rounded p-2 border border-orange-200">
                    <p className="text-xs font-semibold text-orange-900">
                      🏷️ {product.releasedBatch || 'Not specified'}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-1 pt-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1 h-7 text-xs"
                      onClick={() => {
                        if (product.websiteUrl) {
                          window.open(product.websiteUrl, '_blank');
                        }
                      }}
                      disabled={!product.websiteUrl}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs"
                      onClick={() => openEditDialog(product)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 h-7 text-xs"
                      onClick={() => {
                        setProductToDelete(product);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100 hover:bg-gray-100">
                <TableHead className="font-bold">Product Name</TableHead>
                <TableHead className="font-bold">Category</TableHead>
                <TableHead className="font-bold text-right">Quantity</TableHead>
                <TableHead className="font-bold text-right">Price</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold text-center">Released Batch</TableHead>
                <TableHead className="font-bold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map(product => (
                  <TableRow key={product._id} className="hover:bg-gray-50">
                    <TableCell className="font-medium max-w-xs truncate">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right">{product.quantity}</TableCell>
                    <TableCell className="text-right">₹{product.price?.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={product.status === 'In Stock' ? 'default' : 'secondary'}>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {product.releasedBatch || 'Not specified'}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-1 justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setProductToDelete(product);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <p className="text-lg font-medium">No products found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-muted-foreground">Page {currentPage} of {totalPages} • Showing {paginatedProducts.length} of {filteredProducts.length} products</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4 pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Input
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={editingProduct.quantity || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, quantity: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingProduct.price || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select value={editingProduct.status} onValueChange={(value) => setEditingProduct({ ...editingProduct, status: (value ?? 'Newly Added') as ProductStatus })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_STATUS.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Size</Label>
                  <Input value={editingProduct.size || ''} onChange={(e) => setEditingProduct({ ...editingProduct, size: e.target.value })} />
                </div>

                <div>
                  <Label>Image URL</Label>
                  <Input value={editingProduct.imageUrl || ''} onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })} />
                </div>

                <div>
                  <Label>Website URL</Label>
                  <Input value={editingProduct.websiteUrl || ''} onChange={(e) => setEditingProduct({ ...editingProduct, websiteUrl: e.target.value })} />
                </div>

                <div>
                  <Label>Launch Date</Label>
                  <Input
                    type="date"
                    value={editingProduct.launchDate || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, launchDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Tags (comma-separated)</Label>
                  <Input
                    value={typeof editingProduct.tags === 'string' ? editingProduct.tags : (editingProduct.tags?.join(', ') || '')}
                    onChange={(e) => setEditingProduct({ ...editingProduct, tags: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Ribbon</Label>
                    <Input value={editingProduct.ribbon || ''} onChange={(e) => setEditingProduct({ ...editingProduct, ribbon: e.target.value })} />
                  </div>
                  <div>
                    <Label>Released Batch *</Label>
                    {/* @ts-ignore */}
                    <Select value={editingProduct.releasedBatch || ''} onValueChange={(value) => setEditingProduct({ ...editingProduct, releasedBatch: value })}>
                      <SelectTrigger className="border-orange-300 focus-visible:ring-orange-500">
                        <SelectValue placeholder="Select a batch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Batch 1">Batch 1</SelectItem>
                        <SelectItem value="Batch 2">Batch 2</SelectItem>
                        <SelectItem value="Batch 3">Batch 3</SelectItem>
                        <SelectItem value="Batch 4">Batch 4</SelectItem>
                        <SelectItem value="Batch 5">Batch 5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateProduct} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete "<strong>{productToDelete?.name}</strong>"? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteProduct} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
