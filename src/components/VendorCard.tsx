
import { Building2, Mail, Phone, MapPin, Globe, Calendar, Palette, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

interface VendorCardProps {
  vendor: Vendor;
}

const VendorCard = ({ vendor }: VendorCardProps) => {
  const navigate = useNavigate();
  const isInactive = vendor.status.toLowerCase() === 'inactive';

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

  const handleVendorClick = () => {
    // Navigate to edit vendor details page
    navigate(`/edit-vendor/${vendor.tenant_id}`, { 
      state: { 
        vendor: vendor
      } 
    });
  };

  return (
    <Card 
      className={`shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border cursor-pointer ${
        isInactive 
          ? 'bg-gray-50 border-gray-300 opacity-75' 
          : 'bg-white border-gray-200'
      }`}
      onClick={handleVendorClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md ${
                isInactive ? 'bg-gray-400' : 'bg-primary'
              }`}
            >
              {vendor.tenant_name.charAt(0)}
            </div>
            <div>
              <CardTitle className={`text-xl font-semibold ${
                isInactive ? 'text-gray-500' : 'text-gray-900'
              }`}>
                {vendor.tenant_name}
                {isInactive && <span className="ml-2 text-sm font-normal text-gray-400">(Inactive)</span>}
              </CardTitle>
              <CardDescription className={`font-medium ${
                isInactive ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Vendor ID: {vendor.tenant_id}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant={getStatusBadgeVariant(vendor.status)} className="font-medium">
              {vendor.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`flex items-center space-x-2 ${
            isInactive ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <Globe className={`h-4 w-4 ${isInactive ? 'text-gray-400' : 'text-blue-500'}`} />
            <span className="text-sm font-medium truncate">{vendor.domain}</span>
          </div>
          <div className="space-y-1">
            <div className={`flex items-center space-x-2 ${
              isInactive ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <Mail className={`h-4 w-4 ${isInactive ? 'text-gray-400' : 'text-green-500'}`} />
              <span className="text-sm font-medium truncate">{vendor.email}</span>
            </div>
            <div className="flex items-center space-x-1 ml-6">
              <span className={`text-xs ${isInactive ? 'text-gray-400' : 'text-gray-600'}`}>Plan Type:</span>
              <Badge className={`${
                isInactive 
                  ? 'bg-gray-200 text-gray-500 hover:bg-gray-200' 
                  : getPlanBadgeColor(vendor.plan_type)
              } border-0 font-medium text-xs`}>
                {vendor.plan_type}
              </Badge>
            </div>
          </div>
          <div className={`flex items-center space-x-2 ${
            isInactive ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <Phone className={`h-4 w-4 ${isInactive ? 'text-gray-400' : 'text-orange-500'}`} />
            <span className="text-sm font-medium">{vendor.phone_number}</span>
          </div>
          <div className={`flex items-center space-x-2 ${
            isInactive ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <Calendar className={`h-4 w-4 ${isInactive ? 'text-gray-400' : 'text-purple-500'}`} />
            <span className="text-sm font-medium">{vendor.timezone}</span>
          </div>
        </div>
        
        <div className={`flex items-start space-x-2 ${
          isInactive ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <MapPin className={`h-4 w-4 ${isInactive ? 'text-gray-400' : 'text-red-500'} mt-0.5 flex-shrink-0`} />
          <span className="text-sm font-medium">{vendor.address}</span>
        </div>

        <div className={`flex items-center space-x-2 ${
          isInactive ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <Palette className={`h-4 w-4 ${isInactive ? 'text-gray-400' : 'text-indigo-500'}`} />
          <span className="text-sm font-medium">Domain: </span>
          <Badge variant="outline" className={`transition-colors ${
            isInactive 
              ? 'border-gray-300 text-gray-400 hover:bg-gray-100' 
              : 'hover:bg-blue-50'
          }`}>
            {vendor.domain}
          </Badge>
        </div>

        <div className={`flex items-center space-x-2 ${
          isInactive ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <Building2 className={`h-4 w-4 ${isInactive ? 'text-gray-400' : 'text-cyan-500'}`} />
          <span className="text-sm font-medium">Tenant ID: {vendor.tenant_id}</span>
        </div>
        
        <div className="pt-2 border-t border-gray-100">
          <div className={`flex justify-between text-xs ${
            isInactive ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <span>Language: {vendor.language}</span>
            <span>{isInactive ? 'Inactive - Click to reactivate' : 'Click to edit details'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorCard;
