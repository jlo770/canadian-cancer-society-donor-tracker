# Canadian Cancer Society Donor Tracker

A comprehensive web application for the Canadian Cancer Society to track donors, donations, campaigns, and generate reports.

## Features

- Donor management (store donor information, categorize donors, track history)
- Donation tracking (amounts, dates, methods, recurring donations, receipts)
- Campaign management (track fundraising campaigns and their performance)
- Reporting and analytics (donation trends, fundraising goals, donor retention)
- User management (authentication, role-based access control, profile management)
- Session management (timeout warnings, automatic logout for security)

## Tech Stack

- **Frontend**: React with Material-UI
- **Backend**: Python Flask
- **Database**: PostgreSQL
- **Authentication**: JWT with role-based access control
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/canadiancancersociety/donor-tracker.git
   cd donor-tracker
   ```

2. Set up the backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env  # Copy example environment file and update with your settings
   ```

3. Set up the database:
   ```bash
   flask db upgrade  # Apply all migrations
   flask seed-db     # Seed the database with initial data (optional)
   ```

4. Set up the frontend:
   ```bash
   cd ../frontend
   npm install  # or yarn install
   cp .env.development.example .env.development  # Copy example environment file
   ```

### Running the Application

1. Start the backend:
   ```bash
   cd backend
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   flask run --debug  # Development mode with auto-reload
   ```

2. Start the frontend in a new terminal:
   ```bash
   cd frontend
   npm start  # or yarn start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Testing

The application includes comprehensive tests for all components and functionality.

### Running Tests

1. Backend tests:
   ```bash
   cd backend
   pytest
   ```

2. Frontend tests:
   ```bash
   cd frontend
   npm test  # or yarn test
   ```

## Deployment

Detailed deployment guides are available for both frontend and backend:

- [Frontend Deployment Guide](frontend/DEPLOYMENT.md)
- [Backend Deployment Guide](backend/DEPLOYMENT.md)

### Quick Deployment Steps

1. Build the frontend:
   ```bash
   cd frontend
   ./build.sh  # This will install dependencies, run tests, and build for production
   ```

2. Deploy to Netlify (frontend):
   ```bash
   # Using Netlify CLI
   netlify deploy --prod
   ```

3. Deploy the backend following the instructions in the backend deployment guide.

## Project Structure

```
├── backend/                # Flask backend
│   ├── app/                # Application package
│   │   ├── __init__.py     # App initialization
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helper functions
│   ├── migrations/         # Database migrations
│   ├── tests/              # Backend tests
│   └── config.py           # Configuration
│
├── frontend/              # React frontend
│   ├── public/             # Static files
│   ├── src/                # Source code
│   │   ├── components/     # React components
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── campaigns/  # Campaign management
│   │   │   ├── dashboard/  # Dashboard components
│   │   │   ├── donations/  # Donation management
│   │   │   ├── donors/     # Donor management
│   │   │   ├── layout/     # Layout components
│   │   │   ├── reports/    # Reporting components
│   │   │   └── settings/   # Settings components
│   │   ├── context/        # React context providers
│   │   ├── utils/          # Utility functions
│   │   └── App.js          # Main application component
│   └── tests/              # Frontend tests
└── README.md              # Project documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Canadian Cancer Society for their support and collaboration
- All contributors who have helped shape this project

## Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///sales_tracker.db
```
cd /Users/jerryoliphant/CascadeProjects/sales-account-tracker/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
echo "FLASK_APP=app.py" > .env
echo "FLASK_ENV=development" >> .env
echo "SECRET_KEY=your-secret-key-here" >> .env
echo "JWT_SECRET_KEY=your-jwt-secret-key-here" >> .env
echo "DATABASE_URL=sqlite:///sales_tracker.db" >> .env
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
flask run
