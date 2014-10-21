var jsonData = emptyJSON();
var jsonFile;
var htmlFile;
var targetFitness;

var started = false;

outlets = 2;

function targetFitness(targetFitness)
{
	this.targetFitness = targetFitness
}

function emptyJSON()
{
	var jsonData = 
	{
		nodes : [
			{
				"name" : 0,
				"value" : 0,
				"size" : 7
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
		nodeEntry["size"] = Math.floor((Math.random() * 10) + 1);
		jsonData.nodes.push(nodeEntry);
		
		var linkEntry = {};
		linkEntry["source"] = nodeEntry["name"];
		linkEntry["target"] = 0;
		linkEntry["value"] = Math.floor((Math.random() * 100) + 1);
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
return '<!DOCTYPE html>\n\
<meta charset="utf-8">\n\
<style>\n\
\n\
body {\n\
	background-color: black;\n\
}\n\
\n\
.node {\n\
  stroke: #fff;\n\
  stroke-width: 1.5px;\n\
}\n\
\n\
.link {\n\
  stroke: #999;\n\
  stroke-opacity: .6;\n\
}\n\
\n\
</style>\n\
<body>\n\
<script src="http://d3js.org/d3.v3.min.js"></script>\n\
<script>\n\
\n\
var width = 240,\n\
    height = 160;\n\
\n\
var color = d3.scale.category20();\n\
\n\
var force = d3.layout.force()\n\
    .charge(-120)\n\
    .linkDistance(\n\
		function(link) {\n\
       		return link.value;\n\
    	}\n\
    )\n\
    .size([width, height]);\n\
\n\
var svg = d3.select("body").append("svg")\n\
    .attr("width", width)\n\
    .attr("height", height);\n\
\n\
d3.json("' + jsonFile + '", function(error, graph) {\n\
  force\n\
      .nodes(graph.nodes)\n\
      .links(graph.links)\n\
      .start();\n\
\n\
  var link = svg.selectAll(".link")\n\
      .data(graph.links)\n\
    .enter().append("line")\n\
      .attr("class", "link")\n\
//       .style("stroke-width", function(d) { return Math.sqrt(d.value); });\n\
       .style("stroke-width", function(d) { return d.value/12; });\n\
\n\
  var node = svg.selectAll(".node")\n\
      .data(graph.nodes)\n\
    .enter().append("circle")\n\
      .attr("class", "node")\n\
      .attr("r", function(d) {return d.size})\n\
      .style("fill", function(d) { return color(d.group); })\n\
      .call(force.drag);\n\
\n\
  node.append("title")\n\
      .text(function(d) { return d.name; });\n\
\n\
  force.on("tick", function() {\n\
    link.attr("x1", function(d) { return d.source.x; })\n\
        .attr("y1", function(d) { return d.source.y; })\n\
        .attr("x2", function(d) { return d.target.x; })\n\
        .attr("y2", function(d) { return d.target.y; });\n\
\n\
    node.attr("cx", function(d) { return d.x; })\n\
        .attr("cy", function(d) { return d.y; });\n\
  });\n\
});\n\
\n\
</script>';
}