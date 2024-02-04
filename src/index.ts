import M3u8ToMp4Converter from "./modules/video/convert";
import notifier from 'node-notifier';
import WebPageScraper from "./modules/network/req_Service";
import CryptoHelper from "./util_Sett/encrypted";
import FileSett from "./modules/file/file";



class VideoConverter {
    private progressData: Record<string, string> = {};

    private updateProgress(): void {
        const keys = Object.keys(this.progressData).sort();
        let total = 0.0;
    
        console.clear();
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

    private async convertAndNotify(i: number, index?: number): Promise<void> {
        const s = i < 10 ? '0' + i : i;
        const sezon = 4;
        const name = `s0${sezon}e${s}`;
        const dir = `s${sezon}`;
        console.log('${index}', `${index}`, name);
        const url = `https://blackpearl.tortuga.wtf/content/stream/serials/star.trek.discovery.${name}.rezka.mvo_${index}/hls/1080/index.m3u8`;

        console.log('url', url);

        const converter = new M3u8ToMp4Converter();

        FileSett.createFile(dir);

        await converter
        .setInputFile(url)
        .setOutputFile(`s${sezon}/${name}.mp4`)
        .start({
            onProgress: (progress: { percent?: number }) => {
                if (!progress.percent) {
                    return false;
                }
                this.progressData[name] = progress.percent.toFixed(2);
                this.updateProgress();
            },
            onError: (error: Error) => {
                console.log(`Error processing ${name}: ${error}`);
            }
        })
        .then(() => {
            console.log("\nFile converted");
            notifier.notify({ title: 'Video(s)', message: 'Downloaded!' });
        }).catch((e : Error) => {
            console.log(e);
        });
        
    }

    public async processVideos(index: number, series: number): Promise<void> {
        await this.convertAndNotify(index, series);
    }
}



export default VideoConverter;
