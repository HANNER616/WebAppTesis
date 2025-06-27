"use client"

import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import { AuthProvider, useAuth } from "./AuthContext"
import { ThemeProvider } from "./ThemeContext"
import { Menu, Camera, FileText, Settings, LogOut } from "lucide-react"
import AlertsSummary from "./pages/AlertsSummary"
import ConfigCamera from "./pages/ConfigCamera"
import AppConfig from "./pages/AppConfig"
import Auth from "./pages/Auth"
import "./index.css"
import Webcam from './components/Webcam'


// Estado para simular autenticación
//const [isAuthenticated, setIsAuthenticated] = useState(false)

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth(); // Usa el contexto
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};


function App() {


  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/alerts" element={<AlertsSummary />} />
                      <Route path="/config-camera" element={<ConfigCamera />} />
                      <Route path="/config-app" element={<AppConfig />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  )
}

// Componente de Layout para las páginas autenticadas
function AppLayout({ children }) {

  const { logout } = useAuth(); // Obtén la función logout del contexto
  const navigate = useNavigate(); // Hook para redirigir

  const handleLogout = () => {
    logout();
    navigate('/auth');
  }

  return (
    <div className="
      flex flex-col min-h-screen
      bg-white text-gray-900
      dark:bg-gray-900 dark:text-gray-100
    ">
      <header className="
        border-b border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-800
      ">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">
            Monitor de Aula
          </Link>

          <div className="relative group">
            <button className="
              p-2 rounded-full
              hover:bg-gray-100 dark:hover:bg-gray-700
              transition
            ">
              <Menu className="h-5 w-5 text-gray-800 dark:text-gray-200" />
            </button>
            <div className="
              absolute right-0 top-full w-48
              bg-white dark:bg-gray-800
              rounded-md shadow-lg py-1
              z-10 hidden group-hover:block
            ">
              <Link to="/config-camera" className="
                flex items-center px-4 py-2 text-sm
                text-gray-700 dark:text-gray-200
                hover:bg-gray-100 dark:hover:bg-gray-700
              ">
                <Camera className="mr-2 h-4 w-4" />
                Configuración de Cámara
              </Link>
              <Link to="/alerts" className="
                flex items-center px-4 py-2 text-sm
                text-gray-700 dark:text-gray-200
                hover:bg-gray-100 dark:hover:bg-gray-700
              ">
                <FileText className="mr-2 h-4 w-4" />
                Registro de Incidentes
              </Link>
              <Link to="/config-app" className="
                flex items-center px-4 py-2 text-sm
                text-gray-700 dark:text-gray-200
                hover:bg-gray-100 dark:hover:bg-gray-700
              ">
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </Link>
              <button
                onClick={handleLogout}
                className="
                  flex items-center px-4 py-2 text-sm
                  text-gray-700 dark:text-gray-200
                  hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left
                ">
                <LogOut className="mr-2 h-4 w-4" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 h-full">
        {children}
      </main>

      <footer className="
        border-t border-gray-200 dark:border-gray-700
        bg-transparent
      ">
        <div className="container mx-auto px-4 py-2 text-center text-sm
                        text-gray-500 dark:text-gray-400">
          © 2023 Monitor de Aula. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  )
}

// Componente de la página principal
function HomePage() {

  //WEBCAM -------------------------------------------------------------
  const [showWebcam, setShowWebcam] = useState(false);
  const webcamRef = useRef(null);


  useEffect(() => {
    let mounted = true;

    const checkWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (mounted) {
          setShowWebcam(true);
        }
        // Detener el stream inmediatamente después de la verificación
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        if (mounted) {
          setShowWebcam(false);
        }
      }
    };

    checkWebcam();

    return () => {
      mounted = false;
    };
  }, []);
  //---------------------------------------------------------------------
  const [alerts, setAlerts] = useState([])

  const handleNewAlert = (alert) => {
    setAlerts(prevAlerts => [...prevAlerts, alert]);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full">
      <div className="
        md:col-span-2 p-4 rounded-lg shadow
        bg-white dark:bg-gray-800 transition-colors
      ">
        <h2 className="text-xl font-semibold mb-4">Vista de Cámara</h2>
        <div className="aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          {showWebcam ? (
            <Webcam
              ref={webcamRef}
              onNewAlert={handleNewAlert}
              className="h-full w-full object-cover"
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: 'user' }}
            />
          ) : (
            <Camera className="h-16 w-16 text-gray-400 dark:text-gray-500" />
          )}
        </div>
      </div>

      <div className="
  p-4 rounded-lg shadow
  bg-white dark:bg-gray-800 transition-colors
">
  <h2 className="text-xl font-semibold mb-4 flex items-center">
    <FileText className="mr-2 h-5 w-5" />
    Alertas
  </h2>
  <ul className="
    overflow-y-auto  /* scroll cuando rebasa */
    space-y-4
    max-h-[550px] /* altura máxima para el scroll */

  ">
  {alerts.map((a, i) => (
    <li
      key={i}
      className="
        w-full
        border-2 border-orange-500
        bg-orange-100 dark:bg-orange-900
        rounded-lg
        p-3
        shadow-sm
      "
    >
      <strong className="text-orange-700">{a.alert}</strong>: {a.alert}
    </li>
  ))}
  {alerts.length === 0 && (
    <li className="w-full text-center text-gray-500 dark:text-gray-400">
      No hay alertas
    </li>
  )}
</ul>
</div>

    </div>
  )
}

export default App
