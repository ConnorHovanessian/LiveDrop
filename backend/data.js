
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// each thread uses this data structure 
const DataSchema = new Schema(
  {
    id: Number,
    message: String,
    timestamp: Date,
    latitude: Number,
    longitude: Number,
    children: [String] //Saves reference to children
  },
  { timestamps: true }
);

module.exports = mongoose.model("Data", DataSchema);