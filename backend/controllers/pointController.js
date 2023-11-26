const mongoose = require("mongoose");

const Point = require("../models/pointModel");

// get all
const getPoints = async (req, res) => {
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
  query = Point.find(JSON.parse(queryStr));

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

  const points = await query;

  res.status(200).json({
    records: points,
  });
};

// get one
const getPoint = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "No item found" });
  }

  const point = await Point.findById(id);

  if (!point) {
    return res.status(400).json({ error: "No item found" });
  }

  const prevPoint = await Point.findOne({
    sermonId: point.sermonId,
    order: point.order - 1,
  });

  const nextPoint = await Point.findOne({
    sermonId: point.sermonId,
    order: point.order + 1,
  });

  const prevPointId = prevPoint ? prevPoint._id : null;
  const nextPointId = nextPoint ? nextPoint._id : null;

  const data = { ...point.toObject(), prevPointId, nextPointId };

  res.status(200).json(data);
};

// create one
const createPoint = async (req, res) => {
  const { order, sermonId, title } = req.body;

  if (!order) {
    return res.status(400).json({ error: "order is required" });
  }

  if (!sermonId) {
    return res.status(400).json({ error: "sermonId address is required" });
  }

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    const point = await Point.create({
      order,
      sermonId,
      title,
    });

    res.status(201).json(point);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// update one
const updatePoint = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "No item found" });
  }

  try {
    const point = await Point.findByIdAndUpdate(
      { _id: id },
      {
        ...req.body,
      },
      {
        new: true,
      }
    );

    if (!point) {
      res.status(400).json({ error: "Point not found" });
    }

    res.status(200).json(point);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// delete one
const deletePoint = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "No item found" });
  }

  try {
    const point = await Point.findByIdAndDelete({ _id: id });

    if (!point) {
      res.status(400).json({ error: "Point not found" });
    }

    res.status(200).json(point);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// get all
const getPointsPaginated = async (req, res) => {
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
  query = Point.find(JSON.parse(queryStr));

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

  const points = await query;

  let count = await Point.find({
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
    records: points,
  });
};

module.exports = {
  getPoints,
  getPoint,
  createPoint,
  updatePoint,
  deletePoint,
  getPointsPaginated,
};
