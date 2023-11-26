const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const pointSchema = new Schema(
  {
    sermonId: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Point", pointSchema);
