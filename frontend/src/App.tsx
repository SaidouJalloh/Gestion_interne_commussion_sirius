import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { OrganizationProvider } from './context/OrganizationContext';

// Providers généraux (pour login)
import { AuthProvider as GeneralAuthProvider } from './context/AuthContext';
import { ProfileProvider as GeneralProfileProvider } from './context/ProfileContext';
import { ThemeProvider as GeneralThemeProvider } from './context/ThemeContext';

// Providers Admin
import { AuthProvider as AdminAuthProvider } from './admin/context/AuthContext';
import { ProfileProvider as AdminProfileProvider } from './admin/context/ProfileContext';
import { ThemeProvider as AdminThemeProvider } from './admin/context/ThemeContext';

// Providers SuperAdmin
import { AuthProvider as SuperAdminAuthProvider } from './superadmin/context/AuthContext';
import { ProfileProvider as SuperAdminProfileProvider } from './superadmin/context/ProfileContext';
import { ThemeProvider as SuperAdminThemeProvider } from './superadmin/context/ThemeContext';

// Components
import { ProtectedRoute as AdminProtectedRoute } from './admin/components/ProtectedRoute';
import { RoleProtectedRoute as AdminRoleProtectedRoute } from './admin/components/RoleProtectedRoute';
import { ProtectedRoute as SuperAdminProtectedRoute } from './superadmin/components/ProtectedRoute';
import { RoleProtectedRoute as SuperAdminRoleProtectedRoute } from './superadmin/components/RoleProtectedRoute';
import AdminLayout from './admin/components/AdminLayout';
import SuperAdminLayout from './superadmin/components/SuperAdminLayout';
import DefaultLayout from './components/DefaultLayout';

// Pages
const Login = lazy(() => import('./pages/Login'));
const GeneralClients = lazy(() => import('./pages/Clients'));
const GeneralParametres = lazy(() => import('./pages/Parametres'));
const Register = lazy(() => import('./admin/pages/Register'));
const Dashboard = lazy(() => import('./admin/pages/Dashboard'));

// Admin Pages
const AdminClients = lazy(() => import('./admin/pages/Clients'));
const Compagnies = lazy(() => import('./admin/pages/Compagnies'));
const Contrats = lazy(() => import('./admin/pages/Contrats'));
const Souscription = lazy(() => import('./admin/pages/Souscription'));
const Medias = lazy(() => import('./admin/pages/Medias'));
const Paiements = lazy(() => import('./admin/pages/Paiements'));
const AdminParametres = lazy(() => import('./admin/pages/Parametres'));
const GestionUtilisateurs = lazy(() => import('./admin/pages/GestionUtilisateurs'));

const Organizations = lazy(() => import('./pages/Organizations'));
const OrganizationsManagement = lazy(() => import('./superadmin/pages/OrganizationsManagement'));

const LoadingFallback: React.FC = () => (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-primary-50 to-blue-50">
        <div className="text-center">
            <div className="relative mb-6">
                <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-primary-600 mx-auto" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                        className="w-8 h-8 text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                    </svg>
                </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">Sirius Assurance</h3>
            <p className="text-sm text-gray-600 animate-pulse">Chargement en cours...</p>

            <div className="mt-6 w-48 h-1 bg-gray-200 rounded-full overflow-hidden mx-auto">
                <div className="h-full bg-primary-600 rounded-full animate-pulse" style={{ width: '70%' }} />
            </div>
        </div>
    </div>
);

