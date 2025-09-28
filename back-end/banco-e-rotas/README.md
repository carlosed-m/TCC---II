# Back-End Project Documentation

## Overview
This project is a Node.js Express application that provides user authentication, user management, and history verification functionalities. It serves as a back-end service for managing user data and their associated historical records.

## Project Structure
```
back-end
├── src
│   ├── app.js                  # Entry point of the application
│   ├── config
│   │   └── db.js              # Database connection configuration
│   ├── controllers
│   │   ├── authController.js   # Handles user registration and login
│   │   ├── userController.js    # Manages user-related operations
│   │   └── historyController.js  # Verifies and retrieves user history
│   ├── routes
│   │   ├── auth.js             # Routes for authentication
│   │   ├── users.js            # Routes for user management
│   │   └── history.js          # Routes for history verification
│   ├── middleware
│   │   └── authMiddleware.js    # Middleware for authentication
│   └── models
│       ├── User.js             # User model
│       └── History.js          # History model
├── package.json                 # npm configuration file
└── README.md                    # Project documentation
```

## Setup Instructions
1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd back-end
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Configure the database**:
   Update the `src/config/db.js` file with your database connection details.

4. **Run the application**:
   ```
   npm start
   ```

## Usage
- **User Registration**: Send a POST request to `/api/auth/register` with user details to register a new user.
- **User Login**: Send a POST request to `/api/auth/login` with credentials to log in.
- **User Management**: Use the `/api/users` routes to get, update, or delete user information.
- **History Verification**: Access user history through the `/api/history` routes.

## License
This project is licensed under the MIT License.