const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const userModel = require('../models/userModel');

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg,
      });
    }

    const { username, email, password } = req.body;

    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = await userModel.createUser(username, email, passwordHash);

    return res.status(201).json({
      success: true,
      data: { id: userId, username, email },
      message: 'User registered successfully',
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};


const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg,
      });
    }

    const { email, password } = req.body;

    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        token,
      },
      message: 'Login successful',
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await userModel.findUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }
    return res.status(200).json({
      success: true,data: user,
    });
  } catch (err) {
    console.error('GetMe error:', err);
    return res.status(500).json({success: false,
      error: 'Internal server error',
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
};