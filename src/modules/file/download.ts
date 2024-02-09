// import axios from "axios";
// import fs from 'fs';
// import { resolve } from "path";


// export default class DownloadFile {
//     async downloader(url:string, outputFile: string): Promise<void> {
//         try {
//             const res = await axios.get(url, {responseType: 'stream'});
//             const writeFile = fs.createWriteStream(outputFile);

//             res.data.pipe(writeFile);

//             return new Promise((resolve,reject) => {
//                 writeFile.on('finish',resolve);
//                 writeFile.on('err',reject);
//             });
//         } catch(e) {
//             throw new Error(`не удалось скачать: ${e}`);
//         }
//     }
// }