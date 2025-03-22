// Flight API Types
export enum CabinClass {
  ECONOMY = 'Economy',
  PREMIUM_ECONOMY = 'Premium Economy',
  BUSINESS = 'Business',
  FIRST = 'First'
}

export enum TripType {
  ONE_WAY = 'ONE_WAY',
  ROUND_TRIP = 'ROUND_TRIP'
}

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface Flight {
  id: string;
  flightNumber: string;
  origin: Airport;
  destination: Airport;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  cabinClass: CabinClass;
  cabinClassId: string;
  price: number;
  availableSeats: number;
  aircraft: string;
}

export interface SearchFlightRequest {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  cabinClass: CabinClass;
  passengers: number;
  tripType: TripType;
}

export interface SearchFlightResponse {
  outbound: Flight[];
  return: Flight[] | null;
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export interface Passenger {
  firstName: string;
  lastName: string;
  gender: string; // MALE, FEMALE, OTHER
  birthDay: string; // DD format
  birthMonth: string; // MM format
  birthYear: string; // YYYY format
  passportNumber: string;
  passportCountry: string;
  passportExpiryDay: string; // DD format
  passportExpiryMonth: string; // MM format
  passportExpiryYear: string; // YYYY format
}

export interface BookingRequest {
  outboundFlightId: string;
  returnFlightId?: string;
  passengers: Passenger[];
  contactEmail: string;
  contactPhone: string;
  userId?: string;
  flights: {
    outbound: Flight;
    return?: Flight;
    cabinClass: CabinClass;
    cabinClassId: string;
  };
  totalPrice: number;
  bookingDate: string;
}

export interface Booking {
  id: string;
  userId: string;
  outboundFlight: Flight;
  returnFlight?: Flight;
  passengers: Passenger[];
  contactEmail: string;
  contactPhone?: string;
  status: BookingStatus;
  bookingDate: string;
  totalPrice: number;
  flights?: {
    outbound: Flight;
    return?: Flight;
    cabinClass: CabinClass;
    cabinClassId: string;
  };
}
