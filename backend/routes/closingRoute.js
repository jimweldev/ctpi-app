const express = require("express");

const {
  getClosings,
  getClosing,
  createClosing,
  updateClosing,
  deleteClosing,
  getClosingsPaginated,
} = require("../controllers/closingController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/paginated", getClosingsPaginated);
router.get("/", getClosings);
router.get("/:id", getClosing);
router.post("/", createClosing);
router.patch("/:id", updateClosing);
router.delete("/:id", deleteClosing);

module.exports = router;
