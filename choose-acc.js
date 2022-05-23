const puppeteer = require('puppeteer');
const path = require('path');
const iPhone = puppeteer.devices['iPhone SE'];
const _puppeteerCluster = require("puppeteer-cluster");

const userDir = path.resolve('./userDataDir')

/**
 * Delay code execution.
 * 
 * @param {number} time
 * @returns {Promise}
 */
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

const session = async () => {
    const cluster = await _puppeteerCluster.Cluster.launch({
        concurrency: _puppeteerCluster.Cluster.CONCURRENCY_PAGE,
        maxConcurrency: 1,
        puppeteerOptions: {
            userDataDir: userDir,
            headless: false,
        },
        timeout: 300000,
    });

    try {
        // const user = process.env.FB_USER;
        // const pass = process.env.FB_PASS;

        await cluster.task(async ({ page, data = "https://www.instagram.com/" }) => {
            await page.emulate(iPhone);

            await page.goto(data, { waitUntil: 'networkidle2' });

            // check if account has continue button
            await page.evaluate(() => {
                // eslint-disable-next-line no-undef
                const continueBtn = Array.from(document.querySelectorAll("button > span")).find(el => el.textContent.includes("Continue"));

                continueBtn.parentElement.click()
            })

            await delay(9999999);
        });

        await cluster.execute();

    } catch (error) {
        throw new Error(error);
    }
};

session();