const app = require("../src/app");
const connectDB = require("../src/config/db");

// Establish database connection when the serverless function boots up
connectDB();

module.exports = app;
