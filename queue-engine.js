const cron = require('node-cron');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { getTwitImg, postToFacebook, postToInstagram } = require('./web-engine');

const requestFile = path.resolve('./request.txt');
const twitterPath = path.resolve('web-engine/twitter');
const envFile = path.resolve('./.env');
require('dotenv').config({ path: envFile });

let requestBefore = '';

// code here will run every 10 seconds.
cron.schedule('*/10 * * * * *', () => {
  try {
    fs.readFile(requestFile, 'utf8', async (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      // get the first line of the file
      const firstLine = data.split('\n')[0];
      // check if the first line is empty
      if (firstLine === '') {
        console.log('No requests');
      } else if (firstLine !== requestBefore) {
        console.log(`Requesting ${firstLine}`);
        requestBefore = firstLine;
        // doing something with the first line
        const twitIMG = await getTwitImg(firstLine);
        const jsonData = JSON.parse(firstLine);
        await postToFacebook(
          process.env.FB_USER,
          process.env.FB_PASS,
          twitIMG,
          jsonData.caption
        );
        await postToInstagram(
          process.env.IG_USER,
          process.env.IG_PASS,
          twitIMG,
          jsonData.caption
        );
        // delete file after posting
        fs.unlinkSync(`${twitterPath}/${twitIMG}`);
        // delete the first line of the file
        const newData = data.split('\n').slice(1).join('\n');
        fs.writeFile(requestFile, newData, 'utf8', (err) => {
          if (err) {
            console.error(err);
            return;
          }
          console.log('Requested');
        });
      }
    });
  } catch (error) {
    console.log(error.stack);
  }
});
