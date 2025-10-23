

// // n1 qui marche bien sans souscription
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import { ThemeProvider } from './context/ThemeContext';
// import { ProtectedRoute } from './components/ProtectedRoute';
// import { RoleProtectedRoute } from './components/RoleProtectedRoute';
// import Layout from './components/Layout';

// // Pages
// import Login from './pages/Login';
// import Register from './pages/Register';
// import Dashboard from './pages/Dashboard';
// import Clients from './pages/Clients';
// import Compagnies from './pages/Compagnies';
// import Contrats from './pages/Contrats';
// import Medias from './pages/Medias';
// import Parametres from './pages/Parametres';
// import GestionUtilisateurs from './pages/GestionUtilisateurs';

// function App() {
//   return (
//     <BrowserRouter>
//       <ThemeProvider>
//         <AuthProvider>
//           <Routes>
//             {/* Route publique */}
//             <Route path="/login" element={<Login />} />

//             {/* Dashboard - Admin et SuperAdmin uniquement */}
//             <Route
//               path="/dashboard"
//               element={
//                 <ProtectedRoute>
//                   <RoleProtectedRoute allowedRoles={['admin', 'superadmin']} redirectTo="/clients">
//                     <Layout>
//                       <Dashboard />
//                     </Layout>
//                   </RoleProtectedRoute>
//                 </ProtectedRoute>
//               }
//             />

//             {/* Inscription - Tous les utilisateurs authentifiés */}
//             <Route
//               path="/register"
//               element={
//                 <ProtectedRoute>
//                   <Layout>
//                     <Register />
//                   </Layout>
//                 </ProtectedRoute>
//               }
//             />

//             {/* Clients - Gestionnaire, Admin, SuperAdmin */}
//             <Route
//               path="/clients"
//               element={
//                 <ProtectedRoute>
//                   <RoleProtectedRoute allowedRoles={['gestionnaire', 'admin', 'superadmin']}>
//                     <Layout>
//                       <Clients />
//                     </Layout>
//                   </RoleProtectedRoute>
//                 </ProtectedRoute>
//               }
//             />

//             {/* Compagnies - Admin et SuperAdmin uniquement */}
//             <Route
//               path="/compagnies"
//               element={
//                 <ProtectedRoute>
//                   <RoleProtectedRoute allowedRoles={['admin', 'superadmin']} redirectTo="/clients">
//                     <Layout>
//                       <Compagnies />
//                     </Layout>
//                   </RoleProtectedRoute>
//                 </ProtectedRoute>
//               }
//             />

//             {/* Contrats - Gestionnaire, Admin, SuperAdmin */}
//             <Route
//               path="/contrats"
//               element={
//                 <ProtectedRoute>
//                   <RoleProtectedRoute allowedRoles={['gestionnaire', 'admin', 'superadmin']}>
//                     <Layout>
//                       <Contrats />
//                     </Layout>
//                   </RoleProtectedRoute>
//                 </ProtectedRoute>
//               }
//             />

//             {/* Médias - Gestionnaire, Admin, SuperAdmin */}
//             <Route
//               path="/medias"
//               element={
//                 <ProtectedRoute>
//                   <RoleProtectedRoute allowedRoles={['gestionnaire', 'admin', 'superadmin']}>
//                     <Layout>
//                       <Medias />
//                     </Layout>
//                   </RoleProtectedRoute>
//                 </ProtectedRoute>
//               }
//             />

//             {/* Gestion des utilisateurs - SuperAdmin uniquement */}
//             <Route
//               path="/utilisateurs"
//               element={
//                 <ProtectedRoute>
//                   <RoleProtectedRoute allowedRoles={['superadmin']} redirectTo="/clients">
//                     <Layout>
//                       <GestionUtilisateurs />
//                     </Layout>
//                   </RoleProtectedRoute>
//                 </ProtectedRoute>
//               }
//             />

//             {/* Paramètres - Tous les utilisateurs authentifiés */}
//             <Route
//               path="/parametres"
//               element={
//                 <ProtectedRoute>
//                   <Layout>
//                     <Parametres />
//                   </Layout>
//                 </ProtectedRoute>
//               }
//             />

//             {/* Redirections */}
//             <Route path="/" element={<Navigate to="/login" replace />} />
//             <Route path="*" element={<Navigate to="/login" replace />} />
//           </Routes>
//         </AuthProvider>
//       </ThemeProvider>
//     </BrowserRouter>
//   );
// }

// export default App;
























// code avec souscription
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleProtectedRoute } from './components/RoleProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Compagnies from './pages/Compagnies';
import Contrats from './pages/Contrats';
import Souscription from './pages/Souscription';
import Medias from './pages/Medias';
import Parametres from './pages/Parametres';
import GestionUtilisateurs from './pages/GestionUtilisateurs';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
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

            {/* ✅ NOUVELLE ROUTE: Souscription - Gestionnaire, Admin, SuperAdmin */}
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
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;