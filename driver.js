console.time('Initialization took');
import promptSync from 'prompt-sync';
import search from 'websoc-fuzzy-search';
const prompt = promptSync({ sigint: true, eot: true });
console.timeEnd('Initialization took');
while (true) {
    try {
        let query, numResults, mask;
        while (true) {
            query = prompt('Enter a query: ');
            if (!query) {
                console.error('Query may not be empty.');
            } else {
                break;
            }
        }
        while (true) {
            numResults = prompt('Enter the number of results to return [10]: ');
            if (!numResults) {
                numResults = 10;
                break;
            } else if (isNaN(parseInt(numResults))) {
                console.error('Must be a number.');
            } else {
                break;
            }
        }
        mask = prompt('(Optional) Enter a comma-separated list of categories to ignore: ');
        console.time('Query took');
        console.log(search(query, numResults, mask ? mask.split(',') : []));
        console.timeEnd('Query took');
    } catch (e) {
        console.error(e);
    }
}
