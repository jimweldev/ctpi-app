const mongoose = require("mongoose");

const Closing = require("../models/closingModel");

// get all
const getClosings = async (req, res) => {
  let search = req.query.search || "";

  let query;

  const reqQuery = { ...req.query };

  const removeFields = ["search", "page", "limit", "sort"];
  removeFields.forEach((val) => delete reqQuery[val]);

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );
  query = Closing.find(JSON.parse(queryStr));

  // search
  if (req.query.search) {
    query = query.find({
      $or: [
        {
          title: { $regex: search, $options: "i" },
        },
        {
          description: { $regex: search, $options: "i" },
        },
      ],
    });
  }

  // sort
  if (req.query.sort) {
    const sortByArr = req.query.sort.split(",");

    const sortByStr = sortByArr.join(" ");

    query = query.sort(sortByStr);
  } else {
    query = query.sort("title");
  }

  const closings = await query;

  res.status(200).json({
    records: closings,
  });
};

// get one
const getClosing = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "No item found" });
  }

  const closing = await Closing.findById(id).populate({
    path: "seriesId",
    select: "title",
  });

  if (!closing) {
    return res.status(400).json({ error: "No item found" });
  }

  res.status(200).json(closing);
};

// create one
const createClosing = async (req, res) => {
  const { order, sermonId, title, description } = req.body;

  if (!order) {
    return res.status(400).json({ error: "order is required" });
  }

  if (!sermonId) {
    return res.status(400).json({ error: "sermonId address is required" });
  }

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  if (!description) {
    return res.status(400).json({ error: "Description is required" });
  }

  try {
    const closing = await Closing.create({
      order,
      sermonId,
      title,
      description,
    });

    res.status(201).json(closing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// update one
const updateClosing = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "No item found" });
  }

  try {
    const closing = await Closing.findByIdAndUpdate(
      { _id: id },
      {
        ...req.body,
      },
      {
        new: true,
      }
    );

    if (!closing) {
      res.status(400).json({ error: "Closing not found" });
    }

    res.status(200).json(closing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// delete one
const deleteClosing = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "No item found" });
  }

  try {
    const closing = await Closing.findByIdAndDelete({ _id: id });

    if (!closing) {
      res.status(400).json({ error: "Closing not found" });
    }

    res.status(200).json(closing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// get all
const getClosingsPaginated = async (req, res) => {
  let page = req.query.page || 1;
  let limit = req.query.limit || 0;
  let search = req.query.search || "";

  let query;

  const reqQuery = { ...req.query };

  const removeFields = ["search", "page", "limit", "sort"];
  removeFields.forEach((val) => delete reqQuery[val]);

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );
  query = Closing.find(JSON.parse(queryStr));

  // search
  if (req.query.search) {
    query = query.find({
      $or: [
        {
          title: { $regex: search, $options: "i" },
        },
        {
          description: { $regex: search, $options: "i" },
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
    const sortByArr = req.query.sort.split(",");

    const sortByStr = sortByArr.join(" ");

    query = query.sort(sortByStr);
  } else {
    query = query.sort("title");
  }

  // Populate series title
  query = query.populate({
    path: "seriesId",
    select: "title",
  });

  const closings = await query;

  let count = await Closing.find({
    $or: [
      {
        title: { $regex: search, $options: "i" },
      },
      {
        description: { $regex: search, $options: "i" },
      },
    ],
  }).countDocuments({});
  let pages = limit > 0 ? Math.ceil(count / limit) : 1;

  res.status(200).json({
    info: {
      count,
      pages,
    },
    records: closings,
  });
};

module.exports = {
  getClosings,
  getClosing,
  createClosing,
  updateClosing,
  deleteClosing,
  getClosingsPaginated,
};
