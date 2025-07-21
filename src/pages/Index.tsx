
import { useState, useEffect } from "react";
import { Plus, Building2, Globe, Mail, Phone, MapPin, Palette, Calendar, Database, Edit2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTenantVendorData, TenantData } from "@/hooks/useTenantVendorData";

const Index = () => {
  const navigate = useNavigate();
  const { data: apiTenants, isLoading, error, refetch } = useTenantVendorData('tenant');
  const [allTenants, setAllTenants] = useState<any[]>([]);
  const [totalVendors, setTotalVendors] = useState<number>(0);

  useEffect(() => {
    // Use only API data, no localStorage
    const transformedApiTenants = (apiTenants as TenantData[]).map(tenant => ({
      tenant_id: tenant.tenant_id,
      role_id: "API_DATA",
      tenant_name: tenant.tenant_name,
      
      domain: tenant.domain,
      admin_email: tenant.email,
      phone_number: tenant.phone_number,
      address: tenant.address,
      logo_url: "",
      primary_color: tenant.primary_color,
      language: tenant.language,
      timezone: tenant.timezone,
      status: tenant.status,
      modules_enabled: [],
      db_schema_name: `${tenant.tenant_name.toLowerCase()}_schema`,
      plan_type: tenant.plan_type,
      created_by: "api",
      created_at: tenant.time,
      updated_at: tenant.time
    }));

    setAllTenants(transformedApiTenants);
    
    // Fetch vendor counts for each tenant
    const fetchVendorCounts = async () => {
      let totalCount = 0;
      for (const tenant of apiTenants) {
        try {
          const response = await fetch('https://m2fa6mzwo4.execute-api.ca-central-1.amazonaws.com/multi_tenant/tenantandvendor', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type: 'vendor', tenant_id: tenant.tenant_id }),
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.statusCode === 200 && result.body?.data) {
              totalCount += result.body.data.length;
            }
          }
        } catch (error) {
          console.error(`Error fetching vendors for ${tenant.tenant_id}:`, error);
        }
      }
      setTotalVendors(totalCount);
    };

    if (apiTenants.length > 0) {
      fetchVendorCounts();
    }
  }, [apiTenants]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'suspended':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'professional':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'basic':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'demo':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const handleTenantClick = (tenant: any) => {
    // Navigate to vendors list for this tenant's domain
    navigate(`/vendors/${tenant.domain.toLowerCase()}`, { state: { tenant } });
  };

  const handleEditTenant = (tenant: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    navigate('/edit-tenant', { state: { tenant } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Tenant Management</h1>
            <p className="text-lg text-gray-600">Manage your application tenants and their configurations</p>
            {isLoading && <p className="text-sm text-blue-600">Loading tenant data...</p>}
            {error && (
              <div className="flex items-center gap-2">
                <p className="text-sm text-red-600">{error}</p>
                <Button onClick={refetch} size="sm" variant="outline">
                  Retry
                </Button>
              </div>
            )}
          </div>
          <Button 
            onClick={() => navigate('/add-tenant')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add New Tenant
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Tenants</CardTitle>
              <Building2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{allTenants.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Tenants</CardTitle>
              <Globe className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {allTenants.filter(t => t.status.toLowerCase() === 'active').length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Vendors</CardTitle>
              <Database className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {totalVendors}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tenants Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {allTenants.map((tenant) => (
            <Card 
              key={tenant.tenant_id} 
              className="bg-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-200 cursor-pointer"
              onClick={() => handleTenantClick(tenant)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md"
                      style={{ backgroundColor: tenant.primary_color }}
                    >
                      {tenant.tenant_name.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-900">{tenant.tenant_name}</CardTitle>
                      <CardDescription className="text-gray-600 font-medium">
                        {tenant.tenant_id} | {tenant.role_id}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleEditTenant(tenant, e)}
                      className="flex items-center gap-1 h-8"
                    >
                      <Edit2 className="h-3 w-3" />
                      Edit
                    </Button>
                    <Badge variant={getStatusBadgeVariant(tenant.status)} className="font-medium">
                      {tenant.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="flex items-center space-x-2 text-gray-600">
                     <Globe className="h-4 w-4 text-blue-500" />
                     <span className="text-sm font-medium truncate">{tenant.domain}</span>
                   </div>
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium truncate">{tenant.admin_email}</span>
                    </div>
                    <div className="ml-6">
                      <span className="text-xs text-gray-600">Plan Type: </span>
                      <Badge className={`${getPlanBadgeColor(tenant.plan_type)} border-0 font-medium text-xs`}>
                        {tenant.plan_type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">{tenant.phone_number}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <span className="text-sm font-medium">{tenant.timezone}</span>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2 text-gray-600">
                  <MapPin className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium">{tenant.address}</span>
                </div>

                <div className="flex items-center space-x-2 text-gray-600">
                  <Palette className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm font-medium">Domain: </span>
                  <Badge variant="outline" className="hover:bg-blue-50 transition-colors">
                    {tenant.domain}
                  </Badge>
                </div>
                
                {tenant.modules_enabled?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Enabled Modules:</p>
                    <div className="flex flex-wrap gap-1">
                      {tenant.modules_enabled.map((module: string) => (
                        <Badge key={module} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          {module}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Created: {tenant.created_at}</span>
                    <span>Updated: {tenant.updated_at}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
