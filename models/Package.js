const mongoose = require("mongoose");

const PackageSchema = new mongoose.Schema(
  {
    price: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Package", PackageSchema);
