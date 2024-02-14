
import ffmpeg from 'fluent-ffmpeg';

class M3u8ToMp4Converter {
    private inputFile: string | undefined;
    private outputFile: string | undefined;


    setInputFile(url: string): M3u8ToMp4Converter {
        if (!url) throw new Error("You must specify the M3U8 file address");
        this.inputFile = url;
        return this;
    }

    setOutputFile(outputFile: string): M3u8ToMp4Converter {
        if (!outputFile) throw new Error("You must specify the file path and name");
        this.outputFile = outputFile;
        return this;
    }

    start(options: any = {}): Promise<void> {
        // https://github.com/fluent-ffmpeg/node-fluent-ffmpeg#setting-event-handlers
        options = Object.assign({
            onStart: () => {},
            onEnd: () => {},
            onError: (error: any) => {
                throw new Error(error);
            },
            onProgress: (progress: { percent: number }) => {},
            onStderr: () => {},
            onCodecData: () => {},
        }, options);

        return new Promise <void>(async(resolve, reject) => {
            console.log('outputFile :>> ', this.outputFile);
            if (!this.inputFile || !this.outputFile) {
                reject(new Error("You must specify the input and the output files"));
                return;
            }

            // await new Promise((resolve, reject) => {
                ffmpeg(this.inputFile)
                    .outputOptions("-c copy")
                    .outputOptions("-bsf:a aac_adtstoasc")
                    .output(this.outputFile)
                    .on('start', options.onStart)
                    .on('codecData', options.onCodecData)
                    .on('progress', (progress) => {
                        options.onProgress(progress); 
                    })
                    .on("end", (...args) => {
                        console.log('aaaaaaaaaaaaaaa')
                            resolve(); 
                            options.onEnd(...args);
                        })
                    .on("error", (error) => {
                            console.log('error :>> ', error);
                            options.onError(error); 
                            reject(new Error(error)); 
                        })
                    .on('stderr', options.onStderr)
                    .run();        
            });
        // });
    }
}


export default M3u8ToMp4Converter;
