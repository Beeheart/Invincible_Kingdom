const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// 🗄️ Database එක හදමු
const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (dna_code TEXT PRIMARY KEY, current_day INTEGER)");
});

app.post('/api/verify', (req, res) => {
    const { code } = req.body;
    const validCode = "DNA-RIDMI-001"; 

    if (code === validCode) {
        db.get("SELECT current_day FROM users WHERE dna_code = ?", [code], (err, row) => {
            if (row) {
                res.json({ success: true, day: row.current_day });
            } else {
                db.run("INSERT INTO users (dna_code, current_day) VALUES (?, ?)", [code, 1]);
                res.json({ success: true, day: 1 });
            }
        });
    } else {
        res.status(401).json({ success: false, message: "Invalid DNA Passport" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Palace Server is LIVE on port ${PORT}`));