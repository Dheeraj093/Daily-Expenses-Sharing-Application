const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  splitMethod: {
    type: String,
    enum: ['equal', 'exact', 'percentage'],
    required: true,
  },
  splitAmounts: {
    type: Map,
    of: Number, // stores {userId: amount}
    required: true,
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
