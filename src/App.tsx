import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import PropertyListing from "./pages/PropertyListing";
import PropertyDetail from "./pages/PropertyDetail";
import About from "./pages/About";
import Advertise from "./pages/Advertise";
import Contact from "./pages/Contact";
import ClientArea from "./pages/ClientArea";
import Documents from "./pages/Documents";
import Ombudsman from "./pages/Ombudsman";
import Careers from "./pages/Careers";
import Privacy from "./pages/Privacy";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AccessDenied from "./pages/AccessDenied";
import NotFound from "./pages/NotFound";

// Admin
import AdminLayout from "@/components/admin/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import LeadsList from "@/pages/admin/LeadsList";
import LeadForm from "@/pages/admin/LeadForm";
import LeadDetail from "@/pages/admin/LeadDetail";
import PropertiesList from "@/pages/admin/PropertiesList";
import PropertyForm from "@/pages/admin/PropertyForm";
import Agenda from "@/pages/admin/Agenda";
import Team from "@/pages/admin/Team";
import Partners from "@/pages/admin/Partners";
import Reports from "@/pages/admin/Reports";
import Settings from "@/pages/admin/Settings";
import AdminProfile from "@/pages/admin/AdminProfile";
import Notifications from "@/pages/admin/Notifications";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/comprar" element={<PropertyListing purpose="sale" />} />
              <Route path="/alugar" element={<PropertyListing purpose="rent" />} />
              <Route path="/imovel/:id" element={<PropertyDetail />} />
              <Route path="/sobre" element={<About />} />
              <Route path="/anuncie" element={<Advertise />} />
              <Route path="/contato" element={<Contact />} />
              <Route path="/ouvidoria" element={<Ombudsman />} />
              <Route path="/trabalhe-conosco" element={<Careers />} />
              <Route path="/privacidade" element={<Privacy />} />

              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Register />} />
              <Route path="/recuperar-senha" element={<ForgotPassword />} />
              <Route path="/redefinir-senha" element={<ResetPassword />} />
              <Route path="/acesso-negado" element={<AccessDenied />} />

              {/* Protected client routes */}
              <Route
                path="/area-do-cliente"
                element={
                  <ProtectedRoute>
                    <ClientArea />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/documentos"
                element={
                  <ProtectedRoute>
                    <Documents />
                  </ProtectedRoute>
                }
              />

              {/* Admin routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="leads" element={<LeadsList />} />
                <Route path="leads/new" element={<LeadForm />} />
                <Route path="leads/:id" element={<LeadDetail />} />
                <Route path="properties" element={<PropertiesList />} />
                <Route path="properties/new" element={<PropertyForm />} />
                <Route path="properties/:id" element={<PropertyForm />} />
                <Route path="properties/:id/edit" element={<PropertyForm />} />
                <Route path="agenda" element={<Agenda />} />
                <Route path="team" element={<Team />} />
                <Route path="partners" element={<Partners />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="notifications" element={<Notifications />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
