const express = require('express');
const authRouter = express.Router();

const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const bcrypt = require('bcrypt');
const BCRYPT_ROUNDS = 12
const jwt = require('jsonwebtoken')

const mailer = require('../utils/mailer')

const User = require('../models/userModel')

authRouter.get('/', (req, res) => {
    res.send('This is auth')
})

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    message: { error: 'Too many attemps. Please try again later.'}
})

const registerSchema = z.object({
    email: z.string().trim().toLowerCase().email("Invalid email address"),
    password: z.string().min(8, 'Password must be atleast 8 characters').max(32, 'Password must not exceed 128 characters.'),
    username: z.string().trim().min(1).max(100),
})

const loginSchema = z.object({
    email: z.email().max(255),
    password: z.string().trim().min(8).max(32)
})

function setAuthCookie(res, userId) {
    const token = jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
        expiresIn: '15m',
        algorithm: 'HS256'
    });

    res.cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
        path: '/'
    });
}

const DUMMY_HASH = 'invalidhashinvalidhashinvalidhashinvalidhashinvalidhashinvalidhash'


authRouter.post('/register', authLimiter, async (req, res) => {

    try {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: parsed.error.flatten().fieldErrors
            })
        }

        const { email, password, username } = parsed.data;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'This email is already taken.' })
        }

        const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

        const emailToken = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

        mailer.sendVerificationCode(email, username, emailToken);
        
        const newUser = new User({
            email,
            password: passwordHash,
            username,
            emailToken,
        });
        await newUser.save();
        console.log('New user created:', newUser)
        res.cookie('userId', newUser.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        })
        
        setAuthCookie(res, newUser.id);
        return res.status(201).json({ state: 'success' });

    } catch (err) {

        console.error('Signup error:', err)
        return res.status(500).json({ error: 'Internal server error' })

    }
})

authRouter.post('/login', authLimiter, async (req, res) => {
    try {

        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'WTH are you doing'})
        }
        
        const { email, password } = parsed.data;

        const user = await User.findOne({ email });

        const targetHash = user ? user.password : DUMMY_HASH;
        const isPasswordValid = await bcrypt.compare(password, targetHash);

        if (!user || !isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password.'})
        }

        setAuthCookie(res, user.id);
        return res.status(200).json({ state: 'success' });

    } catch (err) {

        console.log('Login error:', err);
        return res.status(500).json({ error: 'Internal server error '})

    }
})

authRouter.post('/logout', (req, res) => {
    res.clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    });

    return res.status(200).json({ message: 'logged out' })
});

authRouter.post('/verify', async (req, res) => {
    const token = req.body?.token;
    console.log(token)

    if (!token || token.length != 6) {
        return res.status(404).json({ error: "No token provided!"})
    }

    console.log(req.cookies.userId)
    const user = await User.findOne({ _id: req.cookies.userId, emailToken: token })

    if (user) {

        if (user.emailVerified) {
            return res.status(200).json({ state: "email already verified" })
        }

        user.emailVerified = true;
        await user.save();

        return res.status(200).json({ state: "success" })
    } else {
        return res.status(404).json({ error: "Wrong code"});
    }
})

async function authenticate(req, res, next) {
    const token = req.cookies.access_token;
    if (!token) {
        console.log("no token")
        req.authenticated = false;
        return next();
    }
    
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })
        req.userId = payload.sub;
        req.authenticated  = true;

        const user = await User.findOne({_id: req.userId});

        if (!user.emailVerified) {
            return res.redirect("/auth/verify")
        }

        return next();
    } catch (err) {
        req.authenticated = false;
        console.log(err)
        return next();
    }
}


module.exports = { authRouter, authenticate };