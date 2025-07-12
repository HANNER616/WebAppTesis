import React, { useState, useRef, useEffect, useContext, createContext } from "react"

import {Camera, FileText, Play, Pause, Square } from "lucide-react"

import "../index.css"
import WebcamComponent from "../components/Webcam"
import { openFrameInNewTab } from "../utils/helpers.jsx"
import DialogConfirmation from "../components/DialogConfirmation.jsx"
import apiAudit from "../lib/apiAudit"
import { ExamContext } from "../contexts/ExamContext.jsx" 
import { AlertsContext } from "../contexts/AlertsContext.jsx"


export default function HomePage() {
  const [showWebcam, setShowWebcam] = useState(false)
  const { alerts, setAlerts } = useContext(AlertsContext)
  const { examActive, setExamActive } = useContext(ExamContext)
  const [countdown, setCountdown] = useState(null)
  const [paused, setPaused] = useState(false)
  const sendInterval = useRef(null)
  const [emailSent, setEmailSent] = useState(false)

  // Modales
  const [confirmStartModal, setConfirmStartModal] = useState(false)
  const [nameModalOpen, setNameModalOpen] = useState(false)
  const [examName, setExamName] = useState("")

  // Verificar cámara
  useEffect(() => {
    let mounted = true
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(stream => {
        if (mounted) setShowWebcam(true)
        stream.getTracks().forEach(t => t.stop())
      })
      .catch(() => {
        if (mounted) setShowWebcam(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  // Cuenta regresiva
  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
    if (countdown === 0) {
      setExamActive(true)
      setCountdown(null)
    }
  }, [countdown])

  // Lógica de inicio
  const openStartModal = () => setConfirmStartModal(true)
  const onConfirmStart = () => {
    setConfirmStartModal(false)
    setNameModalOpen(true)
  }
  const onSubmitName = async () => {
    console.log("Nombre del examen:", examName)
    setAlerts([])
    setEmailSent(false)
    if (!examName.trim()) return
    localStorage.setItem("exam_name", examName.trim())
    try {
      const data = await createSession()
      setNameModalOpen(false)
      setCountdown(3)
    } catch { }
  }
  const onCancelModal = () => {
    setConfirmStartModal(false)
    setNameModalOpen(false)
  }

  // Envío de fotogramas
  useEffect(() => {
    if (examActive && !paused) {
      sendInterval.current = setInterval(() => {
        console.log("Enviando fotograma…")
      }, 500)
    }
    return () => clearInterval(sendInterval.current)
  }, [examActive, paused])

  const handlePauseClick = () => setPaused(p => !p)
  const handleStopClick = () => {
    setExamActive(false)
    setPaused(false)
    setCountdown(null)
  }
  const handleNewAlert = alert => setAlerts(a => [...a, alert])




  const emailAlertsEnabled = localStorage.getItem("emailAlertsEnabled")
  const numAlerts = parseInt(localStorage.getItem("maxAlerts") ?? "0", 10)




  const sendAlertToUserEmail = async () => {

    const AuditBaseURL = import.meta.env.VITE_AUDIT_BASE_URL
    const sessionId = localStorage.getItem("sessionId")
    const username = localStorage.getItem("username")
    const email = localStorage.getItem("email")
    const examName = localStorage.getItem("exam_name")

    console.log("alerts.length:", alerts.length)
    console.log("numAlerts:", numAlerts)



    try {
      await apiAudit.post("/send-warning-email", {
      sessionId,
      username,
      email,
      examName,
      numAlerts: alerts.length
    })
      setEmailSent(true)
    } catch (err) {
      console.error('Error al enviar email de alerta:', err)
    }




  }







  useEffect(() => {

    if (emailAlertsEnabled && alerts.length > numAlerts && !emailSent) {
      sendAlertToUserEmail()
    }

  }, [alerts.length,emailSent, emailAlertsEnabled, numAlerts]);

  const createSession = async () => {
    const examNameLocal = localStorage.getItem("exam_name")
    const token = localStorage.getItem("token")
    try{
    const resp = await apiAudit.post("/exam-session",
      { sessionName: examNameLocal }
    )
    localStorage.setItem("sessionId", resp.data.sessionId)
    return resp.data
  } catch (error) {
    alert('No se ha podido establecer conexion con el servidor, intente más tarde.');
  }
    
  }

  return (
    <>
      <DialogConfirmation
        isOpen={confirmStartModal}
        title="Confirmar inicio"
        message="¿Estás seguro de que quieres empezar el examen?"
        confirmLabel="Sí"
        cancelLabel="Cancelar"
        onConfirm={onConfirmStart}
        onCancel={onCancelModal}
      />

      {nameModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Nombre del examen
            </h3>
            <input
              autoFocus
              type="text"
              value={examName}
              onChange={e => setExamName(e.target.value)}
              placeholder="Escribe aquí el nombre"
              className="w-full mb-4 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={onCancelModal}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={onSubmitName}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
              >
                Empezar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full">
        <div className="md:col-span-2 p-4 rounded-lg shadow bg-white dark:bg-gray-800 transition-colors">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Vista de Cámara</h2>
            {examActive ? (
              <div className="flex space-x-2">
                <button
                  onClick={handlePauseClick}
                  className="flex items-center bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded shadow"
                >
                  <Pause className="mr-1 h-4 w-4" />
                  {paused ? "Reanudar" : "Pausar"}
                </button>
                <button
                  onClick={handleStopClick}
                  className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow"
                >
                  <Square className="mr-2 h-5 w-5" />
                  Detener examen
                </button>
              </div>
            ) : (
              <button
                onClick={openStartModal}
                disabled={countdown !== null || examActive}
                className={`flex items-center px-4 py-2 rounded shadow text-white ${countdown !== null || examActive
                  ? "bg-green-300 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
                  }`}
              >
                <Play className="mr-2 h-5 w-5" />
                Empezar examen
              </button>
            )}
          </div>

          {countdown !== null && countdown > 0 && (
            <div className="mb-4 text-center text-lg text-gray-700 dark:text-gray-300">
              El examen "{localStorage.getItem("exam_name")}" va a iniciar en{" "}
              <strong>{countdown}</strong> segundos…
            </div>
          )}

          <div className="aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            {showWebcam ? (
              <WebcamComponent
                onNewAlert={handleNewAlert}
                examActive={examActive}
                paused={paused}
              />
            ) : (
              <Camera className="h-16 w-16 text-gray-400 dark:text-gray-500" />
            )}
          </div>
        </div>

        <div className="p-4 rounded-lg shadow bg-white dark:bg-gray-800 transition-colors">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FileText className="mr-2 h-5 w-5" /> Alertas
          </h2>
          <ul className="overflow-y-auto space-y-4 max-h-[550px]">
            {alerts.map((a, i) => (
              <li
                key={i}
                className="w-full border-2 border-orange-500 bg-orange-100 dark:bg-orange-900 rounded-lg p-3 shadow-sm"
              >
                <strong className="text-orange-700">⚠️</strong>: {a.timestamp}
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {a.description}
                </p>
                <button
                  onClick={() => openFrameInNewTab(a.frame)}
                  className="text-blue-600 underline cursor-pointer"
                >
                  Clic para ver imagen
                </button>
              </li>
            ))}
            {alerts.length === 0 && (
              <li className="w-full text-center text-gray-500 dark:text-gray-400">
                No hay alertas
              </li>
            )}
          </ul>
        </div>
      </div>
    </>
  )
}