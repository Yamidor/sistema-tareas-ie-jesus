import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import CoordinatorDashboard from "@/pages/CoordinatorDashboard";
import TeacherDashboard from "@/pages/TeacherDashboard";
import PublicCalendarPage from "@/pages/PublicCalendarPage";
import Home from "@/pages/Home";

// Componente para redireccionar según el rol del usuario
const DashboardRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role === 'coordinator') {
    return <Navigate to="/coordinator" replace />;
  } else if (user.role === 'teacher') {
    return <Navigate to="/teacher" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Ruta pública de login */}
            <Route path="/login" element={<Login />} />
            
            {/* Ruta pública del calendario */}
            <Route path="/calendario-actividades" element={<PublicCalendarPage />} />
            
            {/* Ruta raíz que redirige según el rol */}
            <Route path="/" element={<DashboardRedirect />} />
            
            {/* Rutas protegidas para coordinador */}
            <Route 
              path="/coordinator" 
              element={
                <ProtectedRoute requiredRole="coordinator">
                  <CoordinatorDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Rutas protegidas para profesor */}
            <Route 
              path="/teacher" 
              element={
                <ProtectedRoute requiredRole="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Ruta de home (opcional, protegida) */}
            <Route 
              path="/home" 
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } 
            />
            
            {/* Ruta catch-all para rutas no encontradas */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          {/* Toaster para notificaciones */}
          <Toaster 
            position="top-right" 
            richColors 
            closeButton 
            duration={4000}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}
