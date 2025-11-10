// code qui fonctionne bien
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast'; // ✅ Ajout de l'import
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleProtectedRoute } from './components/RoleProtectedRoute';
import Layout from './components/Layout';

// ✅ OPTIMISATION: Lazy Loading des pages
// Chaque page est chargée seulement quand nécessaire
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

// ✅ Composant de chargement élégant
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-gradient-to-br from-primary-50 to-blue-50">
    <div className="text-center">
      {/* Spinner animé */}
      <div className="relative mb-6">
        <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-primary-600 mx-auto"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
      </div>

      {/* Texte */}
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Sirius Assurance</h3>
      <p className="text-sm text-gray-600 animate-pulse">Chargement en cours...</p>

      {/* Barre de progression */}
      <div className="mt-6 w-48 h-1 bg-gray-200 rounded-full overflow-hidden mx-auto">
        <div className="h-full bg-primary-600 rounded-full animate-pulse" style={{ width: '70%' }}></div>
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
          {/* ✅ Ajout du Toaster pour les notifications */}
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

          {/* ✅ Suspense avec fallback pour le lazy loading */}
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Route publique */}
              <Route path="/login" element={<Login />} />

              {/* Dashboard - Admin et SuperAdmin uniquement */}
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

              {/* Inscription - Tous les utilisateurs authentifiés */}
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

              {/* Clients - Gestionnaire, Admin, SuperAdmin */}
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

              {/* Compagnies - Admin et SuperAdmin uniquement */}
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

              {/* Contrats - Gestionnaire, Admin, SuperAdmin */}
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

              {/* Souscription - Gestionnaire, Admin, SuperAdmin */}
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

              {/* Médias - Gestionnaire, Admin, SuperAdmin */}
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

              {/* Gestion des utilisateurs - SuperAdmin uniquement */}
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

              {/* Paramètres - Tous les utilisateurs authentifiés */}
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

              {/* Redirections */}
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
















// code avec portail client for sinistre


// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { Suspense, lazy } from 'react';
// import { Toaster } from 'react-hot-toast';
// import { AuthProvider } from './context/AuthContext';
// import { ThemeProvider } from './context/ThemeContext';
// import { ProtectedRoute } from './components/ProtectedRoute';
// import { RoleProtectedRoute } from './components/RoleProtectedRoute';
// import Layout from './components/Layout';

// // Portail client
// import { PortailAuthProvider } from './portail/context/PortailAuthContext';

// // Pages plateforme interne
// const Login = lazy(() => import('./pages/Login'));
// const Register = lazy(() => import('./pages/Register'));
// const Dashboard = lazy(() => import('./pages/Dashboard'));
// const Clients = lazy(() => import('./pages/Clients'));
// const Compagnies = lazy(() => import('./pages/Compagnies'));
// const Contrats = lazy(() => import('./pages/Contrats'));
// const Souscription = lazy(() => import('./pages/Souscription'));
// const Medias = lazy(() => import('./pages/Medias'));
// const Parametres = lazy(() => import('./pages/Parametres'));
// const GestionUtilisateurs = lazy(() => import('./pages/GestionUtilisateurs'));

// // Pages portail client
// const PortailLogin = lazy(() => import('./portail/pages/PortailLogin'));

// const LoadingFallback = () => (
//   <div className="flex items-center justify-center h-screen bg-gradient-to-br from-primary-50 to-blue-50">
//     <div className="text-center">
//       <div className="relative mb-6">
//         <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-primary-600 mx-auto"></div>
//         <div className="absolute inset-0 flex items-center justify-center">
//           <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//           </svg>
//         </div>
//       </div>
//       <h3 className="text-lg font-semibold text-gray-800 mb-2">Sirius Assurance</h3>
//       <p className="text-sm text-gray-600 animate-pulse">Chargement en cours...</p>
//       <div className="mt-6 w-48 h-1 bg-gray-200 rounded-full overflow-hidden mx-auto">
//         <div className="h-full bg-primary-600 rounded-full animate-pulse" style={{ width: '70%' }}></div>
//       </div>
//     </div>
//   </div>
// );

// function App() {
//   return (
//     <BrowserRouter>
//       <ThemeProvider>
//         <AuthProvider>
//           <Toaster
//             position="top-right"
//             toastOptions={{
//               duration: 4000,
//               style: {
//                 background: '#363636',
//                 color: '#fff',
//               },
//               success: {
//                 duration: 3000,
//                 iconTheme: {
//                   primary: '#10b981',
//                   secondary: '#fff',
//                 },
//               },
//               error: {
//                 duration: 4000,
//                 iconTheme: {
//                   primary: '#ef4444',
//                   secondary: '#fff',
//                 },
//               },
//             }}
//           />

//           <Suspense fallback={<LoadingFallback />}>
//             <Routes>

//               {/* Routes portail client - Authentification séparée */}
//               <Route path="/portail/*" element={
//                 <PortailAuthProvider>
//                   <Routes>
//                     <Route path="login" element={<PortailLogin />} />
//                     <Route path="*" element={<Navigate to="/portail/login" replace />} />
//                   </Routes>
//                 </PortailAuthProvider>
//               } />

//               {/* Routes plateforme interne */}
//               <Route path="/login" element={<Login />} />

//               <Route
//                 path="/dashboard"
//                 element={
//                   <ProtectedRoute>
//                     <RoleProtectedRoute allowedRoles={['admin', 'superadmin']} redirectTo="/clients">
//                       <Layout>
//                         <Dashboard />
//                       </Layout>
//                     </RoleProtectedRoute>
//                   </ProtectedRoute>
//                 }
//               />

//               <Route
//                 path="/register"
//                 element={
//                   <ProtectedRoute>
//                     <Layout>
//                       <Register />
//                     </Layout>
//                   </ProtectedRoute>
//                 }
//               />

//               <Route
//                 path="/clients"
//                 element={
//                   <ProtectedRoute>
//                     <RoleProtectedRoute allowedRoles={['gestionnaire', 'admin', 'superadmin']}>
//                       <Layout>
//                         <Clients />
//                       </Layout>
//                     </RoleProtectedRoute>
//                   </ProtectedRoute>
//                 }
//               />

//               <Route
//                 path="/compagnies"
//                 element={
//                   <ProtectedRoute>
//                     <RoleProtectedRoute allowedRoles={['admin', 'superadmin']} redirectTo="/clients">
//                       <Layout>
//                         <Compagnies />
//                       </Layout>
//                     </RoleProtectedRoute>
//                   </ProtectedRoute>
//                 }
//               />

//               <Route
//                 path="/contrats"
//                 element={
//                   <ProtectedRoute>
//                     <RoleProtectedRoute allowedRoles={['gestionnaire', 'admin', 'superadmin']}>
//                       <Layout>
//                         <Contrats />
//                       </Layout>
//                     </RoleProtectedRoute>
//                   </ProtectedRoute>
//                 }
//               />

//               <Route
//                 path="/souscription"
//                 element={
//                   <ProtectedRoute>
//                     <RoleProtectedRoute allowedRoles={['gestionnaire', 'admin', 'superadmin']}>
//                       <Layout>
//                         <Souscription />
//                       </Layout>
//                     </RoleProtectedRoute>
//                   </ProtectedRoute>
//                 }
//               />

//               <Route
//                 path="/medias"
//                 element={
//                   <ProtectedRoute>
//                     <RoleProtectedRoute allowedRoles={['gestionnaire', 'admin', 'superadmin']}>
//                       <Layout>
//                         <Medias />
//                       </Layout>
//                     </RoleProtectedRoute>
//                   </ProtectedRoute>
//                 }
//               />

//               <Route
//                 path="/utilisateurs"
//                 element={
//                   <ProtectedRoute>
//                     <RoleProtectedRoute allowedRoles={['superadmin']} redirectTo="/clients">
//                       <Layout>
//                         <GestionUtilisateurs />
//                       </Layout>
//                     </RoleProtectedRoute>
//                   </ProtectedRoute>
//                 }
//               />

//               <Route
//                 path="/parametres"
//                 element={
//                   <ProtectedRoute>
//                     <Layout>
//                       <Parametres />
//                     </Layout>
//                   </ProtectedRoute>
//                 }
//               />

//               {/* Redirections */}
//               <Route path="/" element={<Navigate to="/login" replace />} />
//               <Route path="*" element={<Navigate to="/login" replace />} />
//             </Routes>
//           </Suspense>
//         </AuthProvider>
//       </ThemeProvider>
//     </BrowserRouter>
//   );
// }

// export default App;












// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { Suspense, lazy } from 'react';
// import { Toaster } from 'react-hot-toast';
// import { AuthProvider } from './context/AuthContext';
// import { ThemeProvider } from './context/ThemeContext';
// import { ProtectedRoute } from './components/ProtectedRoute';
// import { RoleProtectedRoute } from './components/RoleProtectedRoute';
// import Layout from './components/Layout';

// // Portail client - Context et composants
// import { PortailAuthProvider } from './portail/context/PortailAuthContext';
// import ProtectedPortailRoute from './portail/components/ProtectedPortailRoute';

// // Pages plateforme interne
// const Login = lazy(() => import('./pages/Login'));
// const Register = lazy(() => import('./pages/Register'));
// const Dashboard = lazy(() => import('./pages/Dashboard'));
// const Clients = lazy(() => import('./pages/Clients'));
// const Compagnies = lazy(() => import('./pages/Compagnies'));
// const Contrats = lazy(() => import('./pages/Contrats'));
// const Souscription = lazy(() => import('./pages/Souscription'));
// const Medias = lazy(() => import('./pages/Medias'));
// const Parametres = lazy(() => import('./pages/Parametres'));
// const GestionUtilisateurs = lazy(() => import('./pages/GestionUtilisateurs'));

// // Pages portail client

// const PortailLogin = lazy(() => import('./portail/pages/PortailLogin'));
// const PortailDashboard = lazy(() => import('./portail/pages/PortailDashboard'));
// const NouveauSinistre = lazy(() => import('./portail/pages/NouveauSinistre'));
// // const MesSinistres = lazy(() => import('./portail/pages/MesSinistres'));
// // const SinistreDetail = lazy(() => import('./portail/pages/SinistreDetail'));

// const LoadingFallback = () => (
//   <div className="flex items-center justify-center h-screen bg-gradient-to-br from-primary-50 to-blue-50">
//     <div className="text-center">
//       <div className="relative mb-6">
//         <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-primary-600 mx-auto"></div>
//         <div className="absolute inset-0 flex items-center justify-center">
//           <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//           </svg>
//         </div>
//       </div>
//       <h3 className="text-lg font-semibold text-gray-800 mb-2">Sirius Assurance</h3>
//       <p className="text-sm text-gray-600 animate-pulse">Chargement en cours...</p>
//       <div className="mt-6 w-48 h-1 bg-gray-200 rounded-full overflow-hidden mx-auto">
//         <div className="h-full bg-primary-600 rounded-full animate-pulse" style={{ width: '70%' }}></div>
//       </div>
//     </div>
//   </div>
// );

// function App() {
//   return (
//     <BrowserRouter>
//       <ThemeProvider>
//         <AuthProvider>
//           <Toaster
//             position="top-right"
//             toastOptions={{
//               duration: 4000,
//               style: {
//                 background: '#363636',
//                 color: '#fff',
//               },
//               success: {
//                 duration: 3000,
//                 iconTheme: {
//                   primary: '#10b981',
//                   secondary: '#fff',
//                 },
//               },
//               error: {
//                 duration: 4000,
//                 iconTheme: {
//                   primary: '#ef4444',
//                   secondary: '#fff',
//                 },
//               },
//             }}
//           />

//           <Suspense fallback={<LoadingFallback />}>
//             <Routes>

//               {/* ============================================ */}
//               {/* ROUTES PORTAIL CLIENT - Authentification séparée */}
//               {/* ============================================ */}
//               <Route path="/portail/*" element={
//                 <PortailAuthProvider>
//                   <Routes>
//                     {/* Page de connexion publique */}
//                     <Route path="login" element={<PortailLogin />} />

//                     {/* Pages protégées du portail */}
//                     <Route path="dashboard" element={
//                       <ProtectedPortailRoute>
//                         <PortailDashboard />
//                       </ProtectedPortailRoute>
//                     } />

//                     <Route path="nouveau-sinistre" element={
//                       <ProtectedPortailRoute>
//                         <NouveauSinistre />
//                       </ProtectedPortailRoute>
//                     } />

//                     {/* Routes à créer plus tard */}
//                     {/* <Route path="mes-sinistres" element={
//                       <ProtectedPortailRoute>
//                         <MesSinistres />
//                       </ProtectedPortailRoute>
//                     } /> */}

