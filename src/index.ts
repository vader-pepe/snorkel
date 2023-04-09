import { KnownDevices, Page } from "puppeteer";
import puppeteerInstance from "./puppeteerInstance";
const iphoneSe = KnownDevices['iPhone SE']

const instagramSelectors = {
  emailField: `input[aria-label="Phone number, username or email address"]`,
  passwordField: `input[aria-label="Password"]`,
  loginBtn: `//div[contains(text(),'Log In')]`,
  // loginBtn.parentElement is clickable
  loginSubmitBtn: `button[type="submit"]`,
  verifCodeInput: `input[aria-describedby="verificationCodeDescription"][aria-label="Security code"][name="verificationCode"]`,
  suspiciousLogin: `//p[contains(text(),'Suspicious login attempt')]`,
  // suspiciousLogin.parentElement ==> clickable
  unusualLogin: `//h2[contains(text(),'We've detected an unusual login attempt')]`,
  thisWasMe: `//button[contains(text(),'This was me')]`,
  confirmVerifCode: `//button[contains(text(),'Confirm')]`,
  resendVerifCode: `//div[contains(text(),'resend it')]`,
  // verification choises
  verifMethods: `label`,
  // verifMethods[0] ==> phone number
  // verifMethods[1] ==> email
  sendVerifCode: `//button[contains(text(),'Send Security Code')]`,
  logoutVerif: `//a[contains(text(),'Log out')]`,
  securityCode: `input[aria-label="Security code"]`,
  submitSecurityCode: `//button[contains(text(),'Submit')]`,
  getNewSecurityCode: `//a[contains(text(),'Get a new one')]`,
  goBack: `//a[contains(text(),'Go back')]`,
  turnOnNotifications: `//span[contains(text(),'Turn on notifications')]`,
  notNow: `//button[contains(text(),'Not Now')]`,
  // this is only the SVG. not clickable
  newPost: `svg[aria-label="New post"]`,
  // newPost.parentElement.parentElement.parentElement.parentElement.parentElement ==> the a element which is clickable
  // use querySelectorAll
  mNewPost: `svg[aria-label="Home"]`,
  // mNewPost[1].parentElement.parentElement.parentElement.parentElement.parentElement ==> the a element which is clickable
  mPostType: `div[role="dialog"]`,
  // mPostType.children[0].children[0].children[0].children[0] ==> post
  // mPostType.children[0].children[0].children[0].children[1] ==> story
  mExpand: `//span[contains(text(),'Expand')]`,
  // mExpand.parentElement ==> clickable
  mRotate: `//span[contains(text(),'Rotate')]`,
  mTabs: `//div[contains(text(),'Filter')]`,
  // mTabs.parentElement.parentElement.children[0] ==> Filter
  // mTabs.parentElement.parentElement.children[1] ==> Edit
  mPostNextStep: `//button[contains(text(),'Next')]`,
  mCaption: `textarea[aria-label="Write a caption..."]`,
  mShareBtn: `//button[contains(text(),'Share')]`,
  // TODO: add support for Desktop
  selectFromComputer: `//button[contains(text(),'Select From Computer')]`,
  ratios: `svg[aria-label="Select Crop"]`,
  // ratios.parentElement.parentElement ==> clickable
  ratiosChoises: `//div[contains(text(),'Original')]`,
  // ratiosChoises.parentElement.parentElement.parentElement.parentElement.querySelectorAll('button') ==> the buttons
  postNextStep: `//div[contains(text(),'Next')]`,
  filtersTab: `//span[contains(text(),'Filters')]`,
  // adjustmentsTab: `//span[contains(text(),'Adjustments')]`,
  filters: `//div[contains(text(),'Clarendon')]`,
  // filters.parentElement.parentElement.parentElement.children[1].children[0] ==> clickable filters (0-11)
}

function getElementByXpath(path: string) {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

const USERNAME = process.env.USERNAME as string
const PASSWORD = process.env.PASSWORD as string

async function isInstagramLoggedIn(page: Page) {
  await page.exposeFunction("getElementByXpathInject", getElementByXpath)

  const isLoggedin = await page.evaluate(async (selector) => {
    // @ts-ignore
    const isLoginBtnExist = await window.getElementByXpathInject(selector) as HTMLDivElement
    if (!!isLoginBtnExist) {
      isLoginBtnExist.parentElement?.click()
      return false
    }
    return true
  }, instagramSelectors.loginBtn)

  if (isLoggedin) {
    return true
  }

  await page.type(instagramSelectors.emailField, USERNAME)
  await page.type(instagramSelectors.passwordField, PASSWORD)
  await page.waitForSelector(instagramSelectors.loginSubmitBtn)

  await Promise.all([
    page.waitForNavigation({
      waitUntil: 'networkidle0'
    }),
    page.click(instagramSelectors.loginSubmitBtn)
  ])

  const regionBlocked = await page.evaluate(async (selector) => {
    const isSuspiciousLoginElementExist = document.querySelector(selector)
    if (!!isSuspiciousLoginElementExist) {
      return true
    }
    return false
  }, instagramSelectors.emailField)

  if (regionBlocked) {
    throw ('Please handle login!')
    // choose verification method (phone/email)
    // input the code given
    // proceed to home
  }

  return true
}

async function instagramFlow() {
  const page = await puppeteerInstance()
  try {
    await page.emulate(iphoneSe)
    await page.goto('https://www.instagram.com', {
      waitUntil: 'domcontentloaded'
    })

    isInstagramLoggedIn(page)

  } catch (error: any) {
    const errorMsg = error?.message as string
  }
}

instagramFlow()
