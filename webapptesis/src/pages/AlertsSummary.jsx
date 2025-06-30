import React, { useContext } from 'react';
import { FileText } from 'lucide-react';
import { AlertsContext } from '../AlertsContext';
import { openFrameInNewTab } from '../helpers';

export default function AlertsSummary() {
  const { alerts } = useContext(AlertsContext);

  return (
    <div className="p-4 rounded-lg shadow bg-white dark:bg-gray-800 h-full flex flex-col min-h-0">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FileText className="mr-2 h-5 w-5" /> Alertas
      </h2>

      <ul className="flex-1 overflow-y-auto space-y-4 max-h-[550px]">
        {alerts.length === 0 ? (
          <li className="text-center text-gray-500 dark:text-gray-400">
            No hay alertas
          </li>
        ) : (
          alerts.map((a, i) => (
            <li
              key={i}
              className="border-2 border-orange-500 bg-orange-100 dark:bg-orange-900 rounded-lg p-3 shadow-sm"
            >
              <strong className="text-orange-700">⚠️</strong> {a.timestamp}
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {a.description}
              </p>
              <button
                onClick={() => openFrameInNewTab(a.frame)}
                className="text-blue-600 underline cursor-pointer mt-2"
              >
                Clic para ver imagen
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
