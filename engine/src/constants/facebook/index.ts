export const facebookSelectors = {
  emailField: `input[type='text'][name='email'][id='email'][data-testid='royal_email']`,
  passField: `[type='password'][name='pass'][id='pass'][data-testid='royal_pass']`,
  loginBtn: `[name='login'][data-testid='royal_login_button'][type='submit']`,
  newPost: `//span[contains(text(),"What's on your mind, Ihsan?")]`,
  postField: `div[aria-label="What's on your mind, Ihsan?"]`,
  newPostPopup: `div[role='textbox'][spellcheck='true'][tabindex='0'][data-lexical-editor='true'][contenteditable='true']`,
  postBtn: `div[aria-label='Post'][role='button'][tabindex='0']'`,
  // facebook mobile
  mEmailField: `input[type="email"][data-sigil="m_login_email"]`,
  mWrongPassword: `//div[contains(text(), "The password that you entered is incorrect, but we can help you get back in to your account")]`,
  mPassField: `input#m_login_password[name="pass"][type="password"][data-sigil="password-plain-text-toggle-input"]`,
  mLoginBtn: `button[name="login"][type="button"][data-sigil="touchable login_button_block m_login_button"]`,
  mNotNow: `a[role="button"][target="_self"][data-sigil="touchable"]`,
  mNewPost: `div[role="button"]`,
  mStatusField: `textarea[aria-label="What's on your mind?"][data-sigil="composer-textarea m-textarea-input"]`,
  statusFieldXpath: `//span[contains(text(),"What's on your mind")]`,
  mStatusFieldOnFill: `//button[contains(text(), "What's on your mind?")]`,
  mPhotoBtn: `button[data-sigil="touchable hidden-button photo-button"][type="button"]`,
  newPhotoOrVideoPost: '[aria-label="Photo/video"]',
  mediaInput: `//div[@role="button"][div[div[div[div[div[span[
  contains(
    translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),
    'add photos'
  )
]]]]]]]`,
  skipNContinue: `//span[text()[contains(
    translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),
    "Skip and continue posting"
  )]]`,
  // =============================== V2 =====================================
  whatsOnYourmind: `//div[@role="button"][div[span[contains(text(),"What's on your mind")]]]`,
  captionSpawner: `//button[contains(text(),"What's on your mind?")]`,
  captionTextarea: `//*[@data-lexical-editor="true"][@contenteditable][@aria-label[
  contains(
    translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),
    "what's on your mind"
  )
]]`,
  submitPostBtn: `div[aria-label="Post"]`,
  mNewVideoPost: `//div[@role="button"][div[div[text()[contains(
    translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),
    'video'
  )]]]]`,
  postedToast: `[aria-atomic="true"][aria-live="polite"][role="alert"]`,
  timelines: `//div[@class="m"][@data-tracking-duration-id][@data-type="container"][div[div[@data-comp-id]]]`,
  // desktop!
  posts: `//div[div[div[div[div[div[@aria-posinset]]]]]]`,
  postsHeader: `//div[@data-tti-phase="-1"][@data-tracking-duration-id][@data-actual-height][@data-mcomponent="MContainer"][@data-type="container"][@data-focusable="true"][div[div[div[div[div[img]]]]]]`,
  postsFooter: `//div[@data-tti-phase="-1"][@data-tracking-duration-id][@data-actual-height][@data-mcomponent="MContainer"][@data-type="container"][@data-focusable="true"][div[@data-comp-id][@data-long-click-action-id]]`
}


