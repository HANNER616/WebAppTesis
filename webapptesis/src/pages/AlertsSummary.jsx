import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, Search } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import apiAudit from '../lib/apiAudit';

export default function AlertsSummary() {
  // Paginación
  const [alerts, setAlerts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const totalPages = Math.ceil(total / limit);

  // Inputs de fecha
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  // Filtros aplicados (se usan en el pipeline)
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');

  const [selectedExam, setSelectedExam] = useState(null); // input
  const [filterExam, setFilterExam] = useState(null); // pipeline


  const [examNames, setExamNames] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const examFilterRef = useRef(null);



  const [allExamNames, setAllExamNames] = useState([]);
  // Para la búsqueda en el dropdown
  const [examSearch, setExamSearch] = useState('');

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
          params.endDate = `${filterEnd}T23:59:59-05:00`;
        }
        if (selectedExam) {
          params.examName = selectedExam;
        }

        const resp = await apiAudit.get('/get-alerts-limited', {
          headers: { Authorization: `Bearer ${token}` },
          params
        });
        setAlerts(resp.data.data);
        setTotal(resp.data.total);
        setDisplayedAlerts(resp.data.data); // Inicialmente muestra todo
        // Opcional: si quieres recalcular dropdown de examenes desde cada página:
        setExamNames(
          [...new Set(resp.data.data.map(a => a.exam_name).filter(Boolean))]
        );
      } catch (err) {
        console.error('❌ Error al cargar página:', err);
        alert('Ha ocurrido un error al cargar las alertas, intente más tarde.');
      }
    };
    fetchPage();
  }, [page, limit, filterStart, filterEnd, filterExam]);

  useEffect(() => {
    const handleClickOutside = e => {
      if (examFilterRef.current && !examFilterRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  useEffect(() => {
    const fetchExamNames = async () => {
      try {
        const token = localStorage.getItem('token');
        const resp = await apiAudit.get('/get-exam-names', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAllExamNames(resp.data);  
      } catch (err) {
        console.error('Error al cargar exam names:', err);
        alert('Ha ocurrido un error al cargar los nombres de exámenes, intente más tarde.');
      }
    };
    fetchExamNames();
  }, []);



  // Manejo de clic en “Filtrar” para fechas
  const handleFilter = () => {

    setFilterExam(selectedExam);


    setFilterStart(startDate || null);
    setFilterEnd(endDate || null);


    setPage(1);
    setExamSearch('');
    setDropdownOpen(false);
  };




  const handleDownload = async () => {
    
    const baseURL = import.meta.env.VITE_AUDIT_BASE_URL;

    const token = localStorage.getItem('token');
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Alertas');

    ws.columns = [
      { header: 'Timestamp', key: 'time', width: 25 },
      { header: 'Descripción', key: 'description', width: 30 },
      { header: 'Tipo', key: 'type', width: 15 },
      { header: 'Imagen', key: 'link', width: 40 },
    ];

    displayedAlerts.forEach(a => {
      const row = ws.addRow({
        time: a.time ?? a.timestamp,
        description: a.description,
        type: a.type,
      });
      const cell = ws.getCell(`D${row.number}`);
      cell.value = {
        text: 'Ver imagen',
        hyperlink: `${baseURL}/alerts/${a.id}/frame?token=${token}`,
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


  return (
    <div className="p-4 rounded-lg shadow bg-white dark:bg-gray-800 h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FileText className="mr-2 h-5 w-5" /> Historial de Alertas
      </h2>

      {/* Controles de filtro */}
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



        {/* FILTRAR POR EXAMEN */}
        <div className="flex flex-col w-60 relative" ref={examFilterRef}>
          <label className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Filtrar por examen
          </label>

          <input
            type="text"
            value={examSearch}
            onChange={e => setExamSearch(e.target.value)}
            placeholder={selectedExam ?? 'Buscar examen…'}
            onClick={() => setDropdownOpen(true)}
            onFocus={() => setDropdownOpen(true)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />

          {dropdownOpen && (
            <ul className="absolute left-0 top-full mt-1 w-full z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg max-h-40 overflow-y-auto shadow-lg">
              {/* “Todos los examenes” solo actualiza selectedExam */}
              <li
                onClick={() => {
                  setSelectedExam(null);
                  setDropdownOpen(false);
                }}
                className={`px-3 py-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-gray-700 ${selectedExam === null ? 'bg-indigo-100 dark:bg-gray-600' : ''
                  }`}
              >
                Todos los exámenes
              </li>

              {allExamNames
                .filter(name =>
                  name.toLowerCase().includes(examSearch.toLowerCase())
                )
                .map(name => (
                  <li
                    key={name}
                    onClick={() => {
                      setSelectedExam(name);
                      setDropdownOpen(false);
                    }}
                    className={`px-3 py-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-gray-700 ${selectedExam === name ? 'bg-indigo-100 dark:bg-gray-600' : ''
                      }`}
                  >
                    {name}
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Botón “Filtrar” (fechas) */}
        <button
          onClick={handleFilter}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
        >
          Filtrar
        </button>
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
                  apiAudit
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

      {/* Paginación compacta sin flechas de spinner */}
      <div className="flex items-center justify-center mt-4 space-x-2 text-lg">
        {/* Ir a primera */}
        <button
          onClick={() => setPage(1)}
          disabled={page === 1}
          className="p-2 border rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          «
        </button>

        {/* Anterior */}
        <button
          onClick={() => setPage(p => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="p-2 border rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          ‹
        </button>

        {/* Salto directo ingresando página (solo texto, sin spinner) */}
        <div className="flex items-center">
          <input
            type="text"
            inputMode="numeric"
            value={page}
            onChange={e => {
              const v = Number(e.target.value.replace(/\D/g, ''));
              if (v >= 1 && v <= totalPages) setPage(v);
            }}
            className="w-14 text-center appearance-none px-2 py-1 border rounded focus:outline-none focus:ring focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <span className="ml-1">/ {totalPages}</span>
        </div>

        {/* Siguiente */}
        <button
          onClick={() => setPage(p => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="p-2 border rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          ›
        </button>

        {/* Ir a última */}
        <button
          onClick={() => setPage(totalPages)}
          disabled={page === totalPages}
          className="p-2 border rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          »
        </button>
      </div>
    </div>
  );
}
