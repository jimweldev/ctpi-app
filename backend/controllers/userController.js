const mongoose = require('mongoose');

const User = require('../models/userModel');

// get all
const getUsers = async (req, res) => {
  let page = req.query.page || 1;
  let limit = req.query.limit || 0;
  let search = req.query.search || '';

  let query;

  const reqQuery = { ...req.query };

  const removeFields = ['search', 'page', 'limit', 'sort'];
  removeFields.forEach((val) => delete reqQuery[val]);

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );
  query = User.find(JSON.parse(queryStr));

  // search
  if (req.query.search) {
    query = query.find({
      $or: [
        {
          emailAddress: { $regex: search, $options: 'i' },
        },
        {
          password: { $regex: search, $options: 'i' },
        },
      ],
    });
  }

  // limit
  if (req.query.limit) {
    query = query.limit(limit);
  }

  // pagination
  if (req.query.page) {
    query = query.skip((page - 1) * limit);
  }

  // sort
  if (req.query.sort) {
    const sortByArr = req.query.sort.split(',');

    const sortByStr = sortByArr.join(' ');

    query = query.sort(sortByStr);
  } else {
    query = query.sort('emailAddress');
  }

  const users = await query;

  let count = await User.find({
    $or: [
      {
        emailAddress: { $regex: search, $options: 'i' },
      },
      {
        password: { $regex: search, $options: 'i' },
      },
    ],
  }).countDocuments({});
  let pages = limit > 0 ? Math.ceil(count / limit) : 1;

  res.status(200).json({
    info: {
      count,
      pages,
    },
    records: users,
  });
};

// get one
const getUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'No item found' });
  }

  const user = await User.findById(id);

  if (!user) {
    return res.status(400).json({ error: 'No item found' });
  }

  res.status(200).json(user);
};

// create one
const createUser = async (req, res) => {
  const { emailAddress, password } = req.body;

  if (!emailAddress) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  try {
    const user = await User.create({ emailAddress, password });

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// update one
const updateUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'No item found' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      { _id: id },
      {
        ...req.body,
      },
      {
        new: true,
      }
    );

    if (!user) {
      res.status(400).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// delete one
const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'No item found' });
  }

  try {
    const user = await User.findByIdAndDelete({ _id: id });

    if (!user) {
      res.status(400).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};