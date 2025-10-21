
// // code qui marche bien
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import { ThemeProvider } from './context/ThemeContext';
// import { ProtectedRoute } from './components/ProtectedRoute';
// import Layout from './components/Layout';

// // Pages
// import Login from './pages/Login';
// import Register from './pages/Register';
// import Dashboard from './pages/Dashboard';
// import Clients from './pages/Clients';
// import Compagnies from './pages/Compagnies';
// import Contrats from './pages/Contrats';
// // import Paiements from './pages/Paiements';
// import Medias from './pages/Medias';
// import Parametres from './pages/Parametres';

// function App() {
//   return (
//     <BrowserRouter>
//       <ThemeProvider>
//         <AuthProvider>
//           <Routes>
//             {/* Route publique */}
//             <Route path="/login" element={<Login />} />

//             {/* Routes protégées */}
//             <Route
//               path="/dashboard"
//               element={
//                 <ProtectedRoute>
//                   <Layout>
//                     <Dashboard />
//                   </Layout>
//                 </ProtectedRoute>
//               }
//             />

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

//             <Route
//               path="/clients"
//               element={
//                 <ProtectedRoute>
//                   <Layout>
//                     <Clients />
//                   </Layout>
//                 </ProtectedRoute>
//               }
//             />

//             <Route
//               path="/compagnies"
//               element={
//                 <ProtectedRoute>
//                   <Layout>
//                     <Compagnies />
//                   </Layout>
//                 </ProtectedRoute>
//               }
//             />

//             <Route
//               path="/contrats"
//               element={
//                 <ProtectedRoute>
//                   <Layout>
//                     <Contrats />
//                   </Layout>
//                 </ProtectedRoute>
//               }
//             />
//             {/* 
//             <Route
//               path="/paiements"
//               element={
//                 <ProtectedRoute>
//                   <Layout>
//                     <Paiements />
//                   </Layout>
//                 </ProtectedRoute>
//               }
//             /> */}

//             <Route
//               path="/medias"
//               element={
//                 <ProtectedRoute>
//                   <Layout>
//                     <Medias />
//                   </Layout>
//                 </ProtectedRoute>
//               }
//             />

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









// n1
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