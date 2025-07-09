import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Layout components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// Page components
import Dashboard from './components/dashboard/Dashboard';
import DonorList from './components/donors/DonorList';
import DonorDetail from './components/donors/DonorDetail';
import DonorForm from './components/donors/DonorForm';
import DonationList from './components/donations/DonationList';
import DonationForm from './components/donations/DonationForm';
import CampaignList from './components/campaigns/CampaignList';
import Reports from './components/reports/Reports';
import Settings from './components/settings/Settings';

// Auth components
import Login from './components/auth/Login';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';
import SessionTimeoutDialog from './components/auth/SessionTimeoutDialog';

// Context provider
import { AuthProvider, useAuth } from './context/AuthContext';

// Create theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#d81b60', // Canadian Cancer Society pink
    },
    secondary: {
      main: '#1e88e5', // Blue
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
    success: {
      main: '#4caf50',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
          borderRadius: '8px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

// Layout wrapper for authenticated pages
const AuthenticatedLayout = ({ children }) => {
  return (
    <div className="app">
      <Header />
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
      <Footer />
      <SessionTimeoutDialog />
    </div>
  );
};

function App() {
  // State for theme preference
  const [prefersDarkMode, setPrefersDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('theme-mode');
    return savedMode === 'dark';
  });
  
  // Update theme when preference changes
  useEffect(() => {
    localStorage.setItem('theme-mode', prefersDarkMode ? 'dark' : 'light');
  }, [prefersDarkMode]);
  
  // Create theme based on preference
  const theme = createTheme({
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light',
      primary: {
        main: '#d81b60', // Canadian Cancer Society pink
      },
      secondary: {
        main: '#1e88e5', // Blue
      },
      background: {
        default: prefersDarkMode ? '#121212' : '#f5f5f5',
        paper: prefersDarkMode ? '#1e1e1e' : '#ffffff',
      },
      error: {
        main: '#f44336',
      },
      warning: {
        main: '#ff9800',
      },
      info: {
        main: '#2196f3',
      },
      success: {
        main: '#4caf50',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 500,
      },
      h2: {
        fontWeight: 500,
      },
      h3: {
        fontWeight: 500,
      },
    },
    components: {
      MuiAppBar: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiCard: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
            borderRadius: '8px',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
    },
  });
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Dashboard />
                </AuthenticatedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/donors" element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <DonorList />
                </AuthenticatedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/donors/:id" element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <DonorDetail />
                </AuthenticatedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/donors/new" element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <DonorForm />
                </AuthenticatedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/donors/edit/:id" element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <DonorForm />
                </AuthenticatedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/donations" element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <DonationList />
                </AuthenticatedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/donations/new" element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <DonationForm />
                </AuthenticatedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/donations/edit/:id" element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <DonationForm />
                </AuthenticatedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/campaigns" element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <CampaignList />
                </AuthenticatedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Reports />
                </AuthenticatedLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Settings setPrefersDarkMode={setPrefersDarkMode} />
                </AuthenticatedLayout>
              </ProtectedRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute requiredRole="admin">
                <AuthenticatedLayout>
                  <Navigate to="/settings" replace />
                </AuthenticatedLayout>
              </ProtectedRoute>
            } />
            
            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
      </AuthProvider>
    </ThemeProvider>
  );

}

export default App;
