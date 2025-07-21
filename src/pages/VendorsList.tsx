import { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTenantVendorData, VendorData } from "@/hooks/useTenantVendorData";
import VendorsListHeader from "@/components/VendorsListHeader";
import VendorCard from "@/components/VendorCard";

interface Vendor {
  tenant_id: string;
  tenant_name: string;
  domain: string;
  address: string;
  email: string;
  phone_number: string;
  language: string;
  timezone: string;
  status: string;
  plan_type: string;
  app_type: string;
}

const VendorsList = () => {
  const navigate = useNavigate();
  const { domain } = useParams<{ domain: string }>();
  const location = useLocation();
  const { toast } = useToast();
  const tenant = location.state?.tenant;
  
  const { data: apiVendors, isLoading, error, refetch } = useTenantVendorData('vendor', tenant?.tenant_id);
  const [allVendors, setAllVendors] = useState<Vendor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [submissionInProgress, setSubmissionInProgress] = useState(false);
  const [newVendor, setNewVendor] = useState({
    vendor_name: "",
    app_type: "Vendor",
    domain: domain || "",
    address: "",
    email: "",
    phone_number: "",
    language: "en",
    timezone: "Asia/Kolkata",
    status: "active",
    plan_type: "demo",
    tenant_id: tenant?.tenant_id || "",
    vendor_location: {
      latitude: "",
      longitude: "",
      vendor_address: "",
      address_name: ""
    }
  });

  useEffect(() => {
    console.log("🔍 Raw API vendors data:", apiVendors);
    
    const transformedApiVendors = (apiVendors as VendorData[])
      .filter(vendor => {
        // Filter out vendors with empty values but keep all status types (active, inactive, suspended)
        const hasValidData = vendor.vendor_name && vendor.email && vendor.address;
        const matchesDomain = !domain || vendor.domain.toLowerCase() === domain.toLowerCase();
        
        console.log(`🔍 Vendor ${vendor.vendor_name} - Status: ${vendor.status}, HasValidData: ${hasValidData}, MatchesDomain: ${matchesDomain}`);
        
        return hasValidData && matchesDomain;
      })
      .map(vendor => ({
        tenant_id: vendor.vendor_id, // This is for UI display compatibility
        actual_tenant_id: vendor.tenant_id, // Preserve the actual tenant_id
        vendor_id: vendor.vendor_id, // Preserve vendor_id
        tenant_name: vendor.vendor_name,
        domain: vendor.domain,
        address: vendor.address,
        email: vendor.email,
        phone_number: vendor.phone_number,
        language: vendor.language,
        timezone: vendor.timezone,
        status: vendor.status,
        plan_type: vendor.plan_type,
        app_type: vendor.app_type,
        primary_color: vendor.primary_color,
        vendor_location: vendor.vendor_location
      }));

    console.log("🔍 Transformed vendors for display:", transformedApiVendors);
    setAllVendors(transformedApiVendors);
  }, [apiVendors, domain]);

  // Validation function to ensure all required fields are non-empty
  const validateVendorData = (vendorData: typeof newVendor) => {
    const requiredFields = ['vendor_name', 'email', 'phone_number', 'address', 'tenant_id'];
    
    for (const field of requiredFields) {
      const value = vendorData[field as keyof typeof vendorData];
      if (!value || value.toString().trim() === '') {
        console.log(`❌ Validation failed: ${field} is empty or invalid`);
        return false;
      }
    }
    
    // Additional validation for email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(vendorData.email)) {
      console.log('❌ Validation failed: Invalid email format');
      return false;
    }
    
    // Phone number validation - must start with 6-9 and be exactly 10 digits
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(vendorData.phone_number)) {
      console.log('❌ Validation failed: Phone number must start with 6-9 and be exactly 10 digits');
      return false;
    }
    
    return true;
  };

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Multiple layers of protection against duplicate submissions
    if (isCreating || submissionInProgress) {
      console.log("⚠️ Vendor creation already in progress, ignoring duplicate submission");
      return;
    }

    // Validate that all required fields are non-empty
    if (!validateVendorData(newVendor)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields with valid data",
        variant: "destructive",
      });
      return;
    }

    // Check if tenant ID exists and is valid
    if (!tenant?.tenant_id || tenant.tenant_id.trim() === '') {
      toast({
        title: "Error",
        description: "No valid tenant selected. Please go back and select a tenant.",
        variant: "destructive",
      });
      return;
    }

    // Check if tenant status is active
    if (tenant?.status === 'inactive') {
      toast({
        title: "Error",
        description: "Cannot add vendors to an inactive tenant. Please activate the tenant first.",
        variant: "destructive",
      });
      return;
    }

    console.log("🚀 Starting vendor creation with tenant_id:", tenant.tenant_id);
    console.log("📝 Validated form data being submitted:", newVendor);
    
    // Set both flags to prevent any possibility of duplicate submission
    setIsCreating(true);
    setSubmissionInProgress(true);

    try {
      // Create clean payload with only non-empty values
      const vendorPayload = {
        vendor_name: newVendor.vendor_name.trim(),
        app_type: newVendor.app_type,
        domain: newVendor.domain.trim(),
        address: newVendor.address.trim(),
        email: newVendor.email.trim(),
        phone_number: newVendor.phone_number.trim(),
        
        language: newVendor.language,
        timezone: newVendor.timezone,
        status: newVendor.status,
        plan_type: newVendor.plan_type,
        tenant_id: tenant.tenant_id.trim(),
        vendor_location: {
          latitude: newVendor.vendor_location.latitude,
          longitude: newVendor.vendor_location.longitude,
          vendor_address: newVendor.vendor_location.vendor_address,
          address_name: newVendor.vendor_location.address_name
        }
      };

      // Final validation before sending
      if (!vendorPayload.vendor_name || !vendorPayload.email || !vendorPayload.address || !vendorPayload.tenant_id) {
        throw new Error('Critical validation failed: Required fields are empty');
      }

      console.log("📤 Sending vendor creation request:", vendorPayload);

      const response = await fetch('https://m2fa6mzwo4.execute-api.ca-central-1.amazonaws.com/multi_tenant/create_vendor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vendorPayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Vendor creation response:", result);
      
      if (result.statusCode !== 200) {
        throw new Error(`API error: ${result.message || 'Unknown error'}`);
      }
      
      setNewVendor({
        vendor_name: "",
        app_type: "Vendor",
        domain: domain || "",
        address: "",
        email: "",
        phone_number: "",
        language: "en",
        timezone: "Asia/Kolkata",
        status: "active",
        plan_type: "demo",
        tenant_id: tenant.tenant_id,
        vendor_location: {
          latitude: "",
          longitude: "",
          vendor_address: "",
          address_name: ""
        }
      });
      setIsModalOpen(false);

      // Wait a moment before refetching to allow backend to process
      setTimeout(() => {
        refetch();
      }, 1000);

      toast({
        title: "Success!",
        description: "Vendor has been added successfully",
      });

    } catch (error) {
      console.error('❌ Error creating vendor:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create vendor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
      setSubmissionInProgress(false);
    }
  };

  const handleVendorDataChange = (data: Partial<typeof newVendor>) => {
    setNewVendor(prev => ({ ...prev, ...data }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <VendorsListHeader
          domain={domain}
          tenant={tenant}
          isLoading={isLoading}
          error={error}
          onBackClick={() => navigate('/')}
          onRetry={refetch}
          isModalOpen={isModalOpen}
          onModalOpenChange={setIsModalOpen}
          onSubmit={handleAddVendor}
          isCreating={isCreating}
          vendorData={newVendor}
          onVendorDataChange={handleVendorDataChange}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {allVendors.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Vendors Found</h3>
              <p className="text-gray-500">Add your first vendor to get started</p>
            </div>
          ) : (
            allVendors.map((vendor) => (
              <VendorCard key={vendor.tenant_id} vendor={vendor} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorsList;