function App() {
    return (
        <BrowserRouter>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />

            <Suspense fallback={<LoadingFallback />}>
                <Routes>
                    {/* Route publique - Login */}
                    <Route
                        path="/login"
                        element={
                            <GeneralThemeProvider>
                                <GeneralAuthProvider>
                                    <GeneralProfileProvider>
                                        <OrganizationProvider>
                                            <Login />
                                        </OrganizationProvider>
                                    </GeneralProfileProvider>
                                </GeneralAuthProvider>
                            </GeneralThemeProvider>
                        }
                    />

                    {/* Routes Générales (Autres utilisateurs) */}
                    <Route
                        path="/clients"
                        element={
                            <GeneralThemeProvider>
                                <GeneralAuthProvider>
                                    <GeneralProfileProvider>
                                        <OrganizationProvider>
                                            <DefaultLayout>
                                                <GeneralClients />
                                            </DefaultLayout>
                                        </OrganizationProvider>
                                    </GeneralProfileProvider>
                                </GeneralAuthProvider>
                            </GeneralThemeProvider>
                        }
                    />
                    <Route
                        path="/parametres"
                        element={
                            <GeneralThemeProvider>
                                <GeneralAuthProvider>
                                    <GeneralProfileProvider>
                                        <OrganizationProvider>
                                            <DefaultLayout>
                                                <GeneralParametres />
                                            </DefaultLayout>
                                        </OrganizationProvider>
                                    </GeneralProfileProvider>
                                </GeneralAuthProvider>
                            </GeneralThemeProvider>
                        }
                    />

                    {/* Routes SuperAdmin */}
                    <Route
                        path="/superadmin/organizations"
                        element={
                            <SuperAdminThemeProvider>
                                <SuperAdminAuthProvider>
                                    <SuperAdminProfileProvider>
                                        <OrganizationProvider>
                                            <SuperAdminProtectedRoute>
                                                <SuperAdminRoleProtectedRoute allowedRoles={['superadmin']} redirectTo="/login">
                                                    <SuperAdminLayout>
                                                        <OrganizationsManagement />
                                                    </SuperAdminLayout>
                                                </SuperAdminRoleProtectedRoute>
                                            </SuperAdminProtectedRoute>
                                        </OrganizationProvider>
                                    </SuperAdminProfileProvider>
                                </SuperAdminAuthProvider>
                            </SuperAdminThemeProvider>
                        }
                    />
                    <Route
                        path="/superadmin/utilisateurs"
                        element={
                            <SuperAdminThemeProvider>
                                <SuperAdminAuthProvider>
                                    <SuperAdminProfileProvider>
                                        <OrganizationProvider>
                                            <SuperAdminProtectedRoute>
                                                <SuperAdminRoleProtectedRoute allowedRoles={['superadmin']} redirectTo="/login">
                                                    <SuperAdminLayout>
                                                        <GestionUtilisateurs />
                                                    </SuperAdminLayout>
                                                </SuperAdminRoleProtectedRoute>
                                            </SuperAdminProtectedRoute>
                                        </OrganizationProvider>
                                    </SuperAdminProfileProvider>
                                </SuperAdminAuthProvider>
                            </SuperAdminThemeProvider>
                        }
                    />
                    <Route
                        path="/superadmin/parametres"
                        element={
                            <SuperAdminThemeProvider>
                                <SuperAdminAuthProvider>
                                    <SuperAdminProfileProvider>
                                        <OrganizationProvider>
                                            <SuperAdminProtectedRoute>
                                                <SuperAdminRoleProtectedRoute allowedRoles={['superadmin']} redirectTo="/login">
                                                    <SuperAdminLayout>
                                                        <AdminParametres />
                                                    </SuperAdminLayout>
                                                </SuperAdminRoleProtectedRoute>
                                            </SuperAdminProtectedRoute>
                                        </OrganizationProvider>
                                    </SuperAdminProfileProvider>
                                </SuperAdminAuthProvider>
                            </SuperAdminThemeProvider>
                        }
                    />
                    {/* Redirections SuperAdmin */}
                    <Route path="/organizations/manage" element={<Navigate to="/superadmin/organizations" replace />} />
                    <Route path="/utilisateurs" element={<Navigate to="/superadmin/utilisateurs" replace />} />

                    {/* Routes Admin */}
                    <Route
                        path="/org/dashboard"
                        element={
                            <AdminThemeProvider>
                                <AdminAuthProvider>
                                    <AdminProfileProvider>
                                        <OrganizationProvider>
                                            <AdminProtectedRoute>
                                                <AdminRoleProtectedRoute allowedRoles={['admin', 'superadmin']} redirectTo="/org/clients">
                                                    <AdminLayout>
                                                        <Dashboard />
                                                    </AdminLayout>
                                                </AdminRoleProtectedRoute>
                                            </AdminProtectedRoute>
                                        </OrganizationProvider>
                                    </AdminProfileProvider>
                                </AdminAuthProvider>
                            </AdminThemeProvider>
                        }
                    />
                    <Route
                        path="/org/register"
                        element={
                            <AdminThemeProvider>
                                <AdminAuthProvider>
                                    <AdminProfileProvider>
                                        <OrganizationProvider>
                                            <AdminProtectedRoute>
                                                <AdminRoleProtectedRoute allowedRoles={['superadmin']} redirectTo="/org/clients">
                                                    <AdminLayout>
                                                        <Register />
                                                    </AdminLayout>
                                                </AdminRoleProtectedRoute>
                                            </AdminProtectedRoute>
                                        </OrganizationProvider>
                                    </AdminProfileProvider>
                                </AdminAuthProvider>
                            </AdminThemeProvider>
                        }
                    />
                    <Route
                        path="/org/clients"
                        element={
                            <AdminThemeProvider>
                                <AdminAuthProvider>
                                    <AdminProfileProvider>
                                        <OrganizationProvider>
                                            <AdminProtectedRoute>
                                                <AdminRoleProtectedRoute allowedRoles={['gestionnaire', 'admin', 'superadmin']}>
                                                    <AdminLayout>
                                                        <AdminClients />
                                                    </AdminLayout>
                                                </AdminRoleProtectedRoute>
                                            </AdminProtectedRoute>
                                        </OrganizationProvider>
                                    </AdminProfileProvider>
                                </AdminAuthProvider>
                            </AdminThemeProvider>
                        }
                    />
                    <Route
                        path="/org/compagnies"
                        element={
                            <AdminThemeProvider>
                                <AdminAuthProvider>
                                    <AdminProfileProvider>
                                        <OrganizationProvider>
                                            <AdminProtectedRoute>
                                                <AdminRoleProtectedRoute allowedRoles={['admin', 'superadmin']} redirectTo="/org/clients">
                                                    <AdminLayout>
                                                        <Compagnies />
                                                    </AdminLayout>
                                                </AdminRoleProtectedRoute>
                                            </AdminProtectedRoute>
                                        </OrganizationProvider>
                                    </AdminProfileProvider>
                                </AdminAuthProvider>
                            </AdminThemeProvider>
                        }
                    />
                    <Route
                        path="/org/contrats"
                        element={
                            <AdminThemeProvider>
                                <AdminAuthProvider>
                                    <AdminProfileProvider>
                                        <OrganizationProvider>
                                            <AdminProtectedRoute>
                                                <AdminRoleProtectedRoute allowedRoles={['gestionnaire', 'admin', 'superadmin']}>
                                                    <AdminLayout>
                                                        <Contrats />
                                                    </AdminLayout>
                                                </AdminRoleProtectedRoute>
                                            </AdminProtectedRoute>
                                        </OrganizationProvider>
                                    </AdminProfileProvider>
                                </AdminAuthProvider>
                            </AdminThemeProvider>
                        }
                    />
                    <Route
                        path="/org/souscription"
                        element={
                            <AdminThemeProvider>
                                <AdminAuthProvider>
                                    <AdminProfileProvider>
                                        <OrganizationProvider>
                                            <AdminProtectedRoute>
                                                <AdminRoleProtectedRoute allowedRoles={['gestionnaire', 'admin', 'superadmin']}>
                                                    <AdminLayout>
                                                        <Souscription />
                                                    </AdminLayout>
                                                </AdminRoleProtectedRoute>
                                            </AdminProtectedRoute>
                                        </OrganizationProvider>
                                    </AdminProfileProvider>
                                </AdminAuthProvider>
                            </AdminThemeProvider>
                        }
                    />
                    <Route
                        path="/org/medias"
                        element={
                            <AdminThemeProvider>
                                <AdminAuthProvider>
                                    <AdminProfileProvider>
                                        <OrganizationProvider>
                                            <AdminProtectedRoute>
                                                <AdminRoleProtectedRoute allowedRoles={['gestionnaire', 'admin', 'superadmin']}>
                                                    <AdminLayout>
                                                        <Medias />
                                                    </AdminLayout>
                                                </AdminRoleProtectedRoute>
                                            </AdminProtectedRoute>
                                        </OrganizationProvider>
                                    </AdminProfileProvider>
                                </AdminAuthProvider>
                            </AdminThemeProvider>
                        }
                    />
                    <Route
                        path="/org/paiements"
                        element={
                            <AdminThemeProvider>
                                <AdminAuthProvider>
                                    <AdminProfileProvider>
                                        <OrganizationProvider>
                                            <AdminProtectedRoute>
                                                <AdminRoleProtectedRoute allowedRoles={['gestionnaire', 'admin', 'superadmin']}>
                                                    <AdminLayout>
                                                        <Paiements />
                                                    </AdminLayout>
                                                </AdminRoleProtectedRoute>
                                            </AdminProtectedRoute>
                                        </OrganizationProvider>
                                    </AdminProfileProvider>
                                </AdminAuthProvider>
                            </AdminThemeProvider>
                        }
                    />
                    <Route
                        path="/org/organizations"
                        element={
                            <AdminThemeProvider>
                                <AdminAuthProvider>
                                    <AdminProfileProvider>
                                        <OrganizationProvider>
                                            <AdminProtectedRoute>
                                                <AdminLayout>
                                                    <Organizations />
                                                </AdminLayout>
                                            </AdminProtectedRoute>
                                        </OrganizationProvider>
                                    </AdminProfileProvider>
                                </AdminAuthProvider>
                            </AdminThemeProvider>
                        }
                    />
                    <Route
                        path="/org/parametres"
                        element={
                            <AdminThemeProvider>
                                <AdminAuthProvider>
                                    <AdminProfileProvider>
                                        <OrganizationProvider>
                                            <AdminProtectedRoute>
                                                <AdminLayout>
                                                    <AdminParametres />
                                                </AdminLayout>
                                            </AdminProtectedRoute>
                                        </OrganizationProvider>
                                    </AdminProfileProvider>
                                </AdminAuthProvider>
                            </AdminThemeProvider>
                        }
                    />
                    <Route
                        path="/org/utilisateurs"
                        element={
                            <AdminThemeProvider>
                                <AdminAuthProvider>
                                    <AdminProfileProvider>
                                        <OrganizationProvider>
                                            <AdminProtectedRoute>
                                                <AdminRoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
                                                    <AdminLayout>
                                                        <GestionUtilisateurs />
                                                    </AdminLayout>
                                                </AdminRoleProtectedRoute>
                                            </AdminProtectedRoute>
                                        </OrganizationProvider>
                                    </AdminProfileProvider>
                                </AdminAuthProvider>
                            </AdminThemeProvider>
                        }
                    />
                    {/* Redirections Admin */}
                    <Route path="/dashboard" element={<Navigate to="/org/dashboard" replace />} />
                    <Route path="/register" element={<Navigate to="/org/register" replace />} />
                    <Route path="/admin/clients" element={<Navigate to="/org/clients" replace />} />
                    <Route path="/compagnies" element={<Navigate to="/org/compagnies" replace />} />
                    <Route path="/contrats" element={<Navigate to="/org/contrats" replace />} />
                    <Route path="/souscription" element={<Navigate to="/org/souscription" replace />} />
                    <Route path="/medias" element={<Navigate to="/org/medias" replace />} />
                    <Route path="/paiements" element={<Navigate to="/org/paiements" replace />} />
                    <Route path="/organizations" element={<Navigate to="/org/organizations" replace />} />
                    <Route path="/admin/parametres" element={<Navigate to="/org/parametres" replace />} />

                    {/* Route par défaut */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

export default App;