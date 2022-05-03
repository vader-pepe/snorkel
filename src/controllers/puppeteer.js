/* eslint-disable no-return-await */
import HttpStatus from 'http-status-codes';
import { getTwitImg, postToFacebook, postToInstagram } from '../services/puppeteerServices';
import { Cluster } from "puppeteer-cluster";
import path from 'path';

const userDir = path.resolve('./userDataDir')

/**
 * Get all users.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
// eslint-disable-next-line require-await
export const fromTwitter = async (req, res, next) => {
    req.setTimeout(300000);
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 1,
        puppeteerOptions: {
            userDataDir: userDir,
        },
        monitor: true,
        timeout: 300000,
    });

    // define your task (in this example we extract the title of the given page)
    await cluster.task(async ({ page, data }) => {
        const img = await getTwitImg(page, data.link);

        await postToFacebook(page, process.env.FB_USER, process.env.FB_PASS, img);

        await postToInstagram(page, process.env.IG_USER, process.env.IG_PASS, img, data.caption);

    });

    // eslint-disable-next-line no-console
    console.log('Queued. Thank you!');
    try {
        // eslint-disable-next-line no-console
        const data = req.body;

        await cluster.execute(data);

        res.status(HttpStatus.ACCEPTED).send({ message: "Queued. Thank you!" });

    } catch (error) {
        next(error);
    } finally {
        await cluster.idle();
        await cluster.close();
    }
}