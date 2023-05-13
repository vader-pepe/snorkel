const USERNAME = process.env.USERNAME as string
const PASSWORD = process.env.PASSWORD as string

async function isFacebookLoggedIn(page: Page) {
  const isLoggedIn = await page.evaluate((selector) => {
    const emailField = document.querySelector(selector)
    if (!!emailField) {
      return false
    }
    return true
  }, facebookSelectors.mEmailField)

  if (isLoggedIn) {
    logger.info("User already logged in")
    return true
  }

  logger.info("User is not logged in. Logging in now")
  await page.type(facebookSelectors.mEmailField, USERNAME, { delay: 100 })
  await page.type(facebookSelectors.mPassField, PASSWORD, { delay: 100 })
  await page.waitForSelector(facebookSelectors.mLoginBtn),

    await Promise.all([
      page.waitForNavigation({
        waitUntil: 'domcontentloaded'
      }),
      page.click(facebookSelectors.mLoginBtn)
    ])

  await page.evaluate((selector) => {
    const notNow = document.querySelector(selector) as HTMLButtonElement
    if (!!notNow) {
      notNow.click()
    }
  }, facebookSelectors.mNotNow)

  return true
}

async function facebookNewTextStatus(page: Page, newStatus = 'test from snorkel') {

  await page.waitForSelector(facebookSelectors.mNewPost)

  await Promise.all([
    page.waitForNavigation({
      waitUntil: 'networkidle0'
    }),
    page.click(facebookSelectors.mNewPost)
  ])

  await page.type(facebookSelectors.mStatusField, newStatus, { delay: 100 })
  // weird Facebook behaviour
  await page.evaluate((selector) => {
    let btn = document.querySelector(selector) as HTMLButtonElement
    btn.click()
  }, facebookSelectors.mPostBtn)

  // dialog leaving Facebook will appear for no reason
  page.on('dialog', async dialog => {
    console.log(dialog.type());
    console.log(dialog.message());
    await dialog.dismiss();
  });

  logger.info("Successfully post a status")
}

async function facebookNewMediaStatus(page: Page) {
  // const [fileChooser] = await Promise.all([
  // page.waitForFileChooser(),
  // page.click(selectors.mFacebookPhotoBtn),
  // ]);
  // await fileChooser.accept(['../1.png']);
}

async function facebookFlow() {
  const page = await puppeteerInstance()
  try {
    await page.emulate(iphoneSe)
    await page.goto('https://www.facebook.com', {
      waitUntil: 'domcontentloaded'
    });

    isFacebookLoggedIn(page)
    // facebookNewTextStatus(page)
    facebookNewMediaStatus(page)
  } catch (error: any) {
    const errorMsg = error?.message as string
    logger.error(errorMsg)
  }
}
