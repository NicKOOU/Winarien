const express = require('express');
const bodyParser = require('body-parser');
const redis = require('redis');
const { Match } = require('./models/index.js');
const app = express();

app.use(bodyParser.json());

console.log("test")
const client = redis.createClient(
    6379,
    'redis'
);

console.log(client)

client.on('connect', function () {
    console.log('Connected!');
});

client.subscribe('match-updates');

client.on('message', async (channel, message) => {
    console.log(`Message reçu de ${channel}: ${message}`);

    try {
        const matchUpdate = JSON.parse(message);
        await handleMatchUpdate(matchUpdate);
    } catch (error) {
        console.error('Error parsing match update message:', error);
    }
});

const handleMatchUpdate = async (matchUpdate) => {
    const { matchId, newStatus } = matchUpdate;

    try {
        const match = await Match.findByPk(matchId);

        if (!match) {
            console.error('Match not found with ID:', matchId);
            return;
        }

        if (newStatus === 'PREMATCH' && match.status === 'NOT STARTED') {
            match.status = newStatus;
        } else if (newStatus === 'LIVE' && match.status === 'PREMATCH') {
            match.status = newStatus;
        } else if (newStatus === 'ENDED' && match.status === 'LIVE') {
            match.status = newStatus;
        } else {
            console.error(`Invalid state transition from ${match.status} to ${newStatus}`);
            return;
        }

        await match.save();

        const updatedMatch = await Match.findByPk(matchId);

        console.log('Match updated successfully:', updatedMatch);
    } catch (error) {
        console.error('Error updating match:', error);
    }
};

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Match service is running on port ${PORT}`);
});