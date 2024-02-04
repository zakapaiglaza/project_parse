import request from "request";
import * as cheerio from "cheerio";

export default class WebPageScraper {
    private url: string;

    constructor(url: string) {
        this.url = url;
    }

    async scrapeData(): Promise<{ title: string; encrypted: string | undefined }> {
        return new Promise((resolve, reject) => {
            request(this.url, (error, response, body) => {
                if (!error) {
                    const $ = cheerio.load(body);
                    const data = $("player-control ");
                    const title = $("h1").text();
                    const encrypted = data.attr('data-tag1');

                    resolve({ title, encrypted });
                } else {
                    reject(error);
                }
            });
        });
    }
}