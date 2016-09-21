import * as dimple from 'dimple-js';
import * as d3 from 'd3';
import * as _ from 'lodash';
import {Utils}  from './../../common/utils';
import {Colors} from './../../common/colours';

export class StackedArea {
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
                order: 'Date',
                x: ["YEAR","COUNTRY_NAME"],
                series: "CATEGORY",
                color: 'blue',
                colorRange: 'range',
                localCurrency: false

            };
        };
        let size = Utils.getPageSize();
        Utils.setLastUpdatedDate(_.max(_.map(data, (e: any) => { return e.DATE })));
        this._svg = dimple.newSvg("#graph", size.width, size.height);
        if (query.filterEmpty && query.filterEmpty === true) {
			data = data.filter((d) => { return d[query.series] != '' });
        }

        var myChart = new dimple.chart(this._svg, data);
        myChart.defaultColors = _.map(this._c.color(query.color)('range'),(e)=>{return new dimple.color(e)})
        let x = myChart.addCategoryAxis("x", query.x);
        if (query.order) {
            x.addOrderRule(query.order);
        }
        let yAxis;
		if (query.localCurrency && query.localCurrency === true) {
			yAxis = myChart.addMeasureAxis("y", "AMOUNT");
			yAxis.title = data[0].CURRENCY;
		} else {
			yAxis = myChart.addMeasureAxis("y", "USD_AMOUNT");
			yAxis.title = 'USD';
		}
        let mySeries = myChart.addSeries([query.series], dimple.plot.area);
        if (query.hideLegend) {
           
        } else {
             myChart.addLegend(0, 10, size.width * 0.9, 20, "right");
        }
        
        mySeries.getTooltipText = function (d) {
            var i,
                total = 0,
				tooltip = [];
            for (i = 0; i < data.length; i += 1) {
                if (d.aggField[0] === data[i][query.series]) {
                    total += data[i]['AMOUNT']
                }
            }
            // tooltip.push("Local Amount: " + Utils.formatMoney(total, 2, '.', ',') + ' ' + data[0].CURRENCY);
            tooltip.push("Amount: " + Utils.formatMoney(d.yValue, 2, '.', ',') + '');
            tooltip.push(Utils.ucFirst(query.series) + ' :' + d.aggField[0]);
            _.forEach(query.x, (xVal, i) => {
                    tooltip.push(Utils.ucFirst(xVal)+ ": " + d.xField[i])
            })
            return tooltip;
		};
        myChart.draw(); 
        yAxis.shapes.selectAll('text').style('text-anchor', 'end');
    }
}
