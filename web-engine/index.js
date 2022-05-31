const puppeteer = require('puppeteer');
const path = require('path');

const twitterPath = path.resolve('./web-engine/twitter');
const facebookPath = path.resolve('./web-engine/facebook');
const instagramPath = path.resolve('./web-engine/instagram');
const userDataDir = path.resolve('./web-engine/user-data');
const iPhone = puppeteer.devices['iPhone SE'];

/**
 * Delay code execution.
 *
 * @param {number} time
 * @returns {Promise}
 */
function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

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

const getTwitImg = async (rawData) => {
  const browser = await puppeteer.launch({
    userDataDir,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  let twitURL = '';
  let tweetId = '';
  const data = JSON.parse(rawData);
  try {
    // get the first line of the file
    twitURL = data.link.split('\n')[0];
    tweetId = twitURL.split('/')[5];
    await page.goto(`https://kizie.co/tools/twitter-image`);

    // wait for the page to load
    await page.waitForSelector('input');

    const field = await page.$('input');

    await field.type(twitURL);

    // press enter after typing the url
    await field.press('Enter');

    await page.waitForSelector(
      '#__next > div:nth-child(1) > div > div.relative.pt-32 > div:nth-child(1) > div.flex.flex-col.items-start > div.flex.w-full.max-w-full.overflow-x-auto > div > div.relative.px-5.w-full.h-full.object-cover.flex.items-center.justify-center.rounded-md.transition-all > div'
    );

    await page._client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: twitterPath,
    });

    await page.evaluate(() => {
      // eslint-disable-next-line no-undef
      const allIcon = Array.from(
        document.querySelectorAll(
          '#__next > div:nth-child(1) > div > div > div > div > div > div > div > div > div > div'
        )
      );

      // simulating a click on the post icon
      allIcon[7].click();
    });

    await page.evaluate(() => {
      // eslint-disable-next-line no-undef
      const downloadIcon = document.querySelector(
        '#__next > div:nth-child(1) > div > div > div > div > div > div > button'
      );

      // simulating a click on the download icon
      downloadIcon.click();
    });

    // await page.waitForSelector
    await delay(5000);
    await page.waitForSelector('div.go2344853693');
    // screenshot

    return `kizie-${tweetId}.png`;
  } catch (error) {
    throw new Error(error.stack);
  } finally {
    await browser.close();
  }
};

