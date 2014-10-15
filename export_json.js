var jsonData = emptyJSON();

var started = false;

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
	var nodeEntry = {};
	nodeEntry["name"] = arguments[0];
	nodeEntry["value"]= arguments[1];
	jsonData.nodes.push(nodeEntry);
	
	var linkEntry = {};
	linkEntry["source"] = nodeEntry["name"];
	linkEntry["target"] = 1;
	linkEntry["value"] = Math.floor((Math.random() * 100) + 1);
	jsonData.links.push(linkEntry);
	
	post("here");
}

function clear()
{
	jsonData = emptyJSON();
	write("./out.json");
}

function bang()
{	
	var b = jsobj_to_dict(jsonData);
	
	write("./out.json");
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