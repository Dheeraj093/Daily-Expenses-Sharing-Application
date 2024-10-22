const express = require('express');
const router = express.Router();
const { addExpense, getUserExpenses, getAllExpenses, downloadBalanceSheet, getAll, getUserExpensesList } = require('../Controllers/Expense');
const protect = require("../middleware/auth");

router.post('/add',protect,addExpense);
router.get('/getUserExpenses',protect, getUserExpenses);
router.get('/getUserExpensesList',protect, getUserExpensesList);
router.get('/getUserExpensesList',protect, getUserExpensesList);
router.post('/download',protect, downloadBalanceSheet);

module.exports = router;
