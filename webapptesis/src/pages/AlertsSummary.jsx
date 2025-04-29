"use client"

import { useState } from "react"

export default function AlertsSummary() {
  const [incidentes] = useState([
    {
      id: 1,
      fecha: "2023-05-15",
      hora: "10:30",
      descripcion: "Estudiante mirando el examen de otro",
      accion: "Advertencia verbal",
    },
    {
      id: 2,
      fecha: "2023-05-16",
      hora: "11:15",
      descripcion: "Uso de dispositivo no autorizado",
      accion: "Confiscación del dispositivo",
    },
    {
      id: 3,
      fecha: "2023-05-17",
      hora: "09:45",
      descripcion: "Comportamiento sospechoso durante el examen",
      accion: "Monitoreo adicional",
    },
  ])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Registro de Incidentes</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar incidentes..."
          className="w-full max-w-sm px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow">
          <caption className="p-2 text-sm text-gray-500">Lista de incidentes registrados</caption>
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acción Tomada
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {incidentes.map((incidente) => (
              <tr key={incidente.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{incidente.fecha}</td>
                <td className="px-6 py-4 whitespace-nowrap">{incidente.hora}</td>
                <td className="px-6 py-4">{incidente.descripcion}</td>
                <td className="px-6 py-4">{incidente.accion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
        Exportar Registro
      </button>
    </div>
  )
}
