/*!
 * SvgParser
 * A library to convert an SVG string to parse-able segments for CAD/CAM use
 * Licensed under the MIT license
 */
 
 (function(root){
	'use strict';
	
	function SvgParser(){
		// the SVG document
		this.svg;
		
		// the top level SVG element of the SVG document
		this.svgRoot;
		
		this.allowedElements = ['svg','circle','ellipse','path','polygon','polyline','rect'];
				
		this.conf = {
			tolerance: 2, // max bound for bezier->line segment conversion, in native SVG units
			toleranceSvg: 0.000001 // fudge factor for browser inaccuracy in SVG unit handling
		}; 
	}
	
	SvgParser.prototype.config = function(config){
		this.conf.tolerance = config.tolerance;
	}
	
	SvgParser.prototype.load = function(svgString){
	
		if(!svgString || typeof svgString !== 'string'){
			throw Error('invalid SVG string');
		}
				
		var parser = new DOMParser();
		var svg = parser.parseFromString(svgString, "image/svg+xml");
		
		if(svg){
			this.svg = svg;
			this.svgRoot = svg.firstElementChild;
		}
		
		return this.svgRoot;
	}
	
	// use the utility functions in this class to prepare the svg for CAD-CAM/nest related operations
	SvgParser.prototype.cleanInput = function(){
	
		// apply any transformations, so that all path positions etc will be in the same coordinate space
		this.applyTransform(this.svgRoot);
		
		// remove any g elements and bring all elements to the top level
		this.flatten(this.svgRoot);
		
		// remove any non-contour elements like text
		this.filter(this.allowedElements);
		
		// split any compound paths into individual path elements
		this.recurse(this.svgRoot, this.splitPath);
		
		return this.svgRoot;
		
		/*dedupe(this.svgRoot.firstElementChild);
		dedupe(this.svgRoot.lastElementChild);
		
		var i;
		var A = [];
		for(i=0; i<this.svgRoot.firstElementChild.points.length; i++){
			A.push({
				x: this.svgRoot.firstElementChild.points[i].x, 
				y: this.svgRoot.firstElementChild.points[i].y, 
			});
		}
		
		var B = [];
		for(i=0; i<this.svgRoot.lastElementChild.points.length; i++){
			B.push({
				x: this.svgRoot.lastElementChild.points[i].x, 
				y: this.svgRoot.lastElementChild.points[i].y, 
			});
		}
		
		if(GeometryUtil.polygonArea(A) < 0){
			A.reverse();
		}
		if(GeometryUtil.polygonArea(B) < 0){
			B.reverse();
		}
		
		A.push(A[0]);
		B.push(B[0]);
		
		var nfp = GeometryUtil.noFitPolygon(A, B, true);
		console.log(nfp);
		
		
		for(var i=0; i<nfp.length; i++){
			var nfpe = this.svg.createElementNS(this.svgRoot.namespaceURI, 'polyline');
			for(var j=0; j<nfp[i].length; j++){
			var point = this.svgRoot.createSVGPoint();
			point.x = nfp[i][j].x;
			point.y = nfp[i][j].y;
			nfpe.points.appendItem(point);
			}
			this.svgRoot.appendChild(nfpe);
		}
		
		return this.svgRoot;
		
		// make our own copy of the SVG to preserve the original path data
		
		// replace all elements with polygons/polyline approximations
		this.recurse(this.svgRoot, this.polygonify.bind(this));
		
		// place the paths in a bin
		var bin = [];
		for(var i=0; i<this.svgRoot.firstElementChild.points.length; i++){
			bin.push({
				x: this.svgRoot.firstElementChild.points[i].x, 
				y: this.svgRoot.firstElementChild.points[i].y, 
			});
		}
		var placed = [];
		var len = this.svgRoot.children.length;
		for(i=1; i<len; i++){
			var child = this.svgRoot.children[i];
			
			dedupe(child);
			var A = [];
			for(var j=0; j<child.points.length; j++){
				A.push({
					x: child.points[j].x, 
					y: child.points[j].y, 
				});
			}
			
			var NFP = GeometryUtil.noFitPolygon(bin, A, true);
			if(NFP.length == 0){
				console.log('COULDNT PLACE, FIX THIS!!!!! OMG');
				continue;
			}
			placed.push(A);
			
			for(j=0; j<NFP.length; j++){
				var nfpe = this.svg.createElementNS(this.svgRoot.namespaceURI, 'polyline');
				for(var k=0; k<NFP[j].length; k++){
					var point = this.svgRoot.createSVGPoint();
					point.x = NFP[j][k].x;
					point.y = NFP[j][k].y;
					nfpe.points.appendItem(point);
				}
				this.svgRoot.appendChild(nfpe);
			}
			
			NFP = NFP[0];
			console.log(NFP);
			child.setAttribute('transform','translate('+(NFP[0].x-A[0].x)+' '+(NFP[0].y-A[0].y)+')');
		}*/
		//var polylines = [];
		/*for(var i=0; i< this.svgRoot.children.length; i++){
			
			var edge = GeometryUtil.polygonEdge(this.svgRoot.children[i].points, {x: 1, y: 0});
			var color = getRandomColor();
			for(var j=0; j<edge.length; j++){ // each point
				var circle = this.svg.createElementNS(this.svgRoot.namespaceURI, 'circle');
				circle.setAttribute('fill',color);
				circle.setAttribute('r', 1);
				circle.setAttribute('cx', edge[j].x);
				circle.setAttribute('cy', edge[j].y);
				this.svgRoot.appendChild(circle);
			}
		}*/
		//console.log(GeometryUtil.polygonSlideDistance(this.svgRoot.firstElementChild.points, this.svgRoot.lastElementChild.points, {x: -1, y: 0}));
		
		
		function dedupe(poly){
			var i=0;
			while(i<poly.points.length-1){
				var p = poly.points[i];
				var pnext = poly.points[i+1];
				//if(p.x == pnext.x && p.y == pnext.y){
				if(GeometryUtil.withinDistance(p, pnext, 0.00000001)){
					poly.points.removeItem(i+1);
					i--;
				}
				i++;
				//console.log(poly, poly.points);
			}
		}
		
		//var intersect = GeometryUtil.polylineIntersect(polylines, true);
		//console.log(intersect);
		/*for(i=0; i<intersect.length; i++){ // each shape
			var color = getRandomColor();
			for(var j=0; j<intersect[i].length; j++){ // each point
				var circle = this.svg.createElementNS(this.svgRoot.namespaceURI, 'circle');
				circle.setAttribute('fill',color);
				circle.setAttribute('r', 1);
				circle.setAttribute('cx', intersect[i][j].x);
				circle.setAttribute('cy', intersect[i][j].y);
				this.svgRoot.appendChild(circle);
			}
		}*/
		
		//var edge = GeometryUtil.polygonEdge(A, {x: -1.7611770629882812, y: 1.7601804733276367});
		/*var edge = GeometryUtil.polygonEdge(A, {x: -1.8775253295898438, y: -1.8785877227783203});

		for(i=0; i<edge.length; i++){ // each shape
			//var color = getRandomColor();
				var circle = this.svg.createElementNS(this.svgRoot.namespaceURI, 'circle');
				circle.setAttribute('r', 1);
				circle.setAttribute('cx', edge[i].x);
				circle.setAttribute('cy', edge[i].y);
				this.svgRoot.appendChild(circle);
		}*/
		
		
		
		function getRandomColor() {
			var letters = '0123456789ABCDEF'.split('');
			var color = '#';
			for (var i = 0; i < 6; i++ ) {
				color += letters[Math.floor(Math.random() * 16)];
			}
			return color;
		}
	}
	
	// set the given path as absolute coords (capital commands)
	// from http://stackoverflow.com/a/9677915/433888
	SvgParser.prototype.pathToAbsolute = function(path){
		if(!path || path.tagName != 'path'){
			throw Error('invalid path');
		}
		
		var seglist = path.pathSegList;
		var x=0, y=0, x0=0, y0=0, x1=0, y1=0, x2=0, y2=0;
		
		for(var i=0; i<seglist.length; i++){
			var command = seglist[i].pathSegTypeAsLetter;
			var s = seglist[i];

			if (/[MLHVCSQTA]/.test(command)){
			  if ('x' in s) x=s.x;
			  if ('y' in s) y=s.y;
			}
			else{
				if ('x1' in s) x1=x+s.x1;
				if ('x2' in s) x2=x+s.x2;
				if ('y1' in s) y1=y+s.y1;
				if ('y2' in s) y2=y+s.y2;
				if ('x'  in s) x+=s.x;
				if ('y'  in s) y+=s.y;
				switch(command){
					case 'm': seglist.replaceItem(path.createSVGPathSegMovetoAbs(x,y),i);                   break;
					case 'l': seglist.replaceItem(path.createSVGPathSegLinetoAbs(x,y),i);                   break;
					case 'h': seglist.replaceItem(path.createSVGPathSegLinetoHorizontalAbs(x),i);           break;
					case 'v': seglist.replaceItem(path.createSVGPathSegLinetoVerticalAbs(y),i);             break;
					case 'c': seglist.replaceItem(path.createSVGPathSegCurvetoCubicAbs(x,y,x1,y1,x2,y2),i); break;
					case 's': seglist.replaceItem(path.createSVGPathSegCurvetoCubicSmoothAbs(x,y,x2,y2),i); break;
					case 'q': seglist.replaceItem(path.createSVGPathSegCurvetoQuadraticAbs(x,y,x1,y1),i);   break;
					case 't': seglist.replaceItem(path.createSVGPathSegCurvetoQuadraticSmoothAbs(x,y),i);   break;
					case 'a': seglist.replaceItem(path.createSVGPathSegArcAbs(x,y,s.r1,s.r2,s.angle,s.largeArcFlag,s.sweepFlag),i);   break;
					case 'z': case 'Z': x=x0; y=y0; break;
				}
			}
			// Record the start of a subpath
			if (command=='M' || command=='m') x0=x, y0=y;
		}
	};
	
	// takes an SVG transform string and returns corresponding SVGMatrix
	// from https://github.com/fontello/svgpath
	SvgParser.prototype.transformParse = function(transformString){
		var operations = {
			matrix: true,
			scale: true,
			rotate: true,
			translate: true,
			skewX: true,
			skewY: true
		};

		var CMD_SPLIT_RE    = /\s*(matrix|translate|scale|rotate|skewX|skewY)\s*\(\s*(.+?)\s*\)[\s,]*/;
		var PARAMS_SPLIT_RE = /[\s,]+/;

		var matrix = new Matrix();
		var cmd, params;
		
		// Split value into ['', 'translate', '10 50', '', 'scale', '2', '', 'rotate',  '-45', '']
		transformString.split(CMD_SPLIT_RE).forEach(function (item) {

			// Skip empty elements
			if (!item.length) { return; }

			// remember operation
			if (typeof operations[item] !== 'undefined') {
			cmd = item;
			return;
			}

			// extract params & att operation to matrix
			params = item.split(PARAMS_SPLIT_RE).map(function (i) {
			return +i || 0;
			});

			// If params count is not correct - ignore command
			switch (cmd) {
				case 'matrix':
					if (params.length === 6) {
						matrix.matrix(params);
					}
					return;

				case 'scale':
					if (params.length === 1) {
						matrix.scale(params[0], params[0]);
					} else if (params.length === 2) {
						matrix.scale(params[0], params[1]);
					}
				return;

				case 'rotate':
					if (params.length === 1) {
						matrix.rotate(params[0], 0, 0);
					} else if (params.length === 3) {
						matrix.rotate(params[0], params[1], params[2]);
					}
				return;

				case 'translate':
					if (params.length === 1) {
						matrix.translate(params[0], 0);
					} else if (params.length === 2) {
						matrix.translate(params[0], params[1]);
					}
				return;

				case 'skewX':
					if (params.length === 1) {
						matrix.skewX(params[0]);
					}
				return;

				case 'skewY':
					if (params.length === 1) {
						matrix.skewY(params[0]);
					}
				return;
			}
		});

		return matrix;
	}
	
	// recursively apply the transform property to the given element
	SvgParser.prototype.applyTransform = function(element, globalTransform){
		
		globalTransform = globalTransform || '';
		var transformString = element.getAttribute('transform') || '';
		transformString = globalTransform + transformString;
		
		var transform, scale, rotate;
		
		if(transformString && transformString.length > 0){
			var transform = this.transformParse(transformString);
		}
		
		if(!transform){
			transform = new Matrix();
		}
		
		var tarray = transform.toArray();
		
		// decompose affine matrix to rotate, scale components (translate is just the 3rd column)
		var rotate = Math.atan2(tarray[1], tarray[3])*180/Math.PI;
		var scale = Math.sqrt(tarray[0]*tarray[0]+tarray[2]*tarray[2]);
		
		if(element.tagName == 'g' || element.tagName == 'svg'){
			element.removeAttribute('transform');
			var children = Array.prototype.slice.call(element.children);
			for(var i=0; i<children.length; i++){
				this.applyTransform(children[i], transformString);
			}
		}
		else if(transform && !transform.isIdentity()){
			switch(element.tagName){
				case 'ellipse':
					// the goal is to remove the transform property, but an ellipse without a transform will have no rotation
					// for the sake of simplicity, we will replace the ellipse with a path, and apply the transform to that path
					var path = this.svg.createElementNS(element.namespaceURI, 'path');
					var move = path.createSVGPathSegMovetoAbs(parseFloat(element.getAttribute('cx'))-parseFloat(element.getAttribute('rx')),element.getAttribute('cy'));
					var arc1 = path.createSVGPathSegArcAbs(parseFloat(element.getAttribute('cx'))+parseFloat(element.getAttribute('rx')),element.getAttribute('cy'),element.getAttribute('rx'),element.getAttribute('ry'),0,1,0);
					var arc2 = path.createSVGPathSegArcAbs(parseFloat(element.getAttribute('cx'))-parseFloat(element.getAttribute('rx')),element.getAttribute('cy'),element.getAttribute('rx'),element.getAttribute('ry'),0,1,0);
					
					path.pathSegList.appendItem(move);
					path.pathSegList.appendItem(arc1);
					path.pathSegList.appendItem(arc2);
					path.pathSegList.appendItem(path.createSVGPathSegClosePath());
					
					var transformProperty = element.getAttribute('transform');
					if(transformProperty){
						path.setAttribute('transform', transformProperty);
					}
					
					element.parentElement.replaceChild(path, element);

					element = path;

				case 'path':
					this.pathToAbsolute(element);
					var seglist = element.pathSegList;
					var prevx = 0;
					var prevy = 0;
					
					for(var i=0; i<seglist.length; i++){
						var s = seglist[i];
						var command = s.pathSegTypeAsLetter;
						
						if(command == 'H'){
							seglist.replaceItem(element.createSVGPathSegLinetoAbs(s.x,prevy),i);
							s = seglist[i];
						}
						else if(command == 'V'){
							seglist.replaceItem(element.createSVGPathSegLinetoAbs(prevx,s.y),i);
							s = seglist[i];
						}
						// currently only works for uniform scale, no skew
						// todo: fully support arbitrary affine transforms...
						else if(command == 'A'){
							seglist.replaceItem(element.createSVGPathSegArcAbs(s.x,s.y,s.r1*scale,s.r2*scale,s.angle+rotate,s.largeArcFlag,s.sweepFlag),i);
							s = seglist[i];
						}
						
						if('x' in s && 'y' in s){
							var transformed = transform.calc(s.x, s.y);
							prevx = s.x;
							prevy = s.y;
							
							s.x = transformed[0];
							s.y = transformed[1];
						}
						if('x1' in s && 'y1' in s){
							var transformed = transform.calc(s.x1, s.y1);
							s.x1 = transformed[0];
							s.y1 = transformed[1];
						}
						if('x2' in s && 'y2' in s){
							var transformed = transform.calc(s.x2, s.y2);
							s.x2 = transformed[0];
							s.y2 = transformed[1];
						}
					}
					
					element.removeAttribute('transform');
				break;
				case 'circle':
					var transformed = transform.calc(element.getAttribute('cx'), element.getAttribute('cy'));
					element.setAttribute('cx', transformed[0]);
					element.setAttribute('cy', transformed[1]);
					
					// skew not supported
					element.setAttribute('r', element.getAttribute('r')*scale);
				break;

				case 'rect':
					// similar to the ellipse, we'll replace rect with polygon
					var polygon = this.svg.createElementNS(element.namespaceURI, 'polygon');
					
															
					var p1 = this.svgRoot.createSVGPoint();
					var p2 = this.svgRoot.createSVGPoint();
					var p3 = this.svgRoot.createSVGPoint();
					var p4 = this.svgRoot.createSVGPoint();
					
					p1.x = parseFloat(element.getAttribute('x')) || 0;
					p1.y = parseFloat(element.getAttribute('y')) || 0;
					
					p2.x = p1.x + parseFloat(element.getAttribute('width'));
					p2.y = p1.y;
					
					p3.x = p2.x;
					p3.y = p1.y + parseFloat(element.getAttribute('height'));
					
					p4.x = p1.x;
					p4.y = p3.y;
					
					polygon.points.appendItem(p1);
					polygon.points.appendItem(p2);
					polygon.points.appendItem(p3);
					polygon.points.appendItem(p4);
					
					var transformProperty = element.getAttribute('transform');
					if(transformProperty){
						polygon.setAttribute('transform', transformProperty);
					}
					
					element.parentElement.replaceChild(polygon, element);
					element = polygon;
					
				case 'polygon':
				case 'polyline':
					for(var i=0; i<element.points.length; i++){
						var point = element.points[i];
						var transformed = transform.calc(point.x, point.y);
						point.x = transformed[0];
						point.y = transformed[1];
					}
					
					element.removeAttribute('transform');
				break;
			}
		}
	}
	
	// bring all child elements to the top level
	SvgParser.prototype.flatten = function(element){
		for(var i=0; i<element.children.length; i++){
			this.flatten(element.children[i]);
		}
		
		if(element.tagName != 'svg'){
			while(element.children.length > 0){
				element.parentElement.appendChild(element.children[0]);
			}
		}
	}
	
	// remove all elements with tag name not in the whitelist
	// use this to remove <text>, <g> etc that don't represent shapes
	SvgParser.prototype.filter = function(whitelist, element){
		if(!whitelist || whitelist.length == 0){
			throw Error('invalid whitelist');
		}
		
		element = element || this.svgRoot;
		
		for(var i=0; i<element.children.length; i++){
			this.filter(whitelist, element.children[i]);
		}
		
		if(element.children.length == 0 && whitelist.indexOf(element.tagName) < 0){
			element.parentElement.removeChild(element);
		}
	}
	
	// split a compound path (paths with M, m commands) into an array of paths
	SvgParser.prototype.splitPath = function(path){
		if(!path || path.tagName != 'path' || !path.parentElement){
			return false;
		}
				
		var seglist = path.pathSegList;
		var x=0, y=0, x0=0, y0=0;
		var paths = [];
		
		var p;
		
		var lastM = 0;
		for(var i=0; i<seglist.length; i++){
			if(i > 0 && seglist[i].pathSegTypeAsLetter == 'M' || seglist[i].pathSegTypeAsLetter == 'm'){
				lastM = i;
				break;
			}
		}
		
		if(lastM == 0){
			return false; // only 1 M command, no need to split
		}
		
		for( i=0; i<seglist.length; i++){
			var s = seglist[i];
			var command = s.pathSegTypeAsLetter;
			
			if(command == 'M' || command == 'm'){
				p = path.cloneNode();
				p.setAttribute('d','');
				paths.push(p);
			}
			
			if (/[MLHVCSQTA]/.test(command)){
			  if ('x' in s) x=s.x;
			  if ('y' in s) y=s.y;
			  
			  p.pathSegList.appendItem(s);
			}
			else{
				if ('x'  in s) x+=s.x;
				if ('y'  in s) y+=s.y;
				if(command == 'm'){
					p.pathSegList.appendItem(path.createSVGPathSegMovetoAbs(x,y));
				}
				else{
					if(command == 'Z' || command == 'z'){
						x = x0;
						y = y0;
					}
					p.pathSegList.appendItem(s);
				}
			}
			// Record the start of a subpath
			if (command=='M' || command=='m'){
				x0=x, y0=y;
			}
		}
		
		var addedPaths = [];
		for(i=0; i<paths.length; i++){
			// don't add trivial paths from sequential M commands
			if(paths[i].pathSegList.length > 1){
				path.parentElement.insertBefore(paths[i], path);
				addedPaths.push(paths[i]);
			}
		}
		
		path.remove();
		
		return addedPaths;
	}
	
	// recursively run the given function on the given element
	SvgParser.prototype.recurse = function(element, func){
		// only operate on original DOM tree, ignore any children that are added. Avoid infinite loops
		var children = Array.prototype.slice.call(element.children);
		for(var i=0; i<children.length; i++){
			this.recurse(children[i], func);
		}
		
		func(element);
	}
	
	// make every element a polygon or polyline
	/*SvgParser.prototype.polygonify = function(element){
		var poly;
		
		switch(element.tagName){
			case 'rect':
				poly = this.svg.createElementNS(element.namespaceURI, 'polygon');
				
				var p1 = this.svgRoot.createSVGPoint();
				var p2 = this.svgRoot.createSVGPoint();
				var p3 = this.svgRoot.createSVGPoint();
				var p4 = this.svgRoot.createSVGPoint();
				
				p1.x = element.getAttribute('x') || 0;
				p1.y = element.getAttribute('y') || 0;
				
				p2.x = p1.x + parseFloat(element.getAttribute('width'));
				p2.y = p1.y;
				
				p3.x = p2.x;
				p3.y = p1.y + parseFloat(element.getAttribute('height'));
				
				p4.x = p1.x;
				p4.y = p3.y;
				
				poly.points.appendItem(p1);
				poly.points.appendItem(p2);
				poly.points.appendItem(p3);
				poly.points.appendItem(p4);
			break;
			case 'circle':
				poly = this.svg.createElementNS(element.namespaceURI, 'polygon');
				
				var radius = parseFloat(element.getAttribute('r'));
				var cx = parseFloat(element.getAttribute('cx'));
				var cy = parseFloat(element.getAttribute('cy'));
				
				// num is the smallest number of segments required to approximate the circle to the given tolerance
				var num = Math.ceil((2*Math.PI)/Math.acos(1 - (this.conf.tolerance/radius)));
				
				if(num < 3){
					num = 3;
				}
				
				for(var i=0; i<num; i++){
					var theta = i * ( (2*Math.PI) / num);
					var point = this.svgRoot.createSVGPoint();
					point.x = radius*Math.cos(theta) + cx;
					point.y = radius*Math.sin(theta) + cy;
					
					poly.points.appendItem(point);
				}
			break;
			case 'ellipse':
				poly = this.svg.createElementNS(element.namespaceURI, 'polygon');
				
				// same as circle case. There is probably a way to reduce points but for convenience we will just flatten the equivalent circular polygon
				var rx = parseFloat(element.getAttribute('rx'))
				var ry = parseFloat(element.getAttribute('ry'));
				var maxradius = Math.max(rx, ry);
				
				var cx = parseFloat(element.getAttribute('cx'));
				var cy = parseFloat(element.getAttribute('cy'));
				
				var num = Math.ceil((2*Math.PI)/Math.acos(1 - (this.conf.tolerance/maxradius)));
				
				if(num < 3){
					num = 3;
				}
				
				for(var i=0; i<num; i++){
					var theta = i * ( (2*Math.PI) / num);
					var point = this.svgRoot.createSVGPoint();
					point.x = rx*Math.cos(theta) + cx;
					point.y = ry*Math.sin(theta) + cy;
					
					poly.points.appendItem(point);
				}
			break;
			case 'path':
				// first split into individual paths so each path will only have one M command
				var paths = this.splitPath(element);
				if(paths){
					for(var i=0; i<paths.length; i++){
						this.polygonify(paths[i]);
					}
				}
				else{
					var seglist = element.pathSegList;
					var firstCommand = seglist[0];
					var lastCommand = seglist[seglist.length-1];
					
					if(lastCommand.pathSegTypeAsLetter == 'Z' || lastCommand.pathSegTypeAsLetter == 'z' ||
						GeometryUtil.withinDistance(firstCommand, lastCommand, this.conf.tolerance)){
						// if a Z is not explicitly specified but the ending point is very close to the starting point, we assume they mean to close it but forgot.
						poly = this.svg.createElementNS(element.namespaceURI, 'polygon');
					}
					else{
						poly = this.svg.createElementNS(element.namespaceURI, 'polyline'); // open path
					}
					
					var x=0, y=0, x0=0, y0=0, x1=0, y1=0, x2=0, y2=0, prevx=0, prevy=0, prevx1=0, prevy1=0, prevx2=0, prevy2=0;
					
					for(var i=0; i<seglist.length; i++){
						var s = seglist[i];
						var command = s.pathSegTypeAsLetter;
						
						prevx = x;
						prevy = y;
						
						prevx1 = x1;
						prevy1 = y1;
						
						prevx2 = x2;
						prevy2 = y2;
						
						if (/[MLHVCSQTA]/.test(command)){
							if ('x1' in s) x1=s.x1;
							if ('x2' in s) x2=s.x2;
							if ('y1' in s) y1=s.y1;
							if ('y2' in s) y2=s.y2;
							if ('x' in s) x=s.x;
							if ('y' in s) y=s.y;
						}
						else{
							if ('x1' in s) x1=x+s.x1;
							if ('x2' in s) x2=x+s.x2;
							if ('y1' in s) y1=y+s.y1;
							if ('y2' in s) y2=y+s.y2;							
							if ('x'  in s) x+=s.x;
							if ('y'  in s) y+=s.y;
						}
						switch(command){
							// linear line types
							case 'm':
							case 'M':
							case 'l':
							case 'L':
							case 'h':
							case 'H':
							case 'v':
							case 'V':
								var point = this.svgRoot.createSVGPoint();
								point.x = x;
								point.y = y;
								poly.points.appendItem(point);
							break;
							// Quadratic Beziers
							case 't':
							case 'T':
							// implicit control point
							if(i > 0 && /[QqTt]/.test(seglist[i-1].pathSegTypeAsLetter)){
								x1 = prevx + (prevx-prevx1);
								y1 = prevy + (prevy-prevy1);
							}
							else{
								x1 = prevx;
								y1 = prevy;
							}
							case 'q':
							case 'Q':
								var pointlist = GeometryUtil.QuadraticBezier.linearize({x: prevx, y: prevy}, {x: x, y: y}, {x: x1, y: y1}, this.conf.tolerance);
								pointlist.shift(); // firstpoint would already be in the poly
								for(var j=0; j<pointlist.length; j++){
									var point = this.svgRoot.createSVGPoint();
									point.x = pointlist[j].x;
									point.y = pointlist[j].y;
									poly.points.appendItem(point);
								}
							break;
							case 's':
							case 'S':
								if(i > 0 && /[CcSs]/.test(seglist[i-1].pathSegTypeAsLetter)){
									x1 = prevx + (prevx-prevx2);
									y1 = prevy + (prevy-prevy2);
								}
								else{
									x1 = prevx;
									y1 = prevy;
								}
							case 'c':
							case 'C':
								var pointlist = GeometryUtil.CubicBezier.linearize({x: prevx, y: prevy}, {x: x, y: y}, {x: x1, y: y1}, {x: x2, y: y2}, this.conf.tolerance);
								pointlist.shift(); // firstpoint would already be in the poly
								for(var j=0; j<pointlist.length; j++){
									var point = this.svgRoot.createSVGPoint();
									point.x = pointlist[j].x;
									point.y = pointlist[j].y;
									poly.points.appendItem(point);
								}
							break;
							case 'a':
							case 'A':
								var pointlist = GeometryUtil.Arc.linearize({x: prevx, y: prevy}, {x: x, y: y}, s.r1, s.r2, s.angle, s.largeArcFlag,s.sweepFlag, this.conf.tolerance);
								pointlist.shift();
								
								for(var j=0; j<pointlist.length; j++){
									var point = this.svgRoot.createSVGPoint();
									point.x = pointlist[j].x;
									point.y = pointlist[j].y;
									poly.points.appendItem(point);
								}
							break;
							case 'z': case 'Z': x=x0; y=y0; break;
						}
						// Record the start of a subpath
						if (command=='M' || command=='m') x0=x, y0=y;
					}
				}
				
			break;
		}
		
		if(poly && element.parentElement){
			element.parentElement.replaceChild(poly, element);
		}
	}*/
	
	// return a polygon from the given SVG element in the form of an array of points
	SvgParser.prototype.polygonify = function(element){
		var poly = [];
		var i;
		switch(element.tagName){
			case 'polygon':
			case 'polyline':
				for(i=0; i<element.points.length; i++){
					poly.push({
						x: element.points[i].x,
						y: element.points[i].y
					});
				}
			break;
			case 'rect':
				var p1 = {};
				var p2 = {};
				var p3 = {};
				var p4 = {};
				
				p1.x = parseFloat(element.getAttribute('x')) || 0;
				p1.y = parseFloat(element.getAttribute('y')) || 0;
				
				p2.x = p1.x + parseFloat(element.getAttribute('width'));
				p2.y = p1.y;
				
				p3.x = p2.x;
				p3.y = p1.y + parseFloat(element.getAttribute('height'));
				
				p4.x = p1.x;
				p4.y = p3.y;
				
				poly.push(p1);
				poly.push(p2);
				poly.push(p3);
				poly.push(p4);
			break;
			case 'circle':				
				var radius = parseFloat(element.getAttribute('r'));
				var cx = parseFloat(element.getAttribute('cx'));
				var cy = parseFloat(element.getAttribute('cy'));
				
				// num is the smallest number of segments required to approximate the circle to the given tolerance
				var num = Math.ceil((2*Math.PI)/Math.acos(1 - (this.conf.tolerance/radius)));
				
				if(num < 3){
					num = 3;
				}
				
				for(var i=0; i<num; i++){
					var theta = i * ( (2*Math.PI) / num);
					var point = {};
					point.x = radius*Math.cos(theta) + cx;
					point.y = radius*Math.sin(theta) + cy;
					
					poly.push(point);
				}
			break;
			case 'ellipse':				
				// same as circle case. There is probably a way to reduce points but for convenience we will just flatten the equivalent circular polygon
				var rx = parseFloat(element.getAttribute('rx'))
				var ry = parseFloat(element.getAttribute('ry'));
				var maxradius = Math.max(rx, ry);
				
				var cx = parseFloat(element.getAttribute('cx'));
				var cy = parseFloat(element.getAttribute('cy'));
				
				var num = Math.ceil((2*Math.PI)/Math.acos(1 - (this.conf.tolerance/maxradius)));
				
				if(num < 3){
					num = 3;
				}
				
				for(var i=0; i<num; i++){
					var theta = i * ( (2*Math.PI) / num);
					var point = {};
					point.x = rx*Math.cos(theta) + cx;
					point.y = ry*Math.sin(theta) + cy;
					
					poly.push(point);
				}
			break;
			case 'path':
				// we'll assume that splitpath has already been run on this path, and it only has one M/m command 
				var seglist = element.pathSegList;
				var firstCommand = seglist[0];
				var lastCommand = seglist[seglist.length-1];

				var x=0, y=0, x0=0, y0=0, x1=0, y1=0, x2=0, y2=0, prevx=0, prevy=0, prevx1=0, prevy1=0, prevx2=0, prevy2=0;
				
				for(var i=0; i<seglist.length; i++){
					var s = seglist[i];
					var command = s.pathSegTypeAsLetter;
					
					prevx = x;
					prevy = y;
					
					prevx1 = x1;
					prevy1 = y1;
					
					prevx2 = x2;
					prevy2 = y2;
					
					if (/[MLHVCSQTA]/.test(command)){
						if ('x1' in s) x1=s.x1;
						if ('x2' in s) x2=s.x2;
						if ('y1' in s) y1=s.y1;
						if ('y2' in s) y2=s.y2;
						if ('x' in s) x=s.x;
						if ('y' in s) y=s.y;
					}
					else{
						if ('x1' in s) x1=x+s.x1;
						if ('x2' in s) x2=x+s.x2;
						if ('y1' in s) y1=y+s.y1;
						if ('y2' in s) y2=y+s.y2;							
						if ('x'  in s) x+=s.x;
						if ('y'  in s) y+=s.y;
					}
					switch(command){
						// linear line types
						case 'm':
						case 'M':
						case 'l':
						case 'L':
						case 'h':
						case 'H':
						case 'v':
						case 'V':
							var point = {};
							point.x = x;
							point.y = y;
							poly.push(point);
						break;
						// Quadratic Beziers
						case 't':
						case 'T':
						// implicit control point
						if(i > 0 && /[QqTt]/.test(seglist[i-1].pathSegTypeAsLetter)){
							x1 = prevx + (prevx-prevx1);
							y1 = prevy + (prevy-prevy1);
						}
						else{
							x1 = prevx;
							y1 = prevy;
						}
						case 'q':
						case 'Q':
							var pointlist = GeometryUtil.QuadraticBezier.linearize({x: prevx, y: prevy}, {x: x, y: y}, {x: x1, y: y1}, this.conf.tolerance);
							pointlist.shift(); // firstpoint would already be in the poly
							for(var j=0; j<pointlist.length; j++){
								var point = {};
								point.x = pointlist[j].x;
								point.y = pointlist[j].y;
								poly.push(point);
							}
						break;
						case 's':
						case 'S':
							if(i > 0 && /[CcSs]/.test(seglist[i-1].pathSegTypeAsLetter)){
								x1 = prevx + (prevx-prevx2);
								y1 = prevy + (prevy-prevy2);
							}
							else{
								x1 = prevx;
								y1 = prevy;
							}
						case 'c':
						case 'C':
							var pointlist = GeometryUtil.CubicBezier.linearize({x: prevx, y: prevy}, {x: x, y: y}, {x: x1, y: y1}, {x: x2, y: y2}, this.conf.tolerance);
							pointlist.shift(); // firstpoint would already be in the poly
							for(var j=0; j<pointlist.length; j++){
								var point = {};
								point.x = pointlist[j].x;
								point.y = pointlist[j].y;
								poly.push(point);
							}
						break;
						case 'a':
						case 'A':
							var pointlist = GeometryUtil.Arc.linearize({x: prevx, y: prevy}, {x: x, y: y}, s.r1, s.r2, s.angle, s.largeArcFlag,s.sweepFlag, this.conf.tolerance);
							pointlist.shift();
							
							for(var j=0; j<pointlist.length; j++){
								var point = {};
								point.x = pointlist[j].x;
								point.y = pointlist[j].y;
								poly.push(point);
							}
						break;
						case 'z': case 'Z': x=x0; y=y0; break;
					}
					// Record the start of a subpath
					if (command=='M' || command=='m') x0=x, y0=y;
				}
				
			break;
		}
		
		// do not include last point if coincident with starting point
		if(poly.length > 0 && GeometryUtil.almostEqual(poly[0].x,poly[poly.length-1].x, this.conf.toleranceSvg) && GeometryUtil.almostEqual(poly[0].y,poly[poly.length-1].y, this.conf.toleranceSvg)){
			poly.pop();
		}
		
		return poly;
	};
	
	// expose public methods
	var parser = new SvgParser();
	
	root.SvgParser = {
		config: parser.config.bind(parser),
		load: parser.load.bind(parser),
		clean: parser.cleanInput.bind(parser),
		polygonify: parser.polygonify.bind(parser)
	};
	
}(this));