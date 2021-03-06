
declare module 'lodash-recursive' {
	function compare(n1, n2): any;
	function containsChild(nodes, selector, cb): any;
	function each(nodes, selector, cb): any;
	function filter(nodes, selector, cb): any;
	function filterValues(items, cb): any;
	function flat(nodes, selector): any;
	function generate(method, nodes, selector, cb, flatnodes);
	function map(nodes, selector, cb?): any;
	function metaInfo(ids, id);
	function subset(ids, id);

}

declare module 'd3-queue' {
	function queue(concurrency): any;
	function queue(): any;
}

declare module 'topojson' {
	function feature(topology: any, o: any);
	function merge(topology: any, obj: any);
	function mergeArcs(topology, objects);
	function mesh(topology, o: any, cb: any);
	function meshArcs(topology, o, filter);
	function neighbors(objects);
	function presimplify(topology, triangleArea);
}



declare namespace dimple {
	export function newSvg(parentSelector: any, width: number, height: number);
	export function chart(svg: any, data: any): void;

	export class color {
		constructor(col:any);
	}	
	export class plot {
		constructor();
		static bar: any;
		static pie: any;
		static area: any;
		static line: any;
	}	

	


}
declare module 'dimple-js' {
	export = dimple;
}