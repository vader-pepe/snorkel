import ffmpeg from 'fluent-ffmpeg'

type ObjectLiteral = { [key: string]: any };
const has = (o: ObjectLiteral, k: string): boolean => Object.prototype.hasOwnProperty.call(o, k);

class Util {
  constructor() {
    throw new Error(`The ${this.constructor.name} class may not be instantiated.`)
  }

  static mergeDefault<T extends ObjectLiteral>(def: T, given?: T): T {
    if (!given) return def;
    for (const key in def) {
      if (!has(given, key) || given[key] === undefined) {
        given[key] = def[key];
      } else if (given[key] === Object(given[key])) {
        given[key] = Util.mergeDefault(def[key], given[key]);
      }
    }

    return given;
  }

  /**
 * Configure ffmpeg path
 * @param {string} path
 */
  static setFfmpegPath(path: string) {
    ffmpeg.setFfmpegPath(path);
  }

}

export default Util
