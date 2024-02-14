
import readlineSync from "readline-sync";
import WebPageScraper from "./src/modules/network/req_Service";
import M3u8ToMp4Converter from "./src/modules/video/convert";
import MediaServerRequest from "./src/modules/network/mediaReqService";
import VideoConverter from "./src/index";

class App {
    private scraper: WebPageScraper;

    constructor() {
        this.scraper = new WebPageScraper('');
    }

    async run(): Promise<void> {
        try {
            const url = readlineSync.question('Введите URL: ', { encoding: 'utf-8' });
            this.scraper.writeUrl(url);
            const data = await this.scraper.scrapeData();
            // console.log('Данные о сериале', data);

            for (let i = 0; i < data.seasons.length; i++) {
                console.log(`${i + 1}. ${data.seasons[i].title}`);
            }
            const confirmSeasonIndex = readlineSync.questionInt('Выберите сезон: ');
            if (confirmSeasonIndex < 1 || confirmSeasonIndex > data.seasons.length) {
                console.log('Некорректный выбор сезона!');
                return;
            }

            const selectedSeasonIndex = confirmSeasonIndex - 1;
            const selectedSeason = data.seasons[selectedSeasonIndex].title;
            console.log(`Выбран сезон: ${selectedSeason}`);
            

            for (let i = 0; i < data.seasons[selectedSeasonIndex].episodes.length; i++) {
                console.log(`${i + 1}. ${data.seasons[selectedSeasonIndex].episodes[i]}`);
            }
            const confirmEpisodeIndex = readlineSync.questionInt('Выберите эпизод: ');
            if (confirmEpisodeIndex < 1 || confirmEpisodeIndex > data.seasons[confirmSeasonIndex - 1].episodes.length) {
                console.log('Некорректный выбор эпизода!');
                return;
            }

            const selectedEpisode = data.seasons[selectedSeasonIndex].episodes[confirmEpisodeIndex - 1];
            console.log(`Выбран эпизод: ${selectedEpisode}`);

            const mediaServerRequest = new MediaServerRequest();
            const mediaData = await mediaServerRequest.processMediaServerRequest();

            const videoConverter = new VideoConverter();
            await videoConverter.processVideos(mediaData, selectedSeasonIndex + 1, confirmEpisodeIndex);

            console.log(`Конвертация успешна для эпизода ${selectedEpisode}`);
        } catch (e) {
            console.error('Произошла ошибка:', e);
        }
    }
}

const app = new App();
app.run();


