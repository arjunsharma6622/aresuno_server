const mongoose = require("mongoose");

const PackageBenefitsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: "Work",
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

module.exports = mongoose.model("PackageBenefits", PackageBenefitsSchema);
