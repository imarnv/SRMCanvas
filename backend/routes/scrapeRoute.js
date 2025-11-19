const express = require('express');
const { getScrapedData } = require('../controllers/scrapeController');

const router = express.Router();

router.post('/', getScrapedData);

module.exports = router;
