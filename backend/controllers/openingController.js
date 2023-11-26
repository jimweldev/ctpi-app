const mongoose = require("mongoose");

const Opening = require("../models/openingModel");

// get all
const getOpenings = async (req, res) => {
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
  query = Opening.find(JSON.parse(queryStr));

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

  const openings = await query;

  res.status(200).json({
    records: openings,
  });
};

// get one
const getOpening = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "No item found" });
  }

  const opening = await Opening.findById(id).populate({
    path: "seriesId",
    select: "title",
  });

  if (!opening) {
    return res.status(400).json({ error: "No item found" });
  }

  res.status(200).json(opening);
};

// create one
const createOpening = async (req, res) => {
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
    const opening = await Opening.create({
      order,
      sermonId,
      title,
      description,
    });

    res.status(201).json(opening);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// update one
const updateOpening = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "No item found" });
  }

  try {
    const opening = await Opening.findByIdAndUpdate(
      { _id: id },
      {
        ...req.body,
      },
      {
        new: true,
      }
    );

    if (!opening) {
      res.status(400).json({ error: "Opening not found" });
    }

    res.status(200).json(opening);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// delete one
const deleteOpening = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "No item found" });
  }

  try {
    const opening = await Opening.findByIdAndDelete({ _id: id });

    if (!opening) {
      res.status(400).json({ error: "Opening not found" });
    }

    res.status(200).json(opening);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// get all
const getOpeningsPaginated = async (req, res) => {
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
  query = Opening.find(JSON.parse(queryStr));

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

  const openings = await query;

  let count = await Opening.find({
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
    records: openings,
  });
};

module.exports = {
  getOpenings,
  getOpening,
  createOpening,
  updateOpening,
  deleteOpening,
  getOpeningsPaginated,
};
