import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
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
import Ombudsman from "./pages/Ombudsman";
import Careers from "./pages/Careers";
import Privacy from "./pages/Privacy";
import Financiamento from "./pages/Financiamento";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AccessDenied from "./pages/AccessDenied";
import NotFound from "./pages/NotFound";
import MfaSetup from "./pages/MfaSetup";
import MfaVerify from "./pages/MfaVerify";

// Client
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientDocuments from "./pages/client/ClientDocuments";
import ClientSupport from "./pages/client/ClientSupport";
import ClientFinancial from "./pages/client/ClientFinancial";
import ClientRental from "./pages/client/ClientRental";
import ClientContracts from "./pages/client/ClientContracts";
import ClientProperties from "./pages/client/ClientProperties";
import ClientProfile from "./pages/client/ClientProfile";

// Broker Partner
import BrokerLayout from "@/components/broker/BrokerLayout";
import BrokerDashboard from "./pages/broker/BrokerDashboard";
import BrokerLeads from "./pages/broker/BrokerLeads";
import BrokerProperties from "./pages/broker/BrokerProperties";
import BrokerVisits from "./pages/broker/BrokerVisits";
import BrokerProposals from "./pages/broker/BrokerProposals";
import BrokerCommissions from "./pages/broker/BrokerCommissions";
import BrokerProfile from "./pages/broker/BrokerProfile";

// Admin
import AdminLayout from "@/components/admin/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import LeadsList from "@/pages/admin/LeadsList";
import LeadForm from "@/pages/admin/LeadForm";
import LeadDetail from "@/pages/admin/LeadDetail";
import PropertiesList from "@/pages/admin/PropertiesList";
import PropertyForm from "@/pages/admin/PropertyForm";
import PropertyImport from "@/pages/admin/PropertyImport";
import Agenda from "@/pages/admin/Agenda";
import Team from "@/pages/admin/Team";
import Partners from "@/pages/admin/Partners";
import Reports from "@/pages/admin/Reports";
import Settings from "@/pages/admin/Settings";
import AdminProfile from "@/pages/admin/AdminProfile";
import Notifications from "@/pages/admin/Notifications";
import AdminClients from "@/pages/admin/AdminClients";
import AdminBrokers from "@/pages/admin/AdminBrokers";
import AdminContracts from "@/pages/admin/AdminContracts";
import AdminDocuments from "@/pages/admin/AdminDocuments";
import AdminTickets from "@/pages/admin/AdminTickets";
import AdminFinancial from "@/pages/admin/AdminFinancial";
import AdminAudit from "@/pages/admin/AdminAudit";
import AdminNeighborhoods from "@/pages/admin/Neighborhoods";
import AdminTasks from "@/pages/admin/AdminTasks";
import AdminPermissions from "@/pages/admin/AdminPermissions";
import AdminGestao from "@/pages/admin/AdminGestao";
import AdminEsteira from "@/pages/admin/AdminEsteira";

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
              <Route path="/financiamento" element={<Financiamento />} />

              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Register />} />
              <Route path="/recuperar-senha" element={<ForgotPassword />} />
              <Route path="/redefinir-senha" element={<ResetPassword />} />
              <Route path="/acesso-negado" element={<AccessDenied />} />

              {/* MFA routes */}
              <Route path="/mfa/setup" element={<MfaSetup />} />
              <Route path="/mfa/verify" element={<MfaVerify />} />

              {/* Legacy client routes → redirect to new paths */}
              <Route path="/area-do-cliente" element={<Navigate to="/cliente" replace />} />
              <Route path="/area-do-cliente/*" element={<Navigate to="/cliente" replace />} />
              <Route path="/documentos" element={<Navigate to="/cliente/documentos" replace />} />

              {/* Protected client routes (/cliente) */}
              <Route path="/cliente" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
              <Route path="/cliente/contratos" element={<ProtectedRoute><ClientContracts /></ProtectedRoute>} />
              <Route path="/cliente/documentos" element={<ProtectedRoute><ClientDocuments /></ProtectedRoute>} />
              <Route path="/cliente/financeiro" element={<ProtectedRoute><ClientFinancial /></ProtectedRoute>} />
              <Route path="/cliente/atendimento" element={<ProtectedRoute><ClientSupport /></ProtectedRoute>} />
              <Route path="/cliente/imoveis" element={<ProtectedRoute><ClientProperties /></ProtectedRoute>} />
              <Route path="/cliente/perfil" element={<ProtectedRoute><ClientProfile /></ProtectedRoute>} />
              <Route path="/cliente/locacao" element={<ProtectedRoute><ClientRental /></ProtectedRoute>} />

              {/* Protected broker partner routes (/parceiro) */}
              <Route
                path="/parceiro"
                element={
                  <ProtectedRoute requiredRoles={['corretor_parceiro']}>
                    <BrokerLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<BrokerDashboard />} />
                <Route path="leads" element={<BrokerLeads />} />
                <Route path="imoveis" element={<BrokerProperties />} />
                <Route path="visitas" element={<BrokerVisits />} />
                <Route path="propostas" element={<BrokerProposals />} />
                <Route path="comissoes" element={<BrokerCommissions />} />
                <Route path="perfil" element={<BrokerProfile />} />
              </Route>

              {/* Admin routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRoles={['admin', 'superadmin', 'corretor', 'vendas', 'locacao', 'financeiro']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="leads" element={<LeadsList />} />
                <Route path="leads/new" element={<LeadForm />} />
                <Route path="leads/:id" element={<LeadDetail />} />
                <Route path="properties" element={<PropertiesList />} />
                <Route path="properties/import" element={<PropertyImport />} />
                <Route path="bairros" element={<AdminNeighborhoods />} />
                <Route path="properties/new" element={<PropertyForm />} />
                <Route path="properties/:id" element={<PropertyForm />} />
                <Route path="properties/:id/edit" element={<PropertyForm />} />
                <Route path="clientes" element={<AdminClients />} />
                <Route path="corretores" element={<AdminBrokers />} />
                <Route path="contratos" element={<AdminContracts />} />
                <Route path="documentos" element={<AdminDocuments />} />
                <Route path="tickets" element={<AdminTickets />} />
                <Route path="financeiro" element={<AdminFinancial />} />
                <Route path="auditoria" element={<AdminAudit />} />
                <Route path="agenda" element={<Agenda />} />
                <Route path="tarefas" element={<AdminTasks />} />
                <Route path="team" element={<Team />} />
                <Route path="partners" element={<Partners />} />
                <Route path="reports" element={<Reports />} />
                <Route path="gestao" element={<AdminGestao />} />
                <Route path="esteira" element={<AdminEsteira />} />
                <Route path="permissoes" element={<AdminPermissions />} />
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
