  import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { OpenFreeMap } from '../components/OpenFreeMap'; // Подключаем новый компонент
import type { MapIncidentItem } from '../types/incident';
import { MapPin, Navigation } from 'lucide-react';

export const MapPage: React.FC = () => {
  const [incidents, setIncidents] = useState<MapIncidentItem[]>([]);
  const [selected, setSelected] = useState<MapIncidentItem | null>(null);

  useEffect(() => {
    api.get<MapIncidentItem[]>('/incidents/map')
      .then((res) => {
        setIncidents(res.data);
        if (res.data.length > 0) setSelected(res.data[0]);
      })
      .catch((err) => console.error('Ошибка загрузки карты', err));
  }, []);

  return (
    <div className="p-6 h-full flex flex-col space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <MapPin className="text-cyan-400" /> Обстановка безопасности
        </h1>
        <p className="text-xs text-slate-400">Мониторинг путей сообщения на свободных картографических тайлах</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-3 h-full">
          <OpenFreeMap incidents={incidents} onSelectIncident={setSelected} />
        </div>

        {/* Боковая карточка инцидента */}
        <div className="bg-darkCard border border-darkBorder rounded-xl p-4 flex flex-col justify-between">
          {selected ? (
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">
                {selected.incident_number}
              </span>
              <h2 className="text-lg font-bold text-white">{selected.title}</h2>
              <div className="text-xs space-y-2 text-slate-300 bg-darkBg p-3 rounded-lg border border-darkBorder">
                <div><strong>Тяжесть:</strong> {selected.severity}</div>
                <div><strong>Статус:</strong> {selected.status}</div>
                <div><strong>Широта (Lat):</strong> {selected.coords[0]}</div>
                <div><strong>Долгота (Lng):</strong> {selected.coords[1]}</div>
              </div>
              <p className="text-xs text-slate-400">{selected.description}</p>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <Navigation size={24} className="mb-2 opacity-40" />
              <span className="text-xs">Нажмите на маркер на карте</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
