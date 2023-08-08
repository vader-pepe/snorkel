// eslint-disable-next-line
export const instagramSelectors = {
  emailField: `//input[@aria-label[
  contains(
    translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),
    'user'
  )
]]`,
  passwordField: `//input[@aria-label[
  contains(
    translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),
    'password'
  )
]]`,
  loginBtn: `//button[div[text()[
  contains(
    translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),
    'log in'
  )
]]]`,
  loginSubmitBtn: `button[type="submit"]`,
  verifCodeInput: `input[aria-describedby="verificationCodeDescription"][aria-label="Security code"][name="verificationCode"]`,
  suspiciousLogin: `//p[contains(text(),'Suspicious login attempt')]`,
  // suspiciousLogin.parentElement ==> clickable
  unusualLogin: `//h2[contains(text(),'We've detected an unusual login attempt')]`,
  thisWasMe: `//button[contains(text(),'This was me')]`,
  trustThisDevice: `//label[div[span[text()[contains(
    translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),
    'trust'
  )]]]]`,
  confirmVerifCode: `//button[contains(text(),'Confirm')]`,
  resendVerifCode: `//div[contains(text(),'resend it')]`,
  // verification choises
  verifMethods: `label`,
  // verifMethods[0] ==> phone number
  // verifMethods[1] ==> email
  sendVerifCode: `//button[contains(text(),'Send Security Code')]`,
  logoutVerif: `//a[text()[
  contains(
    translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),
    'log out'
  )
]]`,
  securityCode: `input[aria-label="Security Code"]`,
  submitSecurityCode: `//button[contains(text(),'Submit')]`,
  getNewSecurityCode: `//a[contains(text(),'Get a new one')]`,
  goBack: `//a[contains(text(),'Go back')]`,
  turnOnNotifications: `//span[contains(text(),'Turn on notifications')]`,
  notNowBtn: `//button[contains(text(),'Not Now')]`,
  notNowDiv: `//div[contains(text(),'Not now')]`,
  notNowSaveLoginInfo: `//button[contains(text(),'Not now')]`,
  // this is only the SVG. not clickable
  newPost: `svg[aria-label="New post"]`,
  // newPost.parentElement.parentElement.parentElement.parentElement.parentElement ==> the a element which is clickable
  // use querySelectorAll
  mNewPost: `//a[div[div[div[div[*[*[text()[
  contains(
    translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),
    'home'
  )
]]]]]]]]`,
  mPostSpan: `//div[@role="button"][div[div[div[div[div[div[span[span[text()[
  contains(
    translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),
    'post'
  )
]]]]]]]]]]`,
  mCancelAddToHome: `//button[contains(text(),'Cancel')]`,
  wrongSecurityCode: `//p[contains(text(), 'Please check the security code and try again.')]`,
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
};
