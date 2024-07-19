const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();

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
        'filter-logo1': { color: 'transparent', left: '100px', top: '50px' },
        'filter-logo2': { color: 'transparent', left: '300px', top: '200px' },
        'filter-logo3': { color: 'transparent', left: '300px', top: '200px' },
        'filter-logo4': { color: 'transparent', left: '300px', top: '200px' },
        'filter-logo5': { color: 'transparent', left: '300px', top: '200px' },
        'filter-logo6': { color: 'transparent', left: '300px', top: '200px' },
        'filter-logo7': { color: 'transparent', left: '300px', top: '200px' },
        'filter-logo8': { color: 'transparent', left: '300px', top: '200px' },
    };
    saveLogos(); // Créer le fichier immédiatement
}

function saveLogos() {
    fs.writeFileSync(logosFilePath, JSON.stringify(logos, null, 2));
    console.log('Logos saved to file');
}

app.post('/update-logo-color', (req, res) => {
    const { id, color } = req.body;
    console.log('Updating color for', id, 'to', color);
    if (logos[id]) {
        logos[id].color = color;
        saveLogos();
    }
    res.status(200).send({ success: true });
});

app.post('/update-logo-position', (req, res) => {
    const { id, left, top } = req.body;
    console.log('Updating position for', id, 'to', left, top);
    if (logos[id]) {
        logos[id].left = left;
        logos[id].top = top;
        saveLogos();
    }
    res.status(200).send({ success: true });
});

// Nouvelle route pour obtenir les positions actuelles des logos
app.get('/get-logos', (req, res) => {
    res.json(logos);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});