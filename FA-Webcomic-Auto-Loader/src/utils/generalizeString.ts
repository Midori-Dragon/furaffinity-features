export default function (inputString: string, textToNumbers: boolean, removeCommonPhrases: boolean, removeSpecialChars: boolean, removeNumbers: boolean, removeSpaces: boolean, removeRoman: boolean): string {
    let outputString = inputString.toLowerCase();
    
    if (removeCommonPhrases) {
        const commonPhrases = ['page', 'part', 'book', 'episode'];
        outputString = outputString.replace(new RegExp(`(?:^|\\s)(${commonPhrases.join('|')})(?:\\s|$)`, 'g'), '');
    }

    if (removeRoman) {
        const roman = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii', 'xix', 'xx']; //Checks only up to 20
        outputString = outputString.replace(new RegExp(`(?:^|[^a-zA-Z])(${roman.join('|')})(?:[^a-zA-Z]|$)`, 'g'), '');
    }

    if (textToNumbers) {
        const numbers: { [key: string]: number } = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100 };
        outputString = outputString.replace(new RegExp(Object.keys(numbers).join('|'), 'gi'), match => (numbers as any)[match.toLowerCase()].toString());
    }

    if (removeSpecialChars) {
        outputString = outputString.replace(/[^a-zA-Z0-9 ]/g, '');
    }

    if (removeNumbers) {
        outputString = outputString.replace(/[^a-zA-Z ]/g, '');
    }

    if (removeSpaces) {
        outputString = outputString.replace(/\s/g, '');
    }

    return outputString;
}
