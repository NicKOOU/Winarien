const express = require('express');
const bodyParser = require('body-parser');
const redis = require('redis');
const { Match, Log } = require('./models/index.js');
const app = express();

app.use(bodyParser.json());

const client = redis.createClient({
    socket: {
        host: 'redis',
        port: 6379
    }
});


client.connect().then(() => {
    console.log('Connected to Redis!');
});

const clientPublisher = redis.createClient({
    socket: {
        host: 'redis',
        port: 6379
    }
});

clientPublisher.connect().then(() => {
    console.log('Connected to Redis!');
});

client.subscribe('match-updates', (message, channel) => {
    console.log(`Message reçu de ${channel}: ${message}`);

    try {
        const matchUpdate = JSON.parse(message);
        handleMatchUpdate(matchUpdate).then(console.log("updated"))
    } catch (error) {
        console.error('Error parsing match update message:', error);
    }
});

const handleMatchUpdate = async (matchUpdate) => {
    const { matchId, newStatus, homeScore, awayScore } = matchUpdate;

    console.log('Updating match:', matchUpdate);

    try {
        const match = await Match.findByPk(matchId);
        let type = '';

        if (!match) {
            console.error('Match not found with ID:', matchId);
            return;
        }

        if (newStatus && match.status !== newStatus) {
            handleStatusChange(match, newStatus);
            if (newStatus === 'ENDED') {
                type = 'END';
            }
            if (newStatus === 'PREMATCH') {
                type = 'PREMATCH';
            }
            if (newStatus === 'LIVE') {
                type = 'START';
            }
        }

        if (homeScore !== undefined && awayScore !== undefined) {
            handleScoreChange(match, homeScore, awayScore);
            type = 'SCORE UPDATE';
        }

        await match.save();

        const updatedMatch = await Match.findByPk(matchId);

        console.log('Match updated successfully:', updatedMatch);
        console.log('type', type)
        const logText = `Match updated: Match ${matchId} - Status: ${match.status} - Home Score: ${match.homeScore} - Away Score: ${match.awayScore}`;
        clientPublisher.publish('match-logs', JSON.stringify({ type: type, matchId: matchId, text: logText }));
    } catch (error) {
        console.error('Error updating match:', error);
    }
};

const handleStatusChange = (match, newStatus) => {
    match.status = newStatus;
};

const handleScoreChange = (match, homeScore, awayScore) => {
    match.homeScore = homeScore;
    match.awayScore = awayScore;
};

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Match service is running on port ${PORT}`);
});
