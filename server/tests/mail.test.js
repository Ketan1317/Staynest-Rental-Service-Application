require("dotenv").config();
const { sendMail } = require("../services/mail.service");

(async () => {
  try {
    const info = await sendMail({
      to: "ketan1190.becse24@chitkara.edu.in",
      subject: "Mail Service Test",
      text: "This is a test email from StayNest",
      html: "<b>This is a test email from StayNest</b>",
    });

    console.log("Mail sent successfully");
    console.log("Message ID:", info.messageId);
  } catch (err) {
    console.error("Mail test failed:", err.message);
  }
})();
