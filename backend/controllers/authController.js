const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');

const generateAccessToken = (_id) => {
  return jwt.sign({ _id: _id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
  });
};

const generateRefreshToken = (_id) => {
  return jwt.sign({ _id: _id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
  });
};

// Login
const login = async (req, res) => {
  const { emailAddress, password } = req.body;

  if (!emailAddress || !password) {
    return res
      .status(400)
      .json({ error: 'Please fill all the required fields' });
  }

  let user = await User.findOne({ emailAddress });

  if (!user) {
    return res.status(400).json({ error: 'Incorrect email address' });
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  user = await User.findOne({ emailAddress }).select('-password');

  if (!isPasswordMatched) {
    return res.status(400).json({ error: 'Incorrect password' });
  }

  // generate access token
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res
    .cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    })
    .status(200)
    .json({ user, accessToken });
};

// Register
const register = async (req, res) => {
  const { emailAddress, password, confirmPassword } = req.body;

  if (!emailAddress || !password || !confirmPassword) {
    return res
      .status(400)
      .json({ error: 'Please fill all the required fields' });
  }

  const isEmailAddressUsed = await User.findOne({ emailAddress });

  if (isEmailAddressUsed) {
    return res.status(400).json({ error: 'Email already used' });
  }

  if (!validator.isEmail(emailAddress)) {
    return res.status(400).json({ error: 'Email is invalid' });
  }

  // prettier-ignore
  if (!validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    })) {
    return res.status(400).json({ error: 'Password is not strong enough' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords mismatch' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // try to create
  try {
    let user = await User.create({
      emailAddress,
      password: hashedPassword,
    });

    user = await User.findOne({ emailAddress }).select('-password');

    // generate access token
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
      })
      .status(201)
      .json({ user, accessToken });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Refresh
const refresh = async (req, res) => {
  let { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(204).json({ error: 'Refresh token required' });
  }

  try {
    const { _id } = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById({ _id });

    refreshToken = generateRefreshToken(user._id);

    // generate access token
    const accessToken = generateAccessToken(user._id);

    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
      })
      .status(200)
      .json({ user, accessToken });
  } catch (error) {
    return res
      .clearCookie('refreshToken')
      .status(204)
      .json({ error: 'Refresh token required' });
  }
};

// Logout
const logout = async (req, res) => {
  res
    .clearCookie('refreshToken')
    .status(200)
    .json({ message: 'Successfully logged out' });
};

module.exports = {
  login,
  register,
  refresh,
  logout,
};