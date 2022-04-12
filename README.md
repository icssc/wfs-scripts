# wfs-scripts

This is a set of scripts to aid in the development/testing of [websoc-fuzzy-search](https://github.com/icssc/websoc-fuzzy-search).

## Index builder (`npm run setup`)

The index builder sources cached data from <https://github.com/icssc/peterportal-public-api/tree/master/cache>. It then parses the data and generates it according to the schema required by the fuzzy search function.

## Driver (`npm run driver`)

The driver offers a basic REPL-alike interface for testing queries.
