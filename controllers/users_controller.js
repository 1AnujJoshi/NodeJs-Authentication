const User = require("../models/user");
const resetToken = require("../models/token");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const resetPassMailer = require("../mailers/reset_password_mailer");
const bcryptSalt = process.env.BCRYPT_SALT;

//render user profile page
module.exports.profile = function (req, res) {
  User.findById(req.params.id, function (err, user) {
    if (err) {
      console.log("err", error);
    }
    return res.render("user_profile", {
      title: "User Profile",
      profile_user: user,
    });
  });
};

// render the sign up page
module.exports.signUp = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/profile");
  }
  return res.render("user_sign_up", {
    title: "NodeJS | Sign Up",
  });
};

// render the sign in page
module.exports.signIn = async function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/profile");
  }
  return res.render("user_sign_in", {
    title: "NodeJS | Sign In",
  });
};

//get the sign up data and create a user
module.exports.create = function (req, res) {
  if (req.body.password != req.body.confirm_password) {
    req.flash("error", "Password and Confirm Password did'nt match!!");
    return res.redirect("back");
  }

  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) {
      console.log("error in finding user in signing up");
      return;
    }
    if (!user) {
      User.create(req.body, function (err, user) {
        if (err) {
          console.log("error in creating user while signing up");
          return;
        }

        return res.redirect("/users/sign-in");
      });
      req.flash("success", "You have successfully signed up!");
    } else {
      return res.redirect("back");
    }
  });
};

// sign in and create a session for the user
module.exports.createSession = function (req, res) {
  req.flash("success", "Logged in Successfully");
  return res.redirect("/");
};

//log out and destroy session for the user
module.exports.destroySession = function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "You have logged out!");
    res.redirect("/");
  });
};

//update user's information
module.exports.update = async function (req, res) {
  if (req.user.id == req.params.id) {
    try {
      if (req.body.password == "") {
        delete req.body.password;
      } else {
        req.body.password = await bcrypt.hash(req.body.password, 10);
      }
      User.findByIdAndUpdate(req.params.id, req.body, function (err, user) {
        req.flash("success", "Profile Updated Successfully!!");
        return res.redirect("back");
      });
    } catch (err) {
      req.flash("error", err);
      return res.redirect("back");
    }
  } else {
    req.flash("error", "Unauthorized!");
    return res.redirect("back");
  }
};

//render forgot password page
module.exports.forgotPassword = function (req, res) {
  return res.render("forgot_password", {
    title: "Forgot Password",
  });
};

//send email to user with token to reset password
module.exports.forgotPasswordEmail = function (req, res) {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) {
      console.log("Error ", err);
      return;
    }
    if (user) {
      resetToken.create(
        {
          user: user._id,
          token: crypto.randomBytes(20).toString("hex"),
        },
        function (err, token) {
          resetPassMailer.resetPassword(user, token);

          return res.render("mail-sent", {
            title: "Success",
          });
        }
      );
    } else {
      req.flash("error", "User Not Found");
      return res.redirect("back");
    }
  });
};

//check validity of token and render page to reset password of user
module.exports.resetPassword = function (req, res) {
  resetToken.findOne({ token: req.params.access_token }, function (err, token) {
    if (err) {
      console.log("Error ", err);
      return;
    }
    return res.render("reset_password", {
      title: "Reset Password",
      token,
    });
  });
};

//check if token is valid and update user's password
module.exports.resetPasswordToken = function (req, res) {
  if (req.body.password != req.body.confirm_password) {
    req.flash("error", "Confirm Password didn't match");
    return res.redirect("back");
  } else {
    resetToken.findOne(
      { token: req.params.access_token },
      async function (err, token) {
        token.isValid = false;
        await token.save();
        req.body.password = await bcrypt.hash(
          req.body.password,
          Number(bcryptSalt)
        );
        User.findByIdAndUpdate(token.user, req.body, function (err, user) {
          req.flash("success", "Password Changed Successfully");
          return res.redirect("/users/sign-in");
        });
      }
    );
  }
};
