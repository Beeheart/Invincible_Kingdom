const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database('./sovereign_mind.db', (err) => {
    if (err) console.error("❌ Database Error:", err.message);
    else console.log("✅ Sovereign Database Connected.");
});

// 🏗️ Database එක සහ ටෙස්ට් යූසර් කෙනෙක් හැදීම
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        dna_code TEXT PRIMARY KEY,
        last_completed_day INTEGER DEFAULT 0,
        last_protocol_type TEXT,
        start_date TEXT
    )`);

    // ටෙස්ට් කරන්න කෙනෙක් නැත්නම් විතරක් එක්කෙනෙක්ව ඇඩ් කරනවා
    db.get("SELECT count(*) as count FROM users", (err, row) => {
        if (row.count === 0) {
            db.run(`INSERT INTO users (dna_code, last_completed_day) VALUES (?, ?)`, 
            ['DNA-RIDMI-001', 0]);
            console.log("🎁 Test User Added: DNA-RIDMI-001");
        }
    });
});

app.get('/api/verify-dna/:code', (req, res) => {
    const dnaCode = req.params.code;
    db.get("SELECT * FROM users WHERE dna_code = ?", [dnaCode], (err, row) => {
        if (row) res.json({ success: true, data: row });
        else res.json({ success: false, message: "Invalid DNA Code" });
    });
});

app.post('/api/update-progress', (req, res) => {
    const { dna_code, day, type } = req.body;
    db.run(`UPDATE users SET last_completed_day = ?, last_protocol_type = ? WHERE dna_code = ?`, 
    [day, type, dna_code], function(err) {
        if (err) res.status(500).json({ success: false });
        else res.json({ success: true });
    });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Royal Server running on port ${PORT}`));