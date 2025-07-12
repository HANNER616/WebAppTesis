"use client"

import { useState, useEffect } from "react"
import { useTheme } from "../ThemeContext"
import Hint from "../components/Hint"

export default function ConfigAccount() {
  const [sonido, setSonido] = useState(true)
  const { isDark, toggleTheme } = useTheme()
  const [delay, setDelay] = useState("0")
  const [confidence, setConfidence] = useState("70")
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(false)
  const [maxAlerts, setMaxAlerts] = useState("0")

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

    const savedConfidence = localStorage.getItem("confidenceThreshold")
    if (savedConfidence !== null) {
      setConfidence(savedConfidence)
    }

    const savedEmailAlerts = localStorage.getItem("emailAlertsEnabled")
    if (savedEmailAlerts !== null) {
      setEmailAlertsEnabled(savedEmailAlerts === "true")
    }

    const savedMaxAlerts = localStorage.getItem("maxAlerts")
    if (savedMaxAlerts !== null) {
      setMaxAlerts(savedMaxAlerts)
    } 

  }, [])

  // 2) Handler del botón “Guardar”
  const handleSave = () => {
    localStorage.setItem("sonidoAlertas", sonido.toString())
    localStorage.setItem("alertDelay", delay)
    localStorage.setItem("confidenceThreshold", confidence)
    localStorage.setItem("maxAlerts", maxAlerts)
    localStorage.setItem("emailAlertsEnabled", emailAlertsEnabled.toString())
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


        {/* Retraso de Sonido de Alerta */}

        <div className="flex items-center space-x-2">

          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Retraso de Sonido de Alerta: {delay}s
          </span>

          <Hint instruction="Ajusta el tiempo de espera antes de reproducir el sonido de alerta." />

        </div>

        <label className="flex flex-col space-y-1">

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

        {/* Confidence Threshold */}
        <div className="flex items-center space-x-2">

          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Umbral de confianza: {confidence}%
          </span>


          <Hint instruction="Ajusta este valor para filtrar alertas según su nivel de confianza. Solo se mostrarán alertas cuya confianza sea mayor al umbral seleccionado." />
        </div>

        {/* Slider  */}
        <label className="block mt-2">
          <input
            type="range"
            min="50"
            max="100"
            step="1"
            value={confidence}
            onChange={e => setConfidence(e.target.value)}
            list="delayMarks"
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
          />
          <datalist id="delayMarks">
            <option value="50" label="50%" />
            <option value="75" label="75%" />
            <option value="100" label="100%" />
          </datalist>
        </label>



        {/* ENVIO DE ALERTAS */}
        <label className="inline-flex items-center space-x-3 cursor-pointer">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Activar envio de alertas por email
          </span>
          <div className="relative inline-block w-12 h-6">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={emailAlertsEnabled}
              onChange={e => setEmailAlertsEnabled(e.target.checked)}
              aria-label="Alternar modo oscuro"
            />
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-600 rounded-full transition-colors peer-checked:bg-blue-600" />
            <div className="absolute left-0 top-0 w-6 h-6 bg-white dark:bg-gray-300 rounded-full border border-gray-400 dark:border-gray-500 transform transition-transform peer-checked:translate-x-6" />
          </div>
        </label>

        {/* num alerts maximas */}
        {emailAlertsEnabled && (
          <div className="mt-2 flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Número de alertas máximas:
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={maxAlerts}
              onChange={e => {
                const val = Number(e.target.value)
                if (val >= 1 && val <= 100) setMaxAlerts(val)
              }}
              className="w-20 p-1 border rounded text-sm text-center dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        )}



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
