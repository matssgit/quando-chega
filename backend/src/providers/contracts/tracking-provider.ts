export interface TrackingEventData {
  status: string;
  description: string;
  location: string | null;
  occurred_at: Date;
}

export interface TrackingProvider {
  track(trackingCode: string): Promise<TrackingEventData[]>;
}
