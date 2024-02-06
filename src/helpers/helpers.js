
exports.wrapText = (text, width) => {
    const words = text.split(' ');
    let wrappedText = '';
    let line = '';
    for(const word of words) {
        if((line + word).length <= width) {
            line += word + ' ';
        } else {
            if(word.length > width) {
                line += '\n'
                let slicedWord = word.slice(0, width);
                let remainingPart = word.slice(width);
                line += slicedWord + '-';
                wrappedText += line.trim() + '\n';
                line = remainingPart + ' ';
            } else {
                wrappedText += line.trim() + '\n';
                line = word + ' '
            }
        }
    }
    wrappedText += line.trim();
    return wrappedText;
}