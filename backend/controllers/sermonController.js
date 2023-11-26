const mongoose = require("mongoose");

const Sermon = require("../models/sermonModel");

// get all
const getSermons = async (req, res) => {
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
  query = Sermon.find(JSON.parse(queryStr));

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

  // Populate series title
  query = query.populate({
    path: "seriesId",
    select: "title",
  });

  const sermons = await query;

  res.status(200).json({
    records: sermons,
  });
};

// get one
const getSermon = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "No item found" });
  }

  const sermon = await Sermon.findById(id).populate({
    path: "seriesId",
    select: "title",
  });

  if (!sermon) {
    return res.status(400).json({ error: "No item found" });
  }

  res.status(200).json(sermon);
};

// create one
const createSermon = async (req, res) => {
  const { date, seriesId, title, description, notes } = req.body;

  if (!date) {
    return res.status(400).json({ error: "Date address is required" });
  }

  if (!seriesId) {
    return res.status(400).json({ error: "SeriesId address is required" });
  }

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  if (!description) {
    return res.status(400).json({ error: "Description is required" });
  }

  if (!notes) {
    return res.status(400).json({ error: "Notes is required" });
  }

  try {
    const sermon = await Sermon.create({
      date,
      seriesId,
      title,
      description,
      notes,
    });

    res.status(201).json(sermon);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// update one
const updateSermon = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "No item found" });
  }

  try {
    const sermon = await Sermon.findByIdAndUpdate(
      { _id: id },
      {
        ...req.body,
      },
      {
        new: true,
      }
    );

    if (!sermon) {
      res.status(400).json({ error: "Sermon not found" });
    }

    res.status(200).json(sermon);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// delete one
const deleteSermon = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "No item found" });
  }

  try {
    const sermon = await Sermon.findByIdAndDelete({ _id: id });

    if (!sermon) {
      res.status(400).json({ error: "Sermon not found" });
    }

    res.status(200).json(sermon);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// get all
const getSermonsPaginated = async (req, res) => {
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
  query = Sermon.find(JSON.parse(queryStr));

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

  const sermons = await query;

  let count = await Sermon.find({
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
    records: sermons,
  });
};

module.exports = {
  getSermons,
  getSermon,
  createSermon,
  updateSermon,
  deleteSermon,
  getSermonsPaginated,
};
