const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const sermonSchema = new Schema(
  {
    seriesId: {
      type: Schema.Types.ObjectId,
      ref: "Series",
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
    notes: {
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

module.exports = mongoose.model("Sermon", sermonSchema);
