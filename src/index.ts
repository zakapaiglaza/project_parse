import M3u8ToMp4Converter from "./modules/video/convert";
import notifier from 'node-notifier';
import FileSett from "./modules/file/file";
import MediaServerRequest from "./modules/network/mediaReqService";

class VideoConverter {
    private progressData: Record<string, string> = {};

    private updateProgress(): void {
        const keys = Object.keys(this.progressData).sort();
        let total = 0.0;
    
        // console.clear();
        keys.forEach((key) => {
            const value = this.progressData[key];
            total += parseFloat(value);
    
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write(`${key}: ${this.drawProgress(value)} ${value}%`);
            process.stdout.write('\n');
        });
    
        total = total / keys.length;
        process.stdout.write(`Total: ${total.toFixed(2)}%`);
        process.stdout.write('\n');
    }

    private drawProgress(val: string): string {
        val = (parseFloat(val) * 0.5).toFixed(0);
        let str = '[';
        for (let i = 0; i < 50; i++) {
            if (i < parseFloat(val)) {
                str += '#';
            } else {
                str += '-';
            }
        }
        return str + ']';
    }

    private async convertAndNotify(url: string, outputFile: string): Promise<void> {
        const converter = new M3u8ToMp4Converter();
        

        await converter
        .setInputFile(url)
        .setOutputFile(outputFile)
        .start({
            onProgress: (progress: { percent?: number }) => {
                if (!progress.percent) {
                    return false;
                }
                this.progressData[outputFile] = progress.percent.toFixed(2);
                this.updateProgress();
            },
            onError: (error: Error) => {
                console.log(`Error processing ${outputFile}: ${error}`);
            }
        })
        .then(() => {
            console.log("\nFile converted");
            notifier.notify({ title: 'Video(s)', message: 'Downloaded!' });
        }).catch((e : Error) => {
            console.log(e);
        });
    }

    public async processVideos(mediaData: Array<{ url?: string, RESOLUTION?: string, BANDWIDTH?: string }>, season: number, episode: number): Promise<void> {
        if (episode < 1 || episode > mediaData.length) {
            console.log(`нет такого эпизода: ${episode}`);
            return;
        }
    
        const episodeData = mediaData[episode - 1];
        console.log('Данные об эпизоде:', episodeData);
    
        if (!episodeData.url || !episodeData.RESOLUTION || !episodeData.BANDWIDTH) {
            console.log(`Отсутствуют данные об эпизоде ${episode}`);
            return;
        }
    
        const seasonP = season < 10 ? '0' + season : season.toString();
        const episodeP = episode < 10 ? '0' + episode : episode.toString();
        const outputFile = `s${seasonP}/s${seasonP}e${episodeP}.mp4`;
    
        FileSett.createDirectoryAndEmptyFile(outputFile);
    
        await this.convertAndNotify(episodeData.url, outputFile);
    
        console.log(`Конвертация успешна для эпизода ${episode}`);
    }
    
    
    
}

export default VideoConverter;
