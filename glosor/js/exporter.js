// Define the Exporter class
class Exporter {
    static urlcompress(practiceList) {
        // Validate and encode the PracticeList message
        // Print the size of the PracticeList data as JSON
        const json = JSON.stringify(practiceList);
        const compressedJsonData = LZString.compressToEncodedURIComponent(json);
        console.log(`${json}`);
        console.log(`compressing size ${compressedJsonData.length}`);

        // Return the compressed data
        return compressedJsonData;
    }

    static urldecompress(compressedData) {

        // Decompress the data using LZString
        const json = LZString.decompressFromEncodedURIComponent(compressedData);

        // Parse the JSON data back to a JavaScript object
        const practiceListData = JSON.parse(json);

        // Create a new instance of PracticeList from the parsed data
        const { name, gloses, wordsDomain, translationDomain } = practiceListData;
        const glosObjects = gloses.map(glosData => {
            const { _words, _translations, _clues, _translationClues } = glosData;
            return new Glos(_words, _translations, _clues, _translationClues);
        });
        const practiceList = new PracticeList(name, glosObjects, wordsDomain, translationDomain);

        console.log(practiceList);

        // Return the decompressed PracticeList object
        return practiceList;
    }
}
