
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AddTenant from "./pages/AddTenant";
import EditTenant from "./pages/EditTenant";
import DomainLanding from "./pages/DomainLanding";
import EditVendor from "./pages/EditVendor";
import VendorsList from "./pages/VendorsList";
import TenantManagementPage from "./pages/TenantManagementPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/add-tenant" element={<AddTenant />} />
          <Route path="/edit-tenant" element={<EditTenant />} />
          <Route path="/tenant-management" element={<TenantManagementPage />} />
          <Route path="/domain/:domain" element={<DomainLanding />} />
          <Route path="/edit-vendor/:vendorId" element={<EditVendor />} />
          <Route path="/vendors/:domain" element={<VendorsList />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
