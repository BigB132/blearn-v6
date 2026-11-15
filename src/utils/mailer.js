const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD,
    },
})

async function sendVerificationCode(recipient, code) {
    try {
        const info = await transporter.sendMail({
            from: 'Blearn',
            to: recipient,
            subject: 'Your Blearn verification code',
            text: 'Yo wsg',
            html: `<a href="localhost:3000/api/auth/verify?token=${code}">Verify email</a><br>${code}`, //FIX TS
        })
        console.log('Verification code sent to', recipient);
    } catch (err) {
        console.error('Error sending email:', err)
    }
}

module.exports = { sendVerificationCode }