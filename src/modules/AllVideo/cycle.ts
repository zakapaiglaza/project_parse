// export class EpisodeUrlGenerator {
//     baseUrl: string;
//     seasons: { start: number; end: number }[];

//     constructor(baseUrl: string, seasons: { start: number; end: number }[]) {
//         this.baseUrl = baseUrl;
//         this.seasons = seasons;
//     }

//     generateEpisodeUrls(): string[] {
//         const episodeUrls: string[] = [];

//         this.seasons.forEach(season => {
//             for (let i = season.start; i <= season.end; i++) {
//                 episodeUrls.push(`${this.baseUrl}${i}`);
//             }
//         });

//         return episodeUrls;
//     }
// }

// export function main() {
//     const seasonsData = [
//         { start: 54622, end: 54636 },  // Season 1
//         { start: 54637, end: 54650 },  // Season 2
//         { start: 52924, end: 52845 },  // Season 3
//         { start: 70175, end: 76341 }   // Season 4
//     ];

//     const generator = new EpisodeUrlGenerator("https://tortuga.wtf/vod/", seasonsData);
//     const episodeUrls = generator.generateEpisodeUrls();

//     console.log("URLs of each episode:");
//     episodeUrls.forEach((url, index) => {
//         console.log(`Episode ${index + 1}: ${url}`);
//     });
// }
