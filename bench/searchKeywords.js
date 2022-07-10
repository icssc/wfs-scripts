import search from 'websoc-fuzzy-search';
import { default as index } from '../index.json';
for (const keyword of Object.keys(index.keywords)) {
    search({query: keyword});
}
