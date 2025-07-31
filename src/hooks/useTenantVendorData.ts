
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface TenantData {
  tenant_id: string;
  tenant_name: string;
  domain: string;
  address: string;
  email: string;
  phone_number: string;
  primary_color: string;
  language: string;
  timezone: string;
  status: string;
  plan_type: string;
  app_type: string;
  time: string;
}

export interface VendorData {
  vendor_id: string;
  vendor_name: string;
  domain: string;
  address: string;
  email: string;
  phone_number: string;
  primary_color: string;
  language: string;
  timezone: string;
  status: string;
  plan_type: string;
  app_type: string;
  time: string;
  tenant_id: string; // Add tenant_id field
  vendor_location?: {
    latitude: string;
    longitude: string;
    vendor_address?: string;
    address_name?: string;
  };
  password?: string; // API includes password field
}

interface ApiResponse<T> {
  statusCode: number;
  headers: {
    'Content-Type': string;
  };
  body: {
    type: string;
    count: number;
    data: T[];
  };
}

// Overload signatures for better type inference
export function useTenantVendorData(type: 'tenant'): {
  data: TenantData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};
export function useTenantVendorData(type: 'vendor', tenantId?: string): {
  data: VendorData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useTenantVendorData(type: 'tenant' | 'vendor', tenantId?: string) {
  const [data, setData] = useState<(TenantData | VendorData)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`🔄 Fetching ${type} data...`);
      const requestBody = type === 'vendor' && tenantId 
        ? { type, tenant_id: tenantId }
        : { type };
      
      console.log(`📤 Request body:`, requestBody);
      
      const response = await fetch('https://m2fa6mzwo4.execute-api.ca-central-1.amazonaws.com/multi_tenant/tenantandvendor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${type} data`);
      }

      const result = await response.json();
      console.log(`✅ ${type} data fetched:`, result);

      if (result.statusCode === 200 && result.body?.data) {
        setData(result.body.data);
      } else {
        throw new Error(`Invalid response format for ${type} data`);
      }
    } catch (error) {
      console.error(`❌ Error fetching ${type} data:`, error);
      const errorMessage = `Failed to fetch ${type} data. Please try again.`;
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, type, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = () => {
    fetchData();
  };

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
