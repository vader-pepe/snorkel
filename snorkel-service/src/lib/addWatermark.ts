import path from "path";
import fs from 'fs/promises'
import ffmpeg from 'fluent-ffmpeg'
// @ts-ignore
import watermark from 'jimp-watermark'

const storage = path.resolve('./src/storage')
const watermarkPath = `${storage}/watermark.png`

export async function addWatermarkToVideo(processingVideo: string) {
  const producedVideo = `${storage}/watermarked_video.mp4`

  await fs.unlink(producedVideo).catch(() => {/* keep empty */ })
  ffmpeg()
    .input(processingVideo)
    .input(watermarkPath)
    .videoCodec('libx264')
    .outputOptions('-pix_fmt yuv420p')
    .complexFilter([
      `[0:v][1:v]overlay=W-w-1:H-h-1`
    ])
    .output(producedVideo)
    .run()

  return producedVideo

}

export async function addWatermarkToImage(image: string): Promise<string> {
  const options = {
    'ratio': 0.6,
    'opacity': 1,
    'dstPath': `${storage}/watermarked_image.jpg`
  };
  const res = await watermark.addWatermark(image, watermarkPath, options) as {
    destinationPath: string
    imageHeight: number
    imageWidth: number
  };
  return res.destinationPath as string
}

export const getVideoMetadata = (videoPath: string): Promise<ffmpeg.FfprobeData> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve(metadata);
      }
    });
  });
}

