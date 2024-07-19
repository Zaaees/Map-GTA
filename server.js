const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const session = require('express-session');

const app = express();

app.use(session({
    secret: 'Gruppe6Secret',
    resave: false,
    saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(express.static('public'));

const logosFilePath = path.join(__dirname, 'logos.json');

// Charger les positions des logos depuis le fichier
let logos = {};
try {
    const data = fs.readFileSync(logosFilePath, 'utf8');
    logos = JSON.parse(data);
} catch (err) {
    console.log('No existing logos file, creating a new one');
    logos = {
'filter-logo1': { color: 'transparent', left: '10%', top: '5%' },
'filter-logo2': { color: 'transparent', left: '30%', top: '20%' },
'filter-logo3': { color: 'transparent', left: '30%', top: '20%' },
'filter-logo4': { color: 'transparent', left: '30%', top: '20%' },
'filter-logo5': { color: 'transparent', left: '30%', top: '20%' },
'filter-logo6': { color: 'transparent', left: '30%', top: '20%' },
'filter-logo7': { color: 'transparent', left: '30%', top: '20%' },
'filter-logo8': { color: 'transparent', left: '30%', top: '20%' },
'filter-logo9': { color: 'transparent', left: '30%', top: '20%' },
'filter-logo10': { color: 'transparent', left: '30%', top: '20%' },
'filter-logo11': { color: 'transparent', left: '30%', top: '20%' },
'filter-logo12': { color: 'transparent', left: '30%', top: '20%' },
'filter-logo13': { color: 'transparent', left: '30%', top: '20%' },
'filter-logo14': { color: 'transparent', left: '30%', top: '20%' },
'filter-logo15': { color: 'transparent', left: '30%', top: '20%' },
'filter-logo16': { color: 'transparent', left: '30%', top: '20%' },
'filter-logo17': { color: 'transparent', left: '30%', top: '20%' },
'filter-logo18': { color: 'transparent', left: '30%', top: '20%' },
'filter-logo19': { color: 'transparent', left: '30%', top: '20%' },
'filter-logo20': { color: 'transparent', left: '30%', top: '20%' },
'filter-logo21': { color: 'transparent', left: '30%', top: '20%' },
'filter-logo22': { color: 'transparent', left: '30%', top: '20%' },
'filter-logo23': { color: 'transparent', left: '30%', top: '20%' },
'filter-logo24': { color: 'transparent', left: '30%', top: '20%' },
'filter-logo25': { color: 'transparent', left: '30%', top: '20%' },
'filter-logo26': { color: 'transparent', left: '30%', top: '20%' },
'filter-logo27': { color: 'transparent', left: '30%', top: '20%' },
'filter-logo28': { color: 'transparent', left: '30%', top: '20%' },
'filter-logo29': { color: 'transparent', left: '30%', top: '20%' },
'filter-logo30': { color: 'transparent', left: '30%', top: '20%' },
'filter-logo31': { color: 'transparent', left: '30%', top: '20%' },
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
    console.log('Updating position and size for', id, 'to', left, top, width, height);
    if (logos[id]) {
        logos[id].left = left;
        logos[id].top = top;
        logos[id].width = width;
        logos[id].height = height;
        saveLogos();
    }
    res.status(200).send({ success: true });
});

app.post('/admin-login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'Admin' && password === 'Gruppe6') {
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

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});