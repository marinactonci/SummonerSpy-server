const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const cors = require('cors');
const firebase = require('firebase');
const port = 4320;
require('dotenv').config();

app.use(bodyParser.json());
app.use(cors());

axios.defaults.headers.common['X-Riot-Token'] = 'YOUR-API-KEY-HERE';

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
}

const firebaseApp = firebase.initializeApp(firebaseConfig);

const profileAccountsCollection = firebase.firestore().collection('profileAccounts');
const favoritesCollection = firebase.firestore().collection('favorites');

app.get('/profile-account/:userId', async(req, res) => {
    const { userId } = req.params;
    try {
        const snapshot = await profileAccountsCollection.doc(userId).get();

        if (!snapshot.exists) {
            return res.json({ message: 'Document not found' });
        }

        const documentData = snapshot.data();
        return res.status(200).json(documentData);
    } catch (error) {
        return res.json({ error: error });
    }
});

app.post('/add-profile-account/:userId/:region/:name', async(req, res) => {
    const { userId, region, name } = req.params;
    try {
        const snapshot = await profileAccountsCollection.doc(userId).get();

        if (!snapshot.exists) {
            await profileAccountsCollection.doc(userId).set({
                region: region,
                name: name
            });

            const documentData = snapshot.data();
            return res.status(200).json(documentData);
        }

        const documentData = snapshot.data();
        const profileAccount = {
            region: region,
            name: name
        };

        await profileAccountsCollection.doc(userId).update(profileAccount);

        return res.status(200).json({ message: 'Profile account updated' });
    } catch (error) {
        console.error('Error getting document:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

app.delete('/remove-profile-account/:userId', async(req, res) => {
    const { userId } = req.params;
    try {
        const snapshot = await profileAccountsCollection.doc(userId).get();

        if (!snapshot.exists) {
            return res.status(404).json({ message: 'Document not found' });
        }

        await profileAccountsCollection.doc(userId).delete();
        return res.status(200).json({ message: 'Profile account deleted' });
    } catch (error) {
        console.error('Error getting document:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/get-favorites/:userId', async(req, res) => {
    const { userId } = req.params;
    try {
        const snapshot = await favoritesCollection.doc(userId).get();

        if (!snapshot.exists) {
            await favoritesCollection.doc(userId).set({
                favorites: []
            });
            return res.status(200).json({ message: 'Document created' });
        }

        const documentData = snapshot.data();
        return res.status(200).json(documentData);
    } catch (error) {
        return res.status(500).json({ error: error });
    }
});

app.post('/add-favorites/:userId/:region/:name', async(req, res) => {
    const { userId, region, name } = req.params;
    try {
        const snapshot = await favoritesCollection.doc(userId).get();

        if (!snapshot.exists) {
            await favoritesCollection.doc(userId).set({
                favorites: [{
                    region: region,
                    name: name
                }]
            });
            return res.status(200).json({ message: 'Document created' });
        }

        const documentData = snapshot.data();
        const favorites = documentData.favorites;

        favorites.push({
            region: region,
            name: name
        });

        await favoritesCollection.doc(userId).update({
            favorites: favorites
        });

        return res.status(200).json({ message: 'Favorite added' });
    } catch (error) {
        console.error('Error getting document:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

app.delete('/delete-favorites/:userId/:region/:name', async(req, res) => {
    const { userId, region, name } = req.params;
    try {
        const snapshot = await favoritesCollection.doc(userId).get();

        if (!snapshot.exists) {
            return res.status(404).json({ message: 'Document not found' });
        }

        const documentData = snapshot.data();
        let favorites = documentData.favorites;

        favorites = favorites.filter(favorite => favorite.name !== name || favorite.region !== region);

        await favoritesCollection.doc(userId).update({
            favorites: favorites
        });

        return res.status(200).json({ message: 'Favorite removed' });
    } catch (error) {
        console.error('Error getting document:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/register/:email/:password', async(req, res) => {
    const {email, password} = req.params;
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            res.status(200).send(userCredential);
        })
        .catch((error) => {
            res.status(404).send(error);
        });
});

app.post('/login/:email/:password', async(req, res) => {
    const {email, password} = req.params;
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            res.status(200).send(userCredential);
        })
        .catch((error) => {
            res.status(404).send(error);
        });
});

app.get('/logout', function(req , res){
    firebase.auth().signOut().then(() => {
        res.send({message: "Logged out!"});
    }).catch((error) => {
        res.send({message: "Error!", error: error});
    });
});

app.post('/change-password/:password/:newPassword', async(req, res) => {
    const {password, newPassword} = req.params;
    const user = firebase.auth().currentUser;
    const credential = firebase.auth.EmailAuthProvider.credential(
        user.email,
        password
    );
    user.reauthenticateWithCredential(credential).then(() => {
        user.updatePassword(newPassword).then(() => {
            res.send({message: "Password changed!"});
        }).catch((error) => {
            res.send({message: "Error!", error: error});
        });
    }). catch((error) => {
        res.send({message: "Error!", error: error});
    });
});

app.get('/user-status', (req, res) => {
    res.send(firebase.auth().currentUser);
})

app.get('/summoner/:region/:summonerName', (req, res) => {
    const { region, summonerName } = req.params;
    axios.get(`https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}`)
        .then(response => {
            res.status(200).send(response.data);
        })
        .catch(error => {
            console.log(error);
            res.send({});
        });
});

app.get('/rankPoints/:region/:id', (req, res) => {
    const { region, id } = req.params;
    axios.get(`https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${id}`)
        .then(response => {
            res.status(200).send(response.data);
        })
        .catch(error => {
            res.status(404).send(error.response.data);
        });
});

app.get('/masteryPoints/:region/:id', (req, res) => {
    const { region, id } = req.params;
    axios.get(`https://${region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${id}/top`)
        .then(response => {
            res.status(200).send(response.data);
        })
        .catch(error => {
            res.status(404).send(error.response.data);
        });
});

app.get('/allMatches/:region/:puuid/:start/:count', (req, res) => {
    const { region, puuid, start, count } = req.params;
    axios.get(`https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}`)
        .then(response => {
            res.status(200).send(response.data);
        })
        .catch(error => {
            res.status(404).send(error.response.data);
        });
});

app.get('/match/:region/:matchId', (req, res) => {
    const { region, matchId } = req.params;
    axios.get(`https://${region}.api.riotgames.com/lol/match/v5/matches/${matchId}`)
        .then(response => {
            res.status(200).send(response.data);
        })
        .catch(error => {
            res.status(404).send(error.response.data);
        });
});

app.get('/leaderboards/:server/:queueType', (req, res) => {
    const { server, queueType } = req.params;
    axios.get(`https://${server}.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/${queueType}`)
        .then(response => {
            res.status(200).send(response.data.entries);
        })
        .catch(error => {
            res.status(404).send(error.response.data);
        });
});

app.get('/free-rotation', (req, res) => {
    axios.get('https://euw1.api.riotgames.com/lol/platform/v3/champion-rotations')
        .then(response => {
            res.status(200).send(response.data);
        })
        .catch(error => {
            res.status(404).send(error.response.data);
        });
});

app.listen(port, () => console.log(`Server has started on port: ${port}`));
