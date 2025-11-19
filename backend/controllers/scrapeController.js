const { spawn } = require('child_process');

const getScrapedData = (req, res) => {
  const { username, password } = req.body;

  const python = spawn('python3', ['scraper/scraper.py', username, password]);

  let dataString = '';

  python.stdout.on('data', (data) => {
    dataString += data.toString();
  });

  python.on('close', (code) => {
    try {
      const parsedData = JSON.parse(dataString);
      res.status(200).json(parsedData);
    } catch (error) {
      res.status(500).json({ error: 'Error parsing data from scraper' });
    }
  });
};

module.exports = { getScrapedData };
