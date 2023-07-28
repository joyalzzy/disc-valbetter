export interface Stops {
  id: string;
  lat: number;
  long: number;
  name: string;
  street: string;
}
export interface Service {
  ServiceNo: string;
  Operator: string;
  NextBus: NextBus;
  NextBus2: NextBus;
  NextBus3: NextBus;
}
export interface NextBus {
  OriginCode: string;
  DestinationCode: string;
  EstimatedArrival: string;
  Latitude: string;
  Longitude: string;
  VisitNumber: string;
  Load: string;
  Feature: string;
  Type: string;
}
export interface TrafficIncidentsResponse {
  value: {
    Type: string;
    Latitude: number;
    Longitude: number;
    Message: string;
  }[];
}
