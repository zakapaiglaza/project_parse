import M3u8ToMp4Converter from "./src/modules/video/convert";
import readlineSync from "readline-sync";
import WebPageScraper from "./src/modules/network/req_Service";
import { resolve } from "path";
import request from "request";
// import DownloadFile from "./src/modules/file/download";

class App {
    private scraper: WebPageScraper;
    private converter: M3u8ToMp4Converter;
    // private downloader: DownloadFile;

    constructor() {
        this.scraper = new WebPageScraper('');
        this.converter = new M3u8ToMp4Converter();
        // this.downloader = new DownloadFile();
    }

    async run(): Promise<void> {
        try {
            const url = readlineSync.question('Введите URL: ', { encoding: 'utf-8' });
            this.scraper.writeUrl(url);
            const data = await this.scraper.scrapeData();
            console.log('Данные о сериале', data);

            for(let i = 0; i < data.episodes.length; i++) {
                console.log(`${i + 1}. ${data.episodes[i]}`);
            }

            const confirmEpisodeIndex = readlineSync.questionInt('Выберите эпизод: ');
            if(confirmEpisodeIndex < 1 ) {
                console.log('Такой серии нет!');
                return;
            }

            const selectedEpisode = data.episodes[confirmEpisodeIndex - 1];
            console.log(`Выбран эпизод: ${selectedEpisode}`);

            const season = 1; 
            const episodeNumber = Number(selectedEpisode.split(' ')[0]);

          
            // const outputFile = `episode_${season}_${episodeNumber}.m3u8`;
            // await this.downloader.downloader(url, outputFile);

        
            await this.converter.setInputFile(`episode_${season}_${episodeNumber}.m3u8`)
                .setOutputFile(`episode_${season}_${episodeNumber}.mp4`)
                .start();

            console.log(`Конвертация успешна для сезона ${season}, серии ${selectedEpisode}`);
        } catch (e) {
            console.error('Ошибка:', e);
        }
    }
}

const app = new App();
app.run();
