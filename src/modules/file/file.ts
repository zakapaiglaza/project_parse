import fs from 'fs';

class FileSett {
    static createDirectoryAndEmptyFile(filePath: string) {
        const directory = filePath.substring(0, filePath.lastIndexOf('/'));
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }
        fs.writeFileSync(filePath, ''); 
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
