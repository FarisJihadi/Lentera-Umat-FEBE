const dotenv = require("dotenv");
dotenv.config();

const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers["apikey"];
  const validApiKey = process.env.API_KEY;

  if (!apiKey) {
    return res.status(401).json({ message: "API Key is missing" });
  }

  if (apiKey !== validApiKey) {
    return res.status(403).json({ message: "Invalid API Key" });
  }

  next();
};

module.exports = apiKeyMiddleware;
