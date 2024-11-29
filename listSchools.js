const express = require('express');
const router = express.Router();
const db = require('./db');

const haversineDistance = (coords1, coords2) => {
    const toRad = (angle) => (Math.PI / 180) * angle;
    const R = 6371; // Radius of Earth in km
    const dLat = toRad(coords2.latitude - coords1.latitude);
    const dLon = toRad(coords2.longitude - coords1.longitude);
    const lat1 = toRad(coords1.latitude);
    const lat2 = toRad(coords2.latitude);
    const a = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

router.get('/listSchools', (req, res) => {
    res.send("hello world")
    res.end()
    const { latitude, longitude } = req.query;
    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    db.query('SELECT * FROM schools', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const userCoords = { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
        const sortedSchools = results
            .map((school) => ({
                ...school,
                distance: haversineDistance(userCoords, { latitude: school.latitude, longitude: school.longitude })
            }))
            .sort((a, b) => a.distance - b.distance);
        res.json(sortedSchools);
    });
});

module.exports = router;
