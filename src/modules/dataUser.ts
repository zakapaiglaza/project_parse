interface UserData {
    season: null | number;
    episode: null | number;
    sound: null | number;
    quality: null | number;
};

export default class UserDataManager {
    private userData: UserData;

    constructor() {
        this.userData = {
            season: null,
            episode: null,
            sound: null,
            quality: null
        };
    }

    public setSeason(season: number) {
        this.userData.season = season;
    }

    public setEpisode(episode: number) {
        this.userData.episode = episode;
    }

    public setSound(sound: number) {
        this.userData.sound = sound;
    }

    public setQuality(quality: number) {
        this.userData.quality = quality;
    }

    public getUserData(): UserData {
        return this.userData;
    }

    public FilePathUser(customPath: string): string {
        const { episode, season } = this.userData;
        return `${customPath}/season${season}_episode${episode}.mp4`;
    }

    public getUserUrlSerials(seasons: any[]): string | null {
        const { season, episode, sound } = this.userData;

        if (season === null || episode === null || sound === null) return null;

        const selectedSeason = seasons[season - 1];
        const selectedEpisode = selectedSeason.episodes[episode - 1];
        const selectedSound = selectedEpisode.sounds[sound - 1];

        return selectedSound.url;
    }

}
