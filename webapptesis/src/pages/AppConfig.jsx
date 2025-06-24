"use client"

import { useState } from "react"
import { Sun, Moon } from 'lucide-react';
import { useTheme } from "../ThemeContext";

export default function ConfigAccount() {
  const [notificaciones, setNotificaciones] = useState(true)
  const [sonido, setSonido] = useState(true)
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Configuración General</h1>

      <div className="space-y-6 flex flex-col">



        <label className="inline-flex items-center space-x-3 cursor-pointer">
          {/* Texto */}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Modo Oscuro
          </span>

          {/* Contenedor relativo del switch */}
          <div className="relative inline-block w-12 h-6">
            {/* Checkbox oculto */}
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isDark}
              onChange={toggleTheme}
              aria-label="Alternar modo oscuro"
            />

            {/* Track */}
            <div className="
      absolute inset-0
      bg-gray-200 dark:bg-gray-600
      rounded-full
      transition-colors
      peer-checked:bg-blue-600
      peer-focus:ring-2 peer-focus:ring-blue-500
    " />

            {/* Thumb */}
            <div className="
      absolute left-0 top-0
      w-6 h-6
      bg-white dark:bg-gray-300
      rounded-full
      border border-gray-400 dark:border-gray-500
      transform
      transition-transform
      peer-checked:translate-x-6
    " />
          </div>
        </label>


        <label className="inline-flex items-center space-x-3 cursor-pointer">
          {/* Texto */}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Desactivar Alertas
          </span>

          {/* Contenedor relativo del switch */}
          <div className="relative inline-block w-12 h-6">
            {/* Checkbox oculto */}
            <input
              type="checkbox"
              className="sr-only peer"
              checked={""}
              onChange={""}
              aria-label="Alternar modo oscuro"
            />

            {/* Track */}
            <div className="
      absolute inset-0
      bg-gray-200 dark:bg-gray-600
      rounded-full
      transition-colors
      peer-checked:bg-blue-600
      peer-focus:ring-2 peer-focus:ring-blue-500
    " />

            {/* Thumb */}
            <div className="
      absolute left-0 top-0
      w-6 h-6
      bg-white dark:bg-gray-300
      rounded-full
      border border-gray-400 dark:border-gray-500
      transform
      transition-transform
      peer-checked:translate-x-6
    " />
          </div>
        </label>



        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Guardar Configuración
        </button>
      </div>
    </div>
  )
}
