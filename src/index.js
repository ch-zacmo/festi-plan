require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
var logger = require('morgan');
const fs = require('fs');
const http = require('http');
const https = require('https');
const SSL_CERT_PATH = process.env.SSL_CERT_PATH;
const SSL_KEY_PATH = process.env.SSL_KEY_PATH;
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const MONGO_USER = process.env.MONGO_USER || 'user';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || 'password';

app.use(express.json());

/**
 * @description Setting up the logger for the application.
 * @param {string} format - The format of the logs.
 */
app.use(logger('dev'));

/** JSON parser */
app.use(express.json());

/** Body parser */
app.use(express.urlencoded({
    extended: true
}));

// serve the static files form public directory
app.use(express.static(path.join(__dirname, '../public')));


const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/user');

const checkRole = require('./middleware/checkRole');
const authenticateToken = require('./middleware/authenticateToken');

const userRouter = require('./routes/users');
const manifestationRouter = require('./routes/manifestations');

app.use('/api/users', userRouter);
app.use('/api/manifestations', manifestationRouter);

app.post('/register', async (req, res) => {
    const {
        username,
        password
    } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            password: hashedPassword,
            role: 'employee'
        });
        await user.save();
        res.status(201).json({
            message: 'User created'
        });
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
});

app.post('/login', async (req, res) => {
    const {
        username,
        password,
        rememberMe
    } = req.body;

    try {
        const user = await User.findOne({
            username
        }).select('+password');
        if (!user) return res.status(404).json({
            message: 'User not found'
        });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({
            message: 'Invalid credentials'
        });

        const token = jwt.sign({
            id: user._id,
            role: user.role,
            username: user.username
        }, 'SECRET_KEY', {
            expiresIn: rememberMe ? '7d' : '1d'
        });
        res.json({
            token
        });
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
});

// Route for logout
app.post('/logout', (req, res) => {
    // Si vous n'avez pas besoin de faire de nettoyage spécifique côté serveur,
    // vous pouvez simplement renvoyer un statut 200 pour confirmer la déconnexion
    res.status(200).json({
        message: 'Logged out successfully'
    });
});

// Route profile
app.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({
            message: 'User not found'
        });

        res.json({
            username: user.username
        });
    } catch (err) {
        res.status(500).json({
            message: 'Server error'
        });
    }
});


// 404 Route redirect to /404.html
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../public/404.html'));
});

let server;

function startServer() {
    if (SSL_CERT_PATH && SSL_KEY_PATH) {
        try {
            const cert = fs.readFileSync(SSL_CERT_PATH);
            const key = fs.readFileSync(SSL_KEY_PATH);
            console.log('Starting HTTPS server');
            server = https.createServer({ key, cert }, app);
        } catch (err) {
            console.error('Failed to start HTTPS server:', err);
            server = http.createServer(app);
        }
    } else {
        console.log('Starting HTTP server');
        server = http.createServer(app);
    }

    // Set up server listeners
    server.listen(PORT);

    server.on('error', onError);
    server.on('listening', onListening.bind(null, server));
}

mongoose.connect(MONGO_URI, {
    dbName: 'planning',
    user: MONGO_USER,
    pass: MONGO_PASSWORD
}).then(() => {
    console.log('MongoDB connected');
    startServer();
}).catch(err => {
    console.error(err);
    // Start server anyway if MongoDB fails (optional)
    startServer();
});
