const mongoose = require("mongoose");

const Series = require("../models/seriesModel");

// get all
const getAllSeries = async (req, res) => {
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
  query = Series.find(JSON.parse(queryStr));

  // search
  if (req.query.search) {
    query = query.find({
      $or: [
        {
          title: { $regex: search, $options: "i" },
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
    query = query.sort("-date");
  }

  const series = await query;

  res.status(200).json({
    records: series,
  });
};

// get one
const getSeries = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "No item found" });
  }

  const series = await Series.findById(id);

  if (!series) {
    return res.status(400).json({ error: "No item found" });
  }

  res.status(200).json(series);
};

// create one
const createSeries = async (req, res) => {
  const { date, title } = req.body;

  if (!date) {
    return res.status(400).json({ error: "Date is required" });
  }

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    const series = await Series.create({ date, title });

    res.status(201).json(series);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// update one
const updateSeries = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "No item found" });
  }

  try {
    const series = await Series.findByIdAndUpdate(
      { _id: id },
      {
        ...req.body,
      },
      {
        new: true,
      }
    );

    if (!series) {
      res.status(400).json({ error: "Series not found" });
    }

    res.status(200).json(series);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// delete one
const deleteSeries = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "No item found" });
  }

  try {
    const series = await Series.findByIdAndDelete({ _id: id });

    if (!series) {
      res.status(400).json({ error: "Series not found" });
    }

    res.status(200).json(series);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// get all
const getAllSeriesPaginated = async (req, res) => {
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
  query = Series.find(JSON.parse(queryStr));

  // search
  if (req.query.search) {
    query = query.find({
      $or: [
        {
          title: { $regex: search, $options: "i" },
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

  const series = await query;

  let count = await Series.find({
    $or: [
      {
        title: { $regex: search, $options: "i" },
      },
    ],
  }).countDocuments({});
  let pages = limit > 0 ? Math.ceil(count / limit) : 1;

  res.status(200).json({
    info: {
      count,
      pages,
    },
    records: series,
  });
};

module.exports = {
  getAllSeries,
  getSeries,
  createSeries,
  updateSeries,
  deleteSeries,
  getAllSeriesPaginated,
};
