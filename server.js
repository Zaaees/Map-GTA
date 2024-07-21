const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const dataDir = path.join(__dirname, '.data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const logosFilePath = path.join(dataDir, 'logos.json');

const app = express();

app.use(session({
    secret: process.env.SESSION_SECRET || 'Gruppe6Secret',
    resave: false,
    saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(express.static('public'));

// Charger les positions des logos depuis le fichier
let logos = {};
try {
    const data = fs.readFileSync(logosFilePath, 'utf8');
    logos = JSON.parse(data);
} catch (err) {
    console.log('No existing logos file, creating a new one');
    logos = {
'logo1': { color: 'transparent', left: '10%', top: '5%' },
'logo2': { color: 'transparent', left: '30%', top: '20%' },
'logo3': { color: 'transparent', left: '30%', top: '20%' },
'logo4': { color: 'transparent', left: '30%', top: '20%' },
'logo5': { color: 'transparent', left: '30%', top: '20%' },
'logo6': { color: 'transparent', left: '30%', top: '20%' },
'logo7': { color: 'transparent', left: '30%', top: '20%' },
'logo8': { color: 'transparent', left: '30%', top: '20%' },
'logo9': { color: 'transparent', left: '30%', top: '20%' },
'logo10': { color: 'transparent', left: '30%', top: '20%' },
'logo11': { color: 'transparent', left: '30%', top: '20%' },
'logo12': { color: 'transparent', left: '30%', top: '20%' },
'logo13': { color: 'transparent', left: '30%', top: '20%' },
'logo14': { color: 'transparent', left: '30%', top: '20%' },
'logo15': { color: 'transparent', left: '30%', top: '20%' },
'logo16': { color: 'transparent', left: '30%', top: '20%' },
'logo17': { color: 'transparent', left: '30%', top: '20%' },
'logo18': { color: 'transparent', left: '30%', top: '20%' },
'logo19': { color: 'transparent', left: '30%', top: '20%' },
'logo20': { color: 'transparent', left: '30%', top: '20%' },
'logo21': { color: 'transparent', left: '30%', top: '20%' },
'logo22': { color: 'transparent', left: '30%', top: '20%' },
'logo23': { color: 'transparent', left: '30%', top: '20%' },
'logo24': { color: 'transparent', left: '30%', top: '20%' },
'logo25': { color: 'transparent', left: '30%', top: '20%' },
'logo26': { color: 'transparent', left: '30%', top: '20%' },
'logo27': { color: 'transparent', left: '30%', top: '20%' },
'logo28': { color: 'transparent', left: '30%', top: '20%' },
'logo29': { color: 'transparent', left: '30%', top: '20%' },
'logo30': { color: 'transparent', left: '30%', top: '20%' },
'logo31': { color: 'transparent', left: '30%', top: '20%' },
    };
    saveLogos(); // Créer le fichier immédiatement
}

function requireAuth(req, res, next) {
    if (req.session.isAdmin) {
        next();
    } else {
        res.status(403).send({ success: false, message: 'Accès non autorisé' });
    }
}

function saveLogos() {
    fs.writeFileSync(logosFilePath, JSON.stringify(logos, null, 2));
    console.log('Logos saved to file');
}

app.post('/update-logo-color', requireAuth, (req, res) => {
    const { id, color } = req.body;
    console.log('Updating color for', id, 'to', color);
    if (logos[id]) {
        logos[id].color = color;
        saveLogos();
    }
    res.status(200).send({ success: true });
});

app.post('/update-logo-position', requireAuth, (req, res) => {
    const { id, left, top, width, height } = req.body;
    console.log('Received update request for:', id);
    console.log('New position:', { left, top, width, height });
    if (logos[id]) {
        logos[id].left = left;
        logos[id].top = top;
        logos[id].width = width;
        logos[id].height = height;
        saveLogos();
        console.log('Logo position updated and saved');
        res.status(200).send({ success: true, message: 'Position updated' });
    } else {
        console.log('Logo not found:', id);
        res.status(404).send({ success: false, message: 'Logo not found' });
    }
});

app.post('/admin-login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'HG' && password === 'G6') {
        req.session.isAdmin = true;
        res.status(200).send({ success: true });
    } else {
        res.status(401).send({ success: false, message: 'Identifiants incorrects' });
    }
});
// Nouvelle route pour obtenir les positions actuelles des logos
app.get('/get-logos', (req, res) => {
    res.json(logos);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});