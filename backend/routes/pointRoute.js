const express = require("express");

const {
  getPoints,
  getPoint,
  createPoint,
  updatePoint,
  deletePoint,
  getPointsPaginated,
} = require("../controllers/pointController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/paginated", getPointsPaginated);
router.get("/", getPoints);
router.get("/:id", getPoint);
router.post("/", createPoint);
router.patch("/:id", updatePoint);
router.delete("/:id", deletePoint);

module.exports = router;
