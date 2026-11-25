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

function verificationEmailHTML(username, code) { 
    return `
        <!DOCTYPE html>
        <html>
            <head>
                <style>
                    body {
                        background-color: #023047;
                        font-family: Roboto, sans-serif;
                        color: #fff;
                    }
                    h1 {
                        text-align: center;
                        font-family: Roboto, sans-serif;
                        color: #fff;
                    }
                    p {
                        font-family: Roboto, sans-serif;
                        color: #fff;
                    }
                    .box {
                        background-color: #064666;
                        justify-content: center;
                        border: 4px solid #219ebc;
                        border-radius: 16px;
                        padding: 8px;
                    }
                    .num-box {
                        background-color: #04283a;
                        display: grid;
                        justify-content: center;
                        align-items: center;
                        border-radius: 16px;
                    }
                    .yellow {
                        color: #ffb703;
                    }
                    .big-yellow {
                        color: #ffb703;
                        font-size: 32px;
                        font-weight: bold;
                        margin: 24px;
                        text-align: center;
                    }
                    .subtitle {
                        color: #8b8b8b;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <span style="opacity: 0"> Blearn email verification - </span>
                <div class="box">
                    <h1>Verify your <span class="yellow">Blearn</span> account</h1>
                    <p>
                        Hey ${username},
                        <br><br>
                        thanks for signing up at <span class="yellow">Blearn</span>!
                        Please use the following verification code to finish the signup process:
                    </p>
                    <div class="num-box">
                        <span class="big-yellow">${code}</span>
                    </div>
                    <p class="subtitle">
                        Do not share this code with anyone.
                        If you did not signup at Blearn, please ignore this email.
                    </p>
                </div>
                <span style="opacity: 0"> {{ Bye }} </span>
            </body>
        </html>
    `
}

async function sendVerificationCode(recipient, username, code) {
    try {
        const info = await transporter.sendMail({
            from: 'Blearn',
            to: recipient,
            subject: 'Verify your Blearn email',
            text: 'Welcome at Blearn! This is your verification code: ' + code,
            html: verificationEmailHTML(username, code)
        })
        console.log('Verification code sent to', recipient);
    } catch (err) {
        console.error('Error sending email:', err)
    }
}

module.exports = { sendVerificationCode }