import axios, { AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';

interface SetSerials {
    season: string[];
    sounds: string[];
    episodes: string[];
    title: string;
    encrypted: string | undefined;
}

export default class WebPageScraper {
    private url: string;

    constructor(url: string) {
        this.url = url;
    }

    async scrapeData(): Promise<SetSerials> {
        try {
            const response: AxiosResponse = await axios.get(this.url);
            const { data } = response;
            const $ = cheerio.load(data);

            const setSerials: SetSerials = {
                season: [],
                sounds: [],
                episodes: [],
                encrypted: $("player-control").attr('data-tag1'),
                title: $("h1").text().trim()
            };
            
            // const confirmData = $('<high-select animated="" arrow="" data-key="seasons" data-index="0" tabindex="0"><high-option value="0" slot="option" selected="">1 сезон</high-option><high-option value="1" slot="option">2 сезон</high-option><high-option value="2" slot="option">3 сезон</high-option><high-option value="3" slot="option">4 сезон</high-option></high-select>');
            // const box: number[] = [];
            // confirmData.find('high-option').each((index, element) => {
            //     const s = parseInt($(element).text().trim());
            //     box.push(s);
            // });
            // setSerials.season = box;
            const confirmData = $('<high-select animated="" arrow="" data-key="seasons" data-index="0" tabindex="0"><high-option value="0" slot="option" selected="">1 сезон</high-option><high-option value="1" slot="option">2 сезон</high-option><high-option value="2" slot="option">3 сезон</high-option><high-option value="3" slot="option">4 сезон</high-option></high-select>');
            const box: string[] = [];
            confirmData.find('high-option').each((index, element) => {
                const s = $(element).text().trim().split(' ')[0];
                box.push(s);
            });
            setSerials.season = box;
            // const confirmDataEpi = $('<high-select animated="" arrow="" data-key="episodes" data-index="1" tabindex="0"><high-option value="0-0" slot="option" selected="">1 серія</high-option><high-option value="0-1" slot="option">2 серія</high-option><high-option value="0-2" slot="option">3 серія</high-option><high-option value="0-3" slot="option">4 серія</high-option><high-option value="0-4" slot="option">5 серія</high-option><high-option value="0-5" slot="option">6 серія</high-option><high-option value="0-6" slot="option">7 серія</high-option><high-option value="0-7" slot="option">8 серія</high-option><high-option value="0-8" slot="option">9 серія</high-option><high-option value="0-9" slot="option">10 серія</high-option><high-option value="0-10" slot="option">11 серія</high-option><high-option value="0-11" slot="option">12 серія</high-option><high-option value="0-12" slot="option">13 серія</high-option><high-option value="0-13" slot="option">14 серія</high-option><high-option value="0-14" slot="option">15 серія</high-option></high-select>');
            // const box2: number[] = [];
            // confirmDataEpi.find('high-option').each((index, element) => {
            //     const name = parseInt($(element).text().trim());
            //     box2.push(name);
            // });
            // setSerials.episodes = box2;
            const confirmDataEpi = $('<high-select animated="" arrow="" data-key="episodes" data-index="1" tabindex="0"><high-option value="0-0" slot="option" selected="">1 серія</high-option><high-option value="0-1" slot="option">2 серія</high-option><high-option value="0-2" slot="option">3 серія</high-option><high-option value="0-3" slot="option">4 серія</high-option><high-option value="0-4" slot="option">5 серія</high-option><high-option value="0-5" slot="option">6 серія</high-option><high-option value="0-6" slot="option">7 серія</high-option><high-option value="0-7" slot="option">8 серія</high-option><high-option value="0-8" slot="option">9 серія</high-option><high-option value="0-9" slot="option">10 серія</high-option><high-option value="0-10" slot="option">11 серія</high-option><high-option value="0-11" slot="option">12 серія</high-option><high-option value="0-12" slot="option">13 серія</high-option><high-option value="0-13" slot="option">14 серія</high-option><high-option value="0-14" slot="option">15 серія</high-option></high-select>');
            const box2: string[] = [];
            confirmDataEpi.find('high-option').each((index, element) => {
                const name = $(element).text().trim().split(' ')[0];
                box2.push(name);
            });
            setSerials.episodes = box2;
                

            return setSerials;
        } catch (error: any) {
            throw new Error(`Error fetching data: ${error.message}`);
        }
    }

    writeUrl(url: string) {
        this.url = url;
    }

    getUrl(): string {
        return this.url;
    }
}
