const sgMail = require('@sendgrid/mail');

const dotenv = require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendSGMail = async ({
  recipient,
  sender,
  subject,
  text,
  html,
  attachments,
}) => {
  try {
    const from = sender || 'lukechidubem@gmail.com';

    const msg = {
      to: recipient, // email of recipient
      from: from, // email of sender, that is verified sender
      subject,
      html,
      text,
      attachments,
    };

    return sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent');
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error) {
    console.log(error);
  }
};

exports.sendMail = async (args) => {
  if (process.env.NODE_ENV !== 'development') {
    return new Promise.resolve();
  } else {
    return sendSGMail(args);
  }
};
