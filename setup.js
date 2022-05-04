// imports
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { constants } from 'os';
import { join, normalize } from 'path';
import fetch from 'cross-fetch';
import pluralize from 'pluralize';
import { default as aliases } from './aliases.json';

// input-output configuration
const localPrefix = normalize(`./cache/`);
const remotePrefix = 'https://raw.githubusercontent.com/icssc/peterportal-public-api/master/cache/';
const files = {
    courses: 'parsed_courses_cache.json',
    instructors: 'parsed_professor_cache.json',
};
const outputFile = normalize(`./index.json`);

// Roman numeral map
// Stops at 8 because that's the highest Roman numeral encountered in the cache (as of 2022-04-08)
const romans = {
    i: '1',
    ii: '2',
    iii: '3',
    iv: '4',
    v: '5',
    vi: '6',
    vii: '7',
    viii: '8',
};

// words to filter out
const toFilter = ['', 'a', 'o', 'an', 'at', 'in', 'it', 'of', 'on', 'to', 'and', 'for', 'the'];

// convert titles to keywords
function keywordize(s) {
    return s
        .toLowerCase()
        .replaceAll('u.s.', 'us')
        .replaceAll(/[&'(),\-/:]/g, ' ')
        .split(' ')
        .map((x) => (Object.keys(romans).includes(x) ? [x, romans[x]] : x))
        .flat()
        .map((x) => (x === 'us' || x === 'we' ? x : pluralize(x, 1)))
        .filter((x) => !toFilter.includes(x));
}

// convert GE categories to keywords
function keywordizeGE(s) {
    s = s.toLowerCase();
    const r = Object.keys(romans).filter((x) => s.includes(romans[x]))[0];
    return [
        s,
        s.replace('-', ''),
        s.replace(romans[r], r),
        s.replace('-', '').replace(romans[r], r),
        s.slice(3).replace(romans[r], r),
    ];
}

// convert proper names to lowercase and filter out middle initials
function keywordizeName(s) {
    const delimiters = ['-', ' ', ''];
    return [
        ...new Set(
            [s, s, s]
                .map((x, i) =>
                    x
                        .toLowerCase()
                        .replace('-', delimiters[i])
                        .split(' ')
                        .filter((name) => name.length > 1 && !name.includes('.'))
                )
                .flat()
        ),
    ];
}

// add object to set if keyword exists, create new set if not
function associate(d, k, o) {
    Object.keys(d).includes(k) ? d[k].add(o) : (d[k] = new Set([o]));
}

// parse the data into the format we want, and write it to the output
function parseAndWriteData(d) {
    console.log('Parsing data...');

    // GE categories
    let parsedData = {
        aliases: {},
        keywords: {},
        objects: {
            'GE-1A': {
                name: 'Lower Division Writing',
            },

            'GE-1B': {
                name: 'Upper Division Writing',
            },

            'GE-2': {
                name: 'Science and Technology',
            },

            'GE-3': {
                name: 'Social and Behavioral Sciences',
            },

            'GE-4': {
                name: 'Arts and Humanities',
            },

            'GE-5A': {
                name: 'Quantitative Literacy',
            },

            'GE-5B': {
                name: 'Formal Reasoning',
            },

            'GE-6': {
                name: 'Language other than English',
            },

            'GE-7': {
                name: 'Multicultural Studies',
            },

            'GE-8': {
                name: 'International/Global Issues',
            },
        },
    };
    for (const [key, value] of Object.entries(parsedData.objects)) {
        parsedData.objects[key].type = 'GE_CATEGORY';
        parsedData.objects[key].metadata = {};
        for (const keyword of [keywordizeGE(key), keywordize(key), keywordize(value.name)].flat()) {
            associate(parsedData.keywords, keyword, key);
        }
    }

    // department aliases
    for (const [key, value] of Object.entries(aliases)) {
        for (const department of value) {
            associate(parsedData.aliases, key, department);
            associate(parsedData.keywords, key, department);
        }
    }

    // departments and courses
    for (const [key, value] of Object.entries(d.courses)) {
        if (!Object.keys(parsedData.objects).includes(value.department)) {
            parsedData.objects[value.department] = {
                type: 'DEPARTMENT',
                name: value.department_name,
                metadata: {},
            };
            for (const keyword of [value.department.toLowerCase(), keywordize(value.department_name)].flat()) {
                associate(parsedData.keywords, keyword, value.department);
            }
        }
        parsedData.objects[key] = {
            type: 'COURSE',
            name: value.title,
            metadata: {
                department: value.department,
                number: value.number,
            },
        };
        for (const keyword of keywordize(value.title)) {
            associate(parsedData.keywords, keyword, key);
        }
    }

    // instructors
    for (const instructor of Object.values(d.instructors)) {
        parsedData.objects[instructor.shortened_name] = {
            type: 'INSTRUCTOR',
            name: instructor.name,
            metadata: {},
        };
        for (const keyword of keywordizeName(instructor.name)) {
            associate(parsedData.keywords, keyword, instructor.shortened_name);
        }
    }

    // write the index using a replacer for Sets
    console.log('Writing parsed data...');
    writeFileSync(
        `${outputFile}`,
        JSON.stringify(parsedData, (k, v) => (v instanceof Set ? [...v] : v))
    );
    console.log(`Wrote index to file ${outputFile}`);
    console.timeEnd('Index built in');
    process.exit(0);
}

// fetch the latest cached data from remote if necessary
async function verifyFiles() {
    console.time('Index built in');
    try {
        mkdirSync(localPrefix);
    } catch (e) {
        // no idea why errnos returned by fs are negative
        if (!(-e?.errno === constants.errno.EEXIST)) throw e;
    }
    let cachedData = {};
    for (const [dataType, fileName] of Object.entries(files)) {
        const fqPath = join(localPrefix, fileName);
        try {
            cachedData[dataType] = JSON.parse(readFileSync(`${fqPath}`).toString());
            console.log(`${fqPath} is a valid JSON file, reading into memory and skipping`);
        } catch (e) {
            if (e instanceof SyntaxError || -e?.errno === constants.errno.ENOENT) {
                console.log(`Malformed or empty JSON file ${fqPath} detected locally, downloading from remote`);
                const response = await fetch(`${remotePrefix}${fileName}`);
                const data = await response.json();
                cachedData[dataType] = data;
                writeFileSync(`${fqPath}`, JSON.stringify(data));
                console.log(`File ${fqPath} written successfully`);
            } else {
                throw e;
            }
        }
    }
    return cachedData;
}

// entry point of sorts
verifyFiles().then((response) => parseAndWriteData(response));
