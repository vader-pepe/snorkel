export const twitterSelectors = {
  mNotNow: `//span[contains(text(),'Not now')]`,
  mLoginBtn: `//span[contains(text(),'Log in')]`,
  // mLoginBtn.parentElement.parentElement.parentElement ==> clickable
  mUsernameField: `input[autocomplete="username"]`,
  mNextStep: `//span[contains(text(),'Next')]`,
  mPasswordField: `input[autocomplete="current-password"][name="password"]`,
  mGetStarted: `//span[contains(text(),'Get started')]`,
  mCloseBtn: `div[aria-label="Close"]`,
  mNewTweet: `a[aria-label="Compose a Tweet"]`,
  mComposeTweet: `textarea[placeholder="What is happening?!"]`,
  mSendTweet: `//span[contains(text(),'Tweet')]`,
  mTweetSentNotif: `//span[contains(text(),'Your Tweet was sent.')]`,
  mAddPhotos: `div[aria-label="Add photos or video"]`
}
