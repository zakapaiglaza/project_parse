import RL from './readline/readline';
import Parser from "./utils/parserAsUtils";
import M3u8ToMp4Converter from "./convertor/convertor";
import Serials from './modules/serialS';
import { updateProgress } from './utils/drawLine/drawProgress';
import UserDataManager from './modules/dataUser';
import { parseSeasonsData } from './modules/parseSeasonsData';

const rl = new RL();
const userManager = new UserDataManager();

async function start() {
    const url = await rl.askUrl('Введите URL : ');
    const parser = new Parser();
    const serials = new Serials(url);

    parser.getPlayerData(url, async (error: any, response: any) => {
        if (error) {
            console.error('Ошибка при получении данных:', error);
            return;
        }

        if (response && response.data && response.data.length > 0 && response.data[0].tabName === 'Плеєр') {
            const seasonsData = response.data[0].seasons;
            let permanentData = response.data[0];

            parseSeasonsData(seasonsData, serials);

            console.log('Список сезонов:', serials.getAllSeasons());



            try {
                const selectedSeason = await rl.askQuestion('Выберите сезон: ');
                const selectedSeasonData = serials.getSeasons(`${selectedSeason} сезон`);

                userManager.setSeason(selectedSeason);

                if (!selectedSeasonData) {
                    console.error('Сезон не найден');
                    return;
                }

                console.log('Сезон:', selectedSeasonData.title);
                console.log('Список эпизодов:', selectedSeasonData.episode.map((episode: any) => episode.title));

                const selectedEpisode = await rl.askQuestion('Выберите эпизод: ');
                const selectedEpisodeData = selectedSeasonData.getTitleEpisodes(selectedEpisode.toString());

                userManager.setEpisode(selectedEpisode);

                if (!selectedEpisodeData) {
                    console.error('Эпизод не найден');
                    return;
                }

                console.log('Эпизод:', selectedEpisodeData.title);
                console.log('Озвучка:', selectedEpisodeData.sounds);

                const selectedVoice = await rl.askQuestion('Выберите озвучку: ');
                userManager.setSound(selectedVoice);

                const userUrlSerials = userManager.getUserUrlSerials(permanentData.seasons);
                if (userUrlSerials === null) {
                    return null;
                }

                try {
                    const qResponse: any[] = await new Promise((resolve, reject) => {
                        parser.checkQuality(userUrlSerials, (error: any, res: any[]) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(res);
                            }
                        });
                    });

                    qResponse.forEach((quality, index) => {
                        console.log(`${index + 1}. ${quality.resolution}`);
                    });

                    const selectedQuality = await rl.askQuestion('Выберите качество: ');
                    const indexQuality = qResponse[selectedQuality - 1];
                    console.log('Выбрано качество:', indexQuality.resolution);

                    const converter = new M3u8ToMp4Converter();
                    const filePath = userManager.FilePathUser();

                    await converter.setInputFile(indexQuality.url)
                        .setOutputFile(filePath)
                        .start({
                            onProgress: function (progress: any) {
                                updateProgress(progress);
                            },
                            onError: function (error: any) {
                                console.error('Ошибка конвертации:', error);
                            }
                        });
                    console.log('Сконвертировано:', filePath);
                } catch (e) {
                    console.error('Ошибка при проверке качества видео:', e);
                }

            } catch (e) {
                console.error('ошибка при выборе сезона и эпизода:', e);
            } finally {
                rl.close();
            }
        } else {
            console.error('данные  не найдены');
        }
    });
}

export default start;
