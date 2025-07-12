import { ExamContext } from "../contexts/ExamContext.jsx"
import { useAuth } from "../contexts/AuthContext.jsx"
import { Link, useNavigate } from "react-router-dom"
import { useState, useContext, useEffect } from "react"
import { AlertsContext } from "../contexts/AlertsContext.jsx"
import { Menu, Camera, FileText, Settings, LogOut, } from "lucide-react"
import DialogConfirmation from "../components/DialogConfirmation.jsx"
import apiAudit from '../lib/apiAudit';


export default function AppLayout({ children }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { setAlerts } = useContext(AlertsContext)
  const [User, setUser] = useState("")
  const { examActive } = useContext(ExamContext)
  const [refreshModalOpen, setRefreshModalOpen] = useState(false)



  useEffect(() => {
    setUser(localStorage.getItem("username"))
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "F5" && examActive) {
        e.preventDefault()
        setRefreshModalOpen(true)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [examActive])


  useEffect(() => {
    const beforeUnloadHandler = (e) => {
      if (examActive) {
        // Estándar para Chrome y otros navegadores:
        e.preventDefault()
        // Algunos navegadores requieren asignar returnValue:
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', beforeUnloadHandler)
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler)
    }
  }, [examActive])

  const logEvent = async (type) => {
    try {
      await apiAudit.post("/user-event", { type })
    } catch (err) {
      console.error("Error al loguear evento:", err)
    }
  }


  const handleLogout = async () => {
    await logEvent('logout')
    localStorage.removeItem("token")
    localStorage.removeItem("email")
    localStorage.removeItem("username")
    localStorage.removeItem("sessionId")
    localStorage.removeItem("exam_name")
    setAlerts([])
    logout()
    
    navigate("/auth")
  }




  return (
    <>
      {/*  ← Aquí pones el modal */}
      {refreshModalOpen && (
        <DialogConfirmation
          isOpen={refreshModalOpen}
          title="Advertencia"
          message="Si reinicias la página, el examen se cerrará y la transmisión se detendrá. ¿Deseas continuar?"
          confirmLabel="Continuar"
          cancelLabel="Cancelar"
          onConfirm={() => {
            setRefreshModalOpen(false)
            window.location.reload()
          }}
          onCancel={() => setRefreshModalOpen(false)}
        />
      )}
      <div className="flex flex-col min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4 py-2 flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold">
              Monitor de Aula
            </Link>

            {/* Zona derecha */}
            <div className="flex items-center space-x-4">
              {User && (
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">{User}</span>
                </div>
              )}

              {/* Contenedor que bloquea pointer-events cuando examActive */}
              <div className={`relative ${examActive ? "pointer-events-none" : "group"}`}>
                <button
                  disabled={examActive}
                  className={`p-2 rounded-full transition ${examActive
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                >
                  <Menu className="h-5 w-5 text-gray-800 dark:text-gray-200" />
                </button>
                <div className="absolute right-0 top-full w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                  <Link
                    to="/config-camera"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Camera className="mr-2 h-4 w-4" /> Configuración de Cámara
                  </Link>
                  <Link
                    to="/alerts"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FileText className="mr-2 h-4 w-4" /> Registro de Incidentes
                  </Link>
                  <Link
                    to="/config-app"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Settings className="mr-2 h-4 w-4" /> Configuración
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Salir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-grow container mx-auto px-4 py-8 h-full">{children}</main>

        <footer className="border-t border-gray-200 dark:border-gray-700 bg-transparent">
          <div className="container mx-auto px-4 py-2 text-center text-sm text-gray-500 dark:text-gray-400">
            © 2025 Monitor de Aula. Todos los derechos reservados.
          </div>
        </footer>
      </div>
    </>
  )
}