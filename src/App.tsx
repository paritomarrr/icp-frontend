
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import WorkspaceLayout from "@/components/Layout";

// Pages
import SignUp from "@/pages/SignUp";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import CreateWorkspace from "@/pages/CreateWorkspace";
import ICPWizard from "@/pages/ICPWizard";
import Products from "@/pages/Products";
import Segments from "@/pages/Segments";
import Personas from "@/pages/Personas";
import OutboundPlays from "@/pages/OutboundPlays";
import Collaborators from "@/pages/Collaborators";
import Analytics from "@/pages/Analytics";
import PersonaDetails from '@/pages/PersonaDetails';
import ProductDetails from '@/pages/ProductDetails';
import SegmentDetails from '@/pages/SegmentDetails';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/workspace/new" element={
            <ProtectedRoute>
              <CreateWorkspace />
            </ProtectedRoute>
          } />
          
          <Route path="/workspace/:slug/icp-wizard" element={
            <ProtectedRoute>
              <ICPWizard />
            </ProtectedRoute>
          } />
          
          {/* Workspace Layout Routes */}
          <Route path="/workspace/:slug" element={
            <ProtectedRoute>
              <WorkspaceLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Analytics />} />
            <Route path="home" element={<Analytics />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:productId" element={<ProductDetails />} />
            <Route path="segments" element={<Segments />} />
            <Route path="segments/:segmentId" element={<SegmentDetails />} />
            <Route path="personas" element={<Personas />} />
            <Route path="outbound-plays" element={<OutboundPlays />} />
            <Route path="collaborators" element={<Collaborators />} />
          </Route>
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
          <Route path="/personas" element={<Personas />} />
          <Route path="/personas/:personaIndex" element={<PersonaDetails />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
