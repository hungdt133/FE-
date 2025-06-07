const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

const userSchema = new mongoose.Schema({
  login_name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  location: { type: String, default: '' },
  description: { type: String, default: '' },
  occupation: { type: String, default: '' }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

// Generate JWT token
userSchema.methods.generateToken = function() {
  const token = jwt.sign(
    { 
      _id: this._id,
      login_name: this.login_name,
      first_name: this.first_name
    }, 
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  return token;
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);