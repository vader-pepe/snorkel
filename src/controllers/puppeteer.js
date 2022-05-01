import HttpStatus from 'http-status-codes';
import { getTwitImg, postToFacebook, postToInstagram } from '../services/puppeteerServices';


/**
 * Get all users.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
// eslint-disable-next-line require-await
export const fromTwitter = async (req, res, next) => {
    // eslint-disable-next-line no-console
    console.log('Queued. Thank you!');
    res.status(HttpStatus.ACCEPTED).send({ message: "Queued. Thank you!" });
    try {
        // eslint-disable-next-line no-console
        const data = req.body;

        const img = await getTwitImg(data.link);

        await postToFacebook(process.env.FB_USER, process.env.FB_PASS, img);

        await postToInstagram(process.env.IG_USER, process.env.IG_PASS, img, data.caption);
    } catch (error) {
        next(error);
    }
}