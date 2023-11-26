const express = require("express");

const {
  getAllSeries,
  getSeries,
  createSeries,
  updateSeries,
  deleteSeries,
  getAllSeriesPaginated,
} = require("../controllers/seriesController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/paginated", getAllSeriesPaginated);
router.get("/", getAllSeries);
router.get("/:id", getSeries);
router.post("/", createSeries);
router.patch("/:id", updateSeries);
router.delete("/:id", deleteSeries);

module.exports = router;
