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
  mStatusFieldXpath: `//div[contains(text(),"What's on your mind?")]`,
  mPhotoBtn: `button[data-sigil="touchable hidden-button photo-button"][type="button"]`,
  mPostBtn: `div > button[type="submit"][value="Post"][data-sigil="touchable submit_composer"]`,
}
