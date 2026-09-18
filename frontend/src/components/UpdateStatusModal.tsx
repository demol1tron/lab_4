import React, { useState } from 'react';
import { api } from '../api/client';
import { X, CheckCircle2 } from 'lucide-react';
import type { Incident } from '../types/incident';

interface UpdateModalProps {
  incident: Incident | null;
  onClose: () => void;
  onUpdated: () => void;
}

export const UpdateStatusModal: React.FC<UpdateModalProps> = ({ incident, onClose, onUpdated }) => {
  const [newStatus, setNewStatus] = useState('investigating');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!incident) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch(`/incidents/${incident.id}/status`, {
        new_status: newStatus,
        comment: comment || 'Обновление оперативной обстановки диспетчером',
      });
      onUpdated();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка обновления статуса');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#141820] border border-[#232A38] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-[#232A38] pb-3">
          <h2 className="text-md font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="text-amber-500" size={18} /> Продвижение статуса: {incident.incident_number}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Новый оперативный статус</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full bg-[#0B0D11] border border-[#232A38] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
            >
              <option value="investigating">Расследуется (комиссия на месте)</option>
              <option value="recovery_in_progress">Восстановительные работы (ВП/ПЧ)</option>
              <option value="resolved">Устранен (движение открыто)</option>
              <option value="closed">Закрыт (акт составлен)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Доклад / Причина смены</label>
            <textarea
              required
              rows={3}
              placeholder="Укажите принятые меры реагирования..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-[#0B0D11] border border-[#232A38] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition"
            >
              {loading ? 'Сохранение...' : 'Зафиксировать изменение'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
