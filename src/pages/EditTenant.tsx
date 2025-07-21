
import { ArrowLeft, Building2, Globe, Mail, Phone, MapPin, Palette, Calendar, Database, Edit2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

// Form validation schema
const tenantSchema = z.object({
  tenantName: z.string().min(1, "Tenant name is required").min(2, "Tenant name must be at least 2 characters"),
  domain: z.string().min(1, "Domain is required"),
  adminEmail: z.string().min(1, "Email is required").email("Invalid email format"),
  phoneNumber: z.string().min(1, "Phone number is required").regex(/^[6-9]\d{9}$/, "Phone number must start with 6-9 and be exactly 10 digits"),
  address: z.string().min(1, "Address is required").min(5, "Address must be at least 5 characters"),
  language: z.string().min(1, "Language is required"),
  timezone: z.string().min(1, "Timezone is required"),
  status: z.string().min(1, "Status is required"),
  planType: z.string().min(1, "Plan type is required")
});

type TenantFormData = z.infer<typeof tenantSchema>;

const EditTenant = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const tenant = location.state?.tenant;
  
  const form = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      tenantName: "",
      domain: "",
      adminEmail: "",
      phoneNumber: "",
      address: "",
      language: "en",
      timezone: "Asia/Kolkata",
      status: "active",
      planType: "demo"
    }
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    if (tenant) {
      form.reset({
        tenantName: tenant.tenant_name || "",
        domain: tenant.domain || "",
        adminEmail: tenant.email || "",
        phoneNumber: tenant.phone_number || "",
        address: tenant.address || "",
        language: tenant.language || "en",
        timezone: tenant.timezone || "Asia/Kolkata",
        status: tenant.status || "active",
        planType: tenant.plan_type || "demo"
      });
    }
  }, [tenant, form]);

  const onSubmit = async (data: TenantFormData) => {
    if (!tenant) {
      toast({
        title: "Error",
        description: "No tenant data found to update.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      type: "tenant",
      tenant_id: tenant.tenant_id,
      tenant_name: data.tenantName,
      app_type: tenant.app_type,
      domain: data.domain,
      address: data.address,
      email: data.adminEmail,
      phone_number: data.phoneNumber,
      primary_color: tenant.primary_color,
      language: data.language,
      timezone: data.timezone,
      status: data.status,
      plan_type: data.planType
    };

    console.log('📦 Updating tenant payload:', JSON.stringify(payload, null, 2));

    try {
      const response = await fetch('https://m2fa6mzwo4.execute-api.ca-central-1.amazonaws.com/multi_tenant/edit_detail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ API Response:', result);

        toast({
          title: "Success!",
          description: "Tenant updated successfully",
        });

        navigate('/');
      } else {
        throw new Error('Failed to update tenant');
      }
    } catch (error) {
      console.error('❌ Error updating tenant:', error);
      toast({
        title: "Error",
        description: "Failed to update tenant. Please try again.",
        variant: "destructive",
      });
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
          
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-900">Edit Tenant</h1>
            <p className="text-lg text-gray-600">Update tenant configuration</p>
          </div>
          
          <div className="w-32"></div>
        </div>

        {/* Form */}
        <Card className="bg-white shadow-lg max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-900 flex items-center gap-2 justify-center">
              <Building2 className="h-6 w-6 text-blue-600" />
              Tenant Information
            </CardTitle>
          </CardHeader>
          <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <FormField
                control={form.control}
                name="tenantName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-500" />
                      Tenant Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter tenant name"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Palette className="h-4 w-4 text-purple-500" />
                      Domain *
                    </FormLabel>
                     <FormControl>
                       <Input
                         placeholder="Domain"
                         className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                         disabled
                         {...field}
                       />
                     </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-500" />
                      Address *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter full address"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="adminEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-red-500" />
                        Admin Email *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="admin@example.com"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-orange-500" />
                        Phone Number * (10 digits starting with 6-9)
                      </FormLabel>
                       <FormControl>
                         <Input
                           placeholder="9123456789"
                           maxLength={10}
                           className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                           {...field}
                           onChange={(e) => {
                             // Only allow numeric input and limit to 10 digits
                             const value = e.target.value.replace(/\D/g, '');
                             if (value.length <= 10) {
                               field.onChange(value);
                             }
                           }}
                         />
                       </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Configuration Settings */}
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-green-500" />
                      Language *
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="te">Telugu</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-500" />
                        Timezone *
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">America/New_York</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-500" />
                        Status *
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="planType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      Plan Type *
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select plan type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="demo">Demo</SelectItem>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="px-6 py-2"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Tenant"}
                </Button>
              </div>
            </form>
          </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditTenant;
