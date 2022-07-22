# wfs-scripts

A set of scripts to aid in the development/testing of
[`websoc-fuzzy-search`](https://github.com/icssc/websoc-fuzzy-search). 

Note: This repository hosts the latest version of the search index used by the module, and was therefore designed to be
cloned as a submodule in conjunction with `websoc-fuzzy-search`. If you would like to use its features on their own,
be sure to install the latest version of `websoc-fuzzy-search` before proceeding.

## Index builder (`npm run setup`)

The index builder sources cached data from <https://github.com/icssc/peterportal-public-api/tree/master/cache>. It then
parses the data and generates it according to the schema required by the fuzzy search function.

Since the index is now Base64-encoded and gzip-compressed to reduce bundle size, it can be a hassle to investigate 
relevant bugs. To remedy this, pass `-d` or `--debug` and the index will be written as minified JSON (with a 
JavaScript export wrapper).

## Driver (`npm run driver`)

The driver offers a basic REPL-alike interface for testing queries.

## Benchmarks (`npm run bench`)

The benchmarks are designed to test out various aspects of the search function and the index builder.