const postToFacebook = async (user, pass, photo, caption = 'Sent from API') => {
  const browser = await puppeteer.launch({
    userDataDir,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  try {
    await page.emulate(iPhone);
    await page.goto('https://www.facebook.com/');

    // check if not logged in
    const isNotLoggedIn = await page.$('#m_login_email');
    let loggedIn = true;

    // check if account saved
    const chooseAccEle = await page.$('div > p');
    let chooseAcc = '';
    let saved = false;

    if (chooseAccEle) {
      chooseAcc = await GetProperty(chooseAccEle, 'textContent');
      if (chooseAcc === 'Choose your account') saved = true;
    }

    if (isNotLoggedIn) {
      loggedIn = false;
      await page.type('#m_login_email', user); // login field
      await page.type('#m_login_password', pass); // password field
      await page.screenshot({ path: `${facebookPath}/2.png` });
      // click Log In button
      await page.click(
        `[data-sigil="touchable login_button_block m_login_button"]`
      );
      await delay(5000);

      // check if you logged in or not
      await page.screenshot({ path: './facebook/3.png' });

      // check if facebook wanted to save your password. this script simply press Not Now
      const notNowEle = await page.$('a > span');
      const notNow = await GetProperty(notNowEle, 'textContent');

      await page.screenshot({ path: `${facebookPath}/4.png` });

      if (notNow === 'Not Now') {
        await page.click('a');
        await delay(3000);
      }
      loggedIn = true;
      await page.screenshot({ path: `${facebookPath}/5.png` });
    }

    if (saved) {
      await page.screenshot({ path: `${facebookPath}/1a.png` });
      await Promise.all([
        page.click('#root > div:nth-child(2) > div > div > div > div > div'),
        page.waitForNavigation(),
      ]);
      // passowrd
      await page.type("input[type='password']", pass);
      await page.screenshot({ path: `${facebookPath}/2a.png` });
      await Promise.all([
        page.click("button[type='submit']"),
        page.waitForNavigation(),
      ]);
      await page.click('a > span');
      await page.screenshot({ path: `${facebookPath}/3a.png` });
    }

    if (loggedIn) {
      // finding post field and clicking it
      await page.evaluate(() => {
        // eslint-disable-next-line no-undef
        const postField = Array.from(document.querySelectorAll('div')).find(
          (el) => el.textContent === `What's on your mind?`
        );

        postField.click();
      });
      await page.waitForSelector(
        '[data-sigil="touchable hidden-button photo-button"]'
      );
      await page.screenshot({ path: `${facebookPath}/6.png` });
      // the url will changed. after that, you can upload anything
      if (page.url() === 'https://m.facebook.com/?soft=composer') {
        await page.screenshot({ path: `${facebookPath}/7.png` });

        // write a caption
        await page.evaluate((caption) => {
          // eslint-disable-next-line no-undef
          const textareas = Array.from(document.querySelectorAll('textarea'));

          textareas[1].value = caption;
        }, caption);

        await page.click(
          '#structured_composer_form > div > div > button:nth-child(1)'
        );

        // // your file here
        // start posting
        const [fileChooser] = await Promise.all([
          page.waitForFileChooser(),
          page.evaluate(() => {
            // eslint-disable-next-line no-undef
            const uploadBtn = document.querySelector(
              '#structured_composer_form > div > div > button:nth-child(1) > div'
            );

            uploadBtn.click();
          }), // some button that triggers file selection
        ]);

        // image to upload here
        await fileChooser.accept([`${twitterPath}/${photo}`]);

        await page.click('#composer-main-view-id > div > div > div > button');
        await delay(5000);
        await page.waitForSelector('[data-sigil="bg-upload-progress-root"]');
      }
      // last screenshot
      await page.screenshot({ path: `${facebookPath}/8.png` });
    }
  } catch (error) {
    throw new Error(error.stack);
  } finally {
    await browser.close();
  }
};

const postToInstagram = async (
  user,
  pass,
  photo,
  caption = 'Sent from API'
) => {
  const browser = await puppeteer.launch({
    userDataDir,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  try {
    await page.emulate(iPhone);
    await page.goto('https://www.instagram.com/', {
      waitUntil: 'networkidle2',
    });
    await delay(5000);
    await page.screenshot({ path: `${instagramPath}/1.png` });
    const findAllBtns = await page.$$eval('button', (elements) =>
      elements.map((v) => v.textContent)
    );
    // check if not logged in
    const isNotLoggedIn = findAllBtns.find((v) => v === 'Log In');
    let loggedIn = true;

    // check if login from foreign IP address
    const foreignIPEle = await page.$(
      'html > body > div > section > div > div > div > h2'
    );

    if (
      !!foreignIPEle &&
      GetProperty(foreignIPEle, 'textContent') ===
      'We Detected An Unusual Login Attempt'
    )
      throw new Error('Detected foreign IP');

    if (isNotLoggedIn) {
      loggedIn = false;

      await page.screenshot({ path: `${instagramPath}/2.png` });
      await page.evaluate(() => {
        // eslint-disable-next-line no-undef
        const loginBtn = Array.from(document.querySelectorAll('button')).find(
          (el) => el.textContent === `Log In`
        );

        loginBtn.click();
      });

      // login directly with username and password
      await page.type("input[name='username']", user); // login field
      await page.type("input[name='password']", pass); // password field
      await page.screenshot({ path: `${instagramPath}/3.png` });
      // click Log In button
      await delay(500);
      await page.screenshot({ path: `${instagramPath}/4.png` });
      await Promise.all([
        page.click("button[type='submit']"),
        page.waitForNavigation({
          waitUntil: 'networkidle2',
          timeout: 0,
        }),
      ]);
      await page.click('button');
      await delay(3000);
      await page.screenshot({ path: `${instagramPath}/5.png` });

      loggedIn = true;
    }

    // check if there's a continue button
    await page.evaluate(() => {
      // eslint-disable-next-line no-undef
      const continueBtn = Array.from(
        document.querySelectorAll('button > span')
      ).find((el) => el.textContent.includes('Continue'));

      if (continueBtn) continueBtn.parentElement.click();
    });

    if (loggedIn) {
      await page.screenshot({ path: `${instagramPath}/2.png` });
      // start posting
      const [fileChooser] = await Promise.all([
        page.waitForFileChooser(),
        page.evaluate(() => {
          // eslint-disable-next-line no-undef
          const uploadBtn = Array.from(
            document.querySelectorAll(
              '#react-root > section > nav > div > div > div > div > div > div'
            )
          );

          uploadBtn[2].click();
        }), // some button that triggers file selection
      ]);

      // image to upload here
      await fileChooser.accept([`${twitterPath}/${photo}`]);
      await delay(500);
      await page.screenshot({ path: `${instagramPath}/6.png` });
      if (page.url() === 'https://www.instagram.com/create/style/') {
        await page.screenshot({ path: `${instagramPath}/7.png` });
        await page.evaluate(() => {
          // eslint-disable-next-line no-undef
          const nextBtn = Array.from(document.querySelectorAll('button')).find(
            (el) => el.textContent === `Next`
          );

          nextBtn.click();
        });
        await delay(500);
      }
      if (page.url() === 'https://www.instagram.com/create/details/') {
        // caption here
        await page.screenshot({ path: `${instagramPath}/8.png` });
        await page.type('textarea', caption);
        await page.evaluate(() => {
          // eslint-disable-next-line no-undef
          const shareBtn = Array.from(document.querySelectorAll('button')).find(
            (el) => el.textContent === `Share`
          );

          shareBtn.click();
        });
        // wait for notification to popup
        await delay(5000);
        await page.waitForSelector('div > div > div > div > p');
      }
      await page.screenshot({ path: `${instagramPath}/9.png` });
    }
  } catch (error) {
    throw new Error(error.stack);
  } finally {
    await browser.close();
  }
};

module.exports = {
  getTwitImg,
  postToFacebook,
  postToInstagram,
};
