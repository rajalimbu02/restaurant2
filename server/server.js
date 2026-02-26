const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const auth = require('./auth');
const menu = require('./menu');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
    origin: `http://localhost:${PORT}`,
    credentials: true
}));
app.use(express.json());

// Session configuration
app.use(session({
    secret: 'taplejung-sekuwa-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Serve static files
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/staff', express.static(path.join(__dirname, '../staff')));

// Redirect root to public
app.get('/', (req, res) => {
    res.redirect('/public/index.html');
});

// ===== PUBLIC ROUTES =====
app.get('/api/public/menu', menu.getMenu);

// ===== AUTHENTICATION ROUTES =====
app.post('/api/auth/login', auth.login);
app.post('/api/auth/logout', auth.logout);
app.get('/api/auth/user', auth.getCurrentUser);

// ===== STAFF ROUTES (Authentication required) =====
app.use('/api/staff/*', auth.requireAuth);

app.post('/api/staff/menu/add', menu.addMenuItem);
app.put('/api/staff/menu/update/:id', menu.updateMenuItem);
app.delete('/api/staff/menu/delete/:id', menu.deleteMenuItem);

// Manager-only routes
app.get('/api/staff/users', auth.requireManager, (req, res) => {
    const db = require('./db');
    db.all('SELECT id, name, email, role, created_at FROM staff', [], (err, users) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch users' });
        }
        res.json(users);
    });
});

app.post('/api/staff/users/add', auth.requireManager, auth.addStaffUser);
app.put('/api/staff/users/change-password', auth.requireAuth, auth.changePassword);
app.delete('/api/staff/users/:id', auth.requireManager, auth.deleteStaffUser);

// Create default admin account
auth.createDefaultAdmin();

// Start server
app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`========================================`);
    console.log(`Public Website: http://localhost:${PORT}/public/index.html`);
    console.log(`Staff Login: http://localhost:${PORT}/staff/login.html`);
    console.log(`========================================\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    process.exit(0);
});
