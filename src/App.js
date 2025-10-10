// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import { ProtectedRoute } from './components/ProtectedRoute';
// import Layout from './components/Layout';

// // Pages
// import Login from './pages/Login';
// import Register from './pages/Register';
// import Dashboard from './pages/Dashboard';
// import Clients from './pages/Clients';
// import Contrats from './pages/Contrats';
// import Paiements from './pages/Paiements';

// function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <Routes>
//           {/* Routes publiques */}
//           <Route path="/login" element={<Login />} />

//           {/* Routes protégées avec Layout */}
//           <Route
//             path="/dashboard"
//             element={
//               <ProtectedRoute requireDashboardAccess={true}>
//                 <Layout>
//                   <Dashboard />
//                 </Layout>
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/register"
//             element={
//               <ProtectedRoute allowedRoles={['superadmin']}>
//                 <Layout>
//                   <Register />
//                 </Layout>
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/clients"
//             element={
//               <ProtectedRoute>
//                 <Layout>
//                   <Clients />
//                 </Layout>
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/contrats"
//             element={
//               <ProtectedRoute>
//                 <Layout>
//                   <Contrats />
//                 </Layout>
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/paiements"
//             element={
//               <ProtectedRoute>
//                 <Layout>
//                   <Paiements />
//                 </Layout>
//               </ProtectedRoute>
//             }
//           />

//           {/* Redirection par défaut */}
//           <Route path="/" element={<Navigate to="/login" replace />} />
//           <Route path="*" element={<Navigate to="/login" replace />} />
//         </Routes>
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }

// export default App;






// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import { ProtectedRoute } from './components/ProtectedRoute';
// import Layout from './components/Layout';

// // Pages
// import Login from './pages/Login';
// import Register from './pages/Register';
// import Dashboard from './pages/Dashboard';
// import Clients from './pages/Clients';
// import Compagnies from './pages/Compagnies';
// import Contrats from './pages/Contrats';
// import Paiements from './pages/Paiements';
// import Medias from './pages/Medias';
// import Parametres from './pages/Parametres';

// function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <Routes>
//           {/* Routes publiques */}
//           <Route path="/login" element={<Login />} />

//           {/* Routes protégées avec Layout */}
//           <Route
//             path="/dashboard"
//             element={
//               <ProtectedRoute requireDashboardAccess={true}>
//                 <Layout>
//                   <Dashboard />
//                 </Layout>
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/register"
//             element={
//               <ProtectedRoute allowedRoles={['superadmin']}>
//                 <Layout>
//                   <Register />
//                 </Layout>
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/clients"
//             element={
//               <ProtectedRoute>
//                 <Layout>
//                   <Clients />
//                 </Layout>
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/compagnies"
//             element={
//               <ProtectedRoute>
//                 <Layout>
//                   <Compagnies />
//                 </Layout>
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/contrats"
//             element={
//               <ProtectedRoute>
//                 <Layout>
//                   <Contrats />
//                 </Layout>
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/paiements"
//             element={
//               <ProtectedRoute>
//                 <Layout>
//                   <Paiements />
//                 </Layout>
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/medias"
//             element={
//               <ProtectedRoute>
//                 <Layout>
//                   <Medias />
//                 </Layout>
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/parametres"
//             element={
//               <ProtectedRoute>
//                 <Layout>
//                   <Parametres />
//                 </Layout>
//               </ProtectedRoute>
//             }
//           />

//           {/* Redirection par défaut */}
//           <Route path="/" element={<Navigate to="/login" replace />} />
//           <Route path="*" element={<Navigate to="/login" replace />} />
//         </Routes>
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }

// export default App;
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Compagnies from './pages/Compagnies';
import Contrats from './pages/Contrats';
// import Paiements from './pages/Paiements';
import Medias from './pages/Medias';
import Parametres from './pages/Parametres';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Route publique */}
            <Route path="/login" element={<Login />} />

            {/* Routes protégées */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
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
                  <Layout>
                    <Clients />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/compagnies"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Compagnies />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/contrats"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Contrats />
                  </Layout>
                </ProtectedRoute>
              }
            />
            {/* 
            <Route
              path="/paiements"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Paiements />
                  </Layout>
                </ProtectedRoute>
              }
            /> */}

            <Route
              path="/medias"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Medias />
                  </Layout>
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