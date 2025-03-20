const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobileNumber: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  subscription: { type: String, enum: ["free", "premium"], default: "free" },
  expiry: { type: Date },
  grandAuditLimit: { type: Number, default: 0 },
  userIcon: {type: String}
}, { timestamps: true, default: 'https://res.cloudinary.com/dir5lv73s/image/upload/v1742455852/userProfile/3_1_absxgl.png' });

module.exports = mongoose.model("User", userSchema);
