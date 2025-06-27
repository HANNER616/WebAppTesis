# main.py

from fastapi import FastAPI, WebSocket
import uvicorn

app = FastAPI()

@app.websocket("/video-stream")
async def video_stream(websocket: WebSocket):
    await websocket.accept()
    frame_count = 0


    try:
        while True:
            # Espera texto (el cliente envía JSON con { image: "<base64>" })
            msg = await websocket.receive_text()
            frame_count += 1

            # Cada 1000 fotogramas, resetea contador y responde
            if frame_count >= 5:
                frame_count = 0
                # Aquí podrías generar alertas de prueba
                alerts = []
                await websocket.send_json({ "alerts": alerts })

    except Exception:
        # Si se cierra la conexión o hay error, simplemente salimos
        await websocket.close()


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8080)
