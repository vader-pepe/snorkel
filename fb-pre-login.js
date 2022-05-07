/* eslint-disable no-console */
const puppeteer = require('puppeteer');
const prompt = require('prompt-sync')({ sigint: true });
const path = require('path');
const iPhone = puppeteer.devices['iPhone SE'];


const userDir = path.resolve('./userDataDir')
const facebookPath = path.resolve('./facebook');

/**
 * Get the value of designated HTML Element.
 * 
 * @param {Element} element
 * @param {Element} property
 * @returns {Promise}
 */
async function GetProperty(element, property) {
    // eslint-disable-next-line no-return-await
    return await (await element.getProperty(property)).jsonValue();
}

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
    try {
        const user = prompt('username: ');
        const pass = prompt('password: ');

        const browser = await puppeteer.launch({
            userDataDir: userDir,
        });
        const page = await browser.newPage();

        await page.emulate(iPhone);

        await page.goto('https://www.facebook.com', { waitUntil: 'networkidle2' });

        await page.waitForSelector("#m_login_email");
        const isNotLoggedIn = await page.$("#m_login_email")

        if (isNotLoggedIn) {
            await page.type("#m_login_email", user) // login field
            await page.type("#m_login_password", pass) // password field
            await page.screenshot({ path: `${facebookPath}/2.png` })
            // click Log In button
            await Promise.all([page.click("button"), page.waitForNavigation({
                waitUntil: 'networkidle2',
                timeout: 0
            })])

            // check if you logged in or not
            await page.screenshot({ path: "./facebook/3.png" })
            const detectedForeignIP = await page.$("#checkpoint_title");

            if (detectedForeignIP) {
                await page.waitForSelector("#checkpointSubmitButton-actual-button");
                await page.click("#checkpointSubmitButton-actual-button");
                await delay(3000);

                await page.screenshot({ path: "./facebook/4.png" })

                const choices = await page.$$eval("fieldset > label", ele => ele.map(value => value));

                await page.screenshot({ path: "./facebook/5.png" })

                choices.map((value, index) => {
                    console.log(`${index}: ${value.innerText}`);
                })

                const userChoice = prompt('Choose your choice: ');

                if (!isNaN(userChoice)) {
                    throw new Error("Must be a number!")
                }

                if (userChoice > (choices.length - 1)) {
                    throw new Error("Not valid!");
                }

                await choices[userChoice].click();

                if (choices[userChoice].innerText === "Provide your date of birth") {
                    // date of birth choises here
                } else if (choices[userChoice].innerText === "Get a code sent to your phone") {
                    await page.click("input[type='submit']")
                    await delay(3000);
                    await page.click("fieldset > label");
                    await page.click("input[type='submit']")
                    await delay(3000);
                    const code = prompt("Please input your code: ");

                    await page.type("#nonce_input_field", code);

                    await page.click("input[type='submit']")

                } else if (choices[userChoice].innerText === "Approve your login on another computer") {
                    await page.click("input[type='submit']")
                    await delay(3000);
                    await page.click("input[type='submit']")
                    await delay(3000);
                    await page.click("input[type='submit']")
                }

            } else {
                // check if facebook wanted to save your password. this script simply press Not Now
                const notNowEle = await page.$("a > span");
                const notNow = await GetProperty(notNowEle, "textContent");

                await page.screenshot({ path: facebookPath + "/4.png" })

                if (notNow === "Not Now") {
                    await page.click("a")
                    await delay(3000)
                }
            }
        }

    } catch (error) {
        throw new Error(error);
    }
};

login();