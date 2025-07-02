// components/Webcam.jsx.jsx
import React, { useRef, useEffect, useState, use } from "react";
import Webcam from "react-webcam";

const DEFAULT_CONSTRAINTS = {
  width: 1280,
  height: 720,
  facingMode: "user",
  frameRate: { exact: 30 },
};

// components/Webcam.jsx
import alertSound from '../assets/alert-sound.mp3';



const CameraComponent = ({ onNewAlert, examActive, paused }) => {


  const audioRef = useRef();
  const wsRef = useRef(null);
  const sendInterval = useRef(null);
  const webcamRef = useRef(null);
  const [response, setResponse] = useState(null);
  const [constraints, setConstraints] = useState(DEFAULT_CONSTRAINTS);
  const soundOn = localStorage.getItem("sonidoAlertas") === "true";
  const delaySec = parseInt(localStorage.getItem("alertDelay") || "0", 10)



  // useEffect(() => {
    

  //   const unlock = () => {
  //     const audio = audioRef.current;
  //     const originalVolume = audio.volume;
  //     audio.volume = 0;
      
  //     audioRef.volume=0;
  //     audioRef.current.play().catch(() => { });
  //     audio.volume = originalVolume;
      
  //     window.removeEventListener("click", unlock);
  //   };

  //   window.addEventListener("click", unlock);
  //   return () => window.removeEventListener("click", unlock);
  // }, []);


  useEffect(() => {

    const raw = localStorage.getItem("cameraSettings");
    if (!raw) return;
    const loaded = JSON.parse(raw);

    // extrae el string correcto de deviceId (si estaba anidado)
    let id = typeof loaded.deviceId === "string"
      ? loaded.deviceId
      : loaded.deviceId?.exact?.exact ?? loaded.deviceId?.exact;

    const normalized = {
      width: loaded.width,
      height: loaded.height,
      ...(loaded.frameRate && { frameRate: loaded.frameRate }),
      ...(id && { deviceId: { exact: id } }),
      ...(loaded.facingMode && { facingMode: loaded.facingMode })
    };

    setConstraints(normalized);






  }, []);

  useEffect(() => {
    audioRef.current = new Audio(alertSound);
  }, []);


  useEffect(() => {
    // Si ya hay socket abierto se cierra
    if (wsRef.current) {
      clearInterval(sendInterval.current);
      wsRef.current.close();
      wsRef.current = null;
    }

    if (examActive) {
      // 1) Abrir WS
      const ws = new WebSocket("ws://localhost:8080/video-stream");
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket conectado");
        // 2) Arranca envío solo si no está paused
        if (!paused) {
          sendInterval.current = setInterval(sendFrame, 500);
        }
      };

      ws.onmessage = handleMessage;
      ws.onerror = err => console.error("WS error:", err);
      ws.onclose = () => {
        console.log("WebSocket cerrado");
        clearInterval(sendInterval.current);
      };

    } else {
      // examActive === false: nos aseguramos de limpiar intervalos
      clearInterval(sendInterval.current);
    }

    return () => {
      // Cleanup al desmontar o cambiar examActive
      clearInterval(sendInterval.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [examActive]);

  // Reinicia el envío de frames si se pausa o reanuda el examen
  useEffect(() => {
    if (!examActive || !wsRef.current) return;
    clearInterval(sendInterval.current);
    if (!paused) {
      // reanudar envío
      sendInterval.current = setInterval(sendFrame, 500);
    }
  }, [paused]);

  // Toma screenshot y envía al WS
  const sendFrame = () => {
    if (webcamRef.current && wsRef.current?.readyState === 1) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) wsRef.current.send(JSON.stringify({ image: imageSrc }));
    }
  };

  // Procesa mensajes recibidos
  const handleMessage = ({ data }) => {
    try {
      const { alerts } = JSON.parse(data);
      if (!Array.isArray(alerts)) return;
      setResponse({ alerts });

      alerts.forEach(alert => {
        // procesar frame
        let parsed;
        try { parsed = JSON.parse(alert.frame); }
        catch { parsed = { image: alert.frame }; }
        let imageData = parsed.image.startsWith('data:')
          ? parsed.image.split(',')[1]
          : parsed.image;

        // sonido
        // const audio = audioRef.current;
        // audio.currentTime = 0;
        // audio.play().catch(() => { });


        if (soundOn) {
          setTimeout(() => {
            audioRef.current.currentTime = 0
            audioRef.current.play().catch(() => { })
          }, delaySec * 1000)
        }

        // notificar padre
        onNewAlert?.(alert);

        // enviar alerta al backend
        fetch('http://localhost:3001/service/audit/alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({
            sessionId: localStorage.getItem('sessionId'),
            type: alert.type,
            description: alert.description,
            frame: alert.frame,
          }),
        }).catch(err => console.error("Error al enviar alerta:", err));




      });
    } catch (err) {
      console.error("Error procesando mensaje WS:", err);
    }
  };

  const camKey = JSON.stringify(constraints);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Webcam
        key={camKey}
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={constraints}
        style={{ width: "100%", height: "100%" }}
      />
      {response && (
        <div style={{
          position: "absolute",
          top: 10,
          left: 10,
          backgroundColor: "rgba(0,0,0,0.6)",
          color: "white",
          padding: "4px 8px",
          borderRadius: 4,
          fontSize: 12,
        }}>

        </div>
      )}
    </div>
  );
};

export default CameraComponent;
