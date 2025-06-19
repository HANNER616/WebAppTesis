"use client"

import { useState, useEffect } from "react"

export default function ConfigCamera() {
  const [resolution, setResolution] = useState("720p")
  const [fps, setFps] = useState(30)
  const [nightMode, setNightMode] = useState(false)
  const [cameras, setCameras] = useState([])


  useEffect(() => {

    async function listCameras() {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true })
        // listar dispositivos conectados
        const devices = await navigator.mediaDevices.enumerateDevices()
        //filtrar solo los dispositivos de video
        const videoDevices = devices.filter(device => device.kind === 'videoinput')
        setCameras(videoDevices)
        console.log("camaras encontradas: ", videoDevices)
      } catch (error) {
        console.error("CAMARAS NO ENCONTRADAS CONFIG CAMERA.JSX", error)
        setCameras([])
      }
    }

    listCameras();


  }, [])



  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Configuración de Cámara</h1>

      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="camera-select" className="block text-sm font-medium text-gray-700">
            Seleccionar Cámara
          </label>
          <select
            id="camera-select"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleccionar cámara</option>
            {cameras.map((cam, idx) => (
              <option key={cam.deviceId} value={cam.deviceId}>
                {cam.label || `Cámara:  ${idx + 1}`}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="resolution-select" className="block text-sm font-medium text-gray-700">
            Resolución
          </label>
          <select
            id="resolution-select"
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="480p">480p</option>
            <option value="720p">720p</option>
            <option value="1080p">1080p</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="fps-slider" className="block text-sm font-medium text-gray-700">
            Cuadros por segundo (FPS): {fps}
          </label>
          <input
            id="fps-slider"
            type="range"
            min={15}
            max={60}
            step={1}
            value={fps}
            onChange={(e) => setFps(Number.parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            id="night-mode"
            type="checkbox"
            checked={nightMode}
            onChange={(e) => setNightMode(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="night-mode" className="text-sm font-medium text-gray-700">
            Modo Nocturno
          </label>
        </div>

        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Guardar Configuración
        </button>
      </div>
    </div>
  )
}
