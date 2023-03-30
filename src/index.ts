import puppeteer, { KnownDevices, Page } from "puppeteer-core"
const iphoneSe = KnownDevices['iPhone SE']
import "dotenv/config"

const selectors = {
  // disable "Get alerts about unrecognised logins" first
  facebookEmailField: `[type='text'][name='email'][id='email'][data-testid='royal_email']`,
  facebookPassField: `[type='password'][name='pass'][id='pass'][data-testid='royal_pass']`,
  facebookLoginBtn: `[name='login'][data-testid='royal_login_button'][type='submit']`,
  facebookNewPost: `div[aria-label='Create a post'][role='region'] > div > div`,
  facebookNewPostPopup: `div[role='textbox'][spellcheck='true'][tabindex='0'][data-lexical-editor='true'][contenteditable='true']`,
  //TODO: get to automate the input from the web
  facebookPostBtn: `div[aria-label='Post'][role='button'][tabindex='0']'`,
  // facebook mobile
  mFacebookEmailField: `input#m_login_email[type="email"]`,
  mFacebookPassField: `input#m_login_password[name="pass"][type="password"][data-sigil="password-plain-text-toggle-input"]`,
  mFacebookLoginBtn: `button[name="login"][type="button"]`,
  mFacebookNewPost: `div[role="button"][aria-label="Create a post on Facebook"]`,
  mFacebookNewPostModalShow: `div#MComposer[data-referrer="MComposer"] > div > div > div > div[role="button"][tabindex="0"]`,
  mFacebookStatusTextArea: ``
  //TODO: somehow different from firefox. must use chrome for later development
  //mFacebookNewPostModalShowFirefox: `div[data-tti-phase="-1"][data-actual-height="182"][ data-mcomponent="MContainer" ][ data-type="container" ][ data-focusable="true" ] > div > button`,
  //mFacebookStatusTextAreaFirefox: `div[data-tti-phase="-1"][data-actual-height="182"][ data-mcomponent="MContainer" ][ data-type="container" ][ data-focusable="true" ] > div > div > textarea`,
  //mFacebookPostbtnFirefox: `div[data-tti-phase="-1"][data-actual-height="60"][data-mcomponent="MContainer"][data-type="container"][data-focusable="true"] > div > div > div > button`,
  //mFacebookNotNowFirefox: `a[role="button"][data-sigil="touchable"]`
  // mFacebookZeroPolicySkip: `div[role="button"][aria-label="No, Thanks"][data-tti-phase="-1"][data-type="container"]`
  // twitter: `[data-testid="FloatingActionButtonBase"]`,
  // instagram: `svg[aria-label="Home"]`,
}

async function checkElementExists(page: Page, selector: string) {
  const element = await page.$(selector);
  if (element) {
    return true;
  } else {
    return false;
  }
}

const USERNAME = process.env.USERNAME as string
const PASSWORD = process.env.PASSWORD as string
const main = async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: false,
  });
  const page = await browser.newPage();
  await page.emulate(iphoneSe)
  await page.goto('https://www.facebook.com', {
    waitUntil: 'domcontentloaded'
  });

  await page.type(selectors.mFacebookEmailField, USERNAME)
  await page.type(selectors.mFacebookPassField, PASSWORD)
  await page.waitForSelector(selectors.mFacebookLoginBtn),

    await Promise.all([
      page.waitForNavigation({
        waitUntil: 'domcontentloaded'
      }),
      page.click(selectors.mFacebookLoginBtn)
    ])

  const notNowBtnExist = await checkElementExists(page, selectors.mFacebookNotNow)
  if (!!notNowBtnExist) {
    await page.click(selectors.mFacebookNotNow)
  }

  await page.waitForSelector(selectors.mFacebookNewPostModalShow, {
    timeout: 0
  })
  await page.click(selectors.mFacebookNewPostModalShow)
  await page.type(selectors.mFacebookStatusTextArea, "test from snorkel")
  await page.click(selectors.mFacebookPostbtn)

}

main()
