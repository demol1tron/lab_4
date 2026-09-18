import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { MapIncidentItem } from '../types/incident';

// Направляем воркер на официальный CDN, минуя поиск локального .mjs-файла в Nginx
// @ts-ignore
if (maplibregl.config) {
  // @ts-ignore
  maplibregl.config.WORKER_URL = 'https://unpkg.com/maplibre-gl@5.1.0/dist/maplibre-gl-csp-worker.js';
}

interface OpenFreeMapProps {
  incidents: MapIncidentItem[];
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  onSelectIncident?: (incident: MapIncidentItem) => void;
}

export const OpenFreeMap: React.FC<OpenFreeMapProps> = ({
  incidents,
  center = [82.8992, 55.0354], // [lng, lat]
  zoom = 11,
  onSelectIncident,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/bright',
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

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    incidents.forEach((item) => {
      let markerColor = '#F59E0B';
      if (item.severity === 'critical' || item.severity === 'disaster') markerColor = '#DC2626';
      if (item.severity === 'minor') markerColor = '#10B981';

      const popupHtml = `
        <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; padding: 2px;">
          <div style="font-weight: 800; font-family: monospace; color: ${markerColor};">${item.incident_number}</div>
          <div style="font-weight: 700; margin: 2px 0; color: #1e293b;">${item.title}</div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">Статус: <b>${item.status}</b></div>
          <div style="font-size: 11px; color: #334155; line-height: 1.3;">${item.description}</div>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(popupHtml);
      const lngLat: [number, number] = [item.coords[1], item.coords[0]];

      const marker = new maplibregl.Marker({ color: markerColor })
        .setLngLat(lngLat)
        .setPopup(popup)
        .addTo(map);

      marker.getElement().addEventListener('click', () => {
        if (onSelectIncident) onSelectIncident(item);
      });

      markersRef.current.push(marker);
    });
  }, [incidents]);

  return (
    <div className="w-full h-full min-h-[450px] rounded-xl overflow-hidden border border-[#232A38] shadow-2xl relative">
      <div ref={mapContainer} className="w-full h-full min-h-[450px]" />
    </div>
  );
};
