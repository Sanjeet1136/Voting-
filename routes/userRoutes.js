const express = require('express');
const router = express.Router();
const {signup, login} = require('../controllers/authController');
const { profile, updatePassword } = require('../controllers/userController');

const {jwtAuthMiddleware} = require('../jwt');

router.post('/signup', signup);
router.post('/login', login);
router.get('/profile',jwtAuthMiddleware, profile);
router.put('/profile/password',jwtAuthMiddleware, updatePassword);

module.exports = router;