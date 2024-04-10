const mongoose = require("mongoose");

const PackageSchema = new mongoose.Schema(
  {
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["service", "doctor", "manufacturer"],
      default: "service",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Package", PackageSchema);
