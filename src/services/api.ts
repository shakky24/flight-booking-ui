import { Airport, SearchFlightRequest, SearchFlightResponse, Booking, BookingRequest } from '../types';

// Use environment variable with fallback to localhost:8000
export const API_URL = 'http://localhost:9000';

// Helper to get JWT token from localStorage
const getAuthToken = (): string | null => {
  const sessionStr = localStorage.getItem('auth_session');
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      return session.accessToken || null;
    } catch (e) {
      console.error('Error parsing auth session:', e);
      return null;
    }
  }
  return null;
};

// Handle API errors
const handleApiError = (error: any) => {
  console.error('API Error:', error);
  if (error.status === 401) {
    // Handle unauthorized access
    // Could redirect to login page here
  }
  throw error;
};

export const api = {
  // Authentication
  async signIn(email: string, password: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.message || 'Login failed' };
      }
      
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'An unexpected error occurred' };
    }
  },
  
  async signUp(email: string, password: string, firstName: string, lastName: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.message || 'Signup failed' };
      }
      
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: 'An unexpected error occurred' };
    }
  },
  
  // Get all airport locations
  async getLocations(): Promise<Airport[]> {
    try {
      const response = await fetch(`${API_URL}/flights/locations/all`);
      if (!response.ok) {
        throw new Error(`Error fetching locations: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch locations:', error);
      return [];
    }
  },

  // Search for flights
  async searchFlights(searchRequest: SearchFlightRequest): Promise<SearchFlightResponse> {
    try {
      const response = await fetch(`${API_URL}/flights/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchRequest),
      });

      if (!response.ok) {
        throw new Error(`Error searching flights: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to search flights:', error);
      return { outbound: [], return: null };
    }
  },

  // Get user bookings (requires authentication)
  async getUserBookings(): Promise<Booking[]> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_URL}/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw response;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Create a new booking (requires authentication)
  async createBooking(bookingRequest: BookingRequest): Promise<Booking> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingRequest),
      });

      if (!response.ok) {
        throw response;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get booking details (requires authentication)
  async getBookingDetails(bookingId: string): Promise<Booking> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw response;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Cancel a booking (requires authentication)
  async cancelBooking(bookingId: string): Promise<any> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw response;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Get flight details by ID
  async getFlightDetails(flightId: string): Promise<any> {
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      console.log(`Fetching flight details for ID: ${flightId}`);
      
      // Make sure we're requesting from the flights endpoint, not bookings
      const response = await fetch(`${API_URL}/flights/${flightId}`, {
        headers
      });
      
      if (!response.ok) {
        console.error(`Failed to fetch flight with status: ${response.status}`);
        throw response;
      }
      
      const data = await response.json();
      console.log(`Successfully fetched flight details:`, data);
      return data;
    } catch (error) {
      console.error('Error in getFlightDetails:', error);
      // Return null instead of throwing to avoid breaking the UI
      return null;
    }
  },
  
  // Get location details by ID
  async getLocationDetails(locationId: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/flights/locations/${locationId}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching location: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch location details:', error);
      return null;
    }
  }
};
