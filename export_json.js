var jsonData = emptyJSON();
var jsonFile;
var htmlFile;

var started = false;

outlets = 2;

function emptyJSON()
{
	var jsonData = 
	{
		nodes : [
			{
				"name" : 1,
				"value" : 1
			}
		],
		links : []
	};
	return jsonData;
}

function list(a)
{
	if(started) {
		var nodeEntry = {};
		nodeEntry["name"] = arguments[0];
		nodeEntry["value"]= arguments[1];
		jsonData.nodes.push(nodeEntry);
		
		var linkEntry = {};
		linkEntry["source"] = nodeEntry["name"];
		linkEntry["target"] = 1;
		linkEntry["value"] = Math.floor((Math.random() * 10) + 1);
		jsonData.links.push(linkEntry);
	}
}

function start(path)
{
	if(path != "/") {
		path = path.split(":");
		jsonFile = path[1] + "out.json";
		htmlFile = path[1] + "force.html";	
		
		var htmlText = getHtmlText();
		
		var fout = new File(htmlFile,"write","TEXT");
		if (fout.isopen) {
			fout.eof = 0;
			fout.writestring(htmlText);
			fout.close();
			post("\nJSON Write",htmlFile);
		}
		outlet(1, htmlFile);
	}
	newJSON();
	started = true;
}

function newJSON()
{
	jsonData = emptyJSON();
	write(jsonFile);
}

function bang()
{	
	var b = jsobj_to_dict(jsonData);
	
	write(jsonFile);
	outlet(0, "bang");	
}

function write(p){
	var jase = JSON.stringify(jsonData,null,'\t');
	var path = p;
	var fout = new File(path,"write","TEXT");
	if (fout.isopen) {
		fout.eof = 0;
		fout.writeline(jase);
		fout.close();
		post("\nJSON Write",path);
	} else {
		post("\ncould not create json file: " + path);
	}
}

function jsobj_to_dict(o) {
	var d = new Dict();
	
	for (var keyIndex in o)	{
		var value = o[keyIndex];

		if (!(typeof value === "string" || typeof value === "number")) {
			var isEmpty = true;
			for (var anything in value) {
				isEmpty = false;
				break;
			}
			
			if (isEmpty) {
				value = new Dict();
			}
			else {
				var isArray = true;
				for (var valueKeyIndex in value) {
					if (isNaN(parseInt(valueKeyIndex))) {
						isArray = false;
						break;
					}
				}
			
				if (!isArray) {
					value = jsobj_to_dict(value);
				}
			}
		}
		d.set(keyIndex, value);
	}
	return d;
}

// this function will post a JS object's content to the max window
function printobj (obj, name) {
    post("---- object " + name + "----" +"\n");
    printobjrecurse(obj, name);
}

function printobjrecurse (obj, name) {
    if (typeof obj === "undefined") {
        post(name + " : undefined" +"\n");
        return;
    }
    if (obj == null) {
        post(name + " : null" +"\n");
        return;
    }

    if ((typeof obj == "number") || (typeof obj == "string")) {
        post(name +  " :" + obj + "\n");
    } else {
        var num = 0;
        for (var k in obj) {
            if (obj[k] && typeof obj[k] == "object")
            {
                printobjrecurse(obj[k], name + "[" + k + "]");
            } else {
                post(name + "[" + k + "] : " + obj[k] +"\n")
            }
            num++;
        }
        if (num == 0) {
            post(name + " : empty object" +"\n");
        }
    }
}

//HTML----------------------------------------------

function getHtmlText() {
	return '<!DOCTYPE html><meta charset="utf-8"><style>body {	background-color: black;}.node {  stroke: #fff;  stroke-width: 1.5px;}.link {  stroke: #999;  stroke-opacity: .6;}</style><body><script src="http://d3js.org/d3.v3.min.js"></script><script>var width = 240,    height = 160;var color = d3.scale.category20();var force = d3.layout.force()    .charge(-120)    .linkDistance(		function(link) {       		return link.value;    	}    )    .size([width, height]);var svg = d3.select("body").append("svg")    .attr("width", width)    .attr("height", height);d3.json("'+ jsonFile + '", function(error, graph) {  force      .nodes(graph.nodes)      .links(graph.links)      .start();  var link = svg.selectAll(".link")      .data(graph.links)    .enter().append("line")      .attr("class", "link")       .style("stroke-width", function(d) { return d.value/12; });  var node = svg.selectAll(".node")      .data(graph.nodes)    .enter().append("circle")      .attr("class", "node")      .attr("r", 5)      .style("fill", function(d) { return color(d.group); })      .call(force.drag);  node.append("title")      .text(function(d) { return d.name; });  force.on("tick", function() {    link.attr("x1", function(d) { return d.source.x; })        .attr("y1", function(d) { return d.source.y; })        .attr("x2", function(d) { return d.target.x; })        .attr("y2", function(d) { return d.target.y; });    node.attr("cx", function(d) { return d.x; })        .attr("cy", function(d) { return d.y; });  });});</script>';
}