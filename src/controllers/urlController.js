const Url = require("../models/Url");
const { nanoid } = require("nanoid");
const constant = require("../config/constant")

// 1. Shorten URL Endpoint
exports.shortenUrl = async (req, res) => {
  const { longUrl } = req.body;
  const baseUrl = constant.BASE_URL;

  // Simple validation
  if (!longUrl) {
    return res.status(401).json({
      status: "error",
      message: "Invalid URL",
      data: null,
    });
  }

  try {
    // Check if URL already exists to prevent duplicates (Optional optimization)
    let url = await Url.findOne({ longUrl });

    if (url) {
      return res.status(200).json({
        status: "success",
        message: "data successfully fetched",
        data: {
          shortUrl: `${baseUrl}/${url.shortCode}`,
          originalUrl: url.longUrl,
        },
      });
    }

    // Generate unique 6-char code
    const shortCode = nanoid(6);

    url = new Url({
      longUrl,
      shortCode,
      clicks: 0,
    });

    await url.save(); // Store mapping in MongoDB

    return res.status(200).json({
      status: "success",
      message: "data successfully saved",
      data: {
        shortUrl: `${baseUrl}/${shortCode}`,
        originalUrl: longUrl, // Return generated short URL and original
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Server Error",
      data: null,
    });
  }
};
