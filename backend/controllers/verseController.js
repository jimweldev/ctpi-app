const mongoose = require("mongoose");

const Verse = require("../models/verseModel");

// get all
const getVerses = async (req, res) => {
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
  query = Verse.find(JSON.parse(queryStr));

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

  const verses = await query;

  res.status(200).json({
    records: verses,
  });
};

// get one
const getVerse = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "No item found" });
  }

  const verse = await Verse.findById(id).populate({
    path: "seriesId",
    select: "title",
  });

  if (!verse) {
    return res.status(400).json({ error: "No item found" });
  }

  res.status(200).json(verse);
};

// create one
const createVerse = async (req, res) => {
  const { order, pointId, title, description } = req.body;

  if (!order) {
    return res.status(400).json({ error: "order is required" });
  }

  if (!pointId) {
    return res.status(400).json({ error: "pointId address is required" });
  }

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  if (!description) {
    return res.status(400).json({ error: "Description is required" });
  }

  try {
    const verse = await Verse.create({
      order,
      pointId,
      title,
      description,
    });

    res.status(201).json(verse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// update one
const updateVerse = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "No item found" });
  }

  try {
    const verse = await Verse.findByIdAndUpdate(
      { _id: id },
      {
        ...req.body,
      },
      {
        new: true,
      }
    );

    if (!verse) {
      res.status(400).json({ error: "Verse not found" });
    }

    res.status(200).json(verse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// delete one
const deleteVerse = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "No item found" });
  }

  try {
    const verse = await Verse.findByIdAndDelete({ _id: id });

    if (!verse) {
      res.status(400).json({ error: "Verse not found" });
    }

    res.status(200).json(verse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// get all
const getVersesPaginated = async (req, res) => {
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
  query = Verse.find(JSON.parse(queryStr));

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

  const verses = await query;

  let count = await Verse.find({
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
    records: verses,
  });
};

module.exports = {
  getVerses,
  getVerse,
  createVerse,
  updateVerse,
  deleteVerse,
  getVersesPaginated,
};
