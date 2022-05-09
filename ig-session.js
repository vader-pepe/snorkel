/* eslint-disable no-console */
const puppeteer = require('puppeteer');
const path = require('path');
const iPhone = puppeteer.devices['iPhone SE'];
const _puppeteerCluster = require("puppeteer-cluster");

const userDir = path.resolve('./userDataDir')
const igPath = path.resolve('./instagram');

const session = async () => {
    const cluster = await _puppeteerCluster.Cluster.launch({
        concurrency: _puppeteerCluster.Cluster.CONCURRENCY_PAGE,
        maxConcurrency: 1,
        puppeteerOptions: {
            userDataDir: userDir,
        },
        monitor: true,
        timeout: 300000,
    });

    try {
        // const user = process.env.FB_USER;
        // const pass = process.env.FB_PASS;

        await cluster.task(async ({ page, data = "https://www.instagram.com/" }) => {
            await page.emulate(iPhone);

            await page.goto(data, { waitUntil: 'networkidle2' });

            await page.screenshot({ path: `${igPath}/session.png` })

        });

        await cluster.execute();

    } catch (error) {
        throw new Error(error);
    }
};

session();