# wfs-scripts

A set of scripts to aid in the development/testing of [`websoc-fuzzy-search`](https://github.com/icssc/websoc-fuzzy-search).

Note: This repository was designed to be cloned as a submodule in conjunction with `websoc-fuzzy-search`. If you would like to use its features on their own, be sure to install the latest version of `websoc-fuzzy-search` before proceeding.

## Index builder (`npm run setup`)

The index builder sources cached data from <https://github.com/icssc/peterportal-public-api/tree/master/cache>. It then parses the data and generates it according to the schema required by the fuzzy search function.

## Driver (`npm run driver`)

The driver offers a basic REPL-alike interface for testing queries.

## Benchmarks (`npm run bench`)

A suite of benchmarks designed to test out various aspects of the search function and the index builder.
