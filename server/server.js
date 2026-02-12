const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increase limit for large save files
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from the parent directory (project root)
app.use(express.static(path.join(__dirname, '../')));

// API Routes
app.use('/api', routes);

// Fallback to index.html for SPA-like behavior (optional, but good for robust routing)
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
