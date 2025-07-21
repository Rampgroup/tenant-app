import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Edit2, Save, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Product {
  id: number;
  product_name: string;
  domain_type: string;
  price: string;
  qty: string;
  tenant_id: string;
  vendor_id?: string;
  image?: {
    doc_name: string;
    doc_body: string;
  };
}

interface Tenant {
  tenant_id: string;
  vendor_id?: string;
  tenant_name: string;
  domain: string;
  app_type: string;
}

const TenantManagementPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const tenant: Tenant = location.state?.tenant;
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuantity, setEditingQuantity] = useState<{ [key: number]: boolean }>({});
  const [tempQuantities, setTempQuantities] = useState<{ [key: number]: string }>({});
  
  const [newProduct, setNewProduct] = useState({
    product_name: "",
    domain_type: "",
    price: "",
    qty: "",
    image: {
      doc_name: "",
      doc_body: ""
    }
  });

  useEffect(() => {
    if (tenant) {
      loadProducts();
    }
  }, [tenant]);

  const loadProducts = async () => {
    // For now, load from localStorage. In production, this would be an API call
    const storedProducts = JSON.parse(localStorage.getItem(`products_${tenant.tenant_id}`) || '[]');
    setProducts(storedProducts);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setNewProduct(prev => ({
          ...prev,
          image: {
            doc_name: file.name,
            doc_body: base64String
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProduct.product_name || !newProduct.domain_type || !newProduct.price || !newProduct.qty) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      domain_type: newProduct.domain_type,
      product_name: newProduct.product_name,
      price: newProduct.price,
      qty: newProduct.qty,
      tenant_id: tenant.tenant_id,
      vendor_id: tenant.vendor_id,
      image: newProduct.image
    };

    console.log('Payload being sent to Lambda:', JSON.stringify(payload, null, 2));

    try {
      const response = await fetch('https://m2fa6mzwo4.execute-api.ca-central-1.amazonaws.com/multi_tenant/food_products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const productWithId = {
          ...payload,
          id: Date.now() // Temporary ID generation
        };
        
        // Also save to localStorage for local management
        const storedProducts = JSON.parse(localStorage.getItem(`products_${tenant.tenant_id}`) || '[]');
        const updatedProducts = [...storedProducts, productWithId];
        localStorage.setItem(`products_${tenant.tenant_id}`, JSON.stringify(updatedProducts));
        
        setProducts(updatedProducts);
        setNewProduct({
          product_name: "",
          domain_type: "",
          price: "",
          qty: "",
          image: { doc_name: "", doc_body: "" }
        });
        setIsModalOpen(false);

        toast({
          title: "Success!",
          description: "Product has been added successfully",
        });
      } else {
        throw new Error('Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleQuantityEdit = (productId: number, currentQty: string) => {
    setEditingQuantity(prev => ({ ...prev, [productId]: true }));
    setTempQuantities(prev => ({ ...prev, [productId]: currentQty }));
  };

  const handleQuantitySave = (productId: number) => {
    const newQty = tempQuantities[productId];
    const updatedProducts = products.map(p => 
      p.id === productId ? { ...p, qty: newQty } : p
    );
    
    setProducts(updatedProducts);
    localStorage.setItem(`products_${tenant.tenant_id}`, JSON.stringify(updatedProducts));
    setEditingQuantity(prev => ({ ...prev, [productId]: false }));
    
    toast({
      title: "Updated",
      description: "Quantity has been updated successfully",
    });
  };

  const handleQuantityCancel = (productId: number) => {
    setEditingQuantity(prev => ({ ...prev, [productId]: false }));
    setTempQuantities(prev => {
      const { [productId]: _, ...rest } = prev;
      return rest;
    });
  };

  const getDomainColor = (domain: string) => {
    switch (domain.toLowerCase()) {
      case 'farming': return 'bg-green-100 text-green-800';
      case 'pharma': return 'bg-blue-100 text-blue-800';
      case 'groceries': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!tenant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="p-6">
          <CardContent>
            <p className="text-center text-gray-600">No tenant information found.</p>
            <Button onClick={() => navigate('/')} className="mt-4 w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">Tenant Management</h1>
            <p className="text-lg text-gray-600">{tenant.tenant_name} - {tenant.tenant_id}</p>
          </div>

          {tenant.app_type === 'Vendor' && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="productImage">Upload Image</Label>
                    <Input
                      id="productImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="border-gray-300"
                    />
                    {newProduct.image.doc_body && (
                      <div className="mt-2">
                        <img src={newProduct.image.doc_body} alt="Preview" className="w-20 h-20 object-cover rounded" />
                        <p className="text-xs text-gray-500 mt-1">{newProduct.image.doc_name}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name *</Label>
                    <Input
                      id="productName"
                      value={newProduct.product_name}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, product_name: e.target.value }))}
                      placeholder="Enter product name"
                      className="border-gray-300"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="domainType">Domain Type *</Label>
                    <Select 
                      value={newProduct.domain_type} 
                      onValueChange={(value) => setNewProduct(prev => ({ ...prev, domain_type: value }))}
                    >
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select domain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Farming">Farming</SelectItem>
                        <SelectItem value="Pharma">Pharma</SelectItem>
                        <SelectItem value="Groceries">Groceries</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="Enter price"
                      className="border-gray-300"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="qty">Quantity *</Label>
                    <Input
                      id="qty"
                      type="number"
                      value={newProduct.qty}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, qty: e.target.value }))}
                      placeholder="Enter quantity"
                      className="border-gray-300"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      Add Product
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Content */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="tenant">Tenant Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="p-0">
                    {product.image?.doc_body ? (
                      <img
                        src={product.image.doc_body}
                        alt={product.product_name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                      {product.product_name}
                    </CardTitle>
                    <Badge className={`mb-2 ${getDomainColor(product.domain_type)}`}>
                      {product.domain_type}
                    </Badge>
                    <p className="text-xl font-bold text-green-600 mb-2">₹{product.price}</p>
                    
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-gray-600">Qty:</Label>
                      {editingQuantity[product.id] ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={tempQuantities[product.id] || ''}
                            onChange={(e) => setTempQuantities(prev => ({ ...prev, [product.id]: e.target.value }))}
                            className="w-20 h-8 text-sm"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleQuantitySave(product.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuantityCancel(product.id)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{product.qty}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuantityEdit(product.id, product.qty)}
                            className="h-8 w-8 p-0 ml-2"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found</p>
                {tenant.app_type === 'Vendor' && (
                  <p className="text-gray-400 text-sm mt-2">Add your first product to get started</p>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="tenant" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tenant Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Tenant ID</Label>
                    <p className="text-lg font-semibold">{tenant.tenant_id}</p>
                  </div>
                  {tenant.vendor_id && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Vendor ID</Label>
                      <p className="text-lg font-semibold">{tenant.vendor_id}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Tenant Name</Label>
                    <p className="text-lg">{tenant.tenant_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Domain</Label>
                    <Badge className={getDomainColor(tenant.domain)}>{tenant.domain}</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">App Type</Label>
                    <Badge variant="outline">{tenant.app_type}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TenantManagementPage;
