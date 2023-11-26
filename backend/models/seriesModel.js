const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const seriesSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Series", seriesSchema);
