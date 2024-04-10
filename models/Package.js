const mongoose = require("mongoose");

const PackageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    prevPrice: {
      type: Number,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["service", "doctor", "manufacturer"],
      default: "service",
    },
    features: {
      type: Array,
      required: true,
      default: [false, false, false, false, false, false, false, false],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Package", PackageSchema);
