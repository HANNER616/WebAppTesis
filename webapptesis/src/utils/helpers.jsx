// helpers.js
export function openFrameInNewTab(frame) {
  // 1) Extrae solo el Base64 o la data-URI
  let imgSrc;
  try {
    const parsed = JSON.parse(frame);
    imgSrc = parsed.image;
    // si viene solo Base64, anteponemos el prefijo
    if (!imgSrc.startsWith("data:")) {
      imgSrc = `data:image/jpeg;base64,${imgSrc}`;
    }
  } catch {
    // no era JSON, asumimos que frame ya es Base64 o data-URI
    imgSrc = frame.startsWith("data:")
      ? frame
      : `data:image/jpeg;base64,${frame}`;
  }

  // 2) Abre ventana en blanco y escribe la imagen
  const newWindow = window.open("", "_blank");
  if (!newWindow) {
    console.error("No se pudo abrir la nueva pestaña");
    return;
  }
  newWindow.document.write(`
    <html>
      <head><title>Alerta – Frame</title></head>
      <body style="margin:0; display:flex; justify-content:center; align-items:center; height:100vh; background:#333">
        <img 
          src="${imgSrc}" 
          style="max-width:100%; max-height:100%; object-fit:contain"
          alt="Frame de alerta"
        />
      </body>
    </html>
  `);
  newWindow.document.close();
}
