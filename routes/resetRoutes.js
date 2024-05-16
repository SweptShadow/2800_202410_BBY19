const express = require('express');
const router = express.Router();
const passwordResetController = require('../controllers/resetController');

router.get("/requestReset", (req, res) => {
    res.render("requestPassReset");
})

router.post('/requestReset', passwordResetController.requestPasswordReset);

router.get('/reset-password', (req, res) => {
    const token = req.query.token;
    res.render('resetPassword', { token });
});

router.post('/resetPassword', passwordResetController.resetPassword);

module.exports = router;
