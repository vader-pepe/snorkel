const puppeteer = require('puppeteer');
const prompt = require('prompt-sync')({ sigint: true });
const path = require('path');
const iPhone = puppeteer.devices['iPhone SE'];
const _puppeteerCluster = require("puppeteer-cluster");

const userDir = path.resolve('./userDataDir')
const instagramPath = path.resolve('./instagram');

/**
 * Delay code execution.
 * 
 * @param {number} time
 * @returns {Promise}
 */
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

const login = async () => {
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
        await cluster.task(async ({ page, data = "https://www.instagram.com/" }) => {
            const user = prompt('username: ');
            const pass = prompt('password: ');

            await page.emulate(iPhone);

            await page.goto(data);
            await delay(3000);
            await page.screenshot({ path: instagramPath + "/1.png" })
            const findAllBtns = await page.$$eval("button", (elements) => elements.map((v) => v.textContent))
            const isNotLoggedIn = findAllBtns.find(v => v === "Log In")

            if (isNotLoggedIn) {

                await page.screenshot({ path: instagramPath + "/2.png" })
                await page.evaluate(() => {
                    // eslint-disable-next-line no-undef
                    const loginBtn = Array.from(document.querySelectorAll('button'))
                        .find(el => el.textContent === `Log In`);

                    loginBtn.click();
                })

                // login directly with username and password
                await page.type("input[name='username']", user) // login field
                await page.type("input[name='password']", pass) // password field
                await page.screenshot({ path: instagramPath + "/3.png" })
                // click Log In button
                await delay(500)
                await page.screenshot({ path: instagramPath + "/4.png" })
                await Promise.all([
                    page.click("button[type='submit']"),
                    page.waitForNavigation({
                        waitUntil: "networkidle2"
                    })
                ])
                await delay(5000);
                await page.evaluate(() => {
                    // eslint-disable-next-line no-undef
                    const x = Array.from(document.querySelectorAll("button"));

                    x.map(v => {
                        if (v.textContent === "Send Security Code") {
                            v.click();
                        }
                    })
                })
                await delay(5000);
                await page.screenshot({ path: instagramPath + "/5.png" })
                const code = prompt("Code: ")

                await page.type("#security_code", code);
                await page.screenshot({ path: instagramPath + "/6.png" })

                await page.evaluate(() => {
                    // eslint-disable-next-line no-undef
                    const x = Array.from(document.querySelectorAll("button"))

                    x.map(v => {
                        if (v.textContent === "Submit") {
                            v.click();
                        }
                    })
                })
                await delay(5000);
                await page.screenshot({ path: instagramPath + "/7.png" })

            }
        });

        await cluster.execute();

    } catch (error) {
        throw new Error(error.message);
    }
};

login();