export interface MapIncidentItem {
  id: number;
  incident_number: string;
  title: string;
  severity: 'minor' | 'moderate' | 'critical' | 'disaster';
  status: string;
  coords: [number, number];
  description: string;
}

export interface Incident extends MapIncidentItem {
  railway_object_id: number;
  reported_by_id: number;
  occurred_at: string;
  created_at: string;
}
