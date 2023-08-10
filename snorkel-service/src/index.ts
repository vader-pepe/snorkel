import prompt from "prompt"

import Client from "./Client";

function main() {
  const client = new Client()
  client.initialize()

  client.on('ready', async ({ facebook, instagram, twitter }) => {
    facebook.on('facebook-state-change', async state => {
      console.log('fb', state)
    })

    instagram.on('instagram-state-change', async state => {
      console.log('insta', state)
      if (state === 'need-security-code') {
        prompt.start()
        prompt.get(['code'], async function(_err, result) {
          await instagram.securityCodeInput(result.code as unknown as `${number}`)
        })
        // input your 6 digit code here
        // await instagram.securityCodeInput('123456')
      }
    })

    twitter.on('twitter-state-change', state => {
      console.log('twt', state)
    })

    const facebookIsLoggedIn = await facebook.isLoggedIn()
    if (!facebookIsLoggedIn) {
      // await facebook.login('YOUR USERNAME', 'YOUR PASSWORD')
    }

    const instagramIsLoggedin = await instagram.isLoggedIn()
    if (!instagramIsLoggedin) {
      // await instagram.login('YOUR USERNAME', 'YOUR PASSWORD')
    }

    const twitterIsLoggedIn = await twitter.isLoggedIn()
    if (!twitterIsLoggedIn) {
      // await twitter.login('YOUR USERNAME', 'YOUR PASSWORD')
    }

  })

}

main()
