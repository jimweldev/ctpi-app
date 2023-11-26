const express = require("express");

const {
  getSermons,
  getSermon,
  createSermon,
  updateSermon,
  deleteSermon,
  getSermonsPaginated,
} = require("../controllers/sermonController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/paginated", getSermonsPaginated);
router.get("/", getSermons);
router.get("/:id", getSermon);
router.post("/", createSermon);
router.patch("/:id", updateSermon);
router.delete("/:id", deleteSermon);

module.exports = router;
