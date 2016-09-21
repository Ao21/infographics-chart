import * as dimple from 'dimple-js';
import * as d3 from 'd3';
import * as _ from 'lodash';
import {Utils}  from './../../common/utils';
import {Colors} from './../../common/colours';

export class LineChart {
    private _chart: any;
    private _svg: any;
    private _c: Colors = new Colors();

    constructor() {
        //console.log(dimple);
    }
    init(data) {
        
        var query: any = window['GRAPH_OPTIONS'];

        // Debug Settings		
        if (!query) {
            query = {
                width: 1000,
                height: 400,
                x: ["YEAR"],
                series: "COUNTRY_NAME",
                color: 'blue',
                colorRange: 'range',

            };
        };

        let size = Utils.getPageSize();
        this._svg = dimple.newSvg("#graph",size.width, size.height);
        Utils.setLastUpdatedDate(_.max(_.map(data, (e: any) => { return e.DATE })));
        if (query.filterEmpty && query.filterEmpty === true) {
			data = data.filter((d) => { return d[query.series] != '' });
		}
        var myChart = new dimple.chart(this._svg, data);
        var x = myChart.addCategoryAxis("x", query.x);
        x.title = Utils.updateText(query.x.join(' / '));
        //x.addOrderRule("Date");
        let yAxis;
        if (query.localCurrency && query.localCurrency === true) {
			yAxis = myChart.addMeasureAxis("y", "AMOUNT");
			yAxis.title = data[0].CURRENCY;
		} else {
			yAxis = myChart.addMeasureAxis("y", "USD_AMOUNT");
			yAxis.title = 'USD';
		}
        myChart.addSeries(query.series, dimple.plot.line);
        if (query.hideLegend) { } else {
        myChart.addLegend(0, 10, size.width * 0.9, 20, "right");
        }
        myChart.draw();
        yAxis.shapes.selectAll('text').style('text-anchor', 'end');
    }
}
