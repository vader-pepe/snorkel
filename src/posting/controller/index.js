const path = require('path');
const fs = require('fs');

const requestFile = path.resolve('./request.txt');

module.exports.fromTwitter = async (res, parameters) => {
  const tweetData = JSON.stringify(parameters);
  const readData = fs.readFileSync(requestFile).toString().split('\n');
  readData.splice(0, 0, tweetData);
  const text = readData.join('\n');

  // write data to request.txt
  fs.writeFile(requestFile, text, (err) => {
    if (err) {
      return res.status(400).json({
        status: 400,
        message: err.message,
      });
    }
    res.status(201).json({ message: 'Queued! Thanks.' });
  });
};

// {"caption":"<<<{{Text}}>>>","user":"<<<{{UserName}}>>>","link":"<<<{{LinkToTweet}}>>>","created_at":"<<<{{CreatedAt}}>>>","embed_code":"<<<{{TweetEmbedCode}}>>>"}
