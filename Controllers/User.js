// Import necessary modules
const User = require("../Models/User"); // User model for interacting with user data in the database
const bcryptjs = require("bcryptjs"); // Library for hashing passwords
const jwt = require("jsonwebtoken"); // Library for generating JSON Web Tokens

// Function to generate a JSON Web Token
const generateToken = (_id) => {
  // Sign the token with the user's ID and secret key, set to expire in 10 hours
  return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: "10h" });
};

// Function to handle user signup
const signupUser = async (req, res, next) => {
  // Destructure user input from request body
  const { name, email, password, mobile } = req.body;

  // Validate input fields
  if (!name || !email || !password || !mobile) {
    res.status(400); // Set response status to 400 for bad request
    return next(new Error("Name, email, password & mobile fields are required"));
  }

  try {
    // Check if the user already exists with the given email or mobile
    const exists = await User.findOne({ 
      $or: [{ email }, { mobile }] // Search for user by email or mobile
    });

    if (exists) {
      res.status(400); // User already exists
      return next(new Error("Email or mobile number already in use"));
    }

    // Hash the password before saving it to the database
    const salt = await bcryptjs.genSalt(10); // Generate salt for hashing
    const hashedPassword = await bcryptjs.hash(password, salt); // Hash the password

    // Create a new user and save it to the database
    const user = await User.create({
      name,
      email,
      mobile,
      password: hashedPassword, // Store the hashed password
    });

    // Generate authentication token for the user
    const token = generateToken(user._id);

    // Set the token as a cookie in the response and send the user data
    res.cookie("access_token", token).status(200).json({
      success: true,
      user, // Return the created user details
      token, // Return the generated token
      Credentials: true,
    });
  } catch (error) {
    console.log(error); // Log any errors
    res.status(400); // Set response status to 400 for bad request
    return next(error); // Pass error to the next middleware
  }
};

// Function to handle user login
const loginUser = async (req, res, next) => {
  // Destructure user input from request body
  const { email, mobile, password } = req.body;

  // Check if either email or mobile is provided along with the password
  if ((!email && !mobile) || !password) {
    res.status(400); // Missing required fields
    return next(new Error("Please provide either email or mobile and password"));
  }

  try {
    // Find the user by email or mobile
    const user = await User.findOne({ 
      $or: [{ email }, { mobile }] // Search for user by email or mobile
    });

    // If user does not exist, return error
    if (!user) {
      res.status(400); // User not found
      return next(new Error("User does not exist"));
    }

    // Compare the provided password with the stored hash
    const match = await bcryptjs.compare(password, user.password);

    // If password does not match, return error
    if (!match) {
      res.status(400); // Invalid password
      return next(new Error("Invalid credentials, please try again with correct password"));
    }

    // Generate a token for the user
    const token = generateToken(user._id);

    // Set the token as a cookie in the response and send user data
    res.cookie("access_token", token).status(200).json({
      success: true,
      user, // Return the user details
      token, // Return the generated token
      Credentials: true,
    });

  } catch (error) {
    console.log(error); // Log any errors
    res.status(400); // Set response status to 400 for bad request
    return next(error); // Pass error to the next middleware
  }
};

// Function to search for a user by email or mobile
const searchUser = async (req, res, next) => {
  // Destructure query parameters
  const { email, mobile } = req.query;

  // Check if at least one parameter is provided
  if (!email && !mobile) {
    res.status(400); // Missing search parameters
    return next(new Error("Please provide either email or mobile to search"));
  }

  try {
    // Search for the user by email or mobile
    const user = await User.findOne({ 
      $or: [{ email }, { mobile }] // Search for user by email or mobile
    });

    // If no user is found, return an error
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found' // User does not exist
      });
    }

    // If user is found, return the user details
    res.status(200).json({
      success: true,
      user // Return the found user
    });
    
  } catch (error) {
    console.log(error); // Log any errors
    res.status(500); // Set response status to 500 for internal server error
    return next(error); // Pass error to the next middleware
  }
};

// Function to get user details by ID
const getUser = async (req, res) => {
  try {
    // Find user by ID from the request parameters
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' }); // If user not found, return error
    res.status(200).json(user); // Return user details
  } catch (error) {
    res.status(400).json({ message: error.message }); // Return error message for bad request
  }
};

// Export the user-related functions for use in other parts of the application
module.exports = {
  loginUser,
  signupUser,
  getUser,
  searchUser
};
