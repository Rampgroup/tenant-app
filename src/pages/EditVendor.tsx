import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const EditVendor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const vendor = location.state?.vendor;
  const tenant = location.state?.tenant;
  const [isUpdating, setIsUpdating] = useState(false);
  const [vendorData, setVendorData] = useState({
    vendor_name: vendor?.tenant_name || "",
    email: vendor?.email || "",
    phone_number: vendor?.phone_number || "",
    address: vendor?.address || "",
    domain: vendor?.domain || "",
    language: vendor?.language || "en",
    timezone: vendor?.timezone || "Asia/Kolkata",
    status: vendor?.status || "active",
    plan_type: vendor?.plan_type || "demo"
  });

  const handleInputChange = (field: string, value: string) => {
    setVendorData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const requestPayload = {
        type: "vendor",
        vendor_id: vendor.vendor_id || vendor.tenant_id, // Use vendor_id if available, fallback to tenant_id
        vendor_name: vendorData.vendor_name,
        app_type: vendor.app_type,
        domain: vendorData.domain,
        address: vendorData.address,
        email: vendorData.email,
        phone_number: vendorData.phone_number,
        primary_color: vendor.primary_color,
        vendor_location: vendor.vendor_location || {},
        language: vendorData.language,
        timezone: vendorData.timezone,
        status: vendorData.status,
        plan_type: vendorData.plan_type,
        tenant_id: vendor.actual_tenant_id || vendor.tenant_id // Use actual_tenant_id if available
      };

      console.log("📤 Sending update request with vendor_id:", requestPayload.vendor_id);
      console.log("📤 Sending update request with tenant_id:", requestPayload.tenant_id);

      const response = await fetch('https://m2fa6mzwo4.execute-api.ca-central-1.amazonaws.com/multi_tenant/edit_detail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        throw new Error('Failed to update vendor');
      }

      const result = await response.json();
      console.log('Vendor updated successfully:', result);
      
      toast({
        title: "Success!",
        description: "Vendor details have been updated successfully",
      });
      
      navigate(-1);
    } catch (error) {
      console.error('Error updating vendor:', error);
      toast({
        title: "Error",
        description: "Failed to update vendor details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">No vendor data found</p>
            <Button onClick={() => navigate('/')} className="mt-4">
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
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">Edit Vendor Details</h1>
            <p className="text-lg text-gray-600">Update information for {vendor.tenant_name}</p>
          </div>

          <div className="w-24"></div>
        </div>

        {/* Edit Form */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Vendor Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateVendor} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vendor_name">Vendor Name *</Label>
                  <Input
                    id="vendor_name"
                    value={vendorData.vendor_name}
                    onChange={(e) => handleInputChange('vendor_name', e.target.value)}
                    placeholder="Enter vendor name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={vendorData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number * (10 digits starting with 6-9)</Label>
                  <Input
                    id="phone_number"
                    value={vendorData.phone_number}
                    onChange={(e) => {
                      // Only allow numeric input and limit to 10 digits
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) {
                        handleInputChange('phone_number', value);
                      }
                    }}
                    placeholder="9123456789"
                    maxLength={10}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">Domain *</Label>
                  <Input
                    id="domain"
                    value={vendorData.domain}
                    readOnly
                    className="bg-gray-100 border-gray-300"
                    placeholder="Domain (non-editable)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={vendorData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={vendorData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter full address"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Update Vendor"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditVendor;
