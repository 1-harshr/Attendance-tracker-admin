# Employee Attendance Admin Portal

A comprehensive admin portal for managing employee attendance, built with React and TypeScript.

## Features

- **Dashboard**: Overview of attendance statistics and recent activities
- **Employee Management**: Add, edit, and remove employees
- **Attendance Tracking**: View, edit, and manage attendance records
- **GPS Configuration**: Set office location for location-based attendance
- **Authentication**: Secure login system with JWT tokens
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18, TypeScript
- **Styling**: CSS3 with modern design patterns
- **HTTP Client**: Axios for API communication
- **Routing**: React Router for navigation
- **State Management**: React hooks and context

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- Backend API server running on port 8080

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd admin-portal
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

4. Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000).

## Environment Configuration

Create a `.env.local` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:8080
```

For production, create `.env.production`:

```env
REACT_APP_API_URL=https://your-api-domain.com
```

## Demo Credentials

For testing purposes, you can use these demo credentials:
- **Employee**: `EMP001` / `password123`

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000).

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.

### `npm run eject`
**Note: This is a one-way operation!** Ejects from Create React App configuration.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.tsx      # Main layout component
├── pages/              # Page components
│   ├── Dashboard.tsx   # Dashboard with stats
│   ├── Employees.tsx   # Employee management
│   ├── Attendance.tsx  # Attendance tracking
│   ├── Settings.tsx    # GPS and system settings
│   └── Login.tsx       # Authentication
├── services/           # API services
│   └── api.ts         # HTTP client and API calls
├── types/             # TypeScript type definitions
│   └── index.ts       # Global types
└── utils/             # Utility functions
```

## API Integration

The admin portal connects to a backend API for:
- Employee management (CRUD operations)
- Attendance tracking and reporting
- GPS configuration for location-based attendance
- User authentication and authorization

## Security Features

- JWT token-based authentication
- Protected routes requiring authentication
- Secure credential handling
- Environment-based configuration
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.
