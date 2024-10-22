
# Daily Expenses Sharing Application

This project is a RESTful API for managing expenses, designed to allow users to create, manage, and split expenses among participants. It also provides balance sheets and CSV download functionality. Built using Node.js, Express, and MongoDB, it incorporates JWT authentication for secure access.


## Table of Contents

 - Technologies Used
 - Prerequisites
 - Installation
 - Environment Variables
 - Running the Application
 - API Documentation
 


## Technology Used

 - Node.js: JavaScript runtime for building scalable server-side applications.
 - Express.js: Minimalist web framework for routing and middleware management.
 - MongoDB: NoSQL database for data storage.
 - Mongoose: ODM for MongoDB, simplifying schema  definition and queries.
 - JWT (JSON Web Token): Secure authentication and authorization.
 - bcryptjs: Library to hash passwords.
 - CSV-Parser/Writer: For generating CSV files for expense reports.
## Prerequisites
Before you begin, ensure you have the following installed on your system:

 - Node.js: Download Node.js
 - MongoDB: Download MongoDB or use MongoDB Atlas
## Installation
 - Clone the repository:
    ```http
    git clone https://github.com/Dheeraj093/Daily-Expenses-Sharing-Application.git
    ```

 - Navigate to the project directory:
   ```http
    cd Daily-Expenses-Sharing-Application
    ```

 - Install dependencies:
   ```http
    npm install
    ```
## Environment Variables
 - Create a .env file in the root directory and add the following variables:

   ```http
    MONGO_URI=mongodb://localhost:27017/yourDBname 
    ```
     ```http
      JWT_SECRET=yourJWTsecretKey
   ```
   ```http
    PORT=5000
    ```
## Running the Application
 

 - Install dependencies:
   ```http
    npm start
    ```
 - The API will now run on http://localhost:5000 or the specified port.


## API Endpoints
 ### User Authentication
  - POST /api/user/signup - Register a new user.
  - POST /api/user/login - Log in a user and return a JWT.
  - GET /api/user/:userId - Get user details by ID (JWT required).

### Expense Management
  - POST /api/expense/add - Add a new expense and split among participants (JWT required).
  - GET /api/expense/getAllExpensesList - Get a list of all expenses (JWT required).
  - GET /api/expense/getUserExpensesOnly - Get expenses for the logged-in user (JWT required).

### Balance Sheet
  - POST /api/expense/download - Download user-specific or all expenses as a CSV file (JWT required).
