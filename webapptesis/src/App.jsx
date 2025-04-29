"use client"

import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom"
import { useState } from "react"
import { Menu, Camera, FileText, Settings } from "lucide-react"
import AlertsSummary from "./pages/AlertsSummary"
import ConfigCamera from "./pages/ConfigCamera"
import ConfigAccount from "./pages/ConfigAccount"
import Auth from "./pages/Auth"
import "./index.css"

function App() {
  // Estado para simular autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(true)

  // Componente para proteger rutas
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/auth" replace />
    }
    return children
  }

  return (
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
                  <Route path="/config-account" element={<ConfigAccount />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

// Componente de Layout para las páginas autenticadas
function AppLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">
            Monitor de Aula
          </Link>
          <div className="relative group">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Menu className="h-5 w-5" />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
              <Link to="/config-camera" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <Camera className="mr-2 h-4 w-4" />
                <span>Configuración de Cámara</span>
              </Link>
              <Link to="/alerts" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <FileText className="mr-2 h-4 w-4" />
                <span>Registro de Incidentes</span>
              </Link>
              <Link
                to="/config-account"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>

      <footer className="border-t">
        <div className="container mx-auto px-4 py-2 text-center text-sm text-gray-500">
          © 2023 Monitor de Aula. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  )
}

// Componente de la página principal
function HomePage() {
  const [alerts] = useState([
    { id: 1, message: "Comportamiento sospechoso detectado - Estudiante en fila 3, asiento 2", time: "10:15 AM" },
    { id: 2, message: "Posible intento de copia - Estudiante en fila 2, asiento 5", time: "10:20 AM" },
  ])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Vista de Cámara</h2>
        <div className="aspect-video bg-gray-200 flex items-center justify-center">
          <Camera className="h-16 w-16 text-gray-400" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          Alertas
        </h2>
        <ul className="space-y-4">
          {alerts.map((alert) => (
            <li key={alert.id} className="bg-yellow-100 p-3 rounded-md">
              <p className="text-sm font-medium">{alert.message}</p>
              <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App
