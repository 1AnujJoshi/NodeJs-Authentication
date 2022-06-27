const express = require('express');
const router = express.Router();
const passport = require('passport');

const usersController = require('../controllers/users_controller');

router.get('/profile/', passport.checkAuthentication, usersController.profile);
router.post(
  '/update/:id',
  passport.checkAuthentication,
  usersController.update
);
router.get('/sign-up', usersController.signUp);
router.get('/sign-in', usersController.signIn);
router.get('/sign-out', usersController.destroySession);
router.post('/create', usersController.create);

// use passport as a middleware to authenticate
router.post(
  '/create-session',
  passport.authenticate('local', { failureRedirect: '/users/sign-in' }),
  usersController.createSession
);

//routes for google sign-in/sign-up
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/users/sign-in' }),
  usersController.createSession
);

//for reset password functionality
router.get('/forgot-password', usersController.forgotPassword);
router.post('/forgot-password', usersController.forgotPasswordEmail);
router.get('/reset_password/:access_token', usersController.resetPassword);
router.post(
  '/reset_password/:access_token',
  usersController.resetPasswordToken
);
module.exports = router;
