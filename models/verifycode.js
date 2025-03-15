const mongoose = require("mongoose");

const verifySchema = new mongoose.Schema({
    betId: { type: String, required: true }, 
    verifyCode: { type: String, unique: true }  // Ensure verifyCode is unique
});
const VerifyModel = mongoose.model("VerifyCode", verifySchema);