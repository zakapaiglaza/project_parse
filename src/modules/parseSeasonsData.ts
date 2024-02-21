import Seasons from "./seasonS";
import Serials from "./serialS";
import Episodes from "./episodeS";

export function parseSeasonsData(seasonsData: any[], serials: Serials) {
    seasonsData.forEach((seasonsData: any) => {
        const seasonTitle = seasonsData.title;
        const episodeData = seasonsData.episodes;

        const season = new Seasons(seasonTitle);

        episodeData.forEach((episodeData: any) => {
            const episodeTitle = episodeData.title.toString();
            const sounds = episodeData.sounds.map((sound: any) => sound.title);
            const episode = new Episodes(episodeTitle, sounds);
            season.pushEpisodes(episode);
        });

        serials.pushSeasons(season);
    })
}