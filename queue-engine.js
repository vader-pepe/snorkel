const cron = require('node-cron');
const path = require('path');
const fs = require('fs');

const requestFile = path.resolve('./request.txt');

let requestBefore = '';

// code here will run every 10 seconds.
cron.schedule('*/10 * * * * *', () => {
    fs.readFile(requestFile, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        // get the first line of the file
        const firstLine = data.split('\n')[0];
        // check if the first line is empty
        if (firstLine === '') {
            console.log('No requests');
        } else {
            console.log(`Requesting ${firstLine}`);
            if (firstLine !== requestBefore) {
                requestBefore = firstLine;
                // doing something with the first line
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
        }

    });
});