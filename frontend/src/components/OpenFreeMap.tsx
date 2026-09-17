import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { MapIncidentItem } from '../types/incident';

// @ts-ignore
maplibregl.workerClass = maplibreglWorker;

interface OpenFreeMapProps {
  incidents: MapIncidentItem[];
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  onSelectIncident?: (incident: MapIncidentItem) => void;
}

export const OpenFreeMap: React.FC<OpenFreeMapProps> = ({
  incidents,
  center = [82.8992, 55.0354], // Новосибирск: [lng, lat]
  zoom = 11,
  onSelectIncident,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // 1. Инициализация карты
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: center,
      zoom: zoom,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // 2. Обновление маркеров при изменении списка инцидентов
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Удаляем предыдущие маркеры с карты
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    incidents.forEach((item) => {
// Цвета железнодорожных маркеров
        let markerColor = '#F59E0B'; // Янтарный (стандартное предупреждение)
        if (item.severity === 'critical' || item.severity === 'disaster') markerColor = '#DC2626'; // Красный (стоп / ЧП)
        if (item.severity === 'minor') markerColor = '#10B981'; // Зеленый (штатное устранение)

        const popupHtml = `
          <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; padding: 2px;">
            <div style="font-weight: 800; font-family: monospace; color: ${markerColor};">${item.incident_number}</div>
            <div style="font-weight: 700; margin: 2px 0; color: #1e293b;">${item.title}</div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">
              Статус: <b>${item.status}</b>
            </div>
            <div style="font-size: 11px; color: #334155; line-height: 1.3;">${item.description}</div>
          </div>
        `;
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(popupHtml);

      // Важно: в бэкенде coords передаются как [lat, lon]
      // MapLibre строго требует [lon, lat]!
      const lngLat: [number, number] = [item.coords[1], item.coords[0]];

      const marker = new maplibregl.Marker({ color: markerColor })
        .setLngLat(lngLat)
        .setPopup(popup)
        .addTo(map);

      // Обработка клика для боковой панели
      marker.getElement().addEventListener('click', () => {
        if (onSelectIncident) {
          onSelectIncident(item);
        }
      });

      markersRef.current.push(marker);
    });
  }, [incidents]);

  return (
    <div className="w-full h-full min-h-[450px] rounded-xl overflow-hidden border border-darkBorder shadow-2xl relative">
      <div ref={mapContainer} className="w-full h-full min-h-[450px]" />
    </div>
  );
};
