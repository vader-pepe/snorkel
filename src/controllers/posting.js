/* eslint-disable no-return-await */
import HttpStatus from 'http-status-codes';
import { getTwitImg, postToFacebook, postToInstagram } from '../services/postingServices';
import { Cluster } from "puppeteer-cluster";
import path from 'path';
import fs from "fs";
import logger from '../utils/logger';

const userDir = path.resolve('./userDataDir')
const twitterPath = path.resolve('./twitter')

/**
 * Get all users.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
export const fromTwitter = async (req, res, next) => {
    // using cluster so every request not stacking each other.
    // less CPU power.
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE,
        maxConcurrency: 1,
        puppeteerOptions: {
            userDataDir: userDir,
        },
        monitor: true,
    });

    // define your task (in this example we extract the title of the given page)
    await cluster.task(async ({ page, data }) => {
        const img = await getTwitImg(page, data.link);

        await postToFacebook(page, process.env.FB_USER, process.env.FB_PASS, img, data.caption);

        await postToInstagram(page, process.env.IG_USER, process.env.IG_PASS, img, data.caption);

        fs.unlinkSync(`${twitterPath}/${img}`);

    });
    // always return this to the client
    res.status(HttpStatus.ACCEPTED).send({ message: "Queued. Thank you!" });
    try {
        const data = req.body;

        await cluster.queue(data);

    } catch (error) {
        // this used to send error response to the client.
        // next(error);
        logger.error(error.stack);
    } finally {
        await cluster.idle();
        await cluster.close();
    }
}
