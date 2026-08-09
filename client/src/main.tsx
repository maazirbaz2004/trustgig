  import { createRoot } from "react-dom/client";
  import { BrowserRouter, Routes, Route } from "react-router-dom";
  import { AuthProvider } from "./context/AuthContext";
  import App from "./app/App.tsx";
  import Home from "./pages/Home";
  import Login from "./pages/Login";
  import Register from "./pages/Register";
  import ProtectedRoute from "./components/ProtectedRoute";
  import ClientDashboard from "./pages/ClientDashboard";
  import FreelancerDashboard from "./pages/FreelancerDashboard";
  import GigForm from "./pages/GigForm";
  import GigsList from "./pages/GigsList";
  import GigDetail from "./pages/GigDetail";
  import DisputeForm from "./pages/DisputeForm";
  import Wallet from "./pages/Wallet";
  import AdminKYC from "./pages/admin/AdminKYC";
  import AdminDisputes from "./pages/admin/AdminDisputes";
  import AdminDeposits from "./pages/admin/AdminDeposits";
  import AdminWithdrawals from "./pages/admin/AdminWithdrawals";
  import Inbox from "./pages/Inbox";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminKYC />
            </ProtectedRoute>
          } />

          <Route path="/admin/disputes" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDisputes />
            </ProtectedRoute>
          } />

          <Route path="/admin/deposits" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDeposits />
            </ProtectedRoute>
          } />

          <Route path="/admin/withdrawals" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminWithdrawals />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['client', 'freelancer']}>
              <DashboardRouter />
            </ProtectedRoute>
          } />

          <Route path="/gigs" element={
            <ProtectedRoute allowedRoles={['client']}>
              <GigsList />
            </ProtectedRoute>
          } />

          <Route path="/gigs/new" element={
            <ProtectedRoute allowedRoles={['freelancer']}>
              <GigForm />
            </ProtectedRoute>
          } />

          <Route path="/gigs/:id" element={
            <ProtectedRoute allowedRoles={['client']}>
              <GigDetail />
            </ProtectedRoute>
          } />

          <Route path="/disputes/new/:bookingId" element={
            <ProtectedRoute allowedRoles={['client']}>
              <DisputeForm />
            </ProtectedRoute>
          } />

          <Route path="/wallet" element={
            <ProtectedRoute allowedRoles={['client', 'freelancer']}>
              <Wallet />
            </ProtectedRoute>
          } />

          <Route path="/inbox" element={
            <ProtectedRoute allowedRoles={['client', 'freelancer']}>
              <Inbox />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );

  // Helper component to route to the correct dashboard based on role
  import { useAuth } from "./context/AuthContext";
  function DashboardRouter() {
    const { user } = useAuth();
    if (user?.role === 'freelancer') return <FreelancerDashboard />;
    return <ClientDashboard />;
  }
  