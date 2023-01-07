const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

require('dotenv').config();

let transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
<<<<<<< HEAD
    // user: process.env.From_Email,
    user: "anujjoshi.81.aj@gmail.com",
=======
    user: process.env.From_Email,
>>>>>>> cfd6a36f93d1e5b22c877ce964bf14f9e2588eac
    pass: process.env.app_Password,
  },
});

let renderTemplate = (data, relativePath) => {
  let mailHTML;
  ejs.renderFile(
    path.join(__dirname, '../views/mailers', relativePath),
    data,
    function (err, template) {
      if (err) {
        console.log('error in rendering template', err);
        return;
      }

      mailHTML = template;
    }
  );
  return mailHTML;
};

module.exports = {
  transporter,
  renderTemplate,
};
