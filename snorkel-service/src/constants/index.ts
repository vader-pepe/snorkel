export const instagramSelectors = {
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
  mCancelAddToHome: `//button[contains(text(),'Cancel')]`,
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

export const facebookSelectors = {
  // disable "Get alerts about unrecognised logins" first
  emailField: `[type='text'][name='email'][id='email'][data-testid='royal_email']`,
  passField: `[type='password'][name='pass'][id='pass'][data-testid='royal_pass']`,
  loginBtn: `[name='login'][data-testid='royal_login_button'][type='submit']`,
  newPost: `div[aria-label='Create a post'][role='region'] > div > div`,
  newPostPopup: `div[role='textbox'][spellcheck='true'][tabindex='0'][data-lexical-editor='true'][contenteditable='true']`,
  //TODO: get to automate the input from the web (Desktop version)
  postBtn: `div[aria-label='Post'][role='button'][tabindex='0']'`,
  // facebook mobile
  mEmailField: `input#m_login_email[type="email"]`,
  mPassField: `input#m_login_password[name="pass"][type="password"][data-sigil="password-plain-text-toggle-input"]`,
  mLoginBtn: `button[name="login"][type="button"]`,
  mNotNow: `a[role="button"][target="_self"][data-sigil="touchable"]`,
  mNewPost: `div#MComposer[data-top-of-feed-unit-type="composer"][data-referrer="MComposer"] > div > div > div > div[role="button"]`,
  mStatusField: `textarea[aria-label="What's on your mind?"][data-sigil="composer-textarea m-textarea-input"]`,
  mPhotoBtn: `button[data-sigil="touchable hidden-button photo-button"][type="button"]`,
  mPostBtn: `div > button[type="submit"][value="Post"][data-sigil="touchable submit_composer"]`,
}