//                     {/* <Route path="sinistre/:id" element={
//                       <ProtectedPortailRoute>
//                         <SinistreDetail />
//                       </ProtectedPortailRoute>
//                     } /> */}

//                     {/* Redirection par défaut */}
//                     <Route path="*" element={<Navigate to="/portail/login" replace />} />
//                   </Routes>
//                 </PortailAuthProvider>
//               } />

//               {/* ============================================ */}
//               {/* ROUTES PLATEFORME INTERNE */}
//               {/* ============================================ */}

//               {/* Page de connexion équipe */}
//               <Route path="/login" element={<Login />} />

//               {/* Dashboard équipe */}
//               <Route
//                 path="/dashboard"
//                 element={
//                   <ProtectedRoute>
//                     <RoleProtectedRoute allowedRoles={['admin', 'superadmin']} redirectTo="/clients">
//                       <Layout>
//                         <Dashboard />
//                       </Layout>
//                     </RoleProtectedRoute>
//                   </ProtectedRoute>
//                 }
//               />

//               {/* Enregistrement */}
//               <Route
//                 path="/register"
//                 element={
//                   <ProtectedRoute>
//                     <Layout>
//                       <Register />
//                     </Layout>
//                   </ProtectedRoute>
//                 }
//               />

//               {/* Clients */}
//               <Route
//                 path="/clients"
//                 element={
//                   <ProtectedRoute>
//                     <RoleProtectedRoute allowedRoles={['gestionnaire', 'admin', 'superadmin']}>
//                       <Layout>
//                         <Clients />
//                       </Layout>
//                     </RoleProtectedRoute>
//                   </ProtectedRoute>
//                 }
//               />

//               {/* Compagnies */}
//               <Route
//                 path="/compagnies"
//                 element={
//                   <ProtectedRoute>
//                     <RoleProtectedRoute allowedRoles={['admin', 'superadmin']} redirectTo="/clients">
//                       <Layout>
//                         <Compagnies />
//                       </Layout>
//                     </RoleProtectedRoute>
//                   </ProtectedRoute>
//                 }
//               />

//               {/* Contrats */}
//               <Route
//                 path="/contrats"
//                 element={
//                   <ProtectedRoute>
//                     <RoleProtectedRoute allowedRoles={['gestionnaire', 'admin', 'superadmin']}>
//                       <Layout>
//                         <Contrats />
//                       </Layout>
//                     </RoleProtectedRoute>
//                   </ProtectedRoute>
//                 }
//               />

//               {/* Souscription */}
//               <Route
//                 path="/souscription"
//                 element={
//                   <ProtectedRoute>
//                     <RoleProtectedRoute allowedRoles={['gestionnaire', 'admin', 'superadmin']}>
//                       <Layout>
//                         <Souscription />
//                       </Layout>
//                     </RoleProtectedRoute>
//                   </ProtectedRoute>
//                 }
//               />

//               {/* Médias */}
//               <Route
//                 path="/medias"
//                 element={
//                   <ProtectedRoute>
//                     <RoleProtectedRoute allowedRoles={['gestionnaire', 'admin', 'superadmin']}>
//                       <Layout>
//                         <Medias />
//                       </Layout>
//                     </RoleProtectedRoute>
//                   </ProtectedRoute>
//                 }
//               />

//               {/* Gestion utilisateurs */}
//               <Route
//                 path="/utilisateurs"
//                 element={
//                   <ProtectedRoute>
//                     <RoleProtectedRoute allowedRoles={['superadmin']} redirectTo="/clients">
//                       <Layout>
//                         <GestionUtilisateurs />
//                       </Layout>
//                     </RoleProtectedRoute>
//                   </ProtectedRoute>
//                 }
//               />

//               {/* Paramètres */}
//               <Route
//                 path="/parametres"
//                 element={
//                   <ProtectedRoute>
//                     <Layout>
//                       <Parametres />
//                     </Layout>
//                   </ProtectedRoute>
//                 }
//               />

//               {/* ============================================ */}
//               {/* REDIRECTIONS */}
//               {/* ============================================ */}
//               <Route path="/" element={<Navigate to="/login" replace />} />
//               <Route path="*" element={<Navigate to="/login" replace />} />
//             </Routes>
//           </Suspense>
//         </AuthProvider>
//       </ThemeProvider>
//     </BrowserRouter>
//   );
// }

// export default App;