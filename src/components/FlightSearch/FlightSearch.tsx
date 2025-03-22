import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Airport, CabinClass, TripType, SearchFlightRequest, Flight } from '../../types';
import AirportSelect from './AirportSelect';
import SearchResults from './SearchResults';
import './FlightSearch.css';

const FlightSearch: React.FC = () => {
  // Form state
  const [origin, setOrigin] = useState<Airport | null>(null);
  const [destination, setDestination] = useState<Airport | null>(null);
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [cabinClass, setCabinClass] = useState<CabinClass>(CabinClass.ECONOMY);
  const [passengers, setPassengers] = useState('1');
  const [tripType, setTripType] = useState<TripType>(TripType.ONE_WAY);
  
  // Airport options and loading state
  const [airports, setAirports] = useState<Airport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAirports, setIsLoadingAirports] = useState(false);
  
  // Search results
  const [outboundFlights, setOutboundFlights] = useState<Flight[]>([]);
  const [returnFlights, setReturnFlights] = useState<Flight[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch airports on component mount
  useEffect(() => {
    const fetchAirports = async () => {
      setIsLoadingAirports(true);
      try {
        const airportData = await api.getLocations();
        setAirports(airportData);
        console.log(airportData);
      } catch (err) {
        console.error('Failed to fetch airports:', err);
      } finally {
        setIsLoadingAirports(false);
      }
    };

    fetchAirports();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate form
    if (!origin || !destination || !departureDate) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    // Create search request
    const searchRequest: SearchFlightRequest = {
      origin: origin.code,
      destination: destination.code,
      departureDate,
      cabinClass,
      passengers: parseInt(passengers),
      tripType
    };

    // Only include returnDate for round trips
    if (tripType === TripType.ROUND_TRIP && returnDate) {
      searchRequest.returnDate = returnDate;
    }
    
    try {
      const response = await api.searchFlights(searchRequest);
      setOutboundFlights(response.outbound || []);
      setReturnFlights(response.return || null);
      setHasSearched(true);
      console.log('Search response:', response); // Log the response for debugging
    } catch (err) {
      setError('Failed to search flights');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get min date for departure (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get min date for return (departure date or today if not set)
  const getMinReturnDate = () => {
    if (departureDate) {
      return departureDate;
    }
    return getMinDate();
  };

  return (
    <div className="flight-search">
      <div className="hero-section">
        <h1>Discover Your Next Adventure</h1>
        <p>Find and book the perfect flight to your dream destination</p>
      </div>

      <form onSubmit={handleSubmit} className="search-form">
        <div className="trip-type-selector">
          <label>
            <input
              type="radio"
              name="tripType"
              checked={tripType === TripType.ONE_WAY}
              onChange={() => setTripType(TripType.ONE_WAY)}
            />
            One Way
          </label>
          <label>
            <input
              type="radio"
              name="tripType"
              checked={tripType === TripType.ROUND_TRIP}
              onChange={() => setTripType(TripType.ROUND_TRIP)}
            />
            Round Trip
          </label>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="origin">From</label>
            <AirportSelect
              id="origin"
              airports={airports}
              value={origin}
              onChange={setOrigin}
              placeholder="Select origin"
              isLoading={isLoadingAirports}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="destination">To</label>
            <AirportSelect
              id="destination"
              airports={airports}
              value={destination}
              onChange={setDestination}
              placeholder="Select destination"
              isLoading={isLoadingAirports}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="departureDate">Departure Date</label>
            <input
              type="date"
              id="departureDate"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              min={getMinDate()}
              required
            />
          </div>
          
          {tripType === TripType.ROUND_TRIP && (
            <div className="form-group">
              <label htmlFor="returnDate">Return Date</label>
              <input
                type="date"
                id="returnDate"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                min={getMinReturnDate()}
                required={tripType === TripType.ROUND_TRIP}
              />
            </div>
          )}
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cabinClass">Cabin Class</label>
            <select
              id="cabinClass"
              value={cabinClass}
              onChange={(e) => setCabinClass(e.target.value as CabinClass)}
            >
              <option value={CabinClass.ECONOMY}>Economy</option>
              <option value={CabinClass.PREMIUM_ECONOMY}>Premium Economy</option>
              <option value={CabinClass.BUSINESS}>Business</option>
              <option value={CabinClass.FIRST}>First</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="passengers">Passengers</label>
            <select
              id="passengers"
              value={passengers}
              onChange={(e) => setPassengers(e.target.value)}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        </div>
        
        <button type="submit" className="search-button" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search Flights'}
        </button>
      </form>
      
      {error && <div className="error-message">{error}</div>}

      {hasSearched && (
        <SearchResults
          outboundFlights={outboundFlights}
          returnFlights={returnFlights}
          isRoundTrip={tripType === TripType.ROUND_TRIP}
        />
      )}

      <div className="features-section">
        <div className="feature-card">
          <img src="https://img.icons8.com/fluency/96/null/guarantee.png" alt="Best Price Guarantee" />
          <h3>Best Price Guarantee</h3>
          <p>Find the best deals and exclusive offers on flights worldwide</p>
        </div>
        <div className="feature-card">
          <img src="https://img.icons8.com/fluency/96/null/clock.png" alt="24/7 Support" />
          <h3>24/7 Support</h3>
          <p>Our dedicated team is here to help you anytime, anywhere</p>
        </div>
        <div className="feature-card">
          <img src="https://img.icons8.com/fluency/96/null/trust.png" alt="Trusted Service" />
          <h3>Trusted Service</h3>
          <p>Millions of travelers trust us for their flight bookings</p>
        </div>
      </div>

      <div className="destinations-section">
        <h2>Popular Destinations</h2>
        <div className="destinations-grid">
          <div className="destination-card">
            <img src="https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" alt="Dubai" />
            <div className="destination-info">
              <h3>Dubai</h3>
              <p>Experience luxury in the desert</p>
            </div>
          </div>
          <div className="destination-card">
            <img src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" alt="Paris" />
            <div className="destination-info">
              <h3>Paris</h3>
              <p>The city of love and lights</p>
            </div>
          </div>
          <div className="destination-card">
            <img src="https://images.unsplash.com/photo-1533929736458-ca588d08c8be?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" alt="Tokyo" />
            <div className="destination-info">
              <h3>Tokyo</h3>
              <p>Where tradition meets future</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightSearch;
