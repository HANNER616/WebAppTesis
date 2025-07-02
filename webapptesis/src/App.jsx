// src/App.jsx
"use client"

import React, { useState, useRef, useEffect, useContext, createContext } from "react"
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./AuthContext"
import { ThemeProvider } from "./ThemeContext"
import { Menu, Camera, FileText, Settings, LogOut, Play, Pause, Square } from "lucide-react"
import AlertsSummary from "./pages/AlertsSummary"
import ConfigCamera from "./pages/ConfigCamera"
import AppConfig from "./pages/AppConfig"
import Auth from "./pages/Auth"
import "./index.css"
import WebcamComponent from "./components/Webcam"
import { openFrameInNewTab } from "./helpers"
import { AlertsProvider, AlertsContext } from "./AlertsContext"
import DialogConfirmation from "./components/DialogConfirmation.jsx"
import api from "./lib/api"

// Context para compartir examActive
export const ExamContext = createContext()

function App() {
  // Estado compartido
  const [examActive, setExamActive] = useState(false)

  console.log("token:", localStorage.getItem("token"))
  console.log("email:", localStorage.getItem("email"))
  console.log("username:", localStorage.getItem("username"))

  return (
    <AuthProvider>
      <ThemeProvider>
        <AlertsProvider>
          <ExamContext.Provider value={{ examActive, setExamActive }}>
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
          </ExamContext.Provider>
        </AlertsProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span>Cargando sesión…</span>
      </div>
    )
  }
  return isAuthenticated ? children : <Navigate to="/auth" replace />
}

function AppLayout({ children }) {
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

  const handleLogout = () => {
    logout()
    setAlerts([])
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
                className={`p-2 rounded-full transition ${
                  examActive
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
          © 2023 Monitor de Aula. Todos los derechos reservados.
        </div>
      </footer>
    </div>
    </>
  )
}

function HomePage() {
  const [showWebcam, setShowWebcam] = useState(false)
  const { alerts, setAlerts } = useContext(AlertsContext)
  const { examActive, setExamActive } = useContext(ExamContext)
  const [countdown, setCountdown] = useState(null)
  const [paused, setPaused] = useState(false)
  const sendInterval = useRef(null)

  // Modales
  const [confirmStartModal, setConfirmStartModal] = useState(false)
  const [nameModalOpen, setNameModalOpen] = useState(false)
  const [examName, setExamName] = useState("")

  // Verificar cámara
  useEffect(() => {
    let mounted = true
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(stream => {
        if (mounted) setShowWebcam(true)
        stream.getTracks().forEach(t => t.stop())
      })
      .catch(() => {
        if (mounted) setShowWebcam(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  // Cuenta regresiva
  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
    if (countdown === 0) {
      setExamActive(true)
      setCountdown(null)
    }
  }, [countdown])

  // Lógica de inicio
  const openStartModal = () => setConfirmStartModal(true)
  const onConfirmStart = () => {
    setConfirmStartModal(false)
    setNameModalOpen(true)
  }
  const onSubmitName = async () => {
    if (!examName.trim()) return
    localStorage.setItem("exam_name", examName.trim())
    try {
      const data = await createSession()
      setNameModalOpen(false)
      setCountdown(3)
    } catch {}
  }
  const onCancelModal = () => {
    setConfirmStartModal(false)
    setNameModalOpen(false)
  }

  // Envío de fotogramas
  useEffect(() => {
    if (examActive && !paused) {
      sendInterval.current = setInterval(() => {
        console.log("Enviando fotograma…")
      }, 500)
    }
    return () => clearInterval(sendInterval.current)
  }, [examActive, paused])

  const handlePauseClick = () => setPaused(p => !p)
  const handleStopClick = () => {
    setExamActive(false)
    setPaused(false)
    setCountdown(null)
  }
  const handleNewAlert = alert => setAlerts(a => [...a, alert])

  const createSession = async () => {
    const examNameLocal = localStorage.getItem("exam_name")
    const token = localStorage.getItem("token")
    const resp = await api.post(
      "/exam-session",
      { sessionName: examNameLocal },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    localStorage.setItem("sessionId", resp.data.sessionId)
    return resp.data
  }

  return (
    <>
      <DialogConfirmation
        isOpen={confirmStartModal}
        title="Confirmar inicio"
        message="¿Estás seguro de que quieres empezar el examen?"
        confirmLabel="Sí"
        cancelLabel="Cancelar"
        onConfirm={onConfirmStart}
        onCancel={onCancelModal}
      />

      {nameModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Nombre del examen
            </h3>
            <input
              autoFocus
              type="text"
              value={examName}
              onChange={e => setExamName(e.target.value)}
              placeholder="Escribe aquí el nombre"
              className="w-full mb-4 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={onCancelModal}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={onSubmitName}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
              >
                Empezar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full">
        <div className="md:col-span-2 p-4 rounded-lg shadow bg-white dark:bg-gray-800 transition-colors">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Vista de Cámara</h2>
            {examActive ? (
              <div className="flex space-x-2">
                <button
                  onClick={handlePauseClick}
                  className="flex items-center bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded shadow"
                >
                  <Pause className="mr-1 h-4 w-4" />
                  {paused ? "Reanudar" : "Pausar"}
                </button>
                <button
                  onClick={handleStopClick}
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
                className={`flex items-center px-4 py-2 rounded shadow text-white ${
                  countdown !== null || examActive
                    ? "bg-green-300 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                <Play className="mr-2 h-5 w-5" />
                Empezar examen
              </button>
            )}
          </div>

          {countdown !== null && countdown > 0 && (
            <div className="mb-4 text-center text-lg text-gray-700 dark:text-gray-300">
              El examen "{localStorage.getItem("exam_name")}" va a iniciar en{" "}
              <strong>{countdown}</strong> segundos…
            </div>
          )}

          <div className="aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            {showWebcam ? (
              <WebcamComponent
                onNewAlert={handleNewAlert}
                examActive={examActive}
                paused={paused}
              />
            ) : (
              <Camera className="h-16 w-16 text-gray-400 dark:text-gray-500" />
            )}
          </div>
        </div>

        <div className="p-4 rounded-lg shadow bg-white dark:bg-gray-800 transition-colors">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FileText className="mr-2 h-5 w-5" /> Alertas
          </h2>
          <ul className="overflow-y-auto space-y-4 max-h-[550px]">
            {alerts.map((a, i) => (
              <li
                key={i}
                className="w-full border-2 border-orange-500 bg-orange-100 dark:bg-orange-900 rounded-lg p-3 shadow-sm"
              >
                <strong className="text-orange-700">⚠️</strong>: {a.timestamp}
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {a.description}
                </p>
                <button
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
