import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Providers unifies (montes UNE SEULE FOIS)
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { OrganizationProvider } from './context/OrganizationContext';

// Composants de protection unifies
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleProtectedRoute } from './components/RoleProtectedRoute';

// Layouts
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
const UserProfile = lazy(() => import('./admin/pages/UserProfile'));

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
            <ThemeProvider>
                <AuthProvider>
                    <ProfileProvider>
                        <OrganizationProvider>
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
                                    <Route path="/login" element={<Login />} />

                                    {/* Routes Generales (Autres utilisateurs) */}
                                    <Route
                                        path="/clients"
                                        element={
                                            <DefaultLayout>
                                                <GeneralClients />
                                            </DefaultLayout>
                                        }
                                    />
                                    <Route
                                        path="/parametres"
                                        element={
                                            <DefaultLayout>
                                                <GeneralParametres />
                                            </DefaultLayout>
                                        }
                                    />

                                    {/* Routes SuperAdmin */}
                                    <Route
                                        path="/superadmin/organizations"
                                        element={
                                            <ProtectedRoute>
                                                <RoleProtectedRoute allowedRoles={['superadmin']} redirectTo="/login">
                                                    <SuperAdminLayout>
                                                        <OrganizationsManagement />
                                                    </SuperAdminLayout>
                                                </RoleProtectedRoute>
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/superadmin/utilisateurs"
                                        element={
                                            <ProtectedRoute>
                                                <RoleProtectedRoute allowedRoles={['superadmin']} redirectTo="/login">
                                                    <SuperAdminLayout>
                                                        <GestionUtilisateurs />
                                                    </SuperAdminLayout>
                                                </RoleProtectedRoute>
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/superadmin/parametres"
                                        element={
                                            <ProtectedRoute>
                                                <RoleProtectedRoute allowedRoles={['superadmin']} redirectTo="/login">
                                                    <SuperAdminLayout>
                                                        <AdminParametres />
                                                    </SuperAdminLayout>
                                                </RoleProtectedRoute>
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Redirections SuperAdmin */}
                                    <Route path="/organizations/manage" element={<Navigate to="/superadmin/organizations" replace />} />
                                    <Route path="/utilisateurs" element={<Navigate to="/superadmin/utilisateurs" replace />} />

                                    {/* Routes Admin */}
                                    <Route
                                        path="/org/dashboard"
                                        element={
                                            <ProtectedRoute>
                                                <RoleProtectedRoute allowedRoles={['admin', 'superadmin']} redirectTo="/org/clients">
                                                    <AdminLayout>
                                                        <Dashboard />
                                                    </AdminLayout>
                                                </RoleProtectedRoute>
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/org/register"
                                        element={
                                            <ProtectedRoute>
                                                <RoleProtectedRoute allowedRoles={['superadmin']} redirectTo="/org/clients">
                                                    <AdminLayout>
                                                        <Register />
                                                    </AdminLayout>
                                                </RoleProtectedRoute>
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/org/clients"
                                        element={
                                            <ProtectedRoute>
                                                <RoleProtectedRoute allowedRoles={['gestionnaire', 'admin', 'superadmin']}>
                                                    <AdminLayout>
                                                        <AdminClients />
                                                    </AdminLayout>
                                                </RoleProtectedRoute>
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/org/compagnies"
                                        element={
                                            <ProtectedRoute>
                                                <RoleProtectedRoute allowedRoles={['admin', 'superadmin']} redirectTo="/org/clients">
                                                    <AdminLayout>
                                                        <Compagnies />
                                                    </AdminLayout>
                                                </RoleProtectedRoute>
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/org/contrats"
                                        element={
                                            <ProtectedRoute>
                                                <RoleProtectedRoute allowedRoles={['gestionnaire', 'admin', 'superadmin']}>
                                                    <AdminLayout>
                                                        <Contrats />
                                                    </AdminLayout>
                                                </RoleProtectedRoute>
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/org/souscription"
                                        element={
                                            <ProtectedRoute>
                                                <RoleProtectedRoute allowedRoles={['gestionnaire', 'admin', 'superadmin']}>
                                                    <AdminLayout>
                                                        <Souscription />
                                                    </AdminLayout>
                                                </RoleProtectedRoute>
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/org/medias"
                                        element={
                                            <ProtectedRoute>
                                                <RoleProtectedRoute allowedRoles={['gestionnaire', 'admin', 'superadmin']}>
                                                    <AdminLayout>
                                                        <Medias />
                                                    </AdminLayout>
                                                </RoleProtectedRoute>
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/org/paiements"
                                        element={
                                            <ProtectedRoute>
                                                <RoleProtectedRoute allowedRoles={['gestionnaire', 'admin', 'superadmin']}>
                                                    <AdminLayout>
                                                        <Paiements />
                                                    </AdminLayout>
                                                </RoleProtectedRoute>
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/org/organizations"
                                        element={
                                            <ProtectedRoute>
                                                <AdminLayout>
                                                    <Organizations />
                                                </AdminLayout>
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/org/parametres"
                                        element={
                                            <ProtectedRoute>
                                                <AdminLayout>
                                                    <AdminParametres />
                                                </AdminLayout>
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/profil"
                                        element={
                                            <ProtectedRoute>
                                                <AdminLayout>
                                                    <UserProfile />
                                                </AdminLayout>
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/org/utilisateurs"
                                        element={
                                            <ProtectedRoute>
                                                <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
                                                    <AdminLayout>
                                                        <GestionUtilisateurs />
                                                    </AdminLayout>
                                                </RoleProtectedRoute>
                                            </ProtectedRoute>
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

                                    {/* Route par defaut */}
                                    <Route path="/" element={<Navigate to="/login" replace />} />
                                    <Route path="*" element={<Navigate to="/login" replace />} />
                                </Routes>
                            </Suspense>
                        </OrganizationProvider>
                    </ProfileProvider>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;
