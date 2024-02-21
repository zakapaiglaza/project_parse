import ffmpeg, { FfmpegCommand } from "fluent-ffmpeg";

/**
 * A class to convert M3U8 to MP4
 * @class
 */
class M3u8ToMp4Converter {
    private M3U8_FILE?: string;
    private OUTPUT_FILE?: string;

    /**
     * Sets the input file
     * @param {String} filename M3U8 file path. You can use remote URL
     * @returns {M3u8ToMp4Converter}
     */
    setInputFile(filename: string): M3u8ToMp4Converter {
        if (!filename) throw new Error("You must specify the M3U8 file address");
        this.M3U8_FILE = filename;

        return this;
    }

    /**
     * Sets the output file
     * @param {String} filename Output file path. Has to be local :)
     * @returns {M3u8ToMp4Converter}
     */
    setOutputFile(filename: string): M3u8ToMp4Converter {
        if (!filename) throw new Error("You must specify the file path and name");
        this.OUTPUT_FILE = filename;

        return this;
    }

    /**
     * Starts the process
     * @param {Object} options Optional parameters for the conversion process
     * @returns {Promise<void>}
     */
    async start(options?: {
        onStart?: () => void;
        onEnd?: () => void;
        onError?: (error: Error) => void;
        onProgress?: (progress: string) => void;
        onStderr?: (stderr: string) => void;
        onCodecData?: (codecData: any) => void;
    }): Promise<void> {
        options = Object.assign({
            onStart: () => { },
            onEnd: () => { },
            onError: (error: Error) => {
                throw new Error(error.message);
            },
            onProgress: (progress: string) => { },
            onStderr: (stderr: string) => { },
            onCodecData: (codecData: any) => { },
        }, options || {});

        return new Promise<void>((resolve, reject) => {
            if (!this.M3U8_FILE || !this.OUTPUT_FILE) {
                reject(new Error("You must specify the input and the output files"));
                return;
            }

            const ffmpegCommand: FfmpegCommand = ffmpeg(this.M3U8_FILE)
                .on('start', () => options && options.onStart && options.onStart())
                .on('codecData', (codecData: any) => options && options.onCodecData && options.onCodecData(codecData))
                .on('progress', (progress: string) => options && options.onProgress && options.onProgress(progress))
                .on("error", (error: Error) => options && options.onError && options.onError(error))
                .on('stderr', (stderr: string) => options && options.onStderr && options.onStderr(stderr))
                .on("end", () => {
                    resolve();
                    options && options.onEnd && options.onEnd();
                })
                .outputOptions("-c copy")
                .outputOptions("-bsf:a aac_adtstoasc")
                .output(this.OUTPUT_FILE);

            ffmpegCommand.run();
        });
    }
}

export default M3u8ToMp4Converter;
