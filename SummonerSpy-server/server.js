const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const cors = require('cors');
const port = 4320;

app.use(bodyParser.json());
app.use(cors());

axios.defaults.headers.common['X-Riot-Token'] = 'RGAPI-af8999fe-31fe-45e2-b0f2-6a19c2948cfb';

app.get('summoner/:region/:summonerName', (req, res) => {
    const { region, summonerName } = req.params;
    axios.get(`https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}`)
        .then(response => {
            res.status(200).send(response.data);
        })
        .catch(error => {
            console.error('Error getting summoner', error);
        });
});

app.get('rankPoints/:region/:id', (req, res) => {
    const { region, id } = req.params;
    axios.get(`https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${id}`)
        .then(response => {
            res.status(200).send(response.data);
        })
        .catch(error => {
            console.error('Error getting rank points', error);
        });
});

app.get('masteryPoints/:region/:id', (req, res) => {
    const { region, id } = req.params;
    axios.get(`https://${region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${id}`)
        .then(response => {
            res.status(200).send(response.data);
        })
        .catch(error => {
            console.error('Error getting rank points', error);
        });
});

app.get('allMatches/:region/:puuid/:start/:count', (req, res) => {
    const { region, puuid, start, count } = req.params;
    axios.get(`https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}`)
        .then(response => {
            res.status(200).send(response.data);
        })
        .catch(error => {
            console.error('Error getting rank points', error);
        });
});

app.get('/:server/leaderboards', (req, res) => {
    const { server } = req.params;
    const queueType = 'RANKED_SOLO_5x5';
    axios.get(`https://${server}.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/${queueType}`)
        .then(response => {
            res.status(200).send(response.data.entries);
        })
        .catch(error => {
            console.error('Error getting leaderboards', error);
        });
});

app.get('/free-rotation', (req, res) => {
    axios.get('https://euw1.api.riotgames.com/lol/platform/v3/champion-rotations')
        .then(response => {
            res.status(200).send(response.data);
        })
        .catch(error => {
            console.error('Error getting free rotation', error);
        });
});

app.listen(port, () => console.log(`Server has started on port: ${port}`));