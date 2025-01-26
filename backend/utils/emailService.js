const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "seu-email@gmail.com",
        pass: "sua-senha-app",
    },
});

async function sendEmail(to, subject, text) {
    await transporter.sendMail({
        from: '"Notificador de Euro" <seu-email@gmail.com>',
        to,
        subject,
        text,
    });
}

module.exports = sendEmail;
