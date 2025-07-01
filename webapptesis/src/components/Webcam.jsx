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



const CameraComponent = ({ onNewAlert }) => {


  const audioRef = useRef();

  const webcamRef = useRef(null);
  const [response, setResponse] = useState(null);
  const [constraints, setConstraints] = useState(DEFAULT_CONSTRAINTS);


  useEffect(() => {
    // Una llamada “vacía” a play() tras un click desbloquea el autoplay API
    const unlock = () => {
      audioRef.current.play().catch(() => { });
      window.removeEventListener('click', unlock);
    };
    window.addEventListener('click', unlock);
    return () => window.removeEventListener('click', unlock);
  }, []);


  useEffect(() => {

     const raw = localStorage.getItem("cameraSettings");
    if (!raw) return;
    const loaded = JSON.parse(raw);

    // extrae el string correcto de deviceId (si estaba anidado)
    let id = typeof loaded.deviceId === "string"
      ? loaded.deviceId
      : loaded.deviceId?.exact?.exact ?? loaded.deviceId?.exact;

    const normalized = {
      width:  loaded.width,
      height: loaded.height,
      ...(loaded.frameRate && { frameRate: loaded.frameRate }),
      ...(id &&           { deviceId: { exact: id } }),
      ...(loaded.facingMode && { facingMode: loaded.facingMode })
    };

    setConstraints(normalized);




   

  }, []);


  useEffect(() => {
   
    audioRef.current = new Audio(alertSound);


    // 1) Abrir conexión WS
    const ws = new WebSocket("ws://localhost:8080/video-stream");
    let captureInterval;

    ws.onopen = () => {
      console.log("WebSocket conectado a ws://localhost:8080/video-stream");

      // 2) Cada 500 ms tomamos un screenshot y lo enviamos
      captureInterval = setInterval(() => {
        if (webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc) {
            ws.send(JSON.stringify({ image: imageSrc }));
          }
        }
      }, 500);
    };

    // 3) Procesar mensajes entrantes
    ws.onmessage = ({ data }) => {
      try {
        const { alerts } = JSON.parse(data);
        if (!Array.isArray(alerts)) return;

        // Guardamos la última respuesta para el overlay
        setResponse({ alerts });

        alerts.forEach(alert => {
          // 1) Parseamos el frame (es un string JSON)
          let parsed;
          try {
            parsed = JSON.parse(alert.frame);
          } catch {
            console.warn("alert.frame no es JSON, usamos raw:", alert.frame);
            parsed = { image: alert.frame };
          }
          let imageData = parsed.image;
          // Si vino como data URI, separamos el prefix
          if (imageData.startsWith('data:')) {
            imageData = imageData.split(',')[1];
          }

          //descarga automática
          // const link = document.createElement("a");
          // link.href = `data:image/jpeg;base64,${imageData}`;
          // const ts = new Date(alert.timestamp)
          //   .toISOString()
          //   .replace(/[:.]/g, "-");
          // link.download = `alert_${alert.id}_${ts}.jpg`;
          // document.body.appendChild(link);
          // link.click();
          // document.body.removeChild(link);

          // 3) Sonido de alerta
          const audio = audioRef.current;
          audio.currentTime = 0;
          audio.play().catch(() => {
            console.warn('Interacción previa requerida para reproducir sonido');
          });

          // 4) Notificar al padre
          onNewAlert && onNewAlert(alert);

        //ENVIAR ALERTA A BACKEND

        fetch('http://localhost:3001/service/audit/alert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: localStorage.getItem('email'),
            alertId: alert.id,
            type: alert.type,
            description: alert.description,
            frame: alert.frame, // Enviamos la imagen en base64
          }),
        }).catch((err) => {
          console.error("Error enviando alerta al backend:", err);
        });
        }); 
      } catch (err) {
        console.error("Error procesando mensaje WS:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.onclose = () => {
      console.log("WebSocket cerrado");
      if (captureInterval) clearInterval(captureInterval);
    };

    // Cleanup al desmontar
    return () => {
      if (captureInterval) clearInterval(captureInterval);
      ws.close();
    };
  }, []);

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
