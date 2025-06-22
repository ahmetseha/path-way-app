export interface Trip {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  tripId: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  visitDate?: string;
  notes?: string;
  createdAt: string;
}

export interface Route {
  id: string;
  tripId: string;
  name: string;
  description?: string;
  locations: Location[];
  createdAt: string;
}

export interface OfflineMap {
  id: string;
  name: string;
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  downloadedAt: string;
  fileSize: number;
}
