import * as d3 from 'd3';
import * as Promise from 'bluebird';

export class DataService {
    constructor() {
    }

    loadData() {
        return new Promise((res, rej) => {
            var query: any = window['GRAPH_OPTIONS'];

            if (!query) {
                query = {
                    country: 'denmark',
                    graph: 'chart',
                    // includeDeductions: false,
                    // year: 2015
                }
            }

            if (query.country === '*') {
                d3.json('/api/infographics', (data) => {
                    if (query.year) {
                        data = data.filter((e) => { return e.YEAR === query.year });
                    }
                    if (query.includeDeductions===false || !query.hasOwnProperty('includeDeductions')) {
                       data = data.filter((e) => { return e.TYPE === 'Total' });
                    } 
                    res(data);
                });
            } else {
                d3.json(`/api/infographics/${query.country}/${query.graph}`, (data) => {
                    data = data.entries;
                    if (query.year) {
                        data = data.filter((e) => { return e.YEAR === query.year });
                    }
                    if (query.includeDeductions===false || !query.hasOwnProperty('includeDeductions')) {
                        data = data.filter((e) => { return e.TYPE === 'Total' });
                    }
                    res(data);
                });
            }

        });
    }
};
