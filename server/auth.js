// Authentication middleware and utilities
const bcrypt = require('bcryptjs');
const db = require('./db');

// Hash password
async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

// Verify password
async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

// Login handler
function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    db.get('SELECT * FROM staff WHERE email = ?', [email], async (err, user) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Server error' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await verifyPassword(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Set session
        req.session.userId = user.id;
        req.session.role = user.role;
        req.session.name = user.name;

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    });
}

// Logout handler
function logout(req, res) {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
}

// Check if authenticated
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

// Check if manager
function requireManager(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    if (req.session.role !== 'manager') {
        return res.status(403).json({ error: 'Manager access required' });
    }
    next();
}

// Get current user
function getCurrentUser(req, res) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    db.get('SELECT id, name, email, role FROM staff WHERE id = ?', [req.session.userId], (err, user) => {
        if (err || !user) {
            return res.status(500).json({ error: 'User not found' });
        }
        res.json(user);
    });
}

// Create default admin account (for initial setup)
async function createDefaultAdmin() {
    const defaultEmail = 'admin@taplejung.com';
    const defaultPassword = 'admin123'; // Change this immediately after first login!

    db.get('SELECT * FROM staff WHERE email = ?', [defaultEmail], async (err, user) => {
        if (!user) {
            const hash = await hashPassword(defaultPassword);
            db.run(
                'INSERT INTO staff (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
                ['Admin', defaultEmail, hash, 'manager'],
                (err) => {
                    if (!err) {
                        console.log('Default admin created: admin@taplejung.com / admin123');
                        console.log('⚠️  CHANGE PASSWORD IMMEDIATELY!');
                    }
                }
            );
        }
    });
}

// Add new staff user (manager only)
function addStaffUser(req, res) {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['clerk', 'manager'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if email already exists
    db.get('SELECT * FROM staff WHERE email = ?', [email], async (err, existingUser) => {
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hash = await hashPassword(password);
        db.run(
            'INSERT INTO staff (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [name, email, hash, role],
            function(err) {
                if (err) {
                    console.error('Error adding staff:', err);
                    return res.status(500).json({ error: 'Failed to add staff user' });
                }

                res.json({
                    success: true,
                    message: 'Staff user added successfully',
                    id: this.lastID
                });
            }
        );
    });
}

// Change password
function changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    const userId = req.session.userId;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current and new password required' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    db.get('SELECT * FROM staff WHERE id = ?', [userId], async (err, user) => {
        if (err || !user) {
            return res.status(500).json({ error: 'User not found' });
        }

        const validPassword = await verifyPassword(currentPassword, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        const newHash = await hashPassword(newPassword);
        db.run('UPDATE staff SET password_hash = ? WHERE id = ?', [newHash, userId], (err) => {
            if (err) {
                console.error('Error updating password:', err);
                return res.status(500).json({ error: 'Failed to update password' });
            }

            res.json({
                success: true,
                message: 'Password changed successfully'
            });
        });
    });
}

// Delete staff user (manager only)
function deleteStaffUser(req, res) {
    const { id } = req.params;
    const currentUserId = req.session.userId;

    if (parseInt(id) === currentUserId) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    db.run('DELETE FROM staff WHERE id = ?', [id], function(err) {
        if (err) {
            console.error('Error deleting staff:', err);
            return res.status(500).json({ error: 'Failed to delete staff user' });
        }

        res.json({
            success: true,
            message: 'Staff user deleted successfully'
        });
    });
}

module.exports = {
    hashPassword,
    verifyPassword,
    login,
    logout,
    requireAuth,
    requireManager,
    getCurrentUser,
    createDefaultAdmin,
    addStaffUser,
    changePassword,
    deleteStaffUser
};
