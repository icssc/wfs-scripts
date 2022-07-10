import search from 'websoc-fuzzy-search';
import { default as departments } from '../sources/departments.json';

for (const department of Object.values(departments)) {
    search({query: department});
}
