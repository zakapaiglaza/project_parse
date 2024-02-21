import Episodes from "./episodeS";


export default class Seasons {
    title: string;
    episode: Episodes[];

    constructor(title: string, episode: Episodes[] = []) {
        this.title = title;
        this.episode = episode;
    }

    pushEpisodes(episode: Episodes): void {
        if (episode.sounds && episode.sounds.length > 0) {
            this.episode.push(episode);
        } else {
            console.error(`Ошибка '${episode.title}' нету дорожек.`);
        }
    }

    getTitleEpisodes(title: string): Episodes | null {
        const episodeNumber = title.match(/\d+/);
        if (episodeNumber) {
            return this.episode.find(episod => episod.title === `${episodeNumber[0]} серія`) || null;
        } else {
            return null;
        }
    }

    // getQualityEpisodes(quality: string): Episodes[] {
    //     return this.episode.filter(episode => episode.videoQuality === quality);
    // }
}