import Seasons from "./seasonS";


export default class Serials {
    url: string;
    seasons: Seasons[];

    constructor(url: string, seasons: Seasons[] = []) {
        this.url = url;
        this.seasons = seasons;
    }

    pushSeasons(season: Seasons): void {
        this.seasons.push(season);
    }

    getSeasons(title: string): Seasons | undefined {
        title = title.replace(/"/g, '');
        console.log('Название сезона:', title);
        return this.seasons.find(season => season.title === title);
    }

    getAllSeasons(): string[] {
        return this.seasons.map(season => season.title);
    }
}

