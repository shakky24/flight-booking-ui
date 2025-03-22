import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Flight, Passenger, BookingRequest, CabinClass } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../Auth/AuthModal';
import './BookingDetails.css';

interface BookingDetailsProps {}

interface LocationState {
  outboundFlight: Flight;
  returnFlight?: Flight | null;
  isRoundTrip: boolean;
}

const BookingDetails: React.FC<BookingDetailsProps> = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { outboundFlight, returnFlight, isRoundTrip } = location.state as LocationState;
  
  // State for contact information
  const [contactInfo, setContactInfo] = useState({
    email: user?.email || '',
    phone: ''
  });
  
  // State for passengers
  const [passengers, setPassengers] = useState<Passenger[]>([
    { 
      firstName: '', 
      lastName: '', 
      gender: '',
      birthDay: '',
      birthMonth: '',
      birthYear: '',
      passportNumber: '',
      passportCountry: '',
      passportExpiryDay: '',
      passportExpiryMonth: '',
      passportExpiryYear: ''
    }
  ]);
  
  // State for form errors
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // State for loading and submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for auth modal
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Calculate total price
  const calculateTotalPrice = () => {
    let total = outboundFlight.price;
    if (returnFlight) {
      total += returnFlight.price;
    }
    return total * passengers.length;
  };
  
  // Format date (e.g., "Mon, 23 Mar")
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Format time (e.g., "14:25")
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };
  
  // Handle contact info changes
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle passenger info changes
  const handlePassengerChange = (index: number, field: keyof Passenger, value: string) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = {
      ...updatedPassengers[index],
      [field]: value
    };
    setPassengers(updatedPassengers);
  };
  
  // Add passenger
  const addPassenger = () => {
    setPassengers([
      ...passengers,
      { 
        firstName: '', 
        lastName: '', 
        gender: '',
        birthDay: '',
        birthMonth: '',
        birthYear: '',
        passportNumber: '',
        passportCountry: '',
        passportExpiryDay: '',
        passportExpiryMonth: '',
        passportExpiryYear: ''
      }
    ]);
  };
  
  // Remove passenger
  const removePassenger = (index: number) => {
    if (passengers.length > 1) {
      const updatedPassengers = passengers.filter((_, i) => i !== index);
      setPassengers(updatedPassengers);
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    // Validate contact info
    if (!contactInfo.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(contactInfo.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!contactInfo.phone) {
      newErrors.phone = 'Phone number is required';
    }
    
    // Validate passengers
    passengers.forEach((passenger, index) => {
      if (!passenger.firstName) {
        newErrors[`passenger${index}FirstName`] = 'First name is required';
      }
      
      if (!passenger.lastName) {
        newErrors[`passenger${index}LastName`] = 'Last name is required';
      }
      
      if (!passenger.gender) {
        newErrors[`passenger${index}Gender`] = 'Title/Gender is required';
      }
      
      if (!passenger.birthDay) {
        newErrors[`passenger${index}BirthDay`] = 'Birth day is required';
      }
      
      if (!passenger.birthMonth) {
        newErrors[`passenger${index}BirthMonth`] = 'Birth month is required';
      }
      
      if (!passenger.birthYear) {
        newErrors[`passenger${index}BirthYear`] = 'Birth year is required';
      }
      
      if (!passenger.passportNumber) {
        newErrors[`passenger${index}PassportNumber`] = 'Passport number is required';
      }
      
      if (!passenger.passportCountry) {
        newErrors[`passenger${index}PassportCountry`] = 'Passport country is required';
      }
      
      if (!passenger.passportExpiryDay) {
        newErrors[`passenger${index}PassportExpiryDay`] = 'Passport expiry day is required';
      }
      
      if (!passenger.passportExpiryMonth) {
        newErrors[`passenger${index}PassportExpiryMonth`] = 'Passport expiry month is required';
      }
      
      if (!passenger.passportExpiryYear) {
        newErrors[`passenger${index}PassportExpiryYear`] = 'Passport expiry year is required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Check if user is authenticated
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    await processBooking();
  };
  
  // Process the booking after ensuring user is authenticated
  const processBooking = async () => {
    setIsSubmitting(true);
    
    try {
      // Get current date in ISO format to use as booking date
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Ensure we have proper cabin class values in the flights
      const outboundFlightWithCabin = {
        ...outboundFlight,
        cabinClass: outboundFlight.cabinClass || CabinClass.ECONOMY, // Use existing or default to Economy
        cabinClassId: outboundFlight.cabinClassId || outboundFlight.id // Use existing or use flight id as fallback
      };
      
      // Do the same for return flight if it exists
      const returnFlightWithCabin = returnFlight ? {
        ...returnFlight,
        cabinClass: returnFlight.cabinClass || CabinClass.ECONOMY,
        cabinClassId: returnFlight.cabinClassId || returnFlight.id
      } : undefined;
      
      const bookingRequest: BookingRequest = {
        outboundFlightId: outboundFlight.id,
        returnFlightId: returnFlight?.id,
        passengers,
        contactEmail: contactInfo.email,
        contactPhone: contactInfo.phone,
        userId: user?.id, // Add the user ID from auth context
        flights: {
          outbound: outboundFlightWithCabin,
          return: returnFlightWithCabin,
          cabinClass: outboundFlightWithCabin.cabinClass,
          cabinClassId: outboundFlightWithCabin.cabinClassId
        },
        totalPrice: calculateTotalPrice(),
        bookingDate: currentDate
      };
      
      console.log('Creating booking with request:', JSON.stringify(bookingRequest, null, 2));
      
      const booking = await api.createBooking(bookingRequest);
      console.log('Booking created:', booking);
      
      // Get the full booking details with flight objects before navigation
      if (booking && booking.id) {
        try {
          // Fetch the complete booking with flight objects
          const completeBooking = await api.getBookingDetails(booking.id);
          console.log('Complete booking with flight objects:', completeBooking);
          
          // Navigate to booking confirmation page with complete data
          navigate('/booking-confirmation', { state: { booking: completeBooking } });
        } catch (error) {
          console.error('Error fetching complete booking:', error);
          // Still navigate even if fetching complete booking fails
          navigate('/booking-confirmation', { state: { booking } });
        }
      } else {
        // Fallback if no booking ID
        navigate('/booking-confirmation', { state: { booking } });
      }
    } catch (error: any) {
      console.error('Error creating booking:', error);
      
      // Check if it's a 400 Bad Request error with validation messages
      if (error.status === 400 && error.message) {
        let errorMessage = 'Failed to create booking: ';
        if (Array.isArray(error.message)) {
          errorMessage += error.message.join(', ');
        } else {
          errorMessage += error.message;
        }
        setErrors({ submit: errorMessage });
      }
      // Check if it's a 403 Forbidden error, which indicates invalid token
      else if (error.status === 403) {
        setErrors({ 
          submit: 'Your session has expired. Please log in again.', 
          auth: 'session_expired' 
        });
        setShowAuthModal(true);
      } else {
        setErrors({ submit: 'Failed to create booking. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle successful authentication
  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // Clear the auth error if it was a session expiration
    if (errors.auth === 'session_expired') {
      const { auth, ...remainingErrors } = errors;
      setErrors(remainingErrors);
    }
    processBooking();
  };
  
  // Get today's date in YYYY-MM-DD format for max date of birth
  const getTodayFormatted = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (!outboundFlight) {
    navigate('/');
    return null;
  }
  
  return (
    <div className="booking-details">
      <h2>Complete Your Booking</h2>
      
      <div className="flight-summary">
        <h3>Flight Summary</h3>
        
        <div className="flight-card summary-card">
          <div className="flight-header">
            <span className="flight-label">Outbound</span>
            <span className="flight-number">{outboundFlight.flightNumber}</span>
            <span className="cabin-class">{outboundFlight.cabinClass}</span>
          </div>
          
          <div className="flight-route">
            <div className="origin">
              <div className="code">{outboundFlight.origin.code}</div>
              <div className="time">{formatTime(outboundFlight.departureTime)}</div>
              <div className="date">{formatDate(outboundFlight.departureTime)}</div>
            </div>
            
            <div className="flight-arrow">→</div>
            
            <div className="destination">
              <div className="code">{outboundFlight.destination.code}</div>
              <div className="time">{formatTime(outboundFlight.arrivalTime)}</div>
              <div className="date">{formatDate(outboundFlight.arrivalTime)}</div>
            </div>
          </div>
        </div>
        
        {returnFlight && (
          <div className="flight-card summary-card">
            <div className="flight-header">
              <span className="flight-label">Return</span>
              <span className="flight-number">{returnFlight.flightNumber}</span>
              <span className="cabin-class">{returnFlight.cabinClass}</span>
            </div>
            
            <div className="flight-route">
              <div className="origin">
                <div className="code">{returnFlight.origin.code}</div>
                <div className="time">{formatTime(returnFlight.departureTime)}</div>
                <div className="date">{formatDate(returnFlight.departureTime)}</div>
              </div>
              
              <div className="flight-arrow">→</div>
              
              <div className="destination">
                <div className="code">{returnFlight.destination.code}</div>
                <div className="time">{formatTime(returnFlight.arrivalTime)}</div>
                <div className="date">{formatDate(returnFlight.arrivalTime)}</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="price-summary">
          <div className="price-detail">
            <span>Outbound Flight:</span>
            <span>₹{outboundFlight.price}</span>
          </div>
          
          {returnFlight && (
            <div className="price-detail">
              <span>Return Flight:</span>
              <span>₹{returnFlight.price}</span>
            </div>
          )}
          
          <div className="price-detail">
            <span>Passengers:</span>
            <span>{passengers.length}</span>
          </div>
          
          <div className="price-total">
            <span>Total:</span>
            <span>${calculateTotalPrice()}</span>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-section">
          <h3>Contact Information</h3>
          
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={contactInfo.email}
              onChange={handleContactChange}
              required
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={contactInfo.phone}
              onChange={handleContactChange}
              required
            />
            {errors.phone && <div className="error-message">{errors.phone}</div>}
          </div>
        </div>
        
        <div className="form-section">
          <h3>Passenger Information</h3>
          
          {passengers.map((passenger, index) => (
            <div key={index} className="passenger-form">
              <h4>Passenger {index + 1}</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`firstName-${index}`}>First Name *</label>
                  <input
                    type="text"
                    id={`firstName-${index}`}
                    value={passenger.firstName}
                    onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                    required
                  />
                  {errors[`passenger${index}FirstName`] && (
                    <div className="error-message">{errors[`passenger${index}FirstName`]}</div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor={`lastName-${index}`}>Last Name *</label>
                  <input
                    type="text"
                    id={`lastName-${index}`}
                    value={passenger.lastName}
                    onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                    required
                  />
                  {errors[`passenger${index}LastName`] && (
                    <div className="error-message">{errors[`passenger${index}LastName`]}</div>
                  )}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`gender-${index}`}>Title/Gender *</label>
                  <select
                    id={`gender-${index}`}
                    value={passenger.gender}
                    onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                    required
                  >
                    <option value="">Select Title</option>
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Ms">Ms</option>
                  </select>
                  {errors[`passenger${index}Gender`] && (
                    <div className="error-message">{errors[`passenger${index}Gender`]}</div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor={`birthDay-${index}`}>Birth Day *</label>
                  <input
                    type="number"
                    id={`birthDay-${index}`}
                    value={passenger.birthDay}
                    onChange={(e) => handlePassengerChange(index, 'birthDay', e.target.value)}
                    min="1"
                    max="31"
                    required
                  />
                  {errors[`passenger${index}BirthDay`] && (
                    <div className="error-message">{errors[`passenger${index}BirthDay`]}</div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor={`birthMonth-${index}`}>Birth Month *</label>
                  <input
                    type="number"
                    id={`birthMonth-${index}`}
                    value={passenger.birthMonth}
                    onChange={(e) => handlePassengerChange(index, 'birthMonth', e.target.value)}
                    min="1"
                    max="12"
                    required
                  />
                  {errors[`passenger${index}BirthMonth`] && (
                    <div className="error-message">{errors[`passenger${index}BirthMonth`]}</div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor={`birthYear-${index}`}>Birth Year *</label>
                  <input
                    type="number"
                    id={`birthYear-${index}`}
                    value={passenger.birthYear}
                    onChange={(e) => handlePassengerChange(index, 'birthYear', e.target.value)}
                    min="1900"
                    max={new Date().getFullYear()}
                    required
                  />
                  {errors[`passenger${index}BirthYear`] && (
                    <div className="error-message">{errors[`passenger${index}BirthYear`]}</div>
                  )}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`passportNumber-${index}`}>Passport Number *</label>
                  <input
                    type="text"
                    id={`passportNumber-${index}`}
                    value={passenger.passportNumber}
                    onChange={(e) => handlePassengerChange(index, 'passportNumber', e.target.value)}
                    required
                  />
                  {errors[`passenger${index}PassportNumber`] && (
                    <div className="error-message">{errors[`passenger${index}PassportNumber`]}</div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor={`passportCountry-${index}`}>Passport Country *</label>
                  <input
                    type="text"
                    id={`passportCountry-${index}`}
                    value={passenger.passportCountry}
                    onChange={(e) => handlePassengerChange(index, 'passportCountry', e.target.value)}
                    required
                  />
                  {errors[`passenger${index}PassportCountry`] && (
                    <div className="error-message">{errors[`passenger${index}PassportCountry`]}</div>
                  )}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`passportExpiryDay-${index}`}>Passport Expiry Day *</label>
                  <input
                    type="number"
                    id={`passportExpiryDay-${index}`}
                    value={passenger.passportExpiryDay}
                    onChange={(e) => handlePassengerChange(index, 'passportExpiryDay', e.target.value)}
                    min="1"
                    max="31"
                    required
                  />
                  {errors[`passenger${index}PassportExpiryDay`] && (
                    <div className="error-message">{errors[`passenger${index}PassportExpiryDay`]}</div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor={`passportExpiryMonth-${index}`}>Passport Expiry Month *</label>
                  <input
                    type="number"
                    id={`passportExpiryMonth-${index}`}
                    value={passenger.passportExpiryMonth}
                    onChange={(e) => handlePassengerChange(index, 'passportExpiryMonth', e.target.value)}
                    min="1"
                    max="12"
                    required
                  />
                  {errors[`passenger${index}PassportExpiryMonth`] && (
                    <div className="error-message">{errors[`passenger${index}PassportExpiryMonth`]}</div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor={`passportExpiryYear-${index}`}>Passport Expiry Year *</label>
                  <input
                    type="number"
                    id={`passportExpiryYear-${index}`}
                    value={passenger.passportExpiryYear}
                    onChange={(e) => handlePassengerChange(index, 'passportExpiryYear', e.target.value)}
                    min={new Date().getFullYear()}
                    required
                  />
                  {errors[`passenger${index}PassportExpiryYear`] && (
                    <div className="error-message">{errors[`passenger${index}PassportExpiryYear`]}</div>
                  )}
                </div>
              </div>
              
              {passengers.length > 1 && (
                <button
                  type="button"
                  className="remove-passenger"
                  onClick={() => removePassenger(index)}
                >
                  Remove Passenger
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            className="add-passenger"
            onClick={addPassenger}
          >
            Add Passenger
          </button>
        </div>
        
        {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}
        
        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Confirm Booking'}
          </button>
        </div>
      </form>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default BookingDetails;
