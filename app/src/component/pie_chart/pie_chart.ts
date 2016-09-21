import * as dimple from 'dimple-js';
import * as d3 from 'd3';
import * as _ from 'lodash';
import {Utils}  from './../../common/utils';
import {Colors} from './../../common/colours';

export class PieChart {
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
                series: "CATEGORY",
                color: 'blue',
                colorRange: 'range',

            };
        };

        let size = Utils.getPageSize();
        this._svg = dimple.newSvg("#graph", size.width, size.height);
        Utils.setLastUpdatedDate(_.max(_.map(data, (e: any) => { return e.DATE })));
        if (query.filterEmpty && query.filterEmpty === true) {
			data = data.filter((d) => { return d[query.series] != '' });
        }

        var myChart = new dimple.chart(this._svg, data);
        myChart.defaultColors = _.map(this._c.color(query.color)('range'),(e)=>{return new dimple.color(e)})
        let pAxis;
        if (query.localCurrency && query.localCurrency === true) {
			pAxis = myChart.addMeasureAxis("p", "AMOUNT");
			pAxis.title = data[0].CURRENCY;
		} else {
			pAxis = myChart.addMeasureAxis("p", "USD_AMOUNT");
			pAxis.title = 'USD';
		}
        let mySeries = myChart.addSeries([query.series], dimple.plot.pie);
        if (query.hideLegend) { } else {
            myChart.addLegend(0, 10, size.width * 0.9, 20, "right");
        }
        
        myChart.draw();
    }
}
