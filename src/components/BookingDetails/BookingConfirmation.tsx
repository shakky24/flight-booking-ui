import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Booking, BookingStatus, Flight, Airport } from '../../types';
import { api } from '../../services/api';
import './BookingConfirmation.css';

interface BookingConfirmationProps {}

interface LocationState {
  booking: any; // Using any to accommodate both snake_case and camelCase properties
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking } = (location.state as LocationState) || { booking: null };
  
  const [outboundFlight, setOutboundFlight] = useState<Flight | null>(null);
  const [returnFlight, setReturnFlight] = useState<Flight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingData, setBooking] = useState<any>(null);
  
  // Convert snake_case to camelCase to handle API response
  const formatBookingData = (data: any): Booking => {
    // Map snake_case to camelCase
    return {
      id: data.id || '',
      userId: data.user_id || data.userId || '',
      outboundFlight: data.outboundFlight || null, // Will be populated separately
      returnFlight: data.returnFlight || null, // Will be populated separately
      passengers: data.passengers || [],
      contactEmail: data.contact_email || data.contactEmail || '',
      contactPhone: data.contact_phone || data.contactPhone || '',
      status: data.status || BookingStatus.PENDING,
      bookingDate: data.booking_date || data.bookingDate || new Date().toISOString(),
      totalPrice: data.total_price || data.totalPrice || 0,
      // Handle potential flight object structures
      flights: data.flights || null
    };
  };
  
  useEffect(() => {
    const fetchBookingDetails = async () => {
      console.log("BookingConfirmation rendered with location state:", location.state);
      
      setIsLoading(true);
      setError(null);
      
      try {
        // First, check if we have a booking object from location state
        if (location.state?.booking) {
          console.log("Using booking from location state:", location.state.booking);
          setBooking(location.state.booking);
          await processBookingData(location.state.booking);
          setIsLoading(false);
          return;
        }
        
        // If no booking in location state, check URL for booking ID
        const pathParts = window.location.pathname.split('/');
        const bookingId = pathParts[pathParts.length - 1];
        
        console.log("Checking URL for booking ID:", bookingId);
        
        if (bookingId && bookingId !== 'confirmation') {
          try {
            console.log("Fetching booking by ID:", bookingId);
            const fetchedBooking = await api.getBookingDetails(bookingId);
            console.log("Fetched booking:", fetchedBooking);
            
            // Set the booking data
            setBooking(fetchedBooking);
            await processBookingData(fetchedBooking);
            setIsLoading(false);
            return;
          } catch (err) {
            console.error("Error fetching booking by ID:", err);
            setError("Could not find the booking. Please check your booking reference.");
            setIsLoading(false);
          }
        } else {
          console.log("No booking ID found in URL path.");
          setError("No booking information provided.");
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error in BookingConfirmation:", err);
        setError("Failed to load booking details. Please try again later.");
        setIsLoading(false);
      }
    };
    
    fetchBookingDetails();
  }, [location.state, navigate]);

  // Helper function to handle snake_case to camelCase conversion
  const normalizeFlightData = (flight: any): Flight => {
    if (!flight) return {} as Flight;
    
    // Create a normalized flight object
    const normalized: any = {
      ...flight,
      // Ensure we have camelCase properties even if API returns snake_case
      flightNumber: flight.flightNumber || flight.flight_number || '',
      departureTime: flight.departureTime || flight.departure_time || '',
      arrivalTime: flight.arrivalTime || flight.arrival_time || '',
      origin: flight.origin || flight.origin_airport || {},
      destination: flight.destination || flight.destination_airport || {},
    };
    
    // Ensure airport data has proper structure
    if (normalized.origin && normalized.origin.code && !normalized.origin.airportCode) {
      normalized.origin.airportCode = normalized.origin.code;
    }
    
    if (normalized.destination && normalized.destination.code && !normalized.destination.airportCode) {
      normalized.destination.airportCode = normalized.destination.code;
    }
    
    return normalized as Flight;
  };

  // Helper to process the booking data and extract flight details
  const processBookingData = async (bookingData: any) => {
    console.log("Processing booking data:", bookingData);
    
    try {
      // For debugging - check what fields are available
      console.log("Available fields:", Object.keys(bookingData));
      console.log("Has outbound_flight?", !!bookingData.outbound_flight);
      console.log("Has outbound_flight_id?", !!bookingData.outbound_flight_id);
      
      // Handle outbound flight - check for both full object and ID
      if (bookingData.outbound_flight && typeof bookingData.outbound_flight === 'object') {
        const outbound = normalizeFlightData(bookingData.outbound_flight);
        console.log("Using provided outbound_flight object:", outbound);
        setOutboundFlight(outbound);
      } else if (bookingData.outbound_flight_id) {
        // We only have the ID, fetch the flight details
        console.log("Only have ID, fetching outbound flight:", bookingData.outbound_flight_id);
        try {
          const flightDetails = await api.getFlightDetails(bookingData.outbound_flight_id);
          console.log("Fetched outbound flight details:", flightDetails);
          if (flightDetails) {
            const outbound = normalizeFlightData(flightDetails);
            setOutboundFlight(outbound);
          } else {
            console.error("Failed to fetch outbound flight with ID:", bookingData.outbound_flight_id);
            setError("Could not load outbound flight details");
          }
        } catch (err) {
          console.error("Error fetching outbound flight details:", err);
          setError("Could not load outbound flight details");
        }
      } else {
        console.error("No outbound flight data or ID found");
        setError("Could not load outbound flight details");
      }
      
      // Handle return flight (if present for round-trip)
      if (bookingData.return_flight && typeof bookingData.return_flight === 'object') {
        const returnFlight = normalizeFlightData(bookingData.return_flight);
        console.log("Using provided return_flight object:", returnFlight);
        setReturnFlight(returnFlight);
      } else if (bookingData.return_flight_id) {
        // We only have the ID, fetch the flight details
        console.log("Only have ID, fetching return flight:", bookingData.return_flight_id);
        try {
          const flightDetails = await api.getFlightDetails(bookingData.return_flight_id);
          console.log("Fetched return flight details:", flightDetails);
          if (flightDetails) {
            const returnFlight = normalizeFlightData(flightDetails);
            setReturnFlight(returnFlight);
          } else {
            console.warn("Failed to fetch return flight with ID:", bookingData.return_flight_id);
          }
        } catch (err) {
          console.error("Error fetching return flight details:", err);
        }
      } else {
        // This is normal for one-way trips, not an error
        console.log("No return flight data (likely one-way trip)");
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error("Error processing booking data:", err);
      setError("Error processing booking data");
      setIsLoading(false);
    }
  };

  // Format date (e.g., "Mon, 23 Mar")
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Unknown";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid date";
    }
  };
  
  // Format time (e.g., "14:25")
  const formatTime = (dateStr: string) => {
    if (!dateStr) return "Unknown";
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (e) {
      console.error("Error formatting time:", e);
      return "Invalid time";
    }
  };

  // Format birth date from separate fields
  const formatBirthDate = (passenger: any) => {
    if (passenger.birthDay && passenger.birthMonth && passenger.birthYear) {
      // Create a date string in YYYY-MM-DD format
      const birthDay = String(passenger.birthDay).padStart(2, '0');
      const birthMonth = String(passenger.birthMonth).padStart(2, '0');
      const dateStr = `${passenger.birthYear}-${birthMonth}-${birthDay}`;
      return formatDate(dateStr);
    }
    // For snake_case properties
    if (passenger.birth_day && passenger.birth_month && passenger.birth_year) {
      const birthDay = String(passenger.birth_day).padStart(2, '0');
      const birthMonth = String(passenger.birth_month).padStart(2, '0');
      const dateStr = `${passenger.birth_year}-${birthMonth}-${birthDay}`;
      return formatDate(dateStr);
    }
    // Backward compatibility for older bookings that might have dateOfBirth
    if (passenger.dateOfBirth) {
      return formatDate(passenger.dateOfBirth);
    }
    if (passenger.date_of_birth) {
      return formatDate(passenger.date_of_birth);
    }
    return 'Not specified';
  };

  // Get status badge class based on booking status
  const getStatusBadgeClass = (status: string) => {
    const normalizedStatus = status.toUpperCase();
    switch (normalizedStatus) {
      case BookingStatus.CONFIRMED:
      case 'CONFIRMED':
        return 'status-confirmed';
      case BookingStatus.PENDING:
      case 'PENDING':
        return 'status-pending';
      case BookingStatus.CANCELLED:
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  // Format currency in INR
  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numAmount)) return '₹0.00';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(numAmount);
  };

  // Only redirect if we've confirmed no booking exists and we're not in loading state
  if (!bookingData && !isLoading && error) {
    console.log("No booking found and not loading - redirecting to home");
    navigate('/');
    return null;
  }

  if (isLoading) {
    return <div className="loading">Loading booking details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!outboundFlight) {
    return <div className="error-message">Error: Could not load flight details</div>;
  }

  // Helper to safely access properties that might be in snake_case or camelCase
  const getBookingProperty = (property: string, fallback: any = '') => {
    const snakeCase = property.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    return bookingData[property] || bookingData[snakeCase] || fallback;
  };

  // Get passengers array, handling different property names
  const passengers = bookingData.passengers || [];

  return (
    <div className="booking-confirmation">
      <div className="confirmation-header">
        <div className={`status-icon ${getStatusBadgeClass(getBookingProperty('status', 'PENDING'))}`}>
          {getBookingProperty('status', 'PENDING').toUpperCase() === BookingStatus.CONFIRMED ? '✓' : '!'}
        </div>
        <h2>
          {getBookingProperty('status', 'PENDING').toUpperCase() === BookingStatus.CONFIRMED 
            ? 'Booking Confirmed!' 
            : getBookingProperty('status', 'PENDING').toUpperCase() === BookingStatus.CANCELLED 
              ? 'Booking Cancelled' 
              : 'Booking Pending'}
        </h2>
        <p>
          {getBookingProperty('status', 'PENDING').toUpperCase() === BookingStatus.CONFIRMED 
            ? 'Your booking has been confirmed and is ready for travel.' 
            : getBookingProperty('status', 'PENDING').toUpperCase() === BookingStatus.CANCELLED 
              ? 'This booking has been cancelled.' 
              : 'Your booking has been created and is awaiting confirmation.'}
        </p>
        <div className={`status-badge ${getStatusBadgeClass(getBookingProperty('status', 'PENDING'))}`}>
          {getBookingProperty('status', 'PENDING')}
        </div>
      </div>

      <div className="booking-details-card">
        <div className="booking-reference">
          <h3>Booking Reference</h3>
          <div className="reference-number">{getBookingProperty('id')}</div>
          <div className="booking-date">Booked on: {formatDate(getBookingProperty('bookingDate', getBookingProperty('booking_date')))}</div>
        </div>

        <div className="flight-details">
          <h3>Flight Details</h3>
          
          <div className="flight-card">
            <div className="flight-header">
              <span className="flight-label">Outbound</span>
              <span className="flight-number">{outboundFlight.flightNumber}</span>
            </div>
            
            <div className="flight-route">
              <div className="origin">
                <div className="code">{outboundFlight.origin?.code || "DEP"}</div>
                <div className="location">{outboundFlight.origin?.city || ""} {outboundFlight.origin?.name ? `(${outboundFlight.origin.name})` : ""}</div>
                <div className="time">{formatTime(outboundFlight.departureTime)}</div>
                <div className="date">{formatDate(outboundFlight.departureTime)}</div>
              </div>
              
              <div className="flight-arrow">→</div>
              
              <div className="destination">
                <div className="code">{outboundFlight.destination?.code || "ARR"}</div>
                <div className="location">{outboundFlight.destination?.city || ""} {outboundFlight.destination?.name ? `(${outboundFlight.destination.name})` : ""}</div>
                <div className="time">{formatTime(outboundFlight.arrivalTime)}</div>
                <div className="date">{formatDate(outboundFlight.arrivalTime)}</div>
              </div>
            </div>
            
            <div className="flight-details-row">
              <div className="flight-seats">{outboundFlight.availableSeats || ""} seats</div>
              <div className="flight-aircraft">{outboundFlight.aircraft || ""}</div>
              <div className="flight-cabin">{outboundFlight.cabinClass || ""}</div>
            </div>
          </div>
          
          {returnFlight && (
            <div className="flight-card">
              <div className="flight-header">
                <span className="flight-label">Return</span>
                <span className="flight-number">{returnFlight.flightNumber}</span>
              </div>
              
              <div className="flight-route">
                <div className="origin">
                  <div className="code">{returnFlight.origin?.code || "DEP"}</div>
                  <div className="location">{returnFlight.origin?.city || ""} {returnFlight.origin?.name ? `(${returnFlight.origin.name})` : ""}</div>
                  <div className="time">{formatTime(returnFlight.departureTime)}</div>
                  <div className="date">{formatDate(returnFlight.departureTime)}</div>
                </div>
                
                <div className="flight-arrow">→</div>
                
                <div className="destination">
                  <div className="code">{returnFlight.destination?.code || "ARR"}</div>
                  <div className="location">{returnFlight.destination?.city || ""} {returnFlight.destination?.name ? `(${returnFlight.destination.name})` : ""}</div>
                  <div className="time">{formatTime(returnFlight.arrivalTime)}</div>
                  <div className="date">{formatDate(returnFlight.arrivalTime)}</div>
                </div>
              </div>
              
              <div className="flight-details-row">
                <div className="flight-seats">{returnFlight.availableSeats || ""} seats</div>
                <div className="flight-aircraft">{returnFlight.aircraft || ""}</div>
                <div className="flight-cabin">{returnFlight.cabinClass || ""}</div>
              </div>
            </div>
          )}
        </div>

        <div className="passenger-details">
          <h3>Passenger Information</h3>
          <ul className="passenger-list">
            {passengers.map((passenger: any, index: number) => (
              <li key={index} className="passenger-item">
                <div className="passenger-name">
                  {passenger.firstName || passenger.first_name} {passenger.lastName || passenger.last_name}
                </div>
                <div className="passenger-dob">
                  DOB: {formatBirthDate(passenger)}
                </div>
                {(passenger.passportNumber || passenger.passport_number) && (
                  <div className="passenger-passport">
                    Passport: {passenger.passportNumber || passenger.passport_number} ({passenger.passportCountry || passenger.passport_country})
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="contact-details">
          <h3>Contact Information</h3>
          <div className="contact-info">
            <div className="contact-email">
              <strong>Email:</strong> {getBookingProperty('contactEmail', getBookingProperty('contact_email'))}
            </div>
            {(bookingData.contactPhone || bookingData.contact_phone) && (
              <div className="contact-phone">
                <strong>Phone:</strong> {getBookingProperty('contactPhone', getBookingProperty('contact_phone'))}
              </div>
            )}
          </div>
        </div>

        <div className="payment-details">
          <h3>Payment Summary</h3>
          <div className="payment-info">
            <div className="payment-total">
              <strong>Total Paid:</strong> {formatCurrency(getBookingProperty('totalPrice', getBookingProperty('total_price', 0)))}
            </div>
          </div>
        </div>
      </div>

      <div className="confirmation-actions">
        <button 
          className="view-bookings-button"
          onClick={() => navigate('/profile')}
        >
          View All Bookings
        </button>
        <button 
          className="home-button"
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
