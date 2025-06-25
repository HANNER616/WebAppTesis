// components/CameraComponent.jsx
import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user",
};

const CameraComponent = () => {
  const webcamRef = useRef(null);
  const [response, setResponse] = useState(null);

  useEffect(() => {
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
        const json = JSON.parse(data);
        console.log("Respuesta del servidor:", json);
        setResponse(json);
      } catch (err) {
        console.error("Error parseando JSON del servidor:", err);
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

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
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
          {JSON.stringify(response)}
        </div>
      )}
    </div>
  );
};

export default CameraComponent;
