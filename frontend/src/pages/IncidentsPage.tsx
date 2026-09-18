import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Incident } from '../types/incident';
import { CreateIncidentModal } from '../components/CreateIncidentModal';
import { UpdateStatusModal } from '../components/UpdateStatusModal';
import { ShieldAlert, Plus, RefreshCw, Trash2 } from 'lucide-react';

export const IncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState<Incident | null>(null);

  const loadData = async () => {
    try {
      const res = await api.get<Incident[]>('/incidents');
      setIncidents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Подтверждаете удаление происшествия?')) return;
    try {
      await api.delete(`/incidents/${id}`);
      setIncidents((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка при удалении инцидента (требуются права администратора)');
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <ShieldAlert className="text-amber-500" /> Журнал инцидентов Ж/Д безопасности
          </h1>
          <p className="text-slate-400 text-xs mt-1">Реестр нештатных ситуаций, отказов технических средств и сбоев</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wide transition shadow-lg shadow-amber-500/15">
          <Plus size={16} /> Зафиксировать происшествие
        </button>
      </div>

      <div className="bg-[#141820] border border-[#232A38] rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#232A38] text-xs text-slate-400 uppercase bg-[#0B0D11]/60">
              <th className="py-3 px-4">Номер / Время</th>
              <th className="py-3 px-4">Событие</th>
              <th className="py-3 px-4">Тяжесть</th>
              <th className="py-3 px-4">Статус</th>
              <th className="py-3 px-4 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y border-[#232A38]">
            {incidents.map((row) => (
              <tr key={row.id} className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-mono text-amber-400 font-semibold">{row.incident_number}</td>
                <td className="py-3 px-4 font-medium text-white">{row.title}</td>
                <td className="py-3 px-4 text-amber-400">{row.severity}</td>
                <td className="py-3 px-4">
                  <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300 border border-slate-700">
                    {row.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right space-x-2">
                  <button
                    onClick={() => setSelectedForEdit(row)}
                    className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition"
                    title="Сменить статус"
                  >
                    <RefreshCw size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(row.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    title="Удалить"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CreateIncidentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={loadData}
      />

      <UpdateStatusModal
        incident={selectedForEdit}
        onClose={() => setSelectedForEdit(null)}
        onUpdated={loadData}
      />
    </div>
  );
};
