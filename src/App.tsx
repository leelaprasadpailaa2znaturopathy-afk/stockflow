/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { apiService } from './services/api';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { TooltipProvider } from './components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { InventoryDashboard } from './components/InventoryDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ActivityLogs } from './components/ActivityLogs';
import { LogIn, LogOut, Package, ShieldCheck, History, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { HealthCheck } from './components/HealthCheck';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [serverError, setServerError] = useState('');
  const [logoDataUri, setLogoDataUri] = useState<string>('');

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          apiService.setToken(token);
          const isValid = await apiService.verifyToken();
          if (isValid) {
            setIsLoggedIn(true);
            setAdminEmail(localStorage.getItem('adminEmail') || '');
          } else {
            setIsLoggedIn(false);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };

    const setBrowserFavicon = (iconDataUri: string) => {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = iconDataUri;
    };

    // Fetch logo from MongoDB
    const fetchLogo = async () => {
      try {
        const base64Logo = await apiService.getLogo();
        const dataUri = `data:image/png;base64,${base64Logo}`;
        setLogoDataUri(dataUri);
        setBrowserFavicon(dataUri);
      } catch (error) {
        console.error('Failed to fetch logo:', error);
        // Logo will not display if fetch fails, but app continues
      }
    };

    checkAuth();
    fetchLogo();
    setLoading(false);
  }, []);

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      toast.error('Please enter email and password');
      return;
    }

    try {
      setServerError('');
      const response = await apiService.login(loginEmail, loginPassword);
      localStorage.setItem('adminEmail', response.email);
      setAdminEmail(response.email);
      setIsLoggedIn(true);
      setShowLoginDialog(false);
      setLoginEmail('');
      setLoginPassword('');
      toast.success('✅ Logged in successfully');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Login failed';
      setServerError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleLogout = () => {
    apiService.logout();
    localStorage.removeItem('adminEmail');
    setIsLoggedIn(false);
    setAdminEmail('');
    setLoginEmail('');
    setLoginPassword('');
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {logoDataUri ? (
                <img 
                  src={logoDataUri}
                  alt="StockFlow Logo"
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Package className="text-white h-6 w-6" />
                </div>
              )}
              <h1 className="text-xl font-bold tracking-tight text-slate-900">StockFlow</h1>
            </div>

            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium">{adminEmail}</p>
                    <p className="text-xs text-muted-foreground">Administrator</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setShowLoginDialog(true)} className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Admin Login
                </Button>
              )}
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {isLoggedIn && <HealthCheck />}
          <Tabs defaultValue="inventory" className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <TabsList className="grid w-full md:w-auto grid-cols-3 h-12">
                <TabsTrigger value="inventory" className="gap-2 px-6">
                  <Package className="h-4 w-4" />
                  Inventory
                </TabsTrigger>
                {isLoggedIn && (
                  <>
                    <TabsTrigger value="admin" className="gap-2 px-6">
                      <ShieldCheck className="h-4 w-4" />
                      Manage
                    </TabsTrigger>
                    <TabsTrigger value="logs" className="gap-2 px-6">
                      <History className="h-4 w-4" />
                      Logs
                    </TabsTrigger>
                  </>
                )}
              </TabsList>
            </div>

            <TabsContent value="inventory" className="mt-0">
              <InventoryDashboard />
            </TabsContent>

            {isLoggedIn && (
              <>
                <TabsContent value="admin" className="mt-0">
                  <AdminDashboard />
                </TabsContent>
                <TabsContent value="logs" className="mt-0">
                  <ActivityLogs />
                </TabsContent>
              </>
            )}
          </Tabs>
        </main>
        <Toaster position="top-right" />
        
        {/* Admin Login Dialog */}
        <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Admin Login</DialogTitle>
              <DialogDescription>
                Enter your admin credentials to access management features
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {serverError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{serverError}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@stockflow.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleLogin();
                    }
                  }}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => {
                  setShowLoginDialog(false);
                  setLoginEmail('');
                  setLoginPassword('');
                  setServerError('');
                }}>
                  Cancel
                </Button>
                <Button onClick={handleLogin}>
                  Login
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                📧 Default: admin@stockflow.com / admin123 (change in .env)
              </p>
            </div>
          </DialogContent>
        </Dialog>

      </div>
      </TooltipProvider>
    </ErrorBoundary>
  );
}
