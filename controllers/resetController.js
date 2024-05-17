const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/user");

require("dotenv").config();

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_RESET_USER,
    pass: process.env.EMAIL_RESET_PASS,
  },
});

const sendResetEmail = (email, token) => {
  // Replace with host URL when you leave localhost and move to a hosting service.
  const resetUrl = `http://localhost:9001/reset-password?token=${token}`;

  let mailOptions = {
    from: process.env.EMAIL_RESET_USER,
    to: email,
    subject: "Password Reset",
    text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
    html: `<p>You requested a password reset. Click the link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`,
  };

  // Returns an error if failed or the info object if successful
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log("Error sending email:", error);
    }
    console.log("Message sent successfully:", info.messageId);
  });
};

exports.requestPasswordReset = async (req, res) => {
  const email = req.body.email;

  const token = crypto.randomBytes(20).toString("hex");
  console.log("Generated token:", token);

  try {
    const newUser = await User.saveResetToken(email, token);
    console.log("New user:", newUser);

    sendResetEmail(email, token);
    res.send("Reset email sent successfully");
  } catch (err) {
    console.error("Reset email not sent:", err);
    res.status(500).send("Error saving reset token");
  }
};

exports.resetPassword = async (req, res) => {
  const token = req.body.token;
  const newPassword = req.body.password;

  try {
    await User.resetPassword(token, newPassword);
    res.send("Password reset worked!");
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).send("Error resetting password :(");
  }
};
