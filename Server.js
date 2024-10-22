const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require("./Config/db");
const cors = require("cors");
const UserRoutes =  require("./Routes/User");
const errorHandler = require("./middleware/error");
const expenseRoutes =  require("./Routes/Expense");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.use(cors());

app.use(express.json());


// Routes

app.use('/user',UserRoutes);
app.use('/expense',expenseRoutes);


app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});