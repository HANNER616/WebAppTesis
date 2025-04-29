"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, User, Lock } from 'lucide-react'

export default function Auth() {
  const navigate = useNavigate()
  const [view, setView] = useState("login") // login, register, forgotPassword, resetPassword
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const handleLogin = (e) => {
    e.preventDefault()
    // Aquí iría la lógica de autenticación
    navigate("/") // Redirigir al dashboard después del login
  }

  const handleRegister = (e) => {
    e.preventDefault()
    // Aquí iría la lógica de registro
    setView("login")
  }

  const handleSendRecoveryEmail = (e) => {
    e.preventDefault()
    // Aquí iría la lógica para enviar el email de recuperación
    setView("enterToken")
  }

  const handleVerifyToken = (e) => {
    e.preventDefault()
    // Aquí iría la lógica para verificar el token
    setView("resetPassword")
  }

  const handleResetPassword = (e) => {
    e.preventDefault()
    // Aquí iría la lógica para restablecer la contraseña
    setView("login")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg border border-gray-200">
        {/* Vista de Login */}
        {view === "login" && (
          <>
            <h2 className="text-2xl font-bold text-center">Login</h2>
            <form onSubmit={handleLogin} className="mt-8 space-y-6">
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="username/email"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="password"
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Eye className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <div className="text-right mt-1">
                  <button
                    type="button"
                    className="text-sm text-yellow-600 hover:underline"
                    onClick={() => setView("forgotPassword")}
                  >
                    forgot password
                  </button>
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Login
                </button>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't you have an account?{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:underline"
                    onClick={() => setView("register")}
                  >
                    Register
                  </button>
                </p>
              </div>
            </form>
          </>
        )}

        {/* Vista de Registro */}
        {view === "register" && (
          <>
            <h2 className="text-2xl font-bold text-center">Register</h2>
            <form onSubmit={handleRegister} className="mt-8 space-y-6">
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="email"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="username"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="password"
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Eye className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="repeat password"
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Eye className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign Up
                </button>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:underline"
                    onClick={() => setView("login")}
                  >
                    Login
                  </button>
                </p>
              </div>
            </form>
          </>
        )}

        {/* Vista de Recuperación de Contraseña - Paso 1: Ingresar Email */}
        {view === "forgotPassword" && (
          <>
            <h2 className="text-2xl font-bold text-center">Password recovery</h2>
            <p className="text-sm text-center mt-2">
              Enter your email address, if the account exists, you will recieve a token.
            </p>
            <form onSubmit={handleSendRecoveryEmail} className="mt-8 space-y-6">
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="email"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Send email
                </button>
              </div>
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:underline"
                  onClick={() => setView("login")}
                >
                  Back to login
                </button>
              </div>
            </form>
          </>
        )}

        {/* Vista de Recuperación de Contraseña - Paso 2: Ingresar Token */}
        {view === "enterToken" && (
          <>
            <h2 className="text-2xl font-bold text-center">Password recovery</h2>
            <p className="text-sm text-center mt-2">
              Paste the token that you have recieved down below.
            </p>
            <form onSubmit={handleVerifyToken} className="mt-8 space-y-6">
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="token"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Ok
                </button>
              </div>
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:underline"
                  onClick={() => setView("forgotPassword")}
                >
                  Back
                </button>
              </div>
            </form>
          </>
        )}

        {/* Vista de Recuperación de Contraseña - Paso 3: Nueva Contraseña */}
        {view === "resetPassword" && (
          <>
            <h2 className="text-2xl font-bold text-center">Password recovery</h2>
            <p className="text-sm text-center mt-2">
              Enter a new password
            </p>
            <form onSubmit={handleResetPassword} className="mt-8 space-y-6">
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="password"
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Eye className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="repeat password"
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Eye className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Submit
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
