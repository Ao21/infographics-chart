import * as d3 from 'd3';
import {Subject} from 'rxjs/Rx';
import {DataService} from './services/data';
import {BarStackGrouped} from './component/bar_stack_grouped/bar_stack_grouped';
import {PieChart} from './component/pie_chart/pie_chart';
import {StackedArea} from './component/stacked_area/stacked_area';
import {LineChart} from './component/line_chart/line_chart';
export class Bootstrap {

  data: DataService = new DataService();
  bar: BarStackGrouped = new BarStackGrouped();
  pie: PieChart = new PieChart();
  stackedArea: StackedArea = new StackedArea();
  lineChart: LineChart = new LineChart();
  resizeEvent: Subject<any> = new Subject();



  constructor() {

    this.resizeEvent.debounceTime(50).subscribe(next => {
      d3.select('#graph').selectAll("*").remove();
      this.init();
    });
    this.init();

  }

  init() {
    var query: any = window['GRAPH_OPTIONS'];
    if (!query) {
      query = {
        graph: 'bar'
      }
    }
    this.data.loadData().then((next) => {
      switch (query.graph) {
        case "bar":
          this.bar.init(next);
          break;
        case "pie":
          this.pie.init(next);
          break;
        case "area":
          this.stackedArea.init(next);
          break;
        case "line":
          this.lineChart.init(next);
          break;
        default:
          this.bar.init(next);
      }
    });
    window.onresize = (event) => {
        this.resizeEvent.next(true);
      };
  }
}

let app = new Bootstrap();