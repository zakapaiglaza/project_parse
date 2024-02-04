import fs from 'fs';


class FileSett {
    static createFile(dir:string) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    static writeToFile(filePath: string, data: Buffer) {
        fs.writeFileSync(filePath, data);
    }

    static readBuffer(filePath: string): Buffer {
        return fs.readFileSync(filePath);
    }

    static readText(filePath: string): string {
        return fs.readFileSync(filePath, 'utf8');
    }

}

export default FileSett;