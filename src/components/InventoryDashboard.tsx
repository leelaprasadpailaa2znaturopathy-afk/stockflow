import { useState, useEffect } from 'react';
import { apiService, Product } from '../services/api';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Search, Grid3X3, Table2, RefreshCw, Ribbon, Download } from 'lucide-react';
import { toast } from 'sonner';

export function InventoryDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [loading, setLoading] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(30);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await apiService.getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    const interval = setInterval(fetchProducts, 5000);
    return () => clearInterval(interval);
  }, []);

  const uniqueCategories = Array.from(new Set(products.map((product) => product.category))).sort();

  const filteredProducts = products.filter((product) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower);
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    total: products.length,
    inStock: products.filter((product) => product.status === 'In Stock').length,
    outOfStock: products.filter((product) => product.status === 'Out of Stock').length,
    categories: uniqueCategories.length,
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(filteredProducts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `products-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('✅ Products exported as JSON');
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Category', 'Quantity', 'Price', 'Status', 'ReleasedBatch'];
    const rows = filteredProducts.map(p => [
      p.name,
      p.category,
      p.quantity,
      p.price?.toFixed(2) || '0.00',
      p.status,
      p.releasedBatch || 'Not specified'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `products-${new Date().getTime()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('✅ Products exported as CSV');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <RefreshCw className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      <div className="rounded-3xl bg-gradient-to-r from-sky-50 via-white to-indigo-50 border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Inventory Dashboard</h1>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-4">
            <div className="rounded-2xl bg-white p-4 text-center shadow-sm border border-slate-200">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Total</div>
              <div className="mt-2 text-2xl font-semibold text-sky-700">{stats.total}</div>
            </div>
            <div className="rounded-2xl bg-white p-4 text-center shadow-sm border border-slate-200">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">In stock</div>
              <div className="mt-2 text-2xl font-semibold text-emerald-600">{stats.inStock}</div>
            </div>
            <div className="rounded-2xl bg-white p-4 text-center shadow-sm border border-slate-200">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Out of stock</div>
              <div className="mt-2 text-2xl font-semibold text-rose-600">{stats.outOfStock}</div>
            </div>
            <div className="rounded-2xl bg-white p-4 text-center shadow-sm border border-slate-200">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Categories</div>
              <div className="mt-2 text-2xl font-semibold text-violet-600">{stats.categories}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center md:flex-row md:gap-4 lg:gap-4">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by product or category..."
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={(value) => {
              setSelectedCategory(value ?? 'all');
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories ({uniqueCategories.length})</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={itemsPerPage.toString()} onValueChange={(value) => {
              setItemsPerPage(parseInt(value ?? '30'));
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Items per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 per page</SelectItem>
                <SelectItem value="30">30 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="75">75 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="mr-2 h-4 w-4" /> Grid
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              onClick={() => setViewMode('table')}
            >
              <Table2 className="mr-2 h-4 w-4" /> Table
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportJSON}
              className="gap-2"
            >
              <Download className="h-4 w-4" /> JSON
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportCSV}
              className="gap-2"
            >
              <Download className="h-4 w-4" /> CSV
            </Button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm overflow-hidden">
          <style>{`
            .products-scroll::-webkit-scrollbar {
              width: 8px;
            }
            .products-scroll::-webkit-scrollbar-track {
              background: #f1f5f9;
              border-radius: 10px;
            }
            .products-scroll::-webkit-scrollbar-thumb {
              background: #cbd5e1;
              border-radius: 10px;
            }
            .products-scroll::-webkit-scrollbar-thumb:hover {
              background: #94a3b8;
            }
          `}</style>
          <div className="products-scroll max-h-[800px] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 pr-2">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => (
                  <Card 
                    key={product._id ?? product.name} 
                    className="overflow-hidden transition hover:shadow-lg hover:-translate-y-1 flex flex-col h-full p-0"
                  >
                    {/* Image container with ribbon overlay */}
                    <div className="relative h-56 bg-slate-100 overflow-hidden flex-shrink-0 m-0">
                      {/* Ribbon Badge */}
                      {product.ribbon && (
                        <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          <Ribbon className="h-3 w-3" />
                          {product.ribbon}
                        </div>
                      )}
                      
                      {/* Product Image */}
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-300 hover:scale-105"
                          onError={(event) => {
                            event.currentTarget.src = 'https://via.placeholder.com/300x300?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400 text-center text-xs px-2">
                          No Image Available
                        </div>
                      )}
                    </div>

                    {/* Content Container */}
                    <CardContent className="space-y-2.5 p-3 flex-grow flex flex-col justify-between mt-0">
                      {/* Product Name - Highlighted */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-3 break-words bg-yellow-100 px-2 py-1.5 rounded-lg border-2 border-yellow-300">
                          {product.name}
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 font-medium">{product.category}</p>
                      </div>

                      {/* Status and Price */}
                      <div className="flex items-center justify-between gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs font-semibold ${
                            product.status === 'In Stock' 
                              ? 'bg-green-50 text-green-700 border-green-300' 
                              : 'bg-red-50 text-red-700 border-red-300'
                          }`}
                        >
                          {product.status}
                        </Badge>
                        <span className="text-sm font-bold text-slate-900">₹{product.price?.toFixed(2) ?? '0.00'}</span>
                      </div>

                      {/* Released Batch - Orange Highlighted */}
                      <div className="rounded-lg bg-orange-100 px-2.5 py-1.5 text-xs border-2 border-orange-400">
                        <span className="font-bold text-orange-900">Batch:</span>
                        <span className="text-orange-900 ml-1 font-semibold">{product.releasedBatch || 'Not specified'}</span>
                      </div>

                      {/* Weight */}
                      <p className="text-xs text-slate-600 font-medium">
                        Weight: <span className="font-bold">{product.quantity ? `${product.quantity} g` : 'N/A'}</span>
                      </p>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full"
                        onClick={() => {
                          if (product.websiteUrl) {
                            window.open(product.websiteUrl, '_blank');
                          }
                        }}
                        disabled={!product.websiteUrl}
                      >
                        View
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
                  <p className="text-lg font-semibold">No products found</p>
                  <p className="mt-2 text-sm">Adjust search or category filters to see results.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Weight (g)</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead className="text-center">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((product) => (
                <TableRow key={product._id ?? product.name}>
                  <TableCell className="max-w-[180px] truncate">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right">{product.quantity ? `${product.quantity} g` : 'N/A'}</TableCell>
                  <TableCell className="text-right">₹{product.price?.toFixed(2) ?? '0.00'}</TableCell>
                  <TableCell>
                    <Badge variant={product.status === 'In Stock' ? 'default' : 'secondary'} className="text-xs">
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{product.releasedBatch || 'Not specified'}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        if (product.websiteUrl) {
                          window.open(product.websiteUrl, '_blank');
                        }
                      }}
                      disabled={!product.websiteUrl}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 rounded-3xl bg-white border border-slate-200 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
