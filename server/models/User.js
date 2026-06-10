const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_.@]+$/,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  name: String,
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  registeredContests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest',
  }],
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
