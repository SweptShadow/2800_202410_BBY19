const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date }
});

// saves the reset token for a password reset as an attribute for the user in the database
userSchema.statics.saveResetToken = async function(email, token) {
  const tokenExpiry = Date.now() + 3600000; 

  return this.findOneAndUpdate(
    { email },
    { resetToken: token, resetTokenExpiry: tokenExpiry },
    { new: true }
  ).exec();
};

// allows the token to be used to reset the password
userSchema.statics.resetPassword = async function(token, newPassword) {
  const user = await this.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } }).exec();
  if (!user) {
    throw new Error('Reset token is invalid or has expired');
  }

  user.password = newPassword; 
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();
};

module.exports = mongoose.model('User', userSchema);
