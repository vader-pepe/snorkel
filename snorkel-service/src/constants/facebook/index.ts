export const facebookSelectors = {
  // disable "Get alerts about unrecognised logins" first
  emailField: `input[type='text'][name='email'][id='email'][data-testid='royal_email']`,
  passField: `[type='password'][name='pass'][id='pass'][data-testid='royal_pass']`,
  loginBtn: `[name='login'][data-testid='royal_login_button'][type='submit']`,
  newPost: `//span[contains(text(),"What's on your mind, Ihsan?")]`,
  postField: `div[aria-label="What's on your mind, Ihsan?"]`,
  newPostPopup: `div[role='textbox'][spellcheck='true'][tabindex='0'][data-lexical-editor='true'][contenteditable='true']`,
  //TODO: get to automate the input from the web (Desktop version)
  postBtn: `div[aria-label='Post'][role='button'][tabindex='0']'`,
  // facebook mobile
  mEmailField: `input[type="email"][data-sigil="m_login_email"]`,
  mWrongPassword: `//div[contains(text(), "The password that you entered is incorrect, but we can help you get back in to your account")]`,
  mPassField: `input#m_login_password[name="pass"][type="password"][data-sigil="password-plain-text-toggle-input"]`,
  mLoginBtn: `button[name="login"][type="button"][data-sigil="touchable login_button_block m_login_button"]`,
  mNotNow: `a[role="button"][target="_self"][data-sigil="touchable"]`,
  mNewPost: `div[role="button"]`,
  mStatusField: `textarea[aria-label="What's on your mind?"][data-sigil="composer-textarea m-textarea-input"]`,
  mStatusFieldXpath: `//div[contains(text(),"What's on your mind?")]`,
  mStatusFieldOnFill: `//button[contains(text(), "What's on your mind?")]`,
  mPhotoBtn: `button[data-sigil="touchable hidden-button photo-button"][type="button"]`,
  mPostBtn: `div > button[type="submit"][value="Post"][data-sigil="touchable submit_composer"]`,
  mNewPhotosPost: `button[data-sigil="touchable hidden-button photo-button"]`,
  skipNContinue: `//span[contains(text(), "Skip and continue posting")]`
}
