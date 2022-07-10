#!/usr/bin/env python3.10
# imports
import argparse
import json
import shutil
import statistics
import subprocess
import time

items = {'all': None,
         'search_aliases': ['node', 'bench/searchAliases.js'],
         'search_all': ['node', 'bench/searchAll.js'],
         'search_departments': ['node', 'bench/searchDepartments.js'],
         'search_keywords': ['node', 'bench/searchKeywords.js'],
         'setup': ['setup']}


def run(kwargs: argparse.Namespace) -> None:
    output = {}
    if kwargs.task == 'all':
        tasks = {i: items[i] for i in items if i != 'all'}
    else:
        tasks = {kwargs.task: items[kwargs.task]}
    for task in tasks:
        results = []
        start = time.time_ns()
        for _ in range(kwargs.iterations):
            inner_start = time.time_ns()
            subprocess.run([shutil.which('npm'), 'run'] + items[task],
                           stdout=subprocess.DEVNULL,
                           stderr=subprocess.DEVNULL)
            results.append(time.time_ns() - inner_start)
        results = [int(str(i)[:-6]) for i in results]
        output[task] = {
            'min': min(results),
            'max': max(results),
            'avg': statistics.mean(results),
            'dev': statistics.stdev(results)}
        print(f'Ran {kwargs.iterations} iterations of task {task} in {str(time.time_ns() - start)[:-6]} ms')
        print(f'Minimum: {output[task]["min"]} ms')
        print(f'Maximum: {output[task]["max"]} ms')
        print(f'Average: {output[task]["avg"]} ms')
        print(f'Std dev: {output[task]["dev"]} ms')
    if kwargs.output:
        with open(kwargs.output, 'w') as fp:
            json.dump(kwargs.output, fp)
            print(f'Wrote benchmark results to {kwargs.output}')


def int_at_least_two(x: str) -> int:
    try:
        assert (x := int(x)) >= 2
        return x
    except AssertionError:
        raise argparse.ArgumentTypeError('must be greater than or equal to 2')
    except ValueError:
        raise argparse.ArgumentTypeError('must be an integer')


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('-t', '--task',
                        choices=items.keys(), default='all', metavar='|'.join(items.keys()), type=str,
                        help='which task(s) to run; defaults to all')
    parser.add_argument('-i', '--iterations', default=10, metavar='ITERATIONS', type=int_at_least_two,
                        help='how many iterations to run the benchmark task(s) for; defaults to 10')
    parser.add_argument('-o', '--output', metavar='OUTPUT_FILE', type=str,
                        help='optional; the file to write benchmark results to')
    run(parser.parse_args())


if __name__ == '__main__':
    main()
