require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const bodyparser = require('body-parser');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync')
const app = express()
const port = 3000 || process.env.PORT;
const unityKey = process.env.UNITY;

const UNITY_API = 'https://build-api.cloud.unity3d.com';

app.use(bodyparser.json());

const adapter = new FileSync('db.json')
const db = low(adapter)

db.defaults({ builds: [] })
    .write()

app.use(express.static('public'))

app.get('/builds', (req, res) => {
    const builds = db.get('builds')
        .value();
    res.json(builds);
});

app.post('/build', (req, res) => {
    if (!req.body) return res.sendStatus(400);

    const buildAPIURL = req.body.links.api_self.href;
    if (!buildAPIURL) {
        res.setHeader('Content-Type', 'application/json');
        res.send({
            error: true,
            message: "No build link from Unity Cloud Build webhook"
        });
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.send({
            error: false,
            message: "Process begun for project '" + req.body.projectName + "' platform '" + req.body.buildTargetName + "'."
        });
    }

    fetch(UNITY_API + buildAPIURL, {
        method: 'GET',
        headers: {
            'Authorization': 'Basic ' + unityKey
        }
    })
        .then((response) => {
            response.json().then((json => {

                const buildNumber = json.build;
                const buildType = json.buildTargetName;
                const buildDate = json.finished;
                const downloadLink = json.links.download_primary.href;

                db.get('builds')
                    .push({ buildNumber: buildNumber, buildType: buildType, buildDate: buildDate, downloadLink: downloadLink })
                    .write()
            }));
        });
});

app.listen(port, () => {
    console.log(`Galeforce builds running on port: ${port}`)
})
