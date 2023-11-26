const express = require("express");

const {
  getOpenings,
  getOpening,
  createOpening,
  updateOpening,
  deleteOpening,
  getOpeningsPaginated,
} = require("../controllers/openingController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/paginated", getOpeningsPaginated);
router.get("/", getOpenings);
router.get("/:id", getOpening);
router.post("/", createOpening);
router.patch("/:id", updateOpening);
router.delete("/:id", deleteOpening);

module.exports = router;
