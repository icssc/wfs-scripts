import search from 'websoc-fuzzy-search';
import { default as aliases } from '../sources/aliases.json';
for (const alias of Object.keys(aliases)) {
    search({query: alias});
}