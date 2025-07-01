"use client"

import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom"
import { useState, useRef, useEffect, useContext } from "react"
import { AuthProvider, useAuth } from "./AuthContext"
import { ThemeProvider } from "./ThemeContext"
import { Menu, Camera, FileText, Settings, LogOut, Play, Pause, Square } from "lucide-react"
import AlertsSummary from "./pages/AlertsSummary"
import ConfigCamera from "./pages/ConfigCamera"
import AppConfig from "./pages/AppConfig"
import Auth from "./pages/Auth"
import "./index.css"
import WebcamComponent from './components/Webcam'
import { openFrameInNewTab } from "./helpers";
import { AlertsProvider, AlertsContext } from './AlertsContext'
import DialogConfirmation from './components/DialogConfirmation.jsx';


// Estado para simular autenticación
//const [isAuthenticated, setIsAuthenticated] = useState(false)

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth(); // Usa el contexto
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span>Cargando sesión…</span>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};


function App() {
  console.log("token:", localStorage.getItem('token'));
  console.log("email:", localStorage.getItem('email'));
  console.log("username:", localStorage.getItem('username'));

  return (
    <AuthProvider>
      <ThemeProvider>
        <AlertsProvider>
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
        </AlertsProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

// Componente de Layout para las páginas autenticadas
function AppLayout({ children }) {

  const { logout } = useAuth(); // Obtén la función logout del contexto
  const navigate = useNavigate(); // Hook para redirigir
  const { alerts, setAlerts } = useContext(AlertsContext)

  const handleLogout = () => {
    logout();
    setAlerts([])
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

  //estados examen
  const [examActive, setExamActive] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [paused, setPaused] = useState(false);
  const sendInterval = useRef(null);
  // DIALOG CONFIRMATION COMPONENT
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
  });

  //cuenta regresiva 3 seg
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0) {
      setExamActive(true);
      setCountdown(null);
    }
  }, [countdown]);

  // activar envio fotogramas a la api

  useEffect(() => {
    if (examActive && !paused) {
      // Enviar un fotograma cada 500ms
      sendInterval.current = setInterval(() => {
        // Aquí iría tu llamada real a la API, por ejemplo:
        // webcamRef.current.getScreenshot() → fetch('/api/frame', { method:'POST', body: frame })
        console.log('Enviando fotograma a la API…');
      }, 500);
    }
    return () => clearInterval(sendInterval.current);
  }, [examActive, paused]);

  //BOTONES INICIAR, DETENER EXAMEN

  const openStartModal = () => {
    setModalConfig({
      isOpen: true,
      title: 'Confirmar inicio',
      message: '¿Estás seguro de que quieres empezar el examen?',
      onConfirm: () => {
        setModalConfig(mc => ({ ...mc, isOpen: false }));
        setCountdown(3);
      },
    });
  };

  const openStopModal = () => {
    setModalConfig({
      isOpen: true,
      title: 'Confirmar detención',
      message: '¿Estás seguro de que deseas detener el examen?',
      onConfirm: () => {
        setModalConfig(mc => ({ ...mc, isOpen: false }));
        clearInterval(sendInterval.current);
        setExamActive(false);
        setPaused(false);
        setCountdown(null);
      },
    });
  };

  const handlePauseClick = () => {
    setPaused(p => !p);
    if (paused) {
      // Si venimos de pausa, reiniciar envío
      setExamActive(true);
    } else {
      // Si pausamos, detener intervalos
      clearInterval(sendInterval.current);
    }
  };


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
  const { alerts, setAlerts } = useContext(AlertsContext)

  const handleNewAlert = (alert) => {
    setAlerts(prevAlerts => [...prevAlerts, alert]);
  }

  return (
    <>
      {/* Modal de confirmación */}
      <DialogConfirmation
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmLabel="Sí"
        cancelLabel="Cancelar"
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig(mc => ({ ...mc, isOpen: false }))}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full">
        <div className="
        md:col-span-2 p-4 rounded-lg shadow
        bg-white dark:bg-gray-800 transition-colors
      ">
          {/* Encabezado con botones */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Vista de Cámara</h2>
            {examActive ? (
              <div className="flex space-x-2">
                <button
                  onClick={handlePauseClick}
                  className="flex items-center bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded shadow"
                >
                  <Pause className="mr-1 h-4 w-4" />
                  {paused ? 'Reanudar' : 'Pausar'}
                </button>
                <button
                  onClick={openStopModal}
                  className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow"
                >
                  <Square className="mr-2 h-5 w-5" />
                  Detener examen
                </button>
              </div>
            ) : (
              <button
                onClick={openStartModal}
                disabled={countdown !== null || examActive}
                className={`
      flex items-center px-4 py-2 rounded shadow text-white
      ${countdown !== null || examActive
                    ? 'bg-green-300 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600'}
    `}
              >
                <Play className="mr-2 h-5 w-5" />
                Empezar examen
              </button>
            )}
          </div>

          {/* Mensaje de cuenta regresiva */}
          {countdown !== null && countdown > 0 && (
            <div className="mb-4 text-center text-lg text-gray-700 dark:text-gray-300">
              El examen va a iniciar en <strong>{countdown}</strong> segundos…
            </div>
          )}
          {/* Área de la cámara */}
          <div className="aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            {showWebcam ? (
              <WebcamComponent 
              onNewAlert={handleNewAlert}
              examActive={examActive}
              paused={paused} />
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
                <strong className="text-orange-700">⚠️</strong>: {a.timestamp}
                <p className="text-sm text-gray-700 dark:text-gray-300">{a.description}</p>
                <button
                  key={i}
                  onClick={() => openFrameInNewTab(a.frame)}
                  className="text-blue-600 underline cursor-pointer"
                >
                  Clic para ver imagen
                </button>


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
    </>
  )
}

export default App
