import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flight } from '../../types';
import './SearchResults.css';

interface SearchResultsProps {
  outboundFlights: Flight[] | any;
  returnFlights: Flight[] | null | any;
  isRoundTrip: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  outboundFlights, 
  returnFlights, 
  isRoundTrip 
}) => {
  const [selectedOutbound, setSelectedOutbound] = useState<Flight | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<Flight | null>(null);
  const navigate = useNavigate();

  // Format time (e.g., "14:25")
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Format date (e.g., "Mon, 23 Mar")
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  // Format duration (e.g., "2h 15m")
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Format price (e.g., "$240.50")
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  // Handle flight selection
  const handleFlightSelect = (flight: Flight, isReturn: boolean) => {
    if (isReturn) {
      setSelectedReturn(flight);
    } else {
      setSelectedOutbound(flight);
    }
  };

  // Check if booking is ready to proceed
  const isBookingReady = () => {
    if (isRoundTrip) {
      return selectedOutbound && selectedReturn;
    }
    return selectedOutbound !== null;
  };

  // Handle book now button click
  const handleBookNow = () => {
    navigate('/booking-details', {
      state: {
        outboundFlight: selectedOutbound,
        returnFlight: selectedReturn,
        isRoundTrip: isRoundTrip
      }
    });
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    let total = 0;
    if (selectedOutbound) total += selectedOutbound.price;
    if (selectedReturn) total += selectedReturn.price;
    return formatPrice(total);
  };

  // Render flight card
  const renderFlightCard = (flight: Flight, isReturn: boolean) => {
    const isSelected = isReturn 
      ? selectedReturn?.id === flight.id 
      : selectedOutbound?.id === flight.id;
    
    return (
      <div 
        key={flight.id} 
        className={`flight-card ${isSelected ? 'selected' : ''}`}
        onClick={() => handleFlightSelect(flight, isReturn)}
      >
        <div className="flight-header">
          <div className="flight-number">{flight.flightNumber}</div>
          <div className="cabin-class">{flight.cabinClass}</div>
        </div>
        
        <div className="flight-route">
          <div className="origin">
            <div className="time">{formatTime(flight.departureTime)}</div>
            <div className="date">{formatDate(flight.departureTime)}</div>
            <div className="airport">{flight.origin.code}</div>
          </div>
          
          <div className="flight-duration">
            <div className="duration-line"></div>
            <div className="duration-time">{formatDuration(flight.duration)}</div>
          </div>
          
          <div className="destination">
            <div className="time">{formatTime(flight.arrivalTime)}</div>
            <div className="date">{formatDate(flight.arrivalTime)}</div>
            <div className="airport">{flight.destination.code}</div>
          </div>
        </div>
        
        <div className="flight-details">
          <div className="seats">{flight.availableSeats} seats</div>
          <div className="aircraft">{flight.aircraft}</div>
          <div className="price">{formatPrice(flight.price)}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="search-results">
      {outboundFlights.length === 0 && (
        <div className="no-flights">No flights found for your search criteria.</div>
      )}
      
      {outboundFlights.length > 0 && (
        <>
          <h3>Outbound Flights</h3>
          <div className="flight-list">
            {outboundFlights.map((flight:any) => renderFlightCard(flight, false))}
          </div>
        </>
      )}
      
      {isRoundTrip && returnFlights && returnFlights.length > 0 && (
        <>
          <h3>Return Flights</h3>
          <div className="flight-list">
            {returnFlights.map((flight:any) => renderFlightCard(flight, true))}
          </div>
        </>
      )}
      
      {(selectedOutbound || selectedReturn) && (
        <div className="booking-summary">
          <h3>Booking Summary</h3>
          
          {selectedOutbound && (
            <div className="summary-flight">
              <div>Outbound: {selectedOutbound.origin.code} → {selectedOutbound.destination.code}</div>
              <div>{formatPrice(selectedOutbound.price)}</div>
            </div>
          )}
          
          {selectedReturn && (
            <div className="summary-flight">
              <div>Return: {selectedReturn.origin.code} → {selectedReturn.destination.code}</div>
              <div>{formatPrice(selectedReturn.price)}</div>
            </div>
          )}
          
          <div className="summary-total">
            <div>Total:</div>
            <div>{calculateTotalPrice()}</div>
          </div>
          
          <button 
            className="book-now-button" 
            disabled={!isBookingReady()}
            onClick={handleBookNow}
          >
            Book Now
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
