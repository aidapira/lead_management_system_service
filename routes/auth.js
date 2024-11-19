const express = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// @route    POST /auth/register
// @desc     Register a new user
// @access   Public
router.post(
  '/register',
  [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, email, password } = req.body;

    try {
      // Check if user exists
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ msg: 'User already exists' });

      // Create user
      user = new User({ username, email, password });
      await user.save();

      // Generate JWT
      const payload = { userId: user.id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.status(201).json({ token });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route    POST /auth/login
// @desc     Login user and get token
// @access   Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

      // Generate JWT
      const payload = { userId: user.id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.json({ token });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
