const Url = require("../models/Url");
const redisClient = require("../config/redisClient");



// Redirection Endpoint
exports.redirectUrl = async (req, res) => {
  const { shortCode } = req.params;

  try {
    // Check Redis cache first
    const cachedUrl = await redisClient.get(shortCode);

    if (cachedUrl) {
      // Crucially: Update click counter even on cache hit
      // I do this asynchronously so I don't block the redirect
      Url.findOneAndUpdate({ shortCode }, { $inc: { clicks: 1 } }).exec();

      return res.redirect(cachedUrl);
    }

    // If not in Redis, look in Database
    const url = await Url.findOne({ shortCode });

    if (url) {
      // Store in Redis for future requests
      await redisClient.set(shortCode, url.longUrl, {
        EX: 3600, // Set expiration (e.g., 1 hour) to keep cache fresh
      });

      // Update click count
      url.clicks++;
      await url.save();

      return res.redirect(url.longUrl);
    } else {
      // Error Handling: 404 Not Found 
      return res.status(404).json({
        status: "error",
        message: "No URL found",
        data: null,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status:"error",
      message:"Server Error",
      data:null
    });
  }
};

