# SkyJourney - Flight Booking Application

A modern, responsive flight booking web application built with React and TypeScript. SkyJourney allows users to search for flights, book one-way or round-trip tickets, manage their bookings, and view their profile.

![SkyJourney Logo](https://via.placeholder.com/150x150.png?text=SkyJourney)

## Features

- **User Authentication**: Secure login and registration system
- **Flight Search**: Search for flights with flexible date options
- **Advanced Filtering**: Filter search results by price, duration, and airlines
- **Booking Management**: Create, view, and cancel bookings
- **Round-trip Support**: Book both one-way and round-trip flights
- **User Profiles**: View booking history and personal information
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack

- **Frontend**: React, TypeScript, CSS
- **State Management**: React Context API
- **Routing**: React Router
- **Authentication**: JWT-based authentication
- **API Integration**: RESTful API client
- **Formatting**: Date and currency formatting for different locales

## Installation

1. Clone the repository:
```bash
git clone https://github.com/shakky24/flight-booking-ui.git
cd flight-booking-ui
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your environment variables:
```
REACT_APP_API_URL=http://localhost:9000
```

4. Start the development server:
```bash
npm start
```

## Usage

### Flight Search
1. Enter departure and arrival locations
2. Select departure date (and return date for round trips)
3. Choose number of passengers
4. Click "Search Flights"

### Booking a Flight
1. Select a flight from search results
2. Fill in passenger details
3. Enter contact information
4. Confirm booking details
5. Complete payment process
6. Receive booking confirmation

### Managing Bookings
1. Navigate to "My Profile"
2. View list of all bookings
3. Click on a booking to view details
4. Cancel bookings if needed

## Project Structure

```
flight-booking-react/
├── public/               # Static files
├── src/                  # Source files
│   ├── components/       # React components
│   │   ├── Auth/         # Authentication components
│   │   ├── BookingDetails/ # Booking creation and confirmation
│   │   ├── FlightSearch/ # Flight search and results
│   │   └── UserProfile/  # User profile management
│   ├── context/          # React Context for state management
│   ├── services/         # API services
│   ├── types/            # TypeScript type definitions
│   ├── App.tsx           # Main App component
│   └── index.tsx         # Entry point
└── package.json          # Dependencies and scripts
```

## API Integration

The application connects to a RESTful API with the following main endpoints:

- `/auth/login` & `/auth/register`: User authentication
- `/flights/search`: Search for available flights
- `/flights/{id}`: Get details for a specific flight
- `/bookings`: Create and retrieve bookings
- `/bookings/{id}`: Get, update, or cancel a specific booking

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Icons and design inspiration from various open-source projects
- Flight data structures based on industry standards
