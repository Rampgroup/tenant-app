import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import GoogleMapPicker from "./GoogleMapPicker";

interface VendorFormData {
  vendor_name: string;
  app_type: string;
  domain: string;
  address: string;
  email: string;
  phone_number: string;
  language: string;
  timezone: string;
  status: string;
  plan_type: string;
  tenant_id: string;
  vendor_location: {
    latitude: string;
    longitude: string;
    vendor_address: string;
    address_name: string;
  };
}

interface VendorFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isCreating: boolean;
  vendorData: VendorFormData;
  onVendorDataChange: (data: Partial<VendorFormData>) => void;
}

const VendorForm: React.FC<VendorFormProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  isCreating,
  vendorData,
  onVendorDataChange
}) => {
  const { toast } = useToast();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isCreating) {
      console.log("⚠️ Form submission blocked - already creating vendor");
      return;
    }
    
    console.log("📝 Form submitted with data:", vendorData);
    await onSubmit(e);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by this browser",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onVendorDataChange({
          vendor_location: {
            ...vendorData.vendor_location,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          }
        });
        setIsGettingLocation(false);
        toast({
          title: "Success",
          description: "Location captured successfully",
        });
      },
      (error) => {
        setIsGettingLocation(false);
        toast({
          title: "Error",
          description: "Unable to get location. Please enable location access.",
          variant: "destructive",
        });
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleMapLocationSelect = (lat: number, lng: number, address: string) => {
    onVendorDataChange({
      vendor_location: {
        ...vendorData.vendor_location,
        latitude: lat.toString(),
        longitude: lng.toString(),
        // Don't update vendor_address - let user enter manually
      }
    });
    setShowMapPicker(false);
    toast({
      title: "Success",
      description: "Location coordinates selected from map",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="h-5 w-5 mr-2" />
          Add New Vendor
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Vendor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendorName">Vendor Name *</Label>
              <Input
                id="vendorName"
                value={vendorData.vendor_name}
                onChange={(e) => onVendorDataChange({ vendor_name: e.target.value })}
                placeholder="Enter vendor name"
                className="border-gray-300"
              />
            </div>


            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={vendorData.email}
                onChange={(e) => onVendorDataChange({ email: e.target.value })}
                placeholder="vendor@example.com"
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number * (10 digits starting with 6-9)</Label>
              <Input
                id="phone"
                value={vendorData.phone_number}
                onChange={(e) => {
                  // Only allow numeric input and limit to 10 digits
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 10) {
                    onVendorDataChange({ phone_number: value });
                  }
                }}
                placeholder="9123456789"
                maxLength={10}
                className="border-gray-300"
              />
            </div>


          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={vendorData.address}
              onChange={(e) => onVendorDataChange({ address: e.target.value })}
              placeholder="Enter complete address"
              className="border-gray-300"
            />
          </div>

          {/* Location Section */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Location Information</h3>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="flex items-center gap-2"
                >
                  {isGettingLocation ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  {isGettingLocation ? "Getting Location..." : "Current Location"}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowMapPicker(true)}
                  className="flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  Pick from Map
                </Button>
              </div>
            </div>

            {showMapPicker && (
              <Dialog open={showMapPicker} onOpenChange={setShowMapPicker}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Select Location on Map</DialogTitle>
                  </DialogHeader>
                  <GoogleMapPicker
                    onLocationSelect={handleMapLocationSelect}
                    initialLat={vendorData.vendor_location?.latitude ? parseFloat(vendorData.vendor_location.latitude) : 17.4482947}
                    initialLng={vendorData.vendor_location?.longitude ? parseFloat(vendorData.vendor_location.longitude) : 78.3753447}
                  />
                </DialogContent>
              </Dialog>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  value={vendorData.vendor_location?.latitude || ""}
                  onChange={(e) => onVendorDataChange({ 
                    vendor_location: { 
                      ...vendorData.vendor_location, 
                      latitude: e.target.value 
                    } 
                  })}
                  placeholder="Auto-filled by GPS"
                  className="border-gray-300"
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  value={vendorData.vendor_location?.longitude || ""}
                  onChange={(e) => onVendorDataChange({ 
                    vendor_location: { 
                      ...vendorData.vendor_location, 
                      longitude: e.target.value 
                    } 
                  })}
                  placeholder="Auto-filled by GPS"
                  className="border-gray-300"
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendorAddress">Vendor Address</Label>
                <Input
                  id="vendorAddress"
                  value={vendorData.vendor_location?.vendor_address || ""}
                  onChange={(e) => onVendorDataChange({ 
                    vendor_location: { 
                      ...vendorData.vendor_location, 
                      vendor_address: e.target.value 
                    } 
                  })}
                  placeholder="Specific vendor address"
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressName">Address Name</Label>
                <Input
                  id="addressName"
                  value={vendorData.vendor_location?.address_name || ""}
                  onChange={(e) => onVendorDataChange({ 
                    vendor_location: { 
                      ...vendorData.vendor_location, 
                      address_name: e.target.value 
                    } 
                  })}
                  placeholder="e.g., Main Branch, Downtown Store"
                  className="border-gray-300"
                />
              </div>
            </div>
          </div>

          {vendorData.tenant_id && (
            <div className="space-y-2">
              <Label htmlFor="tenantId">Tenant ID</Label>
              <Input
                id="tenantId"
                value={vendorData.tenant_id}
                readOnly
                className="border-gray-300 bg-gray-50"
              />
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700" 
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Add Vendor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VendorForm;
