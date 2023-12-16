const fs = require('fs');
const { Match } = require('./models/index.js');
const matchesFilePath = './matches.csv';

const seedMatchesFromCSV = async (csvFilePath) => {
    try {
        const csvData = fs.readFileSync(csvFilePath, 'utf-8');
        const rows = csvData.trim().split('\n');

        for (let i = 1; i < rows.length; i++) {
            const [title, competitorId1, competitorId2, startDate, endDate, homeScore, awayScore, status] = rows[i].split(',');

            const [match, created] = await Match.findOrCreate({
                where: {
                    title,
                    startDate: new Date(startDate),
                },
                defaults: {
                    competitorId1: parseInt(competitorId1),
                    competitorId2: parseInt(competitorId2),
                    endDate: new Date(endDate),
                    homeScore: homeScore ? parseInt(homeScore) : null,
                    awayScore: awayScore ? parseInt(awayScore) : null,
                    status: cleanedStatus,
                },
            });

            if (!created) {
                console.log(`Match '${title}' already exists. Skipping.`);
            }
        }

        console.log('Data seeded successfully.');
    } catch (error) {
        console.error('Error seeding data:', error);
    }
};

seedMatchesFromCSV(matchesFilePath);
