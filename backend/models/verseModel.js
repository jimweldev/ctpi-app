const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const verseSchema = new Schema(
  {
    pointId: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
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

module.exports = mongoose.model("Verse", verseSchema);
