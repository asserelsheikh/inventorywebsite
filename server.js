const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup
const db = new sqlite3.Database('inventory.db');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create table
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            category TEXT NOT NULL
        )
    `);
});

// Routes
app.get('/api/items', (req, res) => {
    db.all('SELECT * FROM items ORDER BY id DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/items', (req, res) => {
    const { name, quantity, price, category } = req.body;
    
    if (!name || !quantity || !price || !category) {
        res.status(400).json({ error: 'All fields are required' });
        return;
    }

    db.run(
        'INSERT INTO items (name, quantity, price, category) VALUES (?, ?, ?, ?)',
        [name, quantity, price, category],
        function(err) {
            if (err) {
                res.status(500).json({
