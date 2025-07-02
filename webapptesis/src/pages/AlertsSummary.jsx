import React, { useState, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import api from '../lib/api';

export default function AlertsSummary() {
  // Paginación
  const [alerts, setAlerts] = useState([]);
  const [page, setPage]     = useState(1);
  const [limit, setLimit]   = useState(20);
  const [total, setTotal]   = useState(0);
  const totalPages          = Math.ceil(total / limit);

  // Inputs de fecha
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');
  // Filtros aplicados (se usan en el pipeline)
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd]     = useState('');

  // Dropdown examen
  const [selectedExam, setSelectedExam] = useState('');
  const [examNames, setExamNames]       = useState([]);

  // Resultado final tras aplicar filtros
  const [displayedAlerts, setDisplayedAlerts] = useState([]);

  // 1) Fetch paginado
  useEffect(() => {
  const fetchPage = async () => {
    try {
      const token = localStorage.getItem('token');
      // Armamos los params dinámicamente:
      const params = { page, limit };
      if (filterStart && filterEnd) {
        params.startDate = `${filterStart}T00:00:00-05:00`;
        params.endDate   = `${filterEnd}T23:59:59-05:00`;
      }
      if (selectedExam) {
        params.examName = selectedExam;
      }

      const resp = await api.get('/get-alerts-limited', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      setAlerts(resp.data.data);
      setTotal(resp.data.total);
      // Opcional: si quieres recalcular dropdown de examenes desde cada página:
      setExamNames(
        [...new Set(resp.data.data.map(a => a.exam_name).filter(Boolean))]
      );
    } catch (err) {
      console.error('❌ Error al cargar página:', err);
    }
  };
  fetchPage();
}, [page, limit, filterStart, filterEnd, selectedExam]);

  // 2) Pipeline de filtros: fecha → examenes disponibles → examen → resultado
  useEffect(() => {
    // a) Filtrar por fecha (si existe rango aplicado)
    let working = alerts;
    if (filterStart && filterEnd) {
      const start = new Date(`${filterStart}T00:00:00-05:00`);
      const end   = new Date(`${filterEnd}T23:59:59-05:00`);
      working = working.filter(a => {
        const t = new Date(a.time ?? a.timestamp);
        return t >= start && t <= end;
      });
    }

    // b) Recalcular opciones de examen según 'working'
    const availableExams = [
      ...new Set(working.map(a => a.exam_name).filter(Boolean))
    ];
    setExamNames(availableExams);

    // c) Si el examen seleccionado ya no existe en options, lo limpio
    if (selectedExam && !availableExams.includes(selectedExam)) {
      setSelectedExam('');
    }

    // d) Filtrar por examen (si hay uno seleccionado)
    if (selectedExam) {
      working = working.filter(a => a.exam_name === selectedExam);
    }

    // e) Guardar resultado
    setDisplayedAlerts(working);
  }, [alerts, filterStart, filterEnd, selectedExam]);

  // 3) Manejo de clic en “Filtrar” para fechas
  const handleFilter = () => {
    if (!startDate || !endDate) return;
    setFilterStart(startDate);
    setFilterEnd(endDate);
  };

  // 4) Dropdown examen solo actualiza selección
  const handleExamFilter = examName => {
    setSelectedExam(examName);
  };

  // 5) Download Excel (igual que antes)
  const handleDownload = async () => {
    const BACKEND = 'http://localhost:3001';
    const token   = localStorage.getItem('token');
    const wb      = new ExcelJS.Workbook();
    const ws      = wb.addWorksheet('Alertas');

    ws.columns = [
      { header: 'Timestamp',   key: 'time',        width: 25 },
      { header: 'Descripción', key: 'description', width: 30 },
      { header: 'Tipo',        key: 'type',        width: 15 },
      { header: 'Imagen',      key: 'link',        width: 40 },
    ];

    displayedAlerts.forEach(a => {
      const row = ws.addRow({
        time:        a.time ?? a.timestamp,
        description: a.description,
        type:        a.type,
      });
      const cell = ws.getCell(`D${row.number}`);
      cell.value = {
        text: 'Ver imagen',
        hyperlink: `${BACKEND}/service/audit/alerts/${a.id}/frame?token=${token}`,
      };
      cell.font = { color: { argb: 'FF0000FF' }, underline: true };
    });

    const buf = await wb.xlsx.writeBuffer();
    saveAs(
      new Blob([buf], {
        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }),
      'alertas.xlsx'
    );
  };

  // 6) Render
  return (
    <div className="p-4 rounded-lg shadow bg-white dark:bg-gray-800 h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FileText className="mr-2 h-5 w-5" /> Historial de Alertas
      </h2>

      {/* ★ Controles de filtro (misma fila) */}
      <div className="flex items-end gap-4 mb-6">
        {/* Fecha inicio */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Fecha inicio
          </label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Fecha fin */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Fecha fin
          </label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Botón “Filtrar” (fechas) */}
        <button
          onClick={handleFilter}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
        >
          Filtrar
        </button>

        {/* Dropdown examen */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Filtrar por examen
          </label>
          <select
            value={selectedExam}
            onChange={e => handleExamFilter(e.target.value)}
            className="px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todos los exámenes</option>
            {examNames.map((exam, idx) => (
              <option key={idx} value={exam}>
                {exam}
              </option>
            ))}
          </select>
        </div>

        {/* Selector de límite */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Registros por página
          </label>
          <select
            value={limit}
            onChange={e => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            {[10, 20, 50, 100].map(n => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* Botón Descargar */}
        <button
          onClick={handleDownload}
          className="ml-auto flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
        >
          <Download className="mr-2 h-5 w-5" /> Descargar Excel
        </button>
      </div>

      {/* Lista de alertas */}
      <ul className="space-y-4 flex-1">
        {displayedAlerts.length === 0 ? (
          <li className="text-center text-gray-500 dark:text-gray-400">
            No hay alertas para este rango
          </li>
        ) : (
          displayedAlerts.map((a, i) => (
            <li
              key={i}
              className="border-2 border-orange-500 bg-orange-100 dark:bg-orange-900 rounded-lg p-3 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <span className="text-orange-700 font-medium">
                  ⚠️ {new Date(a.time ?? a.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {a.description}
              </p>
              <button
                onClick={() => {
                  const token = localStorage.getItem('token');
                  api
                    .get(`/alerts/${a.id}/frame`, {
                      responseType: 'blob',
                      headers: { Authorization: `Bearer ${token}` }
                    })
                    .then(res => {
                      const url = URL.createObjectURL(res.data);
                      window.open(url, '_blank');
                    })
                    .catch(err => console.error(err));
                }}
                className="text-blue-600 dark:text-blue-400 underline cursor-pointer mt-2"
              >
                Ver imagen
              </button>
            </li>
          ))
        )}
      </ul>

      {/* Paginación */}
      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() => setPage(p => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded"
        >
          ‹ Anterior
        </button>

        <span className="px-3 py-1">
          Página {page} de {totalPages}
        </span>

        <button
          onClick={() => setPage(p => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded"
        >
          Siguiente ›
        </button>
      </div>
    </div>
  );
}
