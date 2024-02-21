interface ProgressData {
    [key: string]: number;
}

export function updateProgress(progressData: ProgressData) {
    const percent = progressData['percent'];
    const percentProgress = drawProgress(percent);
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(`percent: ${percentProgress} ${percent}%\r`);
}
export function drawProgress(val: number): string {
    val = Math.round(val * 0.5);
    let str = '[';
    for (let i = 0; i < 50; i++) {
        if (i < val) {
            str += '#';
        } else {
            str += '-';
        }
    }
    return str + ']';
}
