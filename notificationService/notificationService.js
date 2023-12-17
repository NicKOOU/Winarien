const db = require('./models/index.js');
const { Log, FavoriteMatch, LogRecipient, User } = db;
const redis = require('redis');

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

Log.belongsToMany(User, {
    through: 'LogRecipients',
});

db.sequelize.sync();

client.subscribe('match-logs', async (message, channel) => {
    try {
        const logData = JSON.parse(message);

        const { type, matchId, text } = logData;

        const logText = `Notification sent: ${type} - Match: ${matchId} - Text: ${text}`;

        const favoriteMatchesUp = await FavoriteMatch.findAll({ where: { matchId } });

        const log = await Log.create({
            type: type,
            text: logText,
            recipients: favoriteMatchesUp.map(favoriteMatch => favoriteMatch.userId),
        });

        if (type === 'MATCH_UPDATE' || type === 'SCORE_UPDATE') {
            const matchId = text.split(' ')[2];
            const favoriteMatches = await FavoriteMatch.findAll({ where: { matchId } });
            const users = favoriteMatches.map(favoriteMatch => favoriteMatch.userId);

            for (const user of users) {
                clientPublisher.publish('notifications', JSON.stringify({ type, recipients: [user], text }));

                await LogRecipient.create({
                    LogId: log.id,
                    UserId: user,
                });
            }
        }

        console.log(logText);
    } catch (error) {
        console.error('Error processing Redis message:', error);
    }
});
