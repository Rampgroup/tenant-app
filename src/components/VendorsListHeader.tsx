
import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import VendorForm from "./VendorForm";

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

interface TenantInfo {
  tenant_name: string;
}

interface VendorsListHeaderProps {
  domain?: string;
  tenant?: TenantInfo;
  isLoading: boolean;
  error: string | null;
  onBackClick: () => void;
  onRetry: () => void;
  isModalOpen: boolean;
  onModalOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isCreating: boolean;
  vendorData: VendorFormData;
  onVendorDataChange: (data: Partial<VendorFormData>) => void;
}

const VendorsListHeader: React.FC<VendorsListHeaderProps> = ({
  domain,
  tenant,
  isLoading,
  error,
  onBackClick,
  onRetry,
  isModalOpen,
  onModalOpenChange,
  onSubmit,
  isCreating,
  vendorData,
  onVendorDataChange
}) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <Button
        variant="outline"
        onClick={onBackClick}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>
      
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 capitalize">{domain} Vendors</h1>
        {tenant && (
          <p className="text-lg text-gray-600">Manage vendors for {tenant.tenant_name}</p>
        )}
        {isLoading && <p className="text-sm text-blue-600">Loading vendor data...</p>}
        {error && (
          <div className="flex items-center gap-2 justify-center mt-2">
            <p className="text-sm text-red-600">{error}</p>
            <Button onClick={onRetry} size="sm" variant="outline">
              Retry
            </Button>
          </div>
        )}
      </div>

      <VendorForm
        isOpen={isModalOpen}
        onOpenChange={onModalOpenChange}
        onSubmit={onSubmit}
        isCreating={isCreating}
        vendorData={vendorData}
        onVendorDataChange={onVendorDataChange}
      />
    </div>
  );
};

export default VendorsListHeader;
