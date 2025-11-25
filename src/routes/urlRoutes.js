const express = require("express");
const router = express.Router();
const { shortenUrl } = require("../controllers/urlController");
const { redirectUrl } = require("../controllers/redirectController");
const { getAnalytics } = require("../controllers/analyticsController");


router.post("/api/v1/shorten", shortenUrl);
router.get("/:shortCode", redirectUrl);
router.get("/api/v1/analytics/:shortCode", getAnalytics);

module.exports = router;
