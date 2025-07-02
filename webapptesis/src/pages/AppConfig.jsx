"use client"

import { useState, useEffect } from "react"
import { useTheme } from "../ThemeContext"

export default function ConfigAccount() {
  const [sonido, setSonido] = useState(true)
  const { isDark, toggleTheme } = useTheme()
  const [delay, setDelay] = useState("0")
  // 1) Al montar, hidrato desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sonidoAlertas")
    if (saved !== null) {
      setSonido(saved === "true")
    }
    const savedDelay = localStorage.getItem("alertDelay")
    if (savedDelay !== null) {
      setDelay(savedDelay)
    }

  }, [])

  // 2) Handler del botón “Guardar”
  const handleSave = () => {
    localStorage.setItem("sonidoAlertas", sonido.toString())
    localStorage.setItem("alertDelay", delay)
    window.alert("¡Configuración guardada!")
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Configuración General</h1>

      <div className="space-y-6 flex flex-col">
        {/* Modo Oscuro */}
        <label className="inline-flex items-center space-x-3 cursor-pointer">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Modo Oscuro
          </span>
          <div className="relative inline-block w-12 h-6">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isDark}
              onChange={toggleTheme}
              aria-label="Alternar modo oscuro"
            />
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-600 rounded-full transition-colors peer-checked:bg-blue-600" />
            <div className="absolute left-0 top-0 w-6 h-6 bg-white dark:bg-gray-300 rounded-full border border-gray-400 dark:border-gray-500 transform transition-transform peer-checked:translate-x-6" />
          </div>
        </label>

        {/* Sonido de Alertas */}
        <label className="inline-flex items-center space-x-3 cursor-pointer">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Sonido de Alertas
          </span>
          <div className="relative inline-block w-12 h-6">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={sonido}
              onChange={() => setSonido(s => !s)}
              aria-label="Activar/desactivar sonido"
            />
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-600 rounded-full transition-colors peer-checked:bg-blue-600" />
            <div className="absolute left-0 top-0 w-6 h-6 bg-white dark:bg-gray-300 rounded-full border border-gray-400 dark:border-gray-500 transform transition-transform peer-checked:translate-x-6" />
          </div>
        </label>

        <label className="flex flex-col space-y-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Retraso de Sonido de Alerta: {delay}s
          </span>
          <input
            type="range"
            min="0"
            max="5"
            step="1"
            value={delay}
            onChange={e => setDelay(e.target.value)}
            list="delayMarks"
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600 "
          />
          <datalist id="delayMarks">
            <option value="0" label="0s" />
            <option value="3" label="3s" />
            <option value="5" label="5s" />
          </datalist>
        </label>

        {/* Botón Guardar */}
        <button
          onClick={handleSave}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Guardar Configuración
        </button>
      </div>
    </div>
  )
}
