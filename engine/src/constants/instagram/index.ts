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
  submitSecurityCode: `//button[text()[contains(
    translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),
    'submit'
  )]]`,
  getNewSecurityCode: `//a[contains(text(),'Get a new one')]`,
  goBack: `//a[contains(text(),'Go back')]`,
  turnOnNotifications: `//span[contains(text(),'Turn on notifications')]`,
  notNowBtn: `//button[text()[
  contains(
    translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),
    'not now'
  )
]]`,
  notNowDiv: `//div[@role="button"][text()[
  contains(
    translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),
    'not now'
  )
]]`,
  newPost: `//a[div[div[div[div[span[span[text()[contains(
    translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),
    'create'
  )]]]]]]]]`,
  selectFromComputer: `//button[text()[
  contains(
    translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),
    'select from computer'
  )
]]`,
  mCancelAddToHome: `//button[text()[
  contains(
    translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),
    'cancel'
  )
]]`,
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
  postNextStep: `//div[text()[
  contains(
    translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),
    'next'
  )
]]`,
  caption: `div[data-lexical-editor="true"]`,
  shareDiv: `//div[@role="button"][text()[
  contains(
    translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),
    'share'
  )
]]`,
  okBtn: `//button[text()[
  contains(
    translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),
    'ok'
  )
]]`,
  sharedNotif: `//span[text()[contains(
    translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),
    'shared'
  )]]`,
  switchAccount: `//div[@role="button"][text()[
  contains(
    translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),
    'switch account'
  )
]]`,
  closeBtn: `//div[@role="button"][div[*[*[text()[
  contains(
    translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),
    'close'
  )
]]]]]`,
  profile: `//div//div//span//div//a[@role="link"][div[div[div[div[span[span[text()[
  contains(
    translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),
    'profile'
  )
]]]]]]]]`,
  changeProfilePhoto: `//button[@title[contains(
    translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),
    'change profile photo'
  )]]`,
  postsContainer: `//article//div//div//div[a[@role="link"][@tabindex="0"]]`,
  contentContainer: '//main//div//div[div[div[div[div[@role="button"][@aria-hidden]]]]]',
  contentPoster: `//header//div//div//div//div//div//span//div//div//a`,
  contentCaption: `//main//div//div[div[div[div[div[@role="button"][@aria-hidden]]]]]`,
  contentLikesCount: `//section//span[@dir="auto"]//a//span[contains(
    translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),
    'like'
  )]`,
  contentImg: '//main//div//div[div[div[div[div[@role="button"][@aria-hidden]]]]]//img',
  contentVid: '//main//div//div[div[div[div[div[@role="button"][@aria-hidden]]]]]//video',
  ratios: `svg[aria-label="Select Crop"]`,
  // ratios.parentElement.parentElement ==> clickable
  ratiosChoises: `//div[contains(text(),'Original')]`,
  // ratiosChoises.parentElement.parentElement.parentElement.parentElement.querySelectorAll('button') ==> the buttons
  filtersTab: `//span[contains(text(),'Filters')]`,
  // adjustmentsTab: `//span[contains(text(),'Adjustments')]`,
  filters: `//div[contains(text(),'Clarendon')]`,
  // filters.parentElement.parentElement.parentElement.children[1].children[0] ==> clickable filters (0-11)
};
