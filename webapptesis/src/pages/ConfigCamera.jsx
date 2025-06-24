"use client"

import { useState, useEffect, useRef } from "react"
import { Sun, Moon } from 'lucide-react';
import { useTheme } from "../ThemeContext";
import Webcam from "../components/Webcam";

const RESOLUTION_MAP = {
  '1080p': { width: 1920, height: 1080 },
  '720p':  { width: 1280, height: 720 },
  '480p':  { width:  640, height: 480 },
};
const RESOLUTIONS = ['1080p', '720p', '480p'];
const FPS_OPTIONS = [60, 30, 15];
// Slider de índices invertido
const FPS_VALUES_SLIDER = FPS_OPTIONS.slice().reverse();

export default function ConfigCamera() {
  const [resolution, setResolution] = useState("720p");
  const [fps, setFps]               = useState(30);
  const [deviceId, setDeviceId]     = useState('');
  const [cameras, setCameras]       = useState([]);
  const [constraints, setConstraints] = useState({});
  const [message, setMessage]       = useState('');
  const webcamRef = useRef(null);
  const { isDark, toggleTheme }     = useTheme();

  const fpsIndex = FPS_VALUES_SLIDER.indexOf(fps);

  // Listar cámaras y cargar settings
  useEffect(() => {
    async function listAndLoad() {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        setCameras(videoDevices);
      } catch (e) {
        console.error("No se pudo acceder a las cámaras", e);
      }

      const saved = JSON.parse(localStorage.getItem('cameraSettings') || '{}');
      if (saved.deviceId) {
        setDeviceId(saved.deviceId);
        setResolution(saved.resolution || resolution);
        setFps(saved.fps || fps);
        applyWithFallback(saved.deviceId, saved.resolution, saved.fps);
      }
    }
    listAndLoad();
  }, []);

  // Fallback de constraints
  const applyWithFallback = async (devId, res, f) => {
    const resOrder = [
      ...RESOLUTIONS.slice(RESOLUTIONS.indexOf(res)),
      ...RESOLUTIONS.slice(0, RESOLUTIONS.indexOf(res))
    ];
    const fpsOrder = [
      ...FPS_OPTIONS.slice(FPS_OPTIONS.indexOf(f)),
      ...FPS_OPTIONS.slice(0, FPS_OPTIONS.indexOf(f))
    ];

    for (let rpt of resOrder) {
      for (let pf of fpsOrder) {
        const { width, height } = RESOLUTION_MAP[rpt];
        const vc = {
          deviceId:  devId ? { exact: devId } : undefined,
          width:     { ideal: width },
          height:    { ideal: height },
          frameRate: { ideal: pf }
        };
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: vc });
          stream.getTracks().forEach(t => t.stop());
          setConstraints(vc);
          setResolution(rpt);
          setFps(pf);
          setMessage(`Aplicado: ${rpt} @ ${pf}fps`);
          return;
        } catch {
          // sigue probando
        }
      }
    }
    setMessage('No soporta ninguna de las configuraciones solicitadas.');
  };

  const handleSave = async () => {
    await applyWithFallback(deviceId, resolution, fps);
    localStorage.setItem('cameraSettings',
      JSON.stringify({ deviceId, resolution, fps })
    );
    setMessage(prev => prev + ' · Guardado.');
    console.log("cameraSettings:", localStorage.getItem('cameraSettings'));
  };

  return (
    <div className="
      max-w-2xl mx-auto p-6 space-y-6
      rounded-lg shadow-lg transition-colors
    ">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Configuración de Cámara</h1>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          aria-label="Alternar modo oscuro"
        >
          {isDark
            ? <Sun className="h-6 w-6 text-yellow-400" />
            : <Moon className="h-6 w-6 text-gray-800" />}
        </button>
      </header>

      {/* Selector de cámara */}
      <div className="space-y-2">
        <label htmlFor="camera-select" className="block text-sm font-medium">
          Seleccionar Cámara
        </label>
        <select
          id="camera-select"
          value={deviceId}
          onChange={e => setDeviceId(e.target.value)}
          className="
            w-full px-3 py-2 border rounded-md shadow-sm
            bg-gray-50 dark:bg-gray-700
            border-gray-300 dark:border-gray-600
            focus:outline-none focus:ring focus:ring-blue-400
          "
        >
          <option value="">Seleccionar cámara</option>
          {cameras.map((cam, idx) => (
            <option key={cam.deviceId} value={cam.deviceId}>
              {cam.label || `Cámara ${idx + 1}`}
            </option>
          ))}
        </select>
      </div>

      {/* Resolución */}
      <div className="space-y-2">
        <label htmlFor="resolution-select" className="block text-sm font-medium">
          Resolución
        </label>
        <select
          id="resolution-select"
          value={resolution}
          onChange={e => setResolution(e.target.value)}
          className="
            w-full px-3 py-2 border rounded-md shadow-sm
            bg-gray-50 dark:bg-gray-700
            border-gray-300 dark:border-gray-600
            focus:outline-none focus:ring focus:ring-blue-400
          "
        >
          {RESOLUTIONS.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* FPS */}
      <div className="space-y-2">
        <label htmlFor="fps-slider" className="block text-sm font-medium">
          Cuadros por segundo (FPS): {fps}
        </label>
        <input
          id="fps-slider"
          type="range"
          min={0}
          max={FPS_VALUES_SLIDER.length - 1}
          step={1}
          value={fpsIndex}
          onChange={e => setFps(FPS_VALUES_SLIDER[+e.target.value])}
          className="
            w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
            dark:bg-gray-600
          "
        />
      </div>

      {/* Preview y Guardar */}
      <div className="space-y-4">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={constraints}
          className="w-full aspect-video bg-black rounded"
        />
        <button
          onClick={handleSave}
          className="
            w-full px-4 py-2 font-medium rounded-md
            bg-blue-600 text-white hover:bg-blue-700
            focus:outline-none focus:ring focus:ring-blue-400
          "
        >
          Guardar configuración
        </button>
        {message && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
