const express = require("express");

const {
  getVerses,
  getVerse,
  createVerse,
  updateVerse,
  deleteVerse,
  getVersesPaginated,
} = require("../controllers/verseController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/paginated", getVersesPaginated);
router.get("/", getVerses);
router.get("/:id", getVerse);
router.post("/", createVerse);
router.patch("/:id", updateVerse);
router.delete("/:id", deleteVerse);

module.exports = router;
