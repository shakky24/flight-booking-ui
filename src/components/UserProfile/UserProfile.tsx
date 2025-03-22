import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Booking, BookingStatus } from '../../types';
import { useNavigate } from 'react-router-dom';
import './UserProfile.css';

interface Props {}

const UserProfile: React.FC<Props> = () => {
  const { user, signOut } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const userBookings = await api.getUserBookings();
        setBookings(userBookings);
      } catch (err) {
        setError('Failed to load your bookings. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get status class for styling
  const getStatusClass = (status: BookingStatus | string) => {
    const normalizedStatus = typeof status === 'string' ? status.toUpperCase() : status;
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

  // Helper to safely get flight data from various booking structures
  const getFlightDetails = (booking: any) => {
    // Debug to see what data structure we have
    console.log("Processing booking data:", booking);
    
    // Create a default empty flight object
    let flightData: any = {
      flightNumber: '',
      origin: { code: '' },
      destination: { code: '' },
      departureTime: ''
    };
    
    // Check each possible location for flight data
    if (booking.outboundFlight && booking.outboundFlight.flightNumber) {
      console.log("Found outboundFlight object");
      flightData = booking.outboundFlight;
    } else if (booking.flights?.outbound && booking.flights.outbound.flightNumber) {
      console.log("Found flights.outbound object");
      flightData = booking.flights.outbound;
    } else if (booking.outbound_flight_details) {
      console.log("Found outbound_flight_details");
      flightData = booking.outbound_flight_details;
    } else {
      console.log("Creating flight details from booking info");
      // Create flight details from other booking properties
      flightData = {
        flightNumber: booking.flight_number || 
                     `FL${booking.outbound_flight_id?.substring(0, 4) || booking.id?.substring(0, 4) || "0000"}`,
        origin: {
          code: booking.origin_code || booking.origin || "DEP"
        },
        destination: {
          code: booking.destination_code || booking.destination || "ARR"
        },
        departureTime: booking.departure_time || booking.departure_date || booking.booking_date || booking.bookingDate || new Date().toISOString()
      };
    }
    
    console.log("Using flight details:", flightData);
    
    // Safely extract values with fallbacks to ensure we always have valid data
    return {
      flightNumber: flightData.flightNumber || flightData.flight_number || `FL${booking.id?.substring(0, 4) || "0000"}`,
      origin: {
        code: flightData.origin?.code || 
              (typeof flightData.origin === 'string' ? flightData.origin : '') || 
              flightData.origin_code || 
              booking.origin_code ||
              booking.origin ||
              'DEP'
      },
      destination: {
        code: flightData.destination?.code || 
              (typeof flightData.destination === 'string' ? flightData.destination : '') || 
              flightData.destination_code || 
              booking.destination_code ||
              booking.destination ||
              'ARR'
      },
      departureTime: flightData.departureTime || 
                    flightData.departure_time || 
                    booking.departure_time || 
                    booking.bookingDate || 
                    booking.booking_date || 
                    new Date().toISOString()
    };
  };

  // Helper to safely get booking status
  const getBookingStatus = (booking: any) => {
    return booking.status || booking.booking_status || BookingStatus.PENDING;
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Your Profile</h2>
        <button className="logout-button" onClick={signOut}>
          Log Out
        </button>
      </div>

      <div className="user-info">
        <h3>Account Information</h3>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Account ID:</strong> {user?.id.substring(0, 8)}...</p>
      </div>

      <div className="bookings-section">
        <h3>Your Bookings</h3>

        {loading && <p className="loading">Loading your bookings...</p>}
        
        {error && <p className="error-message">{error}</p>}

        {!loading && bookings.length === 0 && (
          <div className="no-bookings">
            <p>You haven't made any bookings yet.</p>
            <p>Search for flights to start your journey!</p>
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div className="bookings-list">
            {bookings.map((booking: any) => {
              const flightDetails = getFlightDetails(booking);
              const bookingStatus = getBookingStatus(booking);
              
              return (
                <div key={booking.id} className="booking-card">
                  <div className="booking-header">
                    <span className="flight-number">{flightDetails.flightNumber}</span>
                    <span className={`booking-status ${getStatusClass(bookingStatus)}`}>
                      {bookingStatus}
                    </span>
                  </div>
                  
                  <div className="booking-route">
                    <div className="booking-origin">{flightDetails.origin.code}</div>
                    <div className="route-arrow">→</div>
                    <div className="booking-destination">{flightDetails.destination.code}</div>
                  </div>
                  
                  <div className="booking-details">
                    <span className="booking-date">
                      {formatDate(flightDetails.departureTime)}
                    </span>
                  </div>
                  
                  <button 
                    className="booking-details-button"
                    onClick={() => {
                      // Navigate to booking confirmation page with the booking details
                      navigate('/booking/confirmation', { 
                        state: { booking: booking }
                      });
                    }}
                  >
                    View Details
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
