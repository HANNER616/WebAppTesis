"use client"

import { useState, useEffect, useRef } from "react"


const RESOLUTION_MAP = {
  '1080p': { width: 1920, height: 1080 },
  '720p': { width: 1280, height: 720 },
  '480p': { width: 640, height: 480 },
};

const RESOLUTIONS = ['1080p', '720p', '480p'];
const FPS_OPTIONS = [60, 30, 15];
const FPS_VALUES_SLIDER = FPS_OPTIONS.slice().reverse();


export default function ConfigCamera() {
  const [resolution, setResolution] = useState("720p")
  const [fps, setFps] = useState(30)
  const [deviceId, setDeviceId] = useState('');
  const [nightMode, setNightMode] = useState(false)
  const [cameras, setCameras] = useState([])
  const [constraints, setConstraints] = useState({});
  const [message, setMessage] = useState('');
  const webcamRef = useRef(null);


  const fpsIndex = FPS_VALUES_SLIDER.indexOf(fps);

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


    const saved = JSON.parse(localStorage.getItem('cameraSettings') || '{}');
    if (saved.deviceId) {
      setDeviceId(saved.deviceId);
      setResolution(saved.resolution || resolution);
      setFps(saved.fps || fps);
      applyWithFallback(saved.deviceId, saved.resolution, saved.fps);
    }


  }, [])


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
          deviceId: devId ? { exact: devId } : undefined,
          width: { ideal: width },
          height: { ideal: height },
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
          /* sigue intentando */
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
    console.log("config camera: "  + localStorage.getItem('cameraSettings'));
  };






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
            value={deviceId}
            onChange={e => setDeviceId(e.target.value)}
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
            {RESOLUTIONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="fps-slider" className="block text-sm font-medium text-gray-700">
            Cuadros por segundo (FPS): {fps}
          </label>
          <input
            id="fps-slider"
            type="range"
            // ahora el slider va de 0 a 2 (3 posiciones)
            min={0}
            max={FPS_VALUES_SLIDER.length - 1}
            step={1}
            value={fpsIndex}
            onChange={(e) => {
              // convierte el índice de vuelta al valor real
              const newIndex = Number(e.target.value);
              setFps(FPS_VALUES_SLIDER[newIndex]);
            }}
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

        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={handleSave}

        >
          Guardar Configuración
        </button>
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  )
}
