export const twitterSelectors = {
  mNotNow: `//span[contains(text(),'Not now')]`,
  mSigninBtn: `a[data-testid="loginButton"]`,
  mLoginBtn: `//div[@role="button"][div[span[span[contains(text(),"Log in")]]]]`,
  // mLoginBtn.parentElement.parentElement.parentElement ==> clickable
  mUsernameField: `input[autocomplete="username"]`,
  mNextStep: `//div[@role="button"][div[span[span[contains(text(),"Next")]]]]`,
  mPasswordField: `input[autocomplete="current-password"][name="password"]`,
  mGetStarted: `//span[contains(text(),'Get started')]`,
  mCloseBtn: `div[aria-label="Close"]`,
  mNewTweet: `a[aria-label="Compose a Tweet"]`,
  mComposeTweet: `textarea[placeholder="What is happening?!"]`,
  mSendTweet: `//span[contains(text(),'Post')]`,
  mTweetSentNotif: `//span[contains(text(),'Your Tweet was sent.')]`,
  mAddPhotosOrVideos: `div[aria-label="Add photos or video"]`,
  mMaybeLater: `//div[@role="button"][div[span[span[contains(text(),"Maybe later")]]]]`,
  uploadedNotif: `//span[contains(text(),"Uploaded (100%)")]`
}
