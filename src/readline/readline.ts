import * as readline from 'readline';

class RL {
    private rl: readline.Interface;

    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    askQuestion(question: string): Promise<number> {
        return new Promise((resolve) => {
            this.rl.question(question, (answer: string) => {
                const number = parseInt(answer);
                if (!isNaN(number)) {
                    resolve(number);
                } else {
                    console.log('Введите число');
                    this.askQuestion(question).then(resolve);
                }
            });
        });
    }

    askUrl(question: string): Promise<string> {
        return new Promise((resolve) => {
            this.rl.question(question, (answer: string) => {
                resolve(answer);
            });
        });
    }

    close(): void {
        this.rl.close();
    }
}

export default RL;
