const Url = require("../models/Url");

// Analytics Endpoint
exports.getAnalytics = async (req, res) => {
  const { shortCode } = req.params;

  try {
    const url = await Url.findOne({ shortCode });

    if (url) {
      // Return total number of clicks
      return res.status(200).json({
        status: "success",
        message: "data successfully fetched",
        data: {
          shortCode: url.shortCode,
          totalClicks: url.clicks,
          longUrl: url.longUrl,
        },
      });
    } else {
      return res.status(404).json({
        status: "error",
        message: "No URL found",
        data: null,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Server Error",
      data: null,
    });
  }
};
