// Import necessary modules
const Expense = require('../Models/Expense'); // Model for expense data
const User = require('../Models/User'); // Model for user data (not used in the current code)
const { Parser } = require('json2csv'); // Library for generating CSV files

// Function to add a new expense
const addExpense = async (req, res, next) => {
  // Destructure required fields from request body
  const { title, totalAmount, participants, splitMethod } = req.body;

  // Validate input: Ensure required fields are provided
  if (!title || !totalAmount || !participants || participants.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Title, total amount, and participants are required',
    });
  }

  try {
    let splitAmounts = {}; // Object to hold how much each participant owes

    // Split the expense based on the selected method
    if (splitMethod === 'equal') {
      // Split equally among all participants
      const splitAmount = totalAmount / participants.length;
      participants.forEach((user) => {
        splitAmounts[user] = splitAmount; // Assign split amount to each participant
      });
    } else if (splitMethod === 'exact') {
      // Use exact amounts provided in the request
      splitAmounts = req.body.splitAmounts; // Get exact amounts
      // Validate that the sum of exact amounts matches the total amount
      if (Object.values(splitAmounts).reduce((a, b) => a + b, 0) !== totalAmount) {
        return res.status(400).json({
          success: false,
          message: 'Exact amounts must add up to the total amount',
        });
      }
    } else if (splitMethod === 'percentage') {
      // Split based on percentages provided
      const percentages = req.body.percentages; // Get percentages
      const totalPercentage = Object.values(percentages).reduce((a, b) => a + b, 0);
      // Validate that percentages add up to 100
      if (totalPercentage !== 100) {
        return res.status(400).json({
          success: false,
          message: 'Percentages must add up to 100%',
        });
      }
      participants.forEach((user) => {
        // Calculate and assign amounts based on percentage
        splitAmounts[user] = (percentages[user] / 100) * totalAmount;
      });
    } else {
      // If the split method is not recognized, return an error
      return res.status(400).json({
        success: false,
        message: 'Invalid split method',
      });
    }

    // Create a new expense object
    const expense = new Expense({
      title,
      totalAmount,
      splitMethod,
      splitAmounts,
      participants,
      addedBy: req.user._id, // Store the ID of the user adding the expense
    });

    // Save the expense to the database
    await expense.save();

    // Respond with the created expense
    res.status(201).json({
      success: true,
      expense,
    });
  } catch (error) {
    console.error(error); // Log any errors
    res.status(500).json({
      success: false,
      message: 'Server error', // Respond with a server error message
    });
  }
};




// Function to get individual user's expenses
const getUserExpensesOnly = async (req, res, next) => {
  try {
    const userId = req.user._id; // Get the user ID from the request

    // Find all expenses where the user is a participant
    const expenses = await Expense.find({ participants: userId });

    // Check if any expenses were found
    if (!expenses || expenses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No expenses found for this user',
        totalExpense: 0, // Return 0 total expense if no expenses found
        expenses: [], // Return an empty array
      });
    }

    let totalExpense = 0; // Initialize total expense variable

    // Transform the expenses array to include user-specific expense details
    const userExpensesDetails = expenses.map(expense => {
      // Get user's share for the expense
      const userShare = expense.splitAmounts.get(userId) ; 
      if (userShare) {
        totalExpense += userShare; // Sum up the user's share
      }
      return {
        _id: expense._id, // Include expense ID
        title: expense.title, // Include title of expense
        expense: userShare || 0, // Set user-specific expense, defaulting to 0 if not found
        addedBy: expense.addedBy, // Include who added the expense
        createdAt: expense.createdAt, // Include creation date
        updatedAt: expense.updatedAt, // Include last updated date
        __v: expense.__v, // Include version key
      };
    });

    // Return the response with the total expense and user-specific expenses details
    res.status(200).json({
      success: true,
      totalExpense, // Return the total expense for the user
      expenses: userExpensesDetails, // Return the transformed expenses list
    });
  } catch (error) {
    console.error(error); // Log any errors
    res.status(500).json({
      success: false,
      message: 'Server error', // Respond with a server error message
    });
  }
};



// Function to get overall expenses for all users
const getUserExpensesList = async (req, res, next) => {
  const userId = req.user._id; // Get the user ID
  try {
    // Find all expenses where the user is a participant
    const expenses = await Expense.find({ participants: userId });

    // Check if any expenses were found
    if (!expenses || expenses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No expenses found', // Return not found message
      });
    }

    // Return the response with all expenses
    res.status(200).json({
      success: true,
      expenses, // Return the list of expenses
    });
  } catch (error) {
    console.error(error); // Log any errors
    res.status(500).json({
      success: false,
      message: 'Server error', // Respond with a server error message
    });
  }
};



const getAllExpensesList = async (req, res, next) => {
  const userId = req.user._id; // Get the user ID
  try {
    // Find all expenses 
    const expenses = await Expense.find();

    // Check if any expenses were found
    if (!expenses || expenses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No expenses found', // Return not found message
      });
    }

    // Return the response with all expenses
    res.status(200).json({
      success: true,
      expenses, // Return the list of expenses
    });
  } catch (error) {
    console.error(error); // Log any errors
    res.status(500).json({
      success: false,
      message: 'Server error', // Respond with a server error message
    });
  }
};

// Function to download the balance sheet as a CSV
const downloadBalanceSheet = async (req, res, next) => {
  try {
    // Find all expenses
    const userId = req.user._id;
    let expenses
    if(req.body.type == "user"){
      //for perticular user
      expenses = await Expense.find({ participants: userId });
    }
    else{
      //for all
        expenses = await Expense.find();
    }

    // Check if any expenses were found
    if (!expenses || expenses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No expenses found to generate the balance sheet', // Return not found message
      });
    }

    // Define the fields to be included in the CSV
    const fields = ['title', 'totalAmount', 'splitMethod', 'splitAmounts', 'participants', 'addedBy', 'createdAt'];
    const opts = { fields }; // Options for CSV generation
    const parser = new Parser(opts); // Create a new Parser instance
    const csv = parser.parse(expenses); // Parse the expenses into CSV format

    // Set headers for CSV file download
    res.header('Content-Type', 'text/csv');
    res.attachment('balance_sheet.csv'); // Set the file name
    return res.send(csv); // Send the CSV file
  } catch (error) {
    console.error(error); // Log any errors
    res.status(500).json({
      success: false,
      message: 'Server error', // Respond with a server error message
    });
  }
};

// Export the functions for use in other parts of the application
module.exports = {
  addExpense,
  downloadBalanceSheet,
  getUserExpensesList,
  getUserExpensesOnly,
  getAllExpensesList,
};
 