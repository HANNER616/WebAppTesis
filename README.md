# Documentación Técnica – WebAppTesis

## Índice
1. [Descripción del Proyecto](#descripción-del-proyecto)  
2. [Arquitectura General](#arquitectura-general)  
3. [Tecnologías y Frameworks](#tecnologías-y-frameworks)  
4. [Estructura de Carpetas](#estructura-de-carpetas)  
5. [Variables de Entorno](#variables-de-entorno)  
6. [Instalación y Arranque Local](#instalación-y-arranque-local)  
7. [Microservicio de Autenticación (`auth`)](#microservicio-de-autenticación-auth)  
   - 7.1. Endpoints  
   - 7.2. Controladores  
   - 7.3. Modelos  
   - 7.4. Flujo de Login / Signup / Reset  
8. [Microservicio de Auditoría (`audit`)](#microservicio-de-auditoría-audit)  
   - 8.1. Endpoints  
   - 8.2. Controladores  
   - 8.3. Modelos y Consultas  
   - 8.4. Middleware JWT  
9. [Microservicio de Streaming de Prueba (`streamTest`)](#microservicio-de-streaming-de-prueba-streamtest)  
10. [Aplicación Web Frontend (`webapptesis`)](#aplicación-web-frontend-webapptesis)  
    - 10.1. Estructura de Código  
    - 10.2. Contextos React  
    - 10.3. Rutas y Componentes Principales  
    - 10.4. Configuración de Vite y Proxy  
    - 10.5. Estilos con Tailwind CSS  
11. [Modelos de Datos y Base de Datos](#modelos-de-datos-y-base-de-datos)  
12. [Referencias y Recursos](#referencias-y-recursos)  

---

## Descripción del Proyecto

**WebAppTesis** es una plataforma de monitorización de exámenes en aulas.  
- **Frontend**: SPA en React/Vite que muestra el video en tiempo real, alerta al docente y exporta registros en Excel.  
- **Backend**: colección de microservicios en Node.js (Express) y Python (FastAPI)  
  - `auth`: gestión de usuarios, JWT y recuperación de contraseña  
  - `audit`: registro y consulta de alertas generadas por el análisis de video  
  - `streamTest`: servidor WebSocket de prueba para simular detección de alertas  

---

## Arquitectura General

```text
┌───────────────────┐        ┌──────────────────┐       ┌───────────────────┐
│                   │  HTTPS │                  │ WS    │                   │
│   Frontend (UI)   │◀──────▶│  API Gateway (*) │◀────▶│ streamTest WS Svc │
│  React + Vite     │ proxy  │                  │       │   FastAPI + WS    │
└───────────────────┘        └──────────────────┘       └───────────────────┘
           │                             │
           │ REST                        │ REST
           ▼                             ▼
┌───────────────────┐           ┌───────────────────┐
│                   │           │                   │
│   auth Svc        │           │   audit Svc       │
│ Express + PostgreSQL │        │ Express + PostgreSQL │
└───────────────────┘           └───────────────────┘
```

> (*) En desarrollo local, no hay gateway: el frontend usa proxy de Vite.

---

## Tecnologías y Frameworks

- **Node.js** – Runtime JavaScript (v20+)  
- **Express** – Framework web para Node.js ([Docs Express](https://expressjs.com))  
- **PostgreSQL** – Base de datos relacional  
- **FastAPI** – Framework Python para WebSocket y REST ([Docs FastAPI](https://fastapi.tiangolo.com))  
- **React** – Biblioteca UI ([Docs React](https://reactjs.org))  
- **Vite** – Bundler y dev server ([Docs Vite](https://vitejs.dev))  
- **Tailwind CSS** – Utilidades de CSS ([Docs Tailwind](https://tailwindcss.com))  
- **JWT** – JSON Web Tokens para autenticación  
- **Axios** – Cliente HTTP en frontend  
- **ExcelJS** – Generación de hojas de cálculo  
- **react-webcam** – Captura de video en navegador  

---

## Estructura de Carpetas

```
hanner616-webapptesis/
├── README.md
├── microservices/
│   ├── audit/
│   │   ├── app.js
│   │   ├── package.json
│   │   ├── config/db.js
│   │   ├── controllers/auditController.js
│   │   ├── middleware/authenticateJWT.js
│   │   ├── models/auditModel.js
│   │   ├── public/
│   │   └── routes/auditRoutes.js
│   ├── auth/
│   │   ├── auth.js
│   │   ├── package.json
│   │   ├── config/db.js
│   │   ├── controllers/authController.js
│   │   ├── models/userModel.js
│   │   └── routes/authRoutes.js
│   └── streamTest/
│       └── main.py
└── webapptesis/
    ├── README.md
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── eslint.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── helpers.jsx
        ├── lib/api.js
        ├── index.css
        ├── App.css
        ├── AuthContext.jsx
        ├── AlertsContext.jsx
        ├── ThemeContext.jsx
        ├── components/
        │   ├── DialogConfirmation.jsx
        │   └── Webcam.jsx
        └── pages/
            ├── Auth.jsx
            ├── AlertsSummary.jsx
            ├── AppConfig.jsx
            └── ConfigCamera.jsx
```

---

## Variables de Entorno

Cada microservicio define un archivo `.env`:

```ini
# Común
DATABASE_URL=postgres://user:pass@host:port/dbname
JWT_SECRET=tu_jwt_secret

# auth service
EMAIL_USER=tu@gmail.com
EMAIL_PASS=app_password

# audit service
# (usa DATABASE_URL y JWT_SECRET)

# streamTest
# (no requiere variables)
```

---

## Instalación y Arranque Local

1. Clonar repositorio y navegar:
   ```bash
   git clone https://github.com/tu_usuario/hanner616-webapptesis.git
   cd hanner616-webapptesis
   ```

2. **Microservicios**  
   - **auth**:
     ```bash
     cd microservices/auth
     npm install
     npm start    # Por defecto en puerto 3000
     ```
   - **audit**:
     ```bash
     cd microservices/audit
     npm install
     node app.js  # o npm start, puerto 3001
     ```
   - **streamTest**:
     ```bash
     cd microservices/streamTest
     pip install fastapi uvicorn
     uvicorn main:app --reload --port 8080
     ```

3. **Frontend**  
   ```bash
   cd webapptesis
   npm install
   npm run dev
   ```
   Abrir `http://localhost:5173` en el navegador.

---

## Microservicio de Autenticación (`auth`)

### 7.1. Endpoints

| Método | Ruta                                | Descripción                          |
| ------ | ----------------------------------- | ------------------------------------ |
| POST   | `/service/auth/signup`             | Registrar nuevo usuario              |
| POST   | `/service/auth/login`              | Login (devuelve JWT)                 |
| POST   | `/service/auth/password-send-token`| Enviar token de reset por correo     |
| POST   | `/service/auth/password-reset`     | Reset de contraseña (sin token)      |
| POST   | `/service/auth/update-password`    | Reset de contraseña (con token)      |
| POST   | `/service/auth/verify-token`       | Verificar validez de JWT             |

### 7.2. Controladores

- **signup**: hashea contraseña con `bcryptjs`, llama a `User.create()`.  
- **login**: valida con `bcrypt.compare()`, genera JWT con `jsonwebtoken`.  
- **passwordSendToken**: crea token de 1 h, envía email con `nodemailer`.  
- **updatePassword / updatePasswordReset**: (opcionalmente) verifica token y llama a `User.updatePassword()`.  
- **verifyToken**: decodifica token JWT para validarlo.

### 7.3. Modelos

- **models/userModel.js**  
  - `create({ username, email, password })` → inserta en `users`.  
  - `findUser(identifier)` → busca por `username` o `email`.  
  - `updatePassword(email, newPassword)` → actualiza contraseña y retorna el usuario.

### 7.4. Flujo

1. **Signup** → formulario → `/signup` → status 201.  
2. **Login** → `/login` → recibe `{ userInfo: { token, username, email } }`.  
3. **Recuperación** → solicita token → `/password-send-token` → email con JWT → `/verify-token` → `/update-password`.

---

## Microservicio de Auditoría (`audit`)

### 8.1. Endpoints

| Método | Ruta                                   | Descripción                               |
| ------ | -------------------------------------- | ----------------------------------------- |
| POST   | `/service/audit/exam-session`          | Crear nueva sesión de examen              |
| POST   | `/service/audit/alert`                 | Loguear alerta (frame + meta)             |
| POST   | `/service/audit/user-event`            | Registrar evento de usuario (login/logout)|
| GET    | `/service/audit/get-alerts`            | Obtener todas las alertas del usuario     |
| GET    | `/service/audit/get-alerts-limited`    | Alertas paginadas y filtradas             |
| GET    | `/service/audit/get-exam-names`        | Lista de nombres de exámenes              |
| GET    | `/service/audit/alerts/:id/frame`      | Recuperar imagen de alerta (Data-URL/Blob)|

### 8.2. Controladores

- **createExamSession**: inserta en `exam_sessions`, retorna `sessionId`.  
- **logAlert**: inserta en `alerts_audit` con columna JSONB `frame`.  
- **getAllByUser**: consulta sin filtros.  
- **getAlertsPaginated**: admite `page`, `limit`, `startDate`, `endDate`, `examName`.  
- **getExamNames**: `SELECT DISTINCT name` de `exam_sessions`.  
- **getFrame**: extrae `frame` y sirve como imagen binaria.

### 8.3. Modelos y Consultas

- **exam_sessions**: `id, user_id, name`  
- **alerts_audit**: `id, user_id, session_id, type, description, frame (JSONB), time`  
- **user_events**: `id, user_id, event_type, occurred_at`  

Las consultas usan `pg.Pool` y consultas parametrizadas.

### 8.4. Middleware JWT

```js
// middleware/authenticateJWT.js
const jwt = require('jsonwebtoken');
function authenticateJWT(req, res, next) {
  let token = /* obtiene de header o query */;
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.sendStatus(403);
    req.user = payload;
    next();
  });
}
module.exports = authenticateJWT;
```

---

## Microservicio de Streaming de Prueba (`streamTest`)

- **main.py** (FastAPI + WebSocket) en `/video-stream`.  
- Cada 25 frames recibidos envía un JSON con `alerts`.  
- Ejecutar con:
  ```bash
  uvicorn main:app --reload --port 8080
  ```

---

## Aplicación Web Frontend (`webapptesis`)

### 10.1. Estructura de Código

```
src/
├── main.jsx        # Punto de entrada
├── App.jsx         # Rutas y layout principal
├── helpers.jsx     # Funciones utilitarias
├── lib/api.js      # Cliente Axios
├── contexts/       # AuthContext, ThemeContext, AlertsContext, ExamContext
├── components/     # DialogConfirmation, Webcam
└── pages/          # Auth, AlertsSummary, AppConfig, ConfigCamera
```

### 10.2. Contextos React

- **AuthContext**: controla `isAuthenticated`, `login()`, `logout()`, y `verifyTokenOnServer()`.  
- **ThemeContext**: alterna modo oscuro/light y persiste en `localStorage`.  
- **AlertsContext**: array de alertas en tiempo real.  
- **ExamContext**: flag `examActive` que bloquea refresh y navegación.

### 10.3. Rutas y Componentes

- `/auth` → `Auth.jsx` (login, registro, recuperación).  
- `/` → ProtectedRoute → `HomePage`: cámara + alertas.  
- `/alerts` → `AlertsSummary.jsx`: tabla paginada, filtros, export Excel.  
- `/config-camera` → `ConfigCamera.jsx`: selección de cámara, resolución, FPS.  
- `/config-app` → `AppConfig.jsx`: ajustes de sonido y tema.

### 10.4. Configuración de Vite y Proxy

```js
// webapptesis/vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/service/audit': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/service/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
```

### 10.5. Estilos con Tailwind CSS

- Configurado en `tailwind.config.js` y `postcss.config.js`.  
- Clases utilitarias en JSX para diseño responsivo y dark mode.

---

## Modelos de Datos y Base de Datos

| Tabla             | Campos                                                    |
| ----------------- | --------------------------------------------------------- |
| **users**         | `id`, `username`, `email`, `password`                     |
| **exam_sessions** | `id`, `user_id` → `users.id`, `name`                      |
| **alerts_audit**  | `id`, `user_id`, `session_id`, `type`, `description`, `frame (JSONB)`, `time` |
| **user_events**   | `id`, `user_id`, `event_type`, `occurred_at`              |

---

## Referencias y Recursos

- **Express**: https://expressjs.com  
- **FastAPI**: https://fastapi.tiangolo.com  
- **React**: https://reactjs.org  
- **Vite**: https://vitejs.dev  
- **Tailwind CSS**: https://tailwindcss.com  
- **JWT (jsonwebtoken)**: https://github.com/auth0/node-jsonwebtoken  
- **ExcelJS**: https://github.com/exceljs/exceljs  
- **react-webcam**: https://github.com/mozmorris/react-webcam  
