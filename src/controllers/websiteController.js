const express = require('express')
const path = require('path');

const websiteController = express.Router();
const { authenticate } = require('../controllers/authController');


function skipIfAuth(req, res, next) {
    if (req.authenticated) {
        return res.redirect('/dashboard');
    } else {
        return next();
    }
}

function requireAuth(req, res, next) {
    if (!req.authenticated) {
        return res.redirect('/auth/login');
    } else {
        return next();
    }
}

function serveWebsite(res, page) {
    res.sendFile(path.join(__dirname, page + '.html'))
}

websiteController.get('/', authenticate, skipIfAuth, (req, res) => { serveWebsite(res, '../pages/index') })

// AUTH
websiteController.get('/auth/register', authenticate, skipIfAuth, (req, res) => { serveWebsite(res, '../pages/auth/register') })
websiteController.get('/auth/login', authenticate, skipIfAuth, (req, res) => { serveWebsite(res, '../pages/auth/login') })
websiteController.get('/auth/verify', (req, res) => { serveWebsite(res, '../pages/auth/verify') })
websiteController.get('/auth/logout', (req, res) => { serveWebsite(res, '../pages/auth/logout') })

// MAIN MODULES
websiteController.get('/dashboard', authenticate, requireAuth, (req, res) => { serveWebsite(res, '../pages/dashboard') })
websiteController.get('/subjects', authenticate, requireAuth, (req, res) => { serveWebsite(res, '../pages/mainModules/subjects') })


module.exports = websiteController;