# RAISE Insurance Backend

This is the backend service for the RAISE (Road Accident Insurance System for Everyone) insurance module. It provides RESTful APIs for both the insurance web interface and the police mobile app.

## Features

- User authentication and role-based access control
- Accident report management
- Police abstract handling
- Fraud detection integration
- File upload and management
- Real-time notifications
- Review and commenting system

## Tech Stack

- Python 3.8+
- Flask 3.0.2
- SQLAlchemy (ORM)
- Flask-JWT-Extended (Authentication)
- Flask-Migrate (Database migrations)
- PostgreSQL (Production) / SQLite (Development)
- Flask-Mail (Email notifications)

## Project Structure

```
insurance_backend/
├── app/
│   ├── models/          # Database models
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   └── utils/           # Helper functions
├── config.py           # Configuration
├── requirements.txt    # Dependencies
└── run.py             # Application entry point
```

## Setup Instructions

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file with the following variables:
   ```
   FLASK_APP=run.py
   FLASK_ENV=development
   SECRET_KEY=your-secret-key
   JWT_SECRET_KEY=your-jwt-secret
   DATABASE_URL=sqlite:///app.db  # For development
   MAIL_SERVER=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USE_TLS=True
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=your-app-password
   ```

4. Initialize the database:
   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

5. Run the development server:
   ```bash
   flask run
   ```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

### Accident Report Endpoints

- `GET /api/accidents` - List accidents (with filters)
- `GET /api/accidents/<id>` - Get accident details
- `POST /api/accidents` - Create new accident report
- `PUT /api/accidents/<id>` - Update accident report
- `PUT /api/accidents/<id>/flag` - Flag suspicious report
- `PUT /api/accidents/<id>/review` - Add review note

### Abstract Endpoints

- `POST /api/abstracts/upload` - Upload police abstract
- `GET /api/abstracts/<id>` - Download abstract file

### Insurance Company Endpoints

- `GET /api/company/accidents` - Get company's accident reports
- `GET /api/company/stats` - Get company statistics

## Development Guidelines

1. Follow PEP 8 style guide
2. Write tests for new features
3. Use meaningful commit messages
4. Document API changes
5. Update requirements.txt when adding dependencies

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens expire after 1 hour
- File uploads are validated and sanitized
- CORS is enabled for specific origins
- Rate limiting is implemented on sensitive endpoints

## License

This project is part of the RAISE system and is proprietary software. 