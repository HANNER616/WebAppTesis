"use client"

import { useState } from "react"

export default function ConfigAccount() {
  const [notificaciones, setNotificaciones] = useState(true)
  const [sonido, setSonido] = useState(true)

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Configuración General</h1>

      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="nombre-docente" className="block text-sm font-medium text-gray-700">
            Nombre del Docente
          </label>
          <input
            id="nombre-docente"
            type="text"
            placeholder="Ingrese su nombre"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Correo Electrónico
          </label>
          <input
            id="email"
            type="email"
            placeholder="su@email.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            id="notificaciones"
            type="checkbox"
            checked={notificaciones}
            onChange={(e) => setNotificaciones(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="notificaciones" className="text-sm font-medium text-gray-700">
            Activar Notificaciones
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            id="sonido"
            type="checkbox"
            checked={sonido}
            onChange={(e) => setSonido(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="sonido" className="text-sm font-medium text-gray-700">
            Sonido de Alertas
          </label>
        </div>

        <div className="space-y-2">
          <label htmlFor="umbral-alerta" className="block text-sm font-medium text-gray-700">
            Umbral de Alerta (segundos)
          </label>
          <input
            id="umbral-alerta"
            type="number"
            placeholder="5"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="notas" className="block text-sm font-medium text-gray-700">
            Notas Adicionales
          </label>
          <textarea
            id="notas"
            placeholder="Ingrese cualquier nota o instrucción adicional aquí"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Guardar Configuración
        </button>
      </div>
    </div>
  )
}
