const express = require('express');
const router = express.Router();
const { addExpense, getUserExpensesOnly, downloadBalanceSheet, getUserExpensesList, getAllExpensesList } = require('../Controllers/Expense');
const protect = require("../middleware/auth");

router.post('/add',protect,addExpense);
router.get('/getUserExpensesOnly',protect, getUserExpensesOnly);
router.get('/getUserExpensesList',protect, getUserExpensesList);
router.get('/getAllExpensesList',protect, getAllExpensesList);
router.post('/download',protect, downloadBalanceSheet);

module.exports = router;
