import * as cheerio from "cheerio";

class CheerioUtils {
    static parseBody(body: string): cheerio.Root {
        return cheerio.load(body);
    }
}

export default CheerioUtils;
