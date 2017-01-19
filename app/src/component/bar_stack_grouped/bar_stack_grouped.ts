import * as dimple from 'dimple-js';
import * as d3 from 'd3';
import * as _ from 'lodash';

import { Utils } from './../../common/utils';
import { Colors } from './../../common/colours';

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
				x: ["EMERGENCY","YEAR"],
				series: "YEAR",
				color: 'darkBlue',
				extraMargin: 160,
				colorRange: 'range',
				filterEmpty: true,
				localCurrency: false

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

		if (query.extraMargin) {
			myChart.setMargins(100, 50, 100, query.extraMargin); 	
		}
		
		myChart.draw();
		yAxis.shapes.selectAll('text').style('text-anchor', 'end');

		x.shapes.selectAll("text").each((d) => {
			// There is a dummy empty string value on the end which we want to ignore
			if (d) {
				// Get the total y value
				if (query.x[0] === query.series) {
					if (query.localCurrency && query.localCurrency === true) {
						var total = d3.sum(data, function (t: any) { return (t[query.series] === d ? t.AMOUNT : 0); });
					} else {
						var total = d3.sum(data, function (t: any) { return (t[query.series] === d ? t.USD_AMOUNT : 0); });
					}
				} else {
					if (query.localCurrency && query.localCurrency === true) {
						var total = d3.sum(data, function (t: any) { return (t[query.x[0]] === d ? t.AMOUNT : 0) });
					} else {
						var total = d3.sum(data, function (t: any) { return (t[query.x[0]] === d ? t.USD_AMOUNT : 0) });
					}
				}
				// // Add the text for the label
				var label = this._svg.append("text");

				// Set the x position
				// x._scale(d) is the tick position of each element
				// (myChart._widthPixels() / x._max) / 2 is half of the space allocated to each element
				label.attr("x", x._scale(d) + (myChart._widthPixels() / x._max) / 2)

				// Vertically center the text on the point
				label.attr("dy", "0.35em")

				// Style the text - this can be better done with label.attr("class", "my-label-class")

				var totalD = d;
				if (typeof totalD === 'string') {
					totalD = totalD.replace(new RegExp(' ', 'g'), '');
				}
				label
					.attr('class', 'totals total-' + totalD)
					.style("text-anchor", "middle")
					.style("font-size", "9px")
					.style("font-family", "sans-serif")
					.style("opacity", 0);

				// Set the text itself in thousands
				// label.text(d3.format(",.1f")(total / 1000) + "k");
				if (query.localCurrency && query.localCurrency === true) {
					label.text(data[0].CURRENCY + ' ' + Utils.formatMoney(total, 2, '.', ','));
				} else {
					label.text('USD ' + Utils.formatMoney(total, 2, '.', ','));
				}



				// d.on("mouseover", function () {
				// 	console.log('hi');
				// 	//d3.select(this).style("opacity:0.8");
				// }).on("mouseout", function () {
				// 	//d3.select(this).style("opacity:0");
				// });

				// d3.selectAll('rect').on('mouseover', (t) => {
				// 	let item = t.x;
				// 	if (typeof item === 'string') {
				// 		item = item.replace(' ', '');
				// 	}
				// 	console.log(item);
				// 	d3.selectAll('text').filter('.total-' + item).style('opacity', 0.8);
				// })
				d3.selectAll('rect').on('mouseout', (t) => {
					d3.selectAll('text').filter('.totals').style('opacity', 0);
				})



				// Once the style and the text is set we can set the y position
				// y._scale(total) gives the y position of the total (and therefore the top of the top segment)
				// label.node().getBBox().height gives the height of the text to leave a gap above the bar
				label.attr("y", yAxis._scale(total) - label.node().getBBox().height)
			}

		});

	}


	createNonAggregageTooltip(mySeries, data, query) {
		mySeries.getTooltipText = function (d) {
			let item = d.x;
			if (typeof item === 'string') {
				item = item.replace(new RegExp(' ', 'g'), '');
			}
			d3.selectAll('text').filter('.total-' + item).style('opacity', 0.8);
			var i,
				tooltip = [];
			for (i = 0; i < data.length; i += 1) {
				if (d.aggField[0] === data[i]['_id']) {
					if (query.localCurrency && query.localCurrency === true) {
						tooltip.push("Amount: " + Utils.formatMoney(data[i].AMOUNT, 2, '.', ',') + ' ' + data[i].CURRENCY);
					} else {
						tooltip.push("Amount: " + Utils.formatMoney(data[i].USD_AMOUNT, 2, '.', ',') + ' USD');
					}
					_.forEach(query.x, (xVal) => {
						tooltip.push(Utils.ucFirst(xVal) + ": " + data[i][xVal]);
					});

				}
			}
			return tooltip;
		};
	}

	createAggregatedTooltip(mySeries, data, query) {
		mySeries.getTooltipText = function (d) {
			let item = d.x;
			if (typeof item === 'string') {
				item = item.replace(new RegExp(' ', 'g'), '');
			}

			d3.selectAll('text').filter('.total-' + item).style('opacity', 0.8);

			var i,
				total = 0,
				tooltip = [];
			for (i = 0; i < data.length; i += 1) {
				if (d.aggField[0] === data[i][query.series]) {
					total += data[i]['AMOUNT'];
				}
			}
						console.log(d);

			if (query.localCurrency && query.localCurrency === true) {
				tooltip.push("Amount: " + Utils.formatMoney(d.yValue, 2, '.', ',') + ' ' + data[0].CURRENCY);
			} else {
				tooltip.push("Amount: " + Utils.formatMoney(d.yValue, 2, '.', ',') + '');
			}

			tooltip.push(Utils.ucFirst(query.series) + ': ' + d.aggField[0]);
			_.forEach(query.x, (xVal, i) => {
				tooltip.push(Utils.ucFirst(xVal) + ": " + d.xField[i])
			})
			return tooltip;
		};
	}
}
