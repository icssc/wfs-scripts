import search from 'websoc-fuzzy-search';
import index from '../index.js';
for (const keyword of Object.keys(index.keywords)) {
    search({query: keyword});
}
