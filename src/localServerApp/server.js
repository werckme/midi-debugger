const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());

if (process.argv.length < 3) {
    console.error(`usage: ${process.argv[1]} <path to midi file>`);
    process.exit(-1);
}

const midiFilePath = process.argv[2];
const mainIndexHtml = path.join(__dirname, './index.html');
const mainIndexJs = path.join(__dirname, '../../dist/index.js');
const mainIndexCss = path.join(__dirname, '../../dist/debugger.css');

const port = process.env.PORT || 4488;

app.get('/', async (req, res, next) => {
    try {
       let html = fs.readFileSync(mainIndexHtml).toString();
       html = html.replace('$FILENAME', midiFilePath)
       res.send(html);
    } catch(ex) {
        console.error(ex);
        next(Error());
    }
});

app.get('/index.js', async (req, res, next) => {
    try {
       res.sendFile(mainIndexJs);
    } catch(ex) {
        console.error(ex);
        next(Error());
    }
});

app.get('/midifile', async (req, res, next) => {
    try {
       res.sendFile(midiFilePath);
    } catch(ex) {
        console.error(ex);
        next(Error());
    }
});

app.listen(port, () => {
    console.log(`listening at port ${port}`);
});