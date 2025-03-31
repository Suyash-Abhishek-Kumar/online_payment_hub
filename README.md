# Online Payment Hub

A comprehensive online payment system with user authentication, credit card management, and QR code payment functionality.

## Features

- **User Authentication**: Secure login and signup with optional reCAPTCHA protection
- **Dashboard**: View balance, recent transactions, and quick payment options
- **Credit Card Management**: Add, edit, and delete credit cards
- **QR Code Payments**: Generate and scan QR codes for quick transactions
- **Contact Management**: Maintain a list of contacts for quick payments

## Technology Stack

- **Frontend**: React, TailwindCSS, shadcn/ui components
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (via Neon Database)
- **ORM**: Drizzle ORM
- **Authentication**: Session-based authentication with Passport.js
- **Form Validation**: React Hook Form with Zod schemas
- **Data Fetching**: TanStack Query (React Query)

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=postgresql://user:password@host:port/database
RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
```

The reCAPTCHA integration is optional. If the keys are not provided, the system will skip reCAPTCHA verification.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env` file
4. Run the application: `npm run dev`

## Database Schema

The application uses the following database tables:
- `users`: User account information
- `cards`: Credit card information linked to users
- `transactions`: Transaction history
- `qr_codes`: QR code payment identifiers
- `contacts`: User contacts for quick payments

## API Endpoints

### Authentication
- `POST /api/auth/login`: User login
- `POST /api/auth/signup`: User registration
- `GET /api/auth/logout`: User logout
- `GET /api/auth/me`: Get current user

### Cards
- `GET /api/cards`: Get all cards for current user
- `POST /api/cards`: Add a new card
- `PATCH /api/cards/:id`: Update a card
- `DELETE /api/cards/:id`: Delete a card
- `POST /api/cards/:id/default`: Set a card as default

### Transactions
- `GET /api/transactions`: Get transaction history
- `POST /api/transactions`: Create a new transaction

### QR Codes
- `GET /api/qr`: Get QR code for current user
- `POST /api/qr`: Generate a new QR code

### Contacts
- `GET /api/contacts`: Get contacts for current user
- `POST /api/contacts`: Add a new contact
- `PATCH /api/contacts/:id/paid`: Update last paid timestamp

## License

[MIT License](LICENSE)