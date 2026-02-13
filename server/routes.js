const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./database');

const router = express.Router();
const SECRET_KEY = 'your_secret_key_here'; // In production, use environment variables

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Register
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `INSERT INTO users (username, password_hash) VALUES (?, ?)`;

        db.run(sql, [username, hashedPassword], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ error: 'Username already exists' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = `SELECT * FROM users WHERE username = ?`;
    db.get(sql, [username], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        try {
            if (await bcrypt.compare(password, user.password_hash)) {
                const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
                res.json({ token, username: user.username });
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
});

// Save Game Data
router.post('/save', authenticateToken, (req, res) => {
    const { data } = req.body;
    const userId = req.user.id;

    if (!data) return res.status(400).json({ error: 'No data provided' });

    // Backup logic
    db.get('SELECT data_json FROM saves WHERE user_id = ?', [userId], (err, row) => {
        if (!err && row) {
            db.run('INSERT INTO backups (user_id, data_json) VALUES (?, ?)', [userId, row.data_json], (backupErr) => {
                if (!backupErr) {
                    // Keep only last 3 backups
                    db.run(`DELETE FROM backups WHERE user_id = ? AND id NOT IN (
                        SELECT id FROM backups WHERE user_id = ? ORDER BY created_at DESC LIMIT 3
                    )`, [userId, userId]);
                }
            });
        }
    });

    const sql = `INSERT OR REPLACE INTO saves (user_id, data_json, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)`;

    db.run(sql, [userId, JSON.stringify(data)], function (err) {
        if (err) return res.status(500).json({ error: err.message });

        // Sync to JSON file
        const fs = require('fs');
        const path = require('path');
        const savesDir = path.resolve(__dirname, '../saves');

        if (!fs.existsSync(savesDir)) {
            fs.mkdirSync(savesDir, { recursive: true });
        }

        // Fetch username for filename
        db.get('SELECT username FROM users WHERE id = ?', [userId], (uErr, uRow) => {
            if (!uErr && uRow) {
                const filePath = path.join(savesDir, `${uRow.username}.json`);
                fs.writeFile(filePath, JSON.stringify(data, null, 2), (wErr) => {
                    if (wErr) console.error('Error syncing save to file:', wErr);
                });
            }
        });

        res.json({ message: 'Game saved successfully' });
    });
});

// Load Game Data
router.get('/save', authenticateToken, (req, res) => {
    const userId = req.user.id;

    const sql = `SELECT data_json FROM saves WHERE user_id = ?`;
    db.get(sql, [userId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'No save data found' });

        res.json({ data: JSON.parse(row.data_json) });
    });
});

module.exports = router;
