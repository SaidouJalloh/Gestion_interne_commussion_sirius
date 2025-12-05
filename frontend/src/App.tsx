import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleProtectedRoute } from './components/RoleProtectedRoute';
import Layout from './components/Layout';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Clients = lazy(() => import('./pages/Clients'));
const Compagnies = lazy(() => import('./pages/Compagnies'));
const Contrats = lazy(() => import('./pages/Contrats'));
const Souscription = lazy(() => import('./pages/Souscription'));
const Medias = lazy(() => import('./pages/Medias'));
const Parametres = lazy(() => import('./pages/Parametres'));
const GestionUtilisateurs = lazy(() => import('./pages/GestionUtilisateurs'));

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
                                <Route path="/login" element={<Login />} />

                                <Route
                                    path="/dashboard"
                                    element={
                                        <ProtectedRoute>
                                            <RoleProtectedRoute allowedRoles={['admin', 'superadmin']} redirectTo="/clients">
                                                <Layout>
                                                    <Dashboard />
                                                </Layout>
                                            </RoleProtectedRoute>
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/register"
                                    element={
                                        <ProtectedRoute>
                                            <Layout>
                                                <Register />
                                            </Layout>
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/clients"
                                    element={
                                        <ProtectedRoute>
                                            <RoleProtectedRoute allowedRoles={['gestionnaire', 'admin', 'superadmin']}>
                                                <Layout>
                                                    <Clients />
                                                </Layout>
                                            </RoleProtectedRoute>
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/compagnies"
                                    element={
                                        <ProtectedRoute>
                                            <RoleProtectedRoute allowedRoles={['admin', 'superadmin']} redirectTo="/clients">
                                                <Layout>
                                                    <Compagnies />
                                                </Layout>
                                            </RoleProtectedRoute>
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/contrats"
                                    element={
                                        <ProtectedRoute>
                                            <RoleProtectedRoute allowedRoles={['gestionnaire', 'admin', 'superadmin']}>
                                                <Layout>
                                                    <Contrats />
                                                </Layout>
                                            </RoleProtectedRoute>
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/souscription"
                                    element={
                                        <ProtectedRoute>
                                            <RoleProtectedRoute allowedRoles={['gestionnaire', 'admin', 'superadmin']}>
                                                <Layout>
                                                    <Souscription />
                                                </Layout>
                                            </RoleProtectedRoute>
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/medias"
                                    element={
                                        <ProtectedRoute>
                                            <RoleProtectedRoute allowedRoles={['gestionnaire', 'admin', 'superadmin']}>
                                                <Layout>
                                                    <Medias />
                                                </Layout>
                                            </RoleProtectedRoute>
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/utilisateurs"
                                    element={
                                        <ProtectedRoute>
                                            <RoleProtectedRoute allowedRoles={['superadmin']} redirectTo="/clients">
                                                <Layout>
                                                    <GestionUtilisateurs />
                                                </Layout>
                                            </RoleProtectedRoute>
                                        </ProtectedRoute>
                                    }
                                />

                                <Route
                                    path="/parametres"
                                    element={
                                        <ProtectedRoute>
                                            <Layout>
                                                <Parametres />
                                            </Layout>
                                        </ProtectedRoute>
                                    }
                                />

                                <Route path="/" element={<Navigate to="/login" replace />} />
                                <Route path="*" element={<Navigate to="/login" replace />} />
                            </Routes>
                        </Suspense>
                    </ProfileProvider>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;


