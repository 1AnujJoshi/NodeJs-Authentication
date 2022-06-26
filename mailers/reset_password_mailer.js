const nodemailer = require("../config/nodemailer");
require("dotenv").config();

exports.resetPassword = (user, token) => {
  let htmlString = nodemailer.renderTemplate(
    { user, token },
    "/reset_password/reset_mail.ejs"
  );

  nodemailer.transporter.sendMail(
    {
      from: process.env.From_Email,
      to: user.email,
      subject: "Reset Your Password",
      html: htmlString,
    },
    (err, info) => {
      if (err) {
        console.log("Error in sending the mail", err);
        return;
      }

      console.log("Message sent", info);
      return;
    }
  );
};
