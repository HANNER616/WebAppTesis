import React, { useContext, useState, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';
import { AlertsContext } from '../AlertsContext';
import { openFrameInNewTab } from '../helpers';
import axios from 'axios';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';


export default function AlertsSummary() {
  const { alerts } = useContext(AlertsContext);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [displayedAlerts, setDisplayedAlerts] = useState([]);

  useEffect(() => {


    setDisplayedAlerts(alerts);



  }, [alerts]);

  const handleFilter = async () => {
    if (!startDate || !endDate) return;
    const start = `${startDate}T00:00:00-05:00`;
    const end = `${endDate}T23:59:59-05:00`;
    const email = localStorage.getItem('email'); // o donde tengas guardado el email
    try {
      const { data } = await axios.get('http://localhost:3001/service/audit/show-alerts', {
        params: { email, startDate: start, endDate: end }
      });
      setDisplayedAlerts(data);
    } catch (err) {
      console.error('Error filtrando alertas:', err);
    }
  };

  async function handleDownload() {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Alertas');

    ws.columns = [
      { header: 'Timestamp', key: 'time', width: 25 },
      { header: 'Descripción', key: 'description', width: 30 },
      { header: 'Tipo', key: 'type', width: 15 },
      { header: 'Imagen', key: 'link', width: 20 },
    ];

    // Ajusta esto al host/puerto de tu API Express
    const BACKEND = 'http://localhost:3001';

    displayedAlerts.forEach((a, idx) => {
      const rowNumber = idx + 2;
      ws.addRow({
        time: a.time ?? a.timestamp,
        description: a.description,
        type: a.type,
      });

      // En la columna D creamos un hipervínculo a tu ruta montada
      const cell = ws.getCell(`D${rowNumber}`);
      cell.value = {
        text: 'Ver imagen',
        hyperlink: `${BACKEND}/service/audit/alerts/${a.id}/frame`
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
  }



  return (
    <div className="p-4 rounded-lg shadow bg-white dark:bg-gray-800 h-full flex flex-col min-h-0">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FileText className="mr-2 h-5 w-5" /> Historial de Alertas
      </h2>

      {/* Controles de filtro */}
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 dark:text-gray-400 mb-1">Fecha inicio</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 dark:text-gray-400 mb-1">Fecha fin</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <button
          onClick={handleFilter}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
        >
          Filtrar
        </button>
        <button
          onClick={handleDownload}
          className="ml-auto flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
        >
          <Download className="mr-2 h-5 w-5" /> Descargar Excel
        </button>
      </div>

      {/* Lista de alertas */}
      <ul className="flex-1 overflow-y-auto space-y-4 max-h-[550px]">
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
                onClick={() =>
                  window.open(
                    `http://localhost:3001/service/audit/alerts/${a.id}/frame`,
                    '_blank',
                    'noopener,noreferrer'
                  )
                }
                className="text-blue-600 dark:text-blue-400 underline cursor-pointer mt-2"
              >
                Ver imagen
              </button>

            </li>
          ))
        )}
      </ul>
    </div>
  );
}
