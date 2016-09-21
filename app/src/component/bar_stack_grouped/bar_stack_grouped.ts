import * as dimple from 'dimple-js';
import * as d3 from 'd3';
import * as _ from 'lodash';

import {Utils}  from './../../common/utils';
import {Colors} from './../../common/colours';

export class BarStackGrouped {
	private _chart: any;
	private _svg: any;
	private _c: Colors = new Colors();


	constructor() {

	}
	init(data) {
		var query: any = window['GRAPH_OPTIONS'];
		// Debug Settings		
		if (!query) {
			query = {
				width: 1000,
				height: 400,
				x: ["EMERGENCY", 'COUNTRY_NAME'],
				series: "EMERGENCY",
				color: 'darkBlue',
				colorRange: 'range',
				filterEmpty: true,
				localCurrency: true

			};
		};

		let size = Utils.getPageSize();
		this._svg = dimple.newSvg("#graph", size.width, size.height);
		Utils.setLastUpdatedDate(_.max(_.map(data, (e: any) => { return e.DATE })));
		if (query.filterEmpty && query.filterEmpty === true) {
			data = data.filter((d) => { return d[query.series] != '' });
		}
		var myChart = new dimple.chart(this._svg, data);
		if (query.color) {
			myChart.defaultColors = _.map(this._c.color(query.color)('range'), (e) => { return new dimple.color(e) })
		}

		let yAxis;
		if (query.localCurrency && query.localCurrency === true) {
			yAxis = myChart.addMeasureAxis("y", "AMOUNT");
			yAxis.title = data[0].CURRENCY;
		} else {
			yAxis = myChart.addMeasureAxis("y", "USD_AMOUNT");
			yAxis.title = 'USD';
		}



		let x = myChart.addCategoryAxis("x", query.x);
		x.title = Utils.updateText(query.x.join(' / '));
        if (query.order) {
            x.addOrderRule(query.order);
        }


		if (query.x[0] === query.series) {
			let mySeries = myChart.addSeries(["_id", query.series], dimple.plot.bar);
			this.createNonAggregageTooltip(mySeries, data, query);
		} else {
			let mySeries = myChart.addSeries([query.series], dimple.plot.bar);
			this.createAggregatedTooltip(mySeries, data, query);
		}
		if (query.hideLegend) { } else {
			myChart.addLegend(0, 10, size.width * 0.9, 20, "right");
		}
		myChart.draw();
		yAxis.shapes.selectAll('text').style('text-anchor', 'end');

	}


	createNonAggregageTooltip(mySeries, data, query) {
		mySeries.getTooltipText = function (d) {
			var i,
				tooltip = [];
			for (i = 0; i < data.length; i += 1) {
				if (d.aggField[0] === data[i]['_id']) {
					tooltip.push("Local Amount: " + Utils.formatMoney(data[i].AMOUNT, 2, '.', ',') + ' ' + data[i].CURRENCY);
					tooltip.push("Amount: " + Utils.formatMoney(data[i].USD_AMOUNT, 2, '.', ',') + ' USD');

					_.forEach(query.x, (xVal) => {
						tooltip.push(Utils.ucFirst(xVal) + ": " + data[i][xVal])
					})

				}
			}
			return tooltip;
		};
	}

	createAggregatedTooltip(mySeries, data, query) {
		mySeries.getTooltipText = function (d) {
			console.log(d);
			var i,
				total = 0,
				tooltip = [];
			for (i = 0; i < data.length; i += 1) {
				if (d.aggField[0] === data[i][query.series]) {
					total += data[i]['AMOUNT']
				}
			}
			tooltip.push("Local Amount: " + Utils.formatMoney(total, 2, '.', ',') + ' ' + data[0].CURRENCY);
			tooltip.push("Amount: " + Utils.formatMoney(d.yValue, 2, '.', ',') + '');
			tooltip.push(Utils.ucFirst(query.series) + ' :' + d.aggField[0]);
			_.forEach(query.x, (xVal, i) => {
				tooltip.push(Utils.ucFirst(xVal) + ": " + d.xField[i])
			})
			return tooltip;
		};
	}
}
