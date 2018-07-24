const fs = require('fs');
const prompt = require('prompt');

(() => { // initialize script by prompting user for inputs
    prompt.start();
    // prompt user for file name
    prompt.message = 'Please enter';
    prompt.get(['filename'], (err, result) => {
        let reviews = fs.readFileSync(`reviews/${result.filename}`, 'utf8').split(',\n');
        // prompt user for number of highlights
        prompt.message = 'How many highlights? enter';
        prompt.get(['number'], (err, result) => findHighlights(reviews, result.number));
    })
})();

const findHighlights = (reviewsList, max) => {
    let reviewHighlights = [];
    let keyPhrases = findKeyphrases(reviewsList);
    // sort reviews ascending by review length
    reviewsList.sort((a, b) => a.length - b.length);

    let highlightNumber = 0;
    while (max) {
        if (highlightNumber % 2 === 0) {
            let review = reviewsList.shift();
            review ? reviewHighlights.push(review) : max = 0; // if no more reviews, break out of loop
        } else {
            let keyPhrase = keyPhrases.shift();
            if (keyPhrase) { 
                reviewHighlights.push(keyPhrase[0]);
            } else { // if no more keyphrases, push a review instead
                let review = reviewsList.shift();
                review ? reviewHighlights.push(review) : max = 0;
            }
        }
        if (max) {
            max--;
            highlightNumber === 4 ? highlightNumber = 0 : highlightNumber++;
        }
    }
    reviewHighlights.forEach(highlight => console.log(highlight));
}

const findKeyphrases = reviewsList => {
    let phraseMap = new Map();
    reviewsList.forEach(review => {
        let reviewWordList = review.split(' ').map(word => parseWord(word));
        for (let i = 0; i < reviewWordList.length - 1; i++) {
            let phrase = reviewWordList[i] + ' ' + reviewWordList[i + 1];
            if (phraseMap.has(phrase)) {
                phraseMap.set(phrase, phraseMap.get(phrase) + 1);
            } else {
                phraseMap.set(phrase, 1);
            }
        }
    });
    // convert phraseMap to an array, and then sort phrases descending by frequency
    return Array.from(phraseMap)
        .sort((a, b) => b[1] - a[1])
        .filter(phrase => { // filter phrases that contain unimportant words or if count is 1
            let phraseSplit = phrase[0].split(' ');
            let phraseCount = phrase[1];
            if (nonKeywordSet.has(phraseSplit[0]) || nonKeywordSet.has(phraseSplit[1]) || phraseCount === 1) {
                // if the phrase contains a non keyword or only appears once, filter it out
            } else {
                return phrase;
            }
        });
}

const findKeywords = reviewsList => {
    let wordMap = new Map();
    reviews.map(review => {
        review.split(' ').forEach(string => {
            let word = parseWord(string);
            if (!nonKeywordSet.has(word)) {
                wordMap.has(word) ? wordMap.set(word, wordMap.get(word) + 1) : wordMap.set(word, 1);
            } 
        });
    });
    return Array.from(wordMap)
        .sort((a, b) => b[1] - a[1])
        .filter(keyword => keyword[1] > 1);
}

const parseWord = word => {
    let parsedWord = "";
    for (let i = 0; i < word.length; i++) {
        let char = word[i].toLowerCase(); 
        if (isLetter(char)) parsedWord += char;
    }
    return parsedWord;
}

const isLetter = char => char.match(/[a-z]/i) && char.length === 1;

// mainly pronouns, conjunctions, and non descriptive adjectives/verbs/nouns
const nonKeywordSet = new Set(["and", "or", "also", "but", "nor", "must", "from", "than", "much", "so", "for", "not", "here", "my", "are", "has", "been", "got", "to", "be", "were", "was", "yet", "there", "go", "had", "get", "just", "have", "really", "after", "although", "as", "a", "of", "on", "then", "too", "with", "right", "at", "too", "if", "because", "before", "once", "since", "that", "though", "till", "unless", "until", "bit", "can", "its", "their", "what", "when", "whenever", "wherever", "whether", "while", "place", "restaurant", "i", "ive", "good", "food", "you", "all", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them", "was", "who", "which", "whose", "whoever", "whatever", "whichever", "whomever", "myself", "yourself", "himself", "herself", "itself", "ourselves", "themselves", "the", "like", "was", "is", "on", "in", "about", "said", "come", "came", "best", "worst", "meal", "this", "made", "make", "around"]);