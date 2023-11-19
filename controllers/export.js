const Rating = require('../models/Rating');

exports.exportRatingsByArtistName = async (req, res) => {
    const artistName = req.query.artistName;
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    try {
        const ratings = await Rating.find({
            createdAt: { $gte: oneMonthAgo }
        }).populate({
            path: 'artistId',
            match: { name: artistName }
        }).exec();

        const filteredRatings = ratings.filter(rating => rating.artistId && rating.artistId.name === artistName);

        const ratingsJson = JSON.stringify(filteredRatings);

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${artistName}-ratings.json"`);
        res.send(ratingsJson);
    } catch (error) {
        res.status(500).send('Error exporting ratings: ' + error.message);
    }
};
