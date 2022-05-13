console.time('Initialization took');
import promptSync from 'prompt-sync';
import search from 'websoc-fuzzy-search';
const prompt = promptSync({ sigint: true, eot: true });
console.timeEnd('Initialization took');
while (true) {
    try {
        let query, numResults, filter;
        query = prompt('Enter a query: ');
        while (true) {
            numResults = prompt('Enter the number of results to return [Number.MAX_SAFE_INTEGER]: ');
            if (!numResults) {
                numResults = Number.MAX_SAFE_INTEGER;
                break;
            } else if (isNaN(parseInt(numResults))) {
                console.error('Must be a number.');
            } else {
                break;
            }
        }
        filter = prompt('(Optional) Enter a category to search for: ');
        const start = Date.now();
        const response = search({ query: query, numResults: numResults, filter: filter.length ? filter : undefined })
        console.log(response);
        const stop = Date.now();
        console.log(`${Object.keys(response).length} result(s) found in ${stop - start} ms`);
    } catch (e) {
        console.error(e);
    }
}
