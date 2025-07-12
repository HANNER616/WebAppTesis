// src/App.jsx

import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx"
import { ThemeProvider } from "./contexts/ThemeContext.jsx"
import AlertsSummary from "./pages/AlertsSummary"
import ConfigCamera from "./pages/ConfigCamera"
import AppConfig from "./pages/AppConfig"
import HomePage from "./pages/HomePage"
import Auth from "./pages/Auth"
import AppLayout from "./layouts/AppLayout"
import "./index.css"
import { AlertsProvider } from "./contexts/AlertsContext.jsx"
import { ExamProvider } from "./contexts/ExamContext.jsx"
import ProtectedRoute from "./routes/ProtectedRoute.jsx"

function App() {

  return (
    <AuthProvider>
      <ThemeProvider>
        <AlertsProvider>
          <ExamProvider>
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
          </ExamProvider>
        </AlertsProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
