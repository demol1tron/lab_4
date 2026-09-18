import React, { useState, useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { api } from '../api/client';
import { X, AlertTriangle, MapPin } from 'lucide-react';

// @ts-ignore
if (maplibregl.config) {
  // @ts-ignore
  maplibregl.config.WORKER_URL = 'https://unpkg.com/maplibre-gl@5.1.0/dist/maplibre-gl-csp-worker.js';
}

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const CreateIncidentModal: React.FC<CreateModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [incidentType, setIncidentType] = useState('signal_failure');
  const [severity, setSeverity] = useState('critical');
  const [latitude, setLatitude] = useState(55.0354);
  const [longitude, setLongitude] = useState(82.8992);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const miniMapContainer = useRef<HTMLDivElement>(null);
  const miniMapInstance = useRef<maplibregl.Map | null>(null);

  // Инициализация карты внутри модалки при открытии
  useEffect(() => {
    if (!isOpen) return;

    let map: maplibregl.Map | null = null;

    const timer = setTimeout(() => {
      if (!miniMapContainer.current) return;

      map = new maplibregl.Map({
        container: miniMapContainer.current,
        style: 'https://tiles.openfreemap.org/styles/bright',
        center: [longitude, latitude],
        zoom: 11,
      });

      const marker = new maplibregl.Marker({ color: '#F59E0B', draggable: true })
        .setLngLat([longitude, latitude])
        .addTo(map);

      map.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        setLatitude(parseFloat(lat.toFixed(6)));
        setLongitude(parseFloat(lng.toFixed(6)));
        marker.setLngLat([lng, lat]);
      });

      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        setLatitude(parseFloat(lngLat.lat.toFixed(6)));
        setLongitude(parseFloat(lngLat.lng.toFixed(6)));
      });

      miniMapInstance.current = map;
    }, 50);

    return () => {
      clearTimeout(timer);
      if (map) map.remove();
      miniMapInstance.current = null;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/incidents', {
        title,
        incident_type: incidentType,
        severity,
        latitude: Number(latitude),
        longitude: Number(longitude),
        description,
        railway_object_id: 1,
      });
      onCreated();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#141820] border border-[#232A38] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-[#232A38] pb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="text-amber-500" size={20} /> Зафиксировать Ж/Д происшествие
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Краткое наименование</label>
            <input
              type="text"
              required
              placeholder="Сход порожней платформы / Отказ стрелочного перевода"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0B0D11] border border-[#232A38] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Тип инцидента</label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full bg-[#0B0D11] border border-[#232A38] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
              >
                <option value="signal_failure">Сбой сигнализации/СЦБ</option>
                <option value="derailment">Сход подвижного состава</option>
                <option value="obstacle_on_tracks">Препятствие на путях</option>
                <option value="trespasser">Посторонние лица в опасной зоне</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Тяжесть</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full bg-[#0B0D11] border border-[#232A38] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
              >
                <option value="minor">Незначительный</option>
                <option value="moderate">Умеренный</option>
                <option value="critical">Критический</option>
                <option value="disaster">Катастрофа</option>
              </select>
            </div>
          </div>

          {/* Интерактивная миникарта для выбора координат */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MapPin size={14} className="text-amber-500" /> Место события (кликните по карте для установки метки)
              </label>
              <span className="text-[11px] font-mono text-amber-400">
                {latitude.toFixed(5)}, {longitude.toFixed(5)}
              </span>
            </div>

            <div className="w-full h-56 rounded-lg overflow-hidden border border-[#232A38] relative">
              <div ref={miniMapContainer} className="w-full h-full" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Подробное описание обстановки</label>
            <textarea
              required
              rows={2}
              placeholder="Километр, пикет, характер повреждения или сбоя..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#0B0D11] border border-[#232A38] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-[#232A38]">
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
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
            >
              {loading ? 'Фиксация...' : 'Зафиксировать инцидент'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
