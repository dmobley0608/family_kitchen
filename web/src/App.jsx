import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Recipes from './pages/Recipes';
import RecipeDetails from './pages/RecipeDetails';
import CreateRecipe from './pages/CreateRecipe';
import EditRecipe from './pages/EditRecipe';
import Household from './pages/Household';
import JoinHousehold from './pages/JoinHousehold';
import NotFound from './pages/NotFound';
import ProfileSettings from './pages/ProfileSettings';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Route Guards
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import TermsAndConditions from './pages/TermsAndConditions';
import CookiePolicy from './pages/CookiePolicy';
import CookieConsent from './components/CookieConsent';

function AppContent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </Box>
    );
  }

  return (
    <Routes>
      {/* Public routes with auth layout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:resettoken" element={<ResetPassword />} />
        <Route path="/join-household/:token" element={<JoinHousehold />} />
      </Route>

      {/* Routes with main layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/recipes/:id" element={<RecipeDetails />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/recipes/create" element={<CreateRecipe />} />
          <Route path="/recipes/edit/:id" element={<EditRecipe />} />
          <Route path="/household" element={<Household />} />
          <Route path="/profile" element={<ProfileSettings />} />
        </Route>
      </Route>

      {/* Not found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <CookieConsent />
      <Footer/>
    </AuthProvider>
  );
}

export default App;
