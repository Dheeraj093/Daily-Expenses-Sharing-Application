const express = require('express');
const router = express.Router();
const { signupUser, getUser,loginUser, searchUser} = require('../Controllers/User');

router.post('/signup', signupUser);
router.post('/login', loginUser);
router.post('/search', searchUser);
router.get('/:userId', getUser);


module.exports = router;
