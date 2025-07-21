
import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Minus, ShoppingCart, X } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Updated products data for different domains
const domainProducts = {
  farming: [
    { id: 1, name: "Urea Fertilizer", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop", price: 450 },
    { id: 2, name: "NPK (Nitrogen, Phosphorus, Potassium)", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop", price: 650 },
    { id: 3, name: "Flower Seeds", image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=300&h=200&fit=crop", price: 120 },
    { id: 4, name: "Vegetable Seeds", image: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=300&h=200&fit=crop", price: 180 },
  ],
  pharma: [
    { id: 5, name: "Medical Tablets", image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&h=200&fit=crop", price: 450 },
    { id: 6, name: "Bandage Roll", image: "https://images.unsplash.com/photo-1603398938735-d97c83ba43e5?w=300&h=200&fit=crop", price: 120 },
    { id: 7, name: "Medical Syringe", image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop", price: 85 },
    { id: 8, name: "Glucose Bottle", image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=300&h=200&fit=crop", price: 280 },
  ],
  groceries: [
    { id: 9, name: "Fresh Bread", image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=300&h=200&fit=crop", price: 80 },
    { id: 10, name: "Milk Carton", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=200&fit=crop", price: 60 },
    { id: 11, name: "Fresh Eggs", image: "https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=300&h=200&fit=crop", price: 120 },
    { id: 12, name: "Cheese Block", image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&h=200&fit=crop", price: 220 },
  ],
};

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const DomainLanding = () => {
  const navigate = useNavigate();
  const { domain } = useParams<{ domain: string }>();
  const location = useLocation();
  const { toast } = useToast();
  
  const tenant = location.state?.tenant;
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const products = domainProducts[domain as keyof typeof domainProducts] || [];

  const updateQuantity = (productId: number, change: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === productId);
      const product = products.find(p => p.id === productId);
      
      if (!product) return prevCart;

      if (existingItem) {
        const newQuantity = existingItem.quantity + change;
        if (newQuantity <= 0) {
          return prevCart.filter(item => item.id !== productId);
        }
        return prevCart.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        );
      } else if (change > 0) {
        return [...prevCart, { ...product, quantity: 1 }];
      }
      
      return prevCart;
    });
  };

  const getQuantity = (productId: number) => {
    const item = cart.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const addToCart = (product: any) => {
    updateQuantity(product.id, 1);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const placeOrder = () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before placing an order",
        variant: "destructive",
      });
      return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    setCart([]);
    setIsCartOpen(false);
    toast({
      title: "Order Placed!",
      description: `Your order for ₹${total} has been placed successfully`,
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
            <h1 className="text-4xl font-bold text-gray-900 capitalize">{domain} Products</h1>
            {tenant && (
              <p className="text-lg text-gray-600">Welcome to {tenant.tenant_name}'s {domain} store</p>
            )}
          </div>

          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
              <Button className="relative bg-blue-600 hover:bg-blue-700">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:w-96 bg-white flex flex-col">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Cart ({cartItemCount})
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex-1 overflow-hidden flex flex-col mt-6">
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Your cart is empty</p>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{item.name}</h4>
                            <p className="text-green-600 font-bold">₹{item.price}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, -1)}
                                className="h-6 w-6 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, 1)}
                                className="h-6 w-6 p-0"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">₹{item.price * item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-4 mt-4 flex-shrink-0">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-bold">Total:</span>
                        <span className="text-lg font-bold text-green-600">₹{cartTotal}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <Button 
                          onClick={placeOrder}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          Place Order
                        </Button>
                        <Button 
                          onClick={() => setIsCartOpen(false)}
                          variant="outline"
                          className="w-full"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="p-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                  {product.name}
                </CardTitle>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold text-green-600">₹{product.price}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(product.id, -1)}
                      disabled={getQuantity(product.id) === 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {getQuantity(product.id)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(product.id, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => addToCart(product)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DomainLanding;
