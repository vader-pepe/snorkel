/* eslint-disable no-console */
const puppeteer = require('puppeteer');
const path = require('path');
const iPhone = puppeteer.devices['iPhone SE'];


const userDir = path.resolve('./userDataDir')
const facebookPath = path.resolve('./facebook');

const session = async () => {
    try {
        // const user = process.env.FB_USER;
        // const pass = process.env.FB_PASS;

        const browser = await puppeteer.launch({
            userDataDir: userDir,
        });
        const page = await browser.newPage();

        await page.emulate(iPhone);

        await page.goto('https://www.facebook.com', { waitUntil: 'networkidle2' });

        await page.screenshot({ path: `${facebookPath}/session.png` })
    } catch (error) {
        throw new Error(error);
    }
};

session();