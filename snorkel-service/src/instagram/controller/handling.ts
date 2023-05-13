import { Socket } from "socket.io";
import { instagramPageCtx } from ".";
import selectors from "../../constants/index"
import logger from "../../lib/logger";
import path from "path";
import { writeFile } from "fs";

const storage = path.resolve('./src/storage/instagram')

type ServerResponse = (arg: { message: string }) => { message: string }

const instagramHandling = (socket: Socket) => {
  const { instagramSelectors } = selectors

  // security code input handling
  socket.on('instagram-security-code-input', async (code: string) => {
    if (!!instagramPageCtx) {
      await instagramPageCtx.type(instagramSelectors.securityCode, code)
      await instagramPageCtx.waitForXPath(instagramSelectors.confirmVerifCode).then(async () => {
        await instagramPageCtx.click('xpath/' + instagramSelectors.confirmVerifCode)
      })
    }
  })

  socket.on('instagram-start-uploading', async (file: string | NodeJS.ArrayBufferView, callback: ServerResponse) => {

    writeFile(storage, file, (err) => {
      callback({ message: err ? "failure" : "success" });
    });

    if (!!instagramPageCtx) {
      await instagramPageCtx.waitForSelector(instagramSelectors.mNewPost).then(async () => {

        await instagramPageCtx.evaluate((selector) => {
          const allHome = Array.from(document.querySelectorAll(selector)) as SVGElement[];
          allHome[1]?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.click()

        }, instagramSelectors.mNewPost)

        const [fileChooser] = await Promise.all([
          instagramPageCtx.waitForFileChooser(),
          instagramPageCtx.evaluate((selector) => {
            function getElementByXpath(path: string) {
              return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            }

            const post = getElementByXpath(selector)
            // this is the best I can come with
            post?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.click()

          }, instagramSelectors.mPostSpan)
        ])

        await fileChooser.accept([`${storage}/${file}`]);

      }).catch(() => {
        logger.error('For some reason upload button is not available')
      })
    }
  })

}

export default instagramHandling
