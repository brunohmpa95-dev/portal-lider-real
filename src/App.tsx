import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/comprar" element={<PropertyListing purpose="sale" />} />
            <Route path="/alugar" element={<PropertyListing purpose="rent" />} />
            <Route path="/imovel/:id" element={<PropertyDetail />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/anuncie" element={<Advertise />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/area-do-cliente" element={<ClientArea />} />
            <Route path="/documentos" element={<Documents />} />
            <Route path="/ouvidoria" element={<Ombudsman />} />
            <Route path="/trabalhe-conosco" element={<Careers />} />
            <Route path="/privacidade" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
