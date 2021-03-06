// SAMMI is a tool for visualization of metabolic networks

// Copyright (C) 2019 The University of Texas MD Anderson Cancer Center.

// This program is free software: you can redistribute it and/or modify 
// it under the terms of the GNU General Public License as published by 
// the Free Software Foundation, either version 3 of the License, or 
// any later version.

// This program is distributed in the hope that it will be useful, 
// but WITHOUT ANY WARRANTY; without even the implied warranty of 
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the 
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License 
// with this program. If not, see <https://www.gnu.org/licenses/>.

////////////////////////////////////
var fex;
function receivedExample(e) {
    //Read in file
    fex = e.target.result;
}
function loadFileExample() {
    var input, file, fr;
    input = document.getElementById('fileinputexample');
    file = input.files[0];
    fr = new FileReader();
    fr.onload = receivedExample;
    fr.readAsText(file);
}
//////////////////////////////////////
//Load in XML model
function receivedXML(e) {
    //Read in file
    fex = e.target.result;
    parser = new DOMParser();
    var xmlDoc = parser.parseFromString(fex,"text/xml");
    //Initialize
    graph = {
        nodes: [],
        links: [],
        suspended: [],
        text: [],
        shapes: []
    };
    //Read in metabolites
    x = xmlDoc.getElementsByTagName('species')
    var allmets = [];
    for (var i = 0; i < x.length; i++) {
        var newnode = Object.assign({},newnodetemp("id",2))
        for (var j = 0; j < x[i].attributes.length; j++) {
            newnode[x[i].attributes[j].name] = x[i].attributes[j].value;
        }
        newnode.class = newnode.id;
        newnode.index = i;

        z = x[i].getElementsByTagName('html:p');
        for (var j = 0; j < z.length; j++) {
            m = z[j];
            var attr = m.innerHTML.split(": ");
            newnode[attr[0]] = attr[1];
        }

        z = x[i].getElementsByTagName('p');
        for (var j = 0; j < z.length; j++) {
            m = z[j];
            var attr = m.innerHTML.split(": ");
            newnode[attr[0]] = attr[1];
        }

        z = x[i].getElementsByTagName('parameter');
        for (var j = 0; j < z.length; j++) {
            if ('name' in z[j].attributes) {
                newnode[z[j].attributes.name.value] = z[j].attributes.value.value;
            } else {
                newnode[z[j].attributes.id.value] = z[j].attributes.value.value;
            }
        }

        graph.nodes.push(newnode)
        allmets.push(newnode.id)
    }
    let metcount = x.length;
    //Read in reactions
    y = xmlDoc.getElementsByTagName('reaction')
    var linkcount = 0,
    allrxns = [];
    for (var i = 0; i < y.length; i++) {
        var newnode = Object.assign({},newnodetemp("id",1))
        for (var j = 0; j < y[i].attributes.length; j++) {
            newnode[y[i].attributes[j].name] = y[i].attributes[j].value;
        }
        newnode.class = newnode.id;
        newnode.index = i + metcount;;

        z = y[i].getElementsByTagName('listOfReactants')
        if (z.length > 0) {
            for (var j = 0; j < z[0].childElementCount; j++) {
                var newlink = {index: linkcount, flux: null, refx: 0, refy: 0, width: null, reversed: 1}
                linkcount++
                metnode = graph.nodes[allmets.indexOf(z[0].children[j].attributes['species'].value)];
                newlink.source = metnode;
                newlink.target = newnode;
                graph.links.push(newlink)
            }
            z = y[i].getElementsByTagName('listOfProducts')
        }
        if (z.length > 0) {
            for (var j = 0; j < z[0].childElementCount; j++) {
                var newlink = {index: linkcount, flux: null, refx: 0, refy: 0, width: null, reversed: 1}
                linkcount++
                metnode = graph.nodes[allmets.indexOf(z[0].children[j].attributes['species'].value)];
                newlink.target = metnode;
                newlink.source = newnode;
                graph.links.push(newlink)
            }
        }

        z = y[i].getElementsByTagName('html:p');
        for (var j = 0; j < z.length; j++) {
            m = z[j];
            var attr = m.innerHTML.split(": ");
            newnode[attr[0]] = attr[1];
        }

        z = y[i].getElementsByTagName('p');
        for (var j = 0; j < z.length; j++) {
            m = z[j];
            var attr = m.innerHTML.split(": ");
            newnode[attr[0]] = attr[1];
        }

        z = y[i].getElementsByTagName('parameter');
        for (var j = 0; j < z.length; j++) {
            if ('name' in z[j].attributes) {
                newnode[z[j].attributes.name.value] = z[j].attributes.value.value;
            } else {
                newnode[z[j].attributes.id.value] = z[j].attributes.value.value;
            }
        }

        graph.nodes.push(newnode)
        allrxns.push(newnode.id)
    }

    //Read in groups
    x = xmlDoc.getElementsByTagName('groups:listOfGroups');
    for (var i = 0; i < x.length; i++) {
        y = x[i].getElementsByTagName('groups:group');
        for (var j = 0; j < y.length; j++) {
            var atttmp = y[j].getAttribute('groups:kind');
            var attval = y[j].getAttribute('groups:name');
            z = y[j].getElementsByTagName('groups:member');
            for (var k = 0; k < z.length; k++) {
                graph.nodes[allrxns.indexOf(z[k].getAttribute('groups:idRef'))+allmets.length][atttmp] = attval;
            }
        }
    }

    defineNameOptions()
    
    //load
    if (onloadfilter) {
        document.getElementById("onloadoptionstop").style.display = "block";
        for (var k = 0; k < document.getElementsByClassName("topopt").length; k++) {
            document.getElementsByClassName("topopt")[k].style="display:none;";
        }
        for (var k = 0; k < document.getElementsByClassName("topbr").length; k++) {
            document.getElementsByClassName("topbr")[k].style="display:none;";
        }
        return;
    }

    nm = document.getElementById('fileinput').value.split("\\");
    nm = nm[nm.length-1];
    nm = nm.replace(/\..*$/i,"");
    parsedmodels[nm] = graph;
    currentparsed = nm;

    loadExistingReactionToAdd(parsedmodels)
    loadInitialGraph()
    reDefineSimulation()
}

//Load in JSON 
function receivedJSON(e) {
    lines = e.target.result;
    ograph = JSON.parse(lines);

    graph = {
        nodes: [],
        links: [],
        suspended: [],
        text: [],
        shapes: []
    };

    for(var i = 0; i < ograph.metabolites.length; i++) {
        var newnode = Object.assign(ograph.metabolites[i],{
            index: i,
            group: 2,
            secondary: false,
            flux: null,
            size: null,
            trap: -1,
            concentration: null,
            bezi: [null, null, null, null],
            labelshift: [0,0],
            grouping: [],
            reversed: 1,
            width: null
        });
        newnode.class = newnode.id;
        graph.nodes.push(newnode)
        
    }

    linkcount = 0;
    for (var i = 0; i < ograph.reactions.length; i++) {
        var newnode = Object.assign(ograph.reactions[i],{
            index: ograph.metabolites.length + i,
            group: 1,
            secondary: false,
            flux: null,
            size: null,
            trap: -1,
            concentration: null,
            bezi: [null, null, null, null],
            labelshift: [0,0],
            grouping: [],
            reversed: 1,
            width: null
        });

        newnode.class = newnode.id;
        
        graph.nodes.push(newnode)

        for (var j in newnode.metabolites) {
            var newlink = {index: linkcount, flux: null, refx: 0, refy: 0, width: null, reversed: 1}
            linkcount++;
            for (var k = 0; k < graph.nodes.length; k++){
                if (graph.nodes[k].id == j) {
                    if (newnode.metabolites[j] < 0) {
                        newlink.source = graph.nodes[k];
                        newlink.target = graph.nodes[graph.nodes.length-1];
                    } else {
                        newlink.target = graph.nodes[k];
                        newlink.source = graph.nodes[graph.nodes.length-1];
                    }
                    graph.links.push(newlink)
                    break;
                }
            }
        }
    }
    defineNameOptions()

    if (onloadfilter) {
        document.getElementById("onloadoptionstop").style.display = "block";
        for (var k = 0; k < document.getElementsByClassName("topopt").length; k++) {
            document.getElementsByClassName("topopt")[k].style="display:none;";
        }
        for (var k = 0; k < document.getElementsByClassName("topbr").length; k++) {
            document.getElementsByClassName("topbr")[k].style="display:none;";
        }
        return;
    }

    nm = document.getElementById('fileinput').value.split("\\");
    nm = nm[nm.length-1];
    nm = nm.replace(/\..*$/i,"");
    parsedmodels[nm] = graph;
    currentparsed = nm;

    loadExistingReactionToAdd(parsedmodels)
    loadInitialGraph()
    reDefineSimulation()
}
var tmpy
var xmlall
function receivedOWL(e,file) {
    //Read in file
    fex = e.target.result;
    parser = new DOMParser();
    var xmlDoc = parser.parseFromString(fex,"text/xml");
    xmlall = xmlDoc
    
    //Initialize
    graph = {
        nodes: [],
        links: [],
        suspended: [],
        text: [],
        shapes: []
    };

    //Get metabolites to include
    metlist = []
    y = xmlDoc.getElementsByTagName('bp:BiochemicalReaction')
    for (var i = 0; i < y.length; i++) {
        //Get reactants
        z = y[i].getElementsByTagName('bp:left')
        for (var j = 0; j < z.length; j++) {
            if (z[j].attributes.length == 0) {
                id = z[j].children[0].attributes[0].value
            } else {
                id = z[j].attributes[0].value.substr(1)
            }
            if (metlist.indexOf(id) == -1) {metlist.push(id)}
        }
        //Get products
        z = y[i].getElementsByTagName('bp:right')
        for (var j = 0; j < z.length; j++) {
            if (z[j].attributes.length == 0) {
                id = z[j].children[0].attributes[0].value
            } else {
                id = z[j].attributes[0].value.substr(1)
            }
            if (metlist.indexOf(id) == -1) {metlist.push(id)}
        }
    }

    //Get metabolite data
    var allmets = [];
    z = xmlDoc.getElementsByTagName('bp:SmallMolecule')
    for (var i = 0; i < z.length; i++) {
        if (metlist.indexOf(z[i].attributes[0].value) == -1) {continue}
        var newnode = Object.assign({},newnodetemp("id",2))
        newnode.name = z[i].attributes[0].value
        newnode.id = z[i].attributes[0].value
        for (var j = 0; j < z[i].children.length; j++) {
            newnode[z[i].children[j].localName] = z[i].children[j].textContent;
        }
        newnode.name = newnode.name.replace(/(&.*?;)|(<.*?>)/g,'')
        newnode.standardName = newnode.standardName.replace(/(&.*?;)|(<.*?>)/g,'')
        newnode.class = newnode.id;
        newnode.index = i;
        graph.nodes.push(newnode)
        allmets.push(newnode.id)
    }
  
    let metcount = allmets.length;
    //Read in reactions
    y = xmlDoc.getElementsByTagName('bp:BiochemicalReaction')
    tmpy = y
    var linkcount = 0,
    allrxns = [];
    for (var i = 0; i < y.length; i++) {
        var newnode = Object.assign({},newnodetemp("id",1))
        newnode.name = y[i].attributes[0].value
        newnode.id = y[i].attributes[0].value
        for (var j = 0; j < y[i].children.length; j++) {
            if (y[i].children[j].children.length > 0) {continue;}
            newnode[y[i].children[j].localName] = y[i].children[j].textContent;
        }
        newnode.name = newnode.name.replace(/(&.*?;)|(<.*?>)/g,'')
        newnode.standardName = newnode.standardName.replace(/(&.*?;)|(<.*?>)/g,'')
        newnode.class = newnode.id;
        newnode.index = i + metcount;

        //Get reactants
        z = y[i].getElementsByTagName('bp:left')
        for (var j = 0; j < z.length; j++) {
            if (z[j].attributes.length == 0) {
                id = z[j].children[0].attributes[0].value
            } else {
                id = z[j].attributes[0].value.substr(1)
            }
            var newlink = {index: linkcount, flux: null, refx: 0, refy: 0, width: null, reversed: 1}
            linkcount++
            newlink.source = graph.nodes[allmets.indexOf(id)];
            newlink.target = newnode;
            graph.links.push(newlink)
        }
        //Get products
        z = y[i].getElementsByTagName('bp:right')
        for (var j = 0; j < z.length; j++) {
            if (z[j].attributes.length == 0) {
                id = z[j].children[0].attributes[0].value
            } else {
                id = z[j].attributes[0].value.substr(1)
            }
            var newlink = {index: linkcount, flux: null, refx: 0, refy: 0, width: null, reversed: 1}
            linkcount++
            newlink.target = graph.nodes[allmets.indexOf(id)];
            newlink.source = newnode;
            graph.links.push(newlink)
        }

        graph.nodes.push(newnode)
        allrxns.push(newnode.id)
    }

    defineNameOptions()
    
    //load
    if (onloadfilter) {
        document.getElementById("onloadoptionstop").style.display = "block";
        for (var k = 0; k < document.getElementsByClassName("topopt").length; k++) {
            document.getElementsByClassName("topopt")[k].style="display:none;";
        }
        for (var k = 0; k < document.getElementsByClassName("topbr").length; k++) {
            document.getElementsByClassName("topbr")[k].style="display:none;";
        }
        return;
    }

    nm = file.name;
    // nm = nm[nm.length-1];
    nm = nm.replace(/\..*$/i,"");
    parsedmodels[nm] = graph;
    currentparsed = nm;

    if (Object.keys(parsedmodels).length === numfiles) {
        select = document.getElementById("onloadf1")
        select.onchange = function() {onLoadSwitch(this)};
        select.selectedIndex = 0;
        currentparsed = select.value;
        graph = parsedmodels[currentparsed];

        setdisplay()
        loadExistingReactionToAdd(parsedmodels)
        loadInitialGraph()
        reDefineSimulation()
        node.classed("selected",function(d){return d.selected})
        simulation.restart()
    }
}

function loadFile() {

    if (gMain) {
        gMain.remove();
        simulation.stop();
    }

    var input, file, fr;
    if (input) {delete input;}
    input = document.getElementById('fileinput');
    file = input.files[0];
    fr = new FileReader();
    if (file.name.match(/\.(.*)$/i)[0] == '.json') {
        fr.onload = receivedJSON;
    } else if (file.name.match(/\.(.*)$/i)[0] == '.xml' || file.name.match(/\.(.*)$/i)[0] == '.sbml') {
        fr.onload = receivedXML;
    } else {
        return;
    }
    fr.readAsText(file);
}
function loadFile2() {

    if (gMain) {
        gMain.remove();
        simulation.stop();
    }

    var input, file, fr;
    input = document.getElementById('fileinput2');
    file = input.files[0];
    fr = new FileReader();
    if (file.name.match(/\.(.*)$/i)[0] == '.json') {
        fr.onload = receivedJSON;
    } else if (file.name.match(/\.(.*)$/i)[0] == '.xml') {
        fr.onload = receivedXML;
    } else {
        return;
    }
    fr.readAsText(file);
}

function loadFile3(file) {
    if (gMain) {
        gMain.remove();
        simulation.stop();
    }

    var input, file, fr;
    input = document.getElementById('fileinput3');
    numfiles = input.files.length;

    document.getElementById("onloadoptionmid").style.display = "none";
    document.getElementById("onloadoption2").style.display = "none";

    var place = document.getElementById("onloadoptions");
    var select = document.createElement("select");
    select.id = "onloadf1";
    place.appendChild(select);

    a = document.createElement("a")
    a.innerHTML = "&#8249";
    a.className = "scrollopts";
    a.onclick = function(){previousScroll("onloadf1")}
    place.appendChild(a)
    a = document.createElement("a")
    a.innerHTML = "&#8250";
    a.className = "scrollopts";
    a.onclick = function(){nextScroll("onloadf1")}
    place.appendChild(a)

    var i = 0;
    (function doSort() {

        fr = new FileReader();

        fr.onloadend = (function(file) {
            return function(e) {
                receivedOWL(e, file)
            };
        })(input.files[i]);

        fr.readAsText(input.files[i])

        var option = document.createElement("option")
        option.innerHTML = input.files[i].name.replace(/\..*$/i,"");
        option.id = input.files[i].name.replace(/\..*$/i,"");
        select.appendChild(option)

        i++
        if (i < input.files.length) {setTimeout(doSort,0)}
    })();
}

//Load in SAMMI model
function receivedTextSammi(e) {
    lines = e.target.result;
    
    parsedmodels = JSON.parse(lines);

    selected = parsedmodels.selected;
    delete parsedmodels.selected;

    count = parsedmodels.count;
    delete parsedmodels.count;

    currentparsed = parsedmodels.currentparsed;
    delete parsedmodels.currentparsed;

    backups = parsedmodels.backups
    delete parsedmodels.backups;

    fluxobj = parsedmodels.fluxobj;
    concobj = parsedmodels.concobj;
    delete parsedmodels.fluxobj;
    delete parsedmodels.concobj;

    var textstsval = parsedmodels.textsts;
    delete parsedmodels.textsts;
    var numstsval = parsedmodels.numsts;
    delete parsedmodels.numsts;
    var checkstsval = parsedmodels.checksts;
    delete parsedmodels.checksts;
    
    //If we had loaded data or not
    if (Object.keys(fluxobj).length == 0) {
        rxncolorbreaks = parsedmodels.rxncolorbreaks
        rxncolor = parsedmodels.rxncolor
    } else {
        rxncolorbreaks = fluxobj.rcbs[0];
        rxncolor = fluxobj.rcs[0];
    }
    delete parsedmodels.rxncolorbreaks;
    delete parsedmodels.rxncolor;
    //Define values
    fluxmax = rxncolorbreaks[rxncolorbreaks.length-1];
    fluxmin = rxncolorbreaks[0];
    document.getElementById("fluxmax").value = fluxmax;
    document.getElementById("edgemax").value = rgbToHex(rxncolor[rxncolor.length-1]);
    document.getElementById("fluxmin").value = fluxmin;
    document.getElementById("edgemin").value = rgbToHex(rxncolor[0]);
    if (rxncolorbreaks.length > 2) {
        for (var i = 1; i < rxncolorbreaks.length-1; i++) {
            addReactionColorBreak(document.getElementById("addrxnbreak"));
            var vec = document.getElementsByClassName("rxnbreakval");
            vec[vec.length-1].valueAsNumber = rxncolorbreaks[i];
            var vec = document.getElementsByClassName("rxnbreakcol");
            vec[vec.length-1].value = rgbToHex(rxncolor[i]);
        }
    }
    defineFluxColorBar()

    //If we had loaded data or not
    if (Object.keys(concobj).length == 0) {
        metcolorbreaks = parsedmodels.metcolorbreaks
        metcolor = parsedmodels.metcolor
    } else {
        metcolorbreaks = concobj.mcbs[0];
        metcolor = concobj.mcs[0];
    }
    delete parsedmodels.metcolorbreaks;
    delete parsedmodels.metcolor;
    //Define values
    concentrationmax = metcolorbreaks[metcolorbreaks.length-1];
    concentrationmin = metcolorbreaks[0];
    document.getElementById("metmaxvalue").value = concentrationmax;
    document.getElementById("metmax").value = rgbToHex(metcolor[metcolor.length-1]);
    document.getElementById("metminvalue").value = concentrationmin;
    document.getElementById("metmin").value = rgbToHex(metcolor[0]);
    if (metcolorbreaks.length > 2) {
        for (var i = 1; i < metcolorbreaks.length-1; i++) {
            addMetaboliteColorBreak(document.getElementById("addmetbreak"));
            var vec = document.getElementsByClassName("metbreakval");
            vec[vec.length-1].valueAsNumber = metcolorbreaks[i];
            var vec = document.getElementsByClassName("metbreakcol");
            vec[vec.length-1].value = rgbToHex(metcolor[i]);
        }
    }
    defineMetColorBar()

    //Reaction node size
    sizerxnobj = parsedmodels.sizerxnobj;
    delete parsedmodels.sizerxnobj;

    sizemetobj = parsedmodels.sizemetobj;
    delete parsedmodels.sizemetobj;

    linkwidthobj = parsedmodels.linkwidthobj;
    delete parsedmodels.linkwidthobj;

    backupgraph = parsedmodels.backupgraph
    delete parsedmodels.backupgraph;

    backupgraphcount = parsedmodels.backupgraphcount
    delete parsedmodels.backupgraphcount;

    backupparsing = parsedmodels.backupparsing
    delete parsedmodels.backupparsing;

    if (Object.keys(parsedmodels).length > 1) {
        var place = document.getElementById("onloadoptions");
        place.style.display = "block";
        while (place.childElementCount > 0) {place.children[0].remove()}
        var select = document.createElement("select");
        select.id = "onloadf1";
        place.appendChild(select);
    }

    var unique = [];
    for (j in parsedmodels) {
        parsedmodels[j].links.forEach(function(d){
            d.source = parsedmodels[j].nodes[d.source.index]
            d.target = parsedmodels[j].nodes[d.target.index]
        })
        if (Object.keys(parsedmodels).length > 1) {
            unique.push(j)
        }
    }
    unique.sort()
    for (var i = 0; i < unique.length; i++) {
        var option = document.createElement("option")
        option.innerHTML = unique[i];
        option.id = unique[i];
        select.appendChild(option)
    }

    if (Object.keys(parsedmodels).length > 1) {
        select.value = currentparsed;
        a = document.createElement("a")
        a.innerHTML = "&#8249";
        a.className = "scrollopts";
        a.onclick = function(){previousScroll("onloadf1")}
        place.appendChild(a)
        a = document.createElement("a")
        a.innerHTML = "&#8250";
        a.className = "scrollopts";
        a.onclick = function(){nextScroll("onloadf1")}
        place.appendChild(a)
        select.onchange = function() {onLoadSwitch(this)}
    }

    //If we had loaded data or not
    if (Object.keys(fluxobj).length > 0) {
        var ttls = fluxobj.ttls;
        wind = document.getElementById("onloadoptions");
        if (document.getElementById("onloadoptions").childElementCount != 0) {
            var br = document.createElement("br");
            wind.appendChild(br);
        } 
        var a = document.createElement("a");
        a.innerHTML = "Reaction Data";
        a.style="font-weight:bold"
        wind.appendChild(a);
        var br = document.createElement("br");
        wind.appendChild(br);
        var select = document.createElement("select");
        select.id = "fluxscroll"
        select.onchange = function() {FluxSetSwitch(this)};
        for (var i = 0; i < ttls.length; i++) {
            var option = document.createElement("option");
            option.innerHTML = ttls[i];
            select.appendChild(option);
        }
        wind.appendChild(select)
        //make buttons
        a = document.createElement("a")
        a.innerHTML = "&#8249";
        a.className = "scrollopts";
        a.onclick = function(){previousScrollF("fluxscroll")}
        wind.appendChild(a)
        a = document.createElement("a")
        a.innerHTML = "&#8250";
        a.className = "scrollopts";
        a.onclick = function(){nextScrollF("fluxscroll")}
        wind.appendChild(a)
    }
    //If we had loaded data or not
    if (Object.keys(concobj).length > 0) {
        var ttls = concobj.ttls;
        wind = document.getElementById("onloadoptions");
        if (document.getElementById("onloadoptions").childElementCount != 0) {
            var br = document.createElement("br");
            wind.appendChild(br);
        } 
        var a = document.createElement("a");
        a.innerHTML = "Metabolite Color Data";
        a.style="font-weight:bold"
        wind.appendChild(a);
        var br = document.createElement("br");
        wind.appendChild(br);
        var select = document.createElement("select");
        select.id = "concscroll"
        select.onchange = function() {ConcSetSwitch(this)};
        for (var i = 0; i < ttls.length; i++) {
            var option = document.createElement("option");
            option.innerHTML = ttls[i];
            select.appendChild(option);
        }
        wind.appendChild(select)
        //make buttons
        a = document.createElement("a")
        a.innerHTML = "&#8249";
        a.className = "scrollopts";
        a.onclick = function(){previousScrollC("concscroll")}
        wind.appendChild(a)
        a = document.createElement("a")
        a.innerHTML = "&#8250";
        a.className = "scrollopts";
        a.onclick = function(){nextScrollC("concscroll")}
        wind.appendChild(a)
    }
    //Reaction size
    if (Object.keys(sizerxnobj).length > 0){
        var ttls = sizerxnobj.ttls;
        wind = document.getElementById("onloadoptions");
        if (document.getElementById("onloadoptions").childElementCount != 0) {
            var br = document.createElement("br");
            wind.appendChild(br);
        } 
        var a = document.createElement("a");
        a.innerHTML = "Reaction Size Data";
        a.style="font-weight:bold"
        wind.appendChild(a);
        var br = document.createElement("br");
        wind.appendChild(br);
        var select = document.createElement("select");
        select.id = "rxnsizescroll"
        select.onchange = function() {RxnSizeSetSwitch(this)};
        for (var i = 0; i < ttls.length; i++) {
            var option = document.createElement("option");
            option.innerHTML = ttls[i];
            select.appendChild(option);
        }
        wind.appendChild(select)
        //make buttons
        a = document.createElement("a")
        a.innerHTML = "&#8249";
        a.className = "scrollopts";
        a.onclick = function(){previousScrollRS("rxnsizescroll")}
        wind.appendChild(a)
        a = document.createElement("a")
        a.innerHTML = "&#8250";
        a.className = "scrollopts";
        a.onclick = function(){nextScrollRS("rxnsizescroll")}
        wind.appendChild(a)
    }
    //Metabolite size
    if (Object.keys(sizemetobj).length > 0){
        var ttls = sizemetobj.ttls;
        wind = document.getElementById("onloadoptions");
        if (document.getElementById("onloadoptions").childElementCount != 0) {
            var br = document.createElement("br");
            wind.appendChild(br);
        } 
        var a = document.createElement("a");
        a.innerHTML = "Metabolite Size Data";
        a.style="font-weight:bold"
        wind.appendChild(a);
        var br = document.createElement("br");
        wind.appendChild(br);
        var select = document.createElement("select");
        select.id = "metsizescroll"
        select.onchange = function() {MetSizeSetSwitch(this)};
        for (var i = 0; i < ttls.length; i++) {
            var option = document.createElement("option");
            option.innerHTML = ttls[i];
            select.appendChild(option);
        }
        wind.appendChild(select)
        //make buttons
        a = document.createElement("a")
        a.innerHTML = "&#8249";
        a.className = "scrollopts";
        a.onclick = function(){previousScrollMS("metsizescroll")}
        wind.appendChild(a)
        a = document.createElement("a")
        a.innerHTML = "&#8250";
        a.className = "scrollopts";
        a.onclick = function(){nextScrollMS("metsizescroll")}
        wind.appendChild(a)
    }
    //Reaction Link Width
    if (Object.keys(linkwidthobj).length > 0){
        var ttls = linkwidthobj.ttls;
        wind = document.getElementById("onloadoptions");
        if (document.getElementById("onloadoptions").childElementCount != 0) {
            var br = document.createElement("br");
            wind.appendChild(br);
        } 
        var a = document.createElement("a");
        a.innerHTML = "Reaction Width Data";
        a.style="font-weight:bold"
        wind.appendChild(a);
        var br = document.createElement("br");
        wind.appendChild(br);
        var select = document.createElement("select");
        select.id = "widthscroll"
        select.onchange = function() {WidthSetSwitch(this)};
        for (var i = 0; i < ttls.length; i++) {
            var option = document.createElement("option");
            option.innerHTML = ttls[i];
            select.appendChild(option);
        }
        wind.appendChild(select)
        //make buttons
        a = document.createElement("a")
        a.innerHTML = "&#8249";
        a.className = "scrollopts";
        a.onclick = function(){previousScrollW("widthscroll")}
        wind.appendChild(a)
        a = document.createElement("a")
        a.innerHTML = "&#8250";
        a.className = "scrollopts";
        a.onclick = function(){nextScrollW("widthscroll")}
        wind.appendChild(a)
    }

    document.getElementById("fluxmax").value = fluxmax;
    document.getElementById("fluxmin").value = fluxmin;
    document.getElementById("metmaxvalue").value = concentrationmax;
    document.getElementById("metminvalue").value = concentrationmin;

    //currentparsed = Object.keys(parsedmodels)[0];
    graph = parsedmodels[currentparsed]
    graph.nodes.forEach(function(d){
        if (selected.indexOf(d.index) != -1) {
            d.selected = true;
        } else {
            d.selected = false;
        }
    })

    loadInitialGraph()
    reDefineSimulation()
    node.classed("selected",function(d){return d.selected})
    simulation.restart()

    defineNameOptions()
    for (i in textsts) {document.getElementById(textsts[i]).value = textstsval[i]}
    delete parsedmodels.textsts;
    for (i in numsts) {document.getElementById(numsts[i]).value = numstsval[i]}
    delete parsedmodels.numsts;
    for (i in checksts) {document.getElementById(checksts[i]).checked = checkstsval[i]}
    delete parsedmodels.checksts;
    maxrxnsize = Number(document.getElementById("maxrxnsize").value);
    minrxnsize = Number(document.getElementById("minrxnsize").value);
    maxmetsize = Number(document.getElementById("maxmetsize").value);
    minmetsize = Number(document.getElementById("minmetsize").value);
    maxwidth = Number(document.getElementById("maxwidth").value);
    minwidth = Number(document.getElementById("minwidth").value);

    loadExistingReactionToAdd(parsedmodels)
    reDefineSimulation()
    reDefineColors()
    renameNodes()

    defineSuspended()
}
function loadFileSammi() {
    var input, file, fr;
    input = document.getElementById('fileinputsammi');
        file = input.files[0];
        fr = new FileReader();
        fr.onload = receivedTextSammi;
        fr.readAsText(file);
}


//Download SAMMI fomat model
function downloadSammi() {
    parsedmodels[currentparsed] = graph;
    if (Object.keys(fluxobj).length > 0) {
        id = fluxobj.ttls.indexOf(document.getElementById("fluxscroll").value);
        fluxobj.rcs[id] = rxncolor;
        fluxobj.rcbs[id] = rxncolorbreaks;
    }
    if (Object.keys(concobj).length > 0) {
        var id = concobj.ttls.indexOf(document.getElementById("concscroll").value);
        concobj.mcs[id] = metcolor;
        concobj.mcbs[id] = metcolorbreaks;
    }

    //parameters
    parsedmodels.selected = selected;
    parsedmodels.count = count;
    parsedmodels.currentparsed = currentparsed;
    parsedmodels.backups = backups;
    parsedmodels.rxncolorbreaks = rxncolorbreaks;
    parsedmodels.rxncolor = rxncolor;
    parsedmodels.metcolorbreaks = metcolorbreaks;
    parsedmodels.metcolor = metcolor;
    //parsedmodels.backupgraph = backupgraph;
    //parsedmodels.backupgraphcount = backupgraphcount;
    //parsedmodels.backupparsing = backupparsing;
    parsedmodels.backupgraph = [];
    parsedmodels.backupgraphcount = -1;
    parsedmodels.backupparsing = false;
    parsedmodels.fluxobj = fluxobj;
    parsedmodels.concobj = concobj;
    parsedmodels.sizerxnobj = sizerxnobj;
    parsedmodels.sizemetobj = sizemetobj;
    parsedmodels.linkwidthobj = linkwidthobj;
    parsedmodels.textsts = []
    for (i in textsts) {parsedmodels.textsts.push(document.getElementById(textsts[i]).value)}
    parsedmodels.numsts = []
    for (i in numsts) {parsedmodels.numsts.push(document.getElementById(numsts[i]).value)}
    parsedmodels.checksts = []
    for (i in checksts) {parsedmodels.checksts.push(document.getElementById(checksts[i]).checked)}

    element = document.createElement('a');
    var bb = new Blob([JSON.stringify(parsedmodels)], {type: 'text/plain'});
    element.href = window.URL.createObjectURL(bb);

    element.setAttribute('download', 'SAMMI.json');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    delete parsedmodels.selected;
    delete parsedmodels.count;
    delete parsedmodels.currentparsed;
    delete parsedmodels.backups;
    delete parsedmodels.rxncolorbreaks;
    delete parsedmodels.rxncolor;
    delete parsedmodels.metcolorbreaks;
    delete parsedmodels.metcolor;
    delete parsedmodels.backupgraph;
    delete parsedmodels.backupgraphcount;
    delete parsedmodels.backupparsing;
    delete parsedmodels.fluxobj;
    delete parsedmodels.concobj;
    delete parsedmodels.sizerxnobj;
    delete parsedmodels.sizemetobj;
    delete parsedmodels.linkwidthobj;
    delete parsedmodels.textsts;
    delete parsedmodels.numsts;
    delete parsedmodels.checksts;
}

//Download Current graph SAMMI fomat model
function downloadCurrent() {
    //parameters
    parsedmodels[currentparsed] = graph;
    if (Object.keys(fluxobj).length > 0) {
        id = fluxobj.ttls.indexOf(document.getElementById("fluxscroll").value);
        fluxobj.rcs[id] = rxncolor;
        fluxobj.rcbs[id] = rxncolorbreaks;
    }
    if (Object.keys(concobj).length > 0) {
        var id = concobj.ttls.indexOf(document.getElementById("concscroll").value);
        concobj.mcs[id] = metcolor;
        concobj.mcbs[id] = metcolorbreaks;
    }

    //parameters
    var tmp = {};
    tmp.selected = selected;
    tmp.count = count;
    tmp.currentparsed = currentparsed;
    tmp.backups = backups;
    tmp.rxncolorbreaks = rxncolorbreaks;
    tmp.rxncolor = rxncolor;
    tmp.metcolorbreaks = metcolorbreaks;
    tmp.metcolor = metcolor;
    tmp.backupgraph = backupgraph;
    tmp.backupgraphcount = backupgraphcount;
    tmp.backupparsing = backupparsing;
    tmp.fluxobj = fluxobj;
    tmp.concobj = concobj;
    tmp.sizerxnobj = sizerxnobj;
    tmp.sizemetobj = sizemetobj;
    tmp.linkwidthobj = linkwidthobj;
    tmp.textsts = []
    for (i in textsts) {tmp.textsts.push(document.getElementById(textsts[i]).value)}
    tmp.numsts = []
    for (i in numsts) {tmp.numsts.push(document.getElementById(numsts[i]).value)}
    tmp.checksts = []
    for (i in checksts) {tmp.checksts.push(document.getElementById(checksts[i]).checked)}
    
    tmp[currentparsed] = parsedmodels[currentparsed];

    element = document.createElement('a');
    var bb = new Blob([JSON.stringify(tmp)], {type: 'text/plain'});
    element.href = window.URL.createObjectURL(bb);

    element.setAttribute('download', currentparsed + '.json');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

var pgr;
function onLoadFilter2(d) {
    document.getElementById("onloadoptionmid").style.display = "none";
    document.getElementById("onloadoption2").style.display = "none";

    var lopt = d.value;
    select = document.getElementById("onloadf1top")
    select.remove();

    var place = document.getElementById("onloadoptionstop");
    var select = document.createElement("select");
    select.id = "onloadf2";
    place.appendChild(select);

    var option = document.createElement("option")
    option.innerHTML = "Select Option";
    select.appendChild(option)

    var fields = [];
    if (lopt == "Metabolites") {
        pgr = 2;
    } else {
        pgr = 1;
    }
    
    var unique = [];
    graph.nodes.forEach(function(e){
        if (e.group == pgr) {
            Object.keys(e).forEach(function(z){if (unique.indexOf(z) == -1){unique.push(z)}})
        }
    })

    var tmpshow = noshowedit.concat(["concentration","flux","size",'id',"class","isfixed","grouping","secondary"])
    for (var i = 0; i < unique.length; i++) {
        if (tmpshow.indexOf(unique[i]) == -1) {
            var option = document.createElement("option")
            option.innerHTML = unique[i];
            select.appendChild(option)
        }
    }

    select.onchange = function() {onLoadFilter3(this)}
}
function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}
var pgrfield;
var tmp
function onLoadFilter3(d) {
    tmp = graph;
    pgrfield = d.value;
    select = document.getElementById("onloadf2")
    select.remove();

    var place = document.getElementById("onloadoptions");
    var select = document.createElement("select");
    select.id = "onloadf1";
    place.appendChild(select);
    select.style.visibility = "hidden";

    var fields = [];
    graph.nodes.forEach(function(e){
        if (e.group == pgr) {
            fields.push(e[pgrfield])
        }
    })
    var unique = fields.filter(onlyUnique);
    unique.sort();

    opts = document.getElementsByClassName("center")[0];//document.getElementById("onloadoptionstop");
    div1 = document.createElement("div");
    div1.className = "myProgress";
    div1.style = 'width: 100px; background-color: #808080;margin: auto;text-align: center;';
    opts.appendChild(div1);

    div2 = document.createElement("div");
    div2.className = "myBar";
    div2.style = 'width: 1%; height: 10px; background-color: #008000';
    div1.appendChild(div2)

    var i = 0;
    (function doSort() {
        div2.style.width = (100*(i+1)/unique.length) + "%";
        
        var option = document.createElement("option")
        option.innerHTML = unique[i];
        option.id = unique[i];
        select.appendChild(option)
        
        //Define nodes
        var nodestokeep = [];
        graph.links.forEach(function(e){
            if ((e.source.group == pgr && e.source[pgrfield] == unique[i]) || (e.target.group == pgr && e.target[pgrfield] == unique[i])) {
                nodestokeep.push(e.source.index);
                nodestokeep.push(e.target.index);
            }
        })
        uniquenodes = nodestokeep.filter(onlyUnique)

        var tmpgraph = {nodes: [], links: []};
        for (var j = 0; j < uniquenodes.length; j++) {
            tmpgraph.nodes.push(graph.nodes[uniquenodes[j]])
        }
        //Define edges
        var linkstokeep = [];
        graph.links.forEach(function(e){
            if (uniquenodes.indexOf(e.source.index) != -1 && uniquenodes.indexOf(e.target.index) != -1) {
                linkstokeep.push(e.index)
            }
        })
        for (var j = 0; j < linkstokeep.length; j++){
            tmpgraph.links.push(graph.links[linkstokeep[j]])
        }

        //Independent
        parsedmodels[select.children[i].id] = JSON.parse(JSON.stringify(tmpgraph));
    
        //Redirect edges
        var allids = [];
        for (var j = 0; j < parsedmodels[select.children[i].id].nodes.length; j++) {
            allids.push(parsedmodels[select.children[i].id].nodes[j].id)
            parsedmodels[select.children[i].id].nodes[j].index = j;
        }
        for (var j = 0; j < parsedmodels[select.children[i].id].links.length; j++) {
            parsedmodels[select.children[i].id].links[j].target = parsedmodels[select.children[i].id].nodes[allids.indexOf(parsedmodels[select.children[i].id].links[j].target.id)];
            parsedmodels[select.children[i].id].links[j].source = parsedmodels[select.children[i].id].nodes[allids.indexOf(parsedmodels[select.children[i].id].links[j].source.id)];
            parsedmodels[select.children[i].id].links[j].index = j;
        }
        
        //node weight
        parsedmodels[select.children[i].id].nodes.forEach(function(d){
            d.isfixed = false;
            d.weight = 1.01; 
            return d;
        })
        //additional fiels
        parsedmodels[select.children[i].id].suspended = [];
        parsedmodels[select.children[i].id].shapes = [];
        parsedmodels[select.children[i].id].text = [];

        i++
        if (i < unique.length) {setTimeout(doSort,0)}        

        //Load
        if (i == unique.length) {
            //Initialize
            div1.remove()
            currentparsed = select.children[0].id;
            graph = parsedmodels[currentparsed];

            a = document.createElement("a")
            a.innerHTML = "&#8249";
            a.className = "scrollopts";
            a.onclick = function(){previousScroll("onloadf1")}
            place.appendChild(a)
            a = document.createElement("a")
            a.innerHTML = "&#8250";
            a.className = "scrollopts";
            a.onclick = function(){nextScroll("onloadf1")}
            place.appendChild(a)

            setdisplay()
            loadInitialGraph()
            reDefineSimulation()
            loadExistingReactionToAdd(parsedmodels)
            node.classed("selected",function(d){return d.selected})
            simulation.restart()
            select.style.visibility = "visible";
            select.onchange = function (){onLoadSwitch(this)}
        }
    })();
}
function nextScroll(nodeid) {
    x = document.getElementById(nodeid);
    if (x.selectedIndex == x.options.length-1) {return;}
    x.selectedIndex++
    onLoadSwitch(x)
}
function previousScroll(nodeid) {
    x = document.getElementById(nodeid);
    if (x.selectedIndex == 0) {return;}
    x.selectedIndex--
    onLoadSwitch(x)
}
function onLoadSwitch(d) {
    if(tracking){trackMet()}
    parsedmodels[currentparsed] = Object.assign({},graph);
    currentparsed = d.selectedOptions[0].id;
    graph = parsedmodels[currentparsed];

    reDefineSimulation()
    node.classed("selected",function(d){return d.selected})
    simulation.restart()

    defineSuspended()
    clearBackup()

    if (document.getElementById("dialog2").style.display == "block") {joinSubGraphs()}
}
var fluxmaxtmp = 0.1,
fluxmintmp = -0.1;
function receivedTextFilterFiles(e, file) {
    e = e.target.result.split(/\r\n|\r|\n/);     if (e[e.length-1] == "") {e.pop()}
    rxn = [];
    flux = [];
    for (var i = 0; i < e.length; i++) {
        tmp = e[i].split('\t');
        rxn.push(tmp[0])
        if (tmp.length > 1 && tmp[1].length > 0) {flux.push(Number(tmp[1]))} else {flux.push(null)}        
    }
    fluxmaxtmp = Math.max(...flux,fluxmaxtmp)
    fluxmintmp = Math.min(...flux,fluxmintmp)

    //Define nodes
    var nodestokeep = [];
    graph.links.forEach(function(e){
        if (rxn.indexOf(e.source.id) != -1 || rxn.indexOf(e.target.id) != -1) {
            nodestokeep.push(e.source.index);
            nodestokeep.push(e.target.index);
        }
    })
    uniquenodes = nodestokeep.filter(onlyUnique)

    var tmpgraph = {nodes: [], links: []};
    for (var i = 0; i < uniquenodes.length; i++) {
        tmpgraph.nodes.push(graph.nodes[uniquenodes[i]])
    }
    //Define edges
    var linkstokeep = [];
    graph.links.forEach(function(e){
        if (uniquenodes.indexOf(e.source.index) != -1 && uniquenodes.indexOf(e.target.index) != -1) {
            linkstokeep.push(e.index)
        }
    })
    for (var i = 0; i < linkstokeep.length; i++){
        tmpgraph.links.push(graph.links[linkstokeep[i]])
    }

    //Independent
    parsedmodels[file.name] = JSON.parse(JSON.stringify(tmpgraph));
 
    //Redirect edges
    var allids = [];
    for (var i = 0; i < parsedmodels[file.name].nodes.length; i++) {
        allids.push(parsedmodels[file.name].nodes[i].id)
        parsedmodels[file.name].nodes[i].index = i;
    }
    for (var j = 0; j < parsedmodels[file.name].links.length; j++) {
        parsedmodels[file.name].links[j].target = parsedmodels[file.name].nodes[allids.indexOf(parsedmodels[file.name].links[j].target.id)];
        parsedmodels[file.name].links[j].source = parsedmodels[file.name].nodes[allids.indexOf(parsedmodels[file.name].links[j].source.id)];
        parsedmodels[file.name].links[j].index = j;
    }
    
    //node weight
    parsedmodels[file.name].nodes.forEach(function(d){
        d.isfixed = false;
        d.weight = 1.01; 
        return d;
    })
    //node and edge flux
    parsedmodels[file.name].nodes.forEach(function(d){
        index = rxn.indexOf(d.class);
        if (index != -1) {d.flux = flux[index]}
        return d;
    })
    parsedmodels[file.name].links.forEach(function(d){
        if (d.source.flux == null && d.target.flux == null) {
            d.flux = null;
        } else {
            d.flux = d.source.flux + d.target.flux;
        }
    })
    //additional fiels
    parsedmodels[file.name].suspended = [];
    parsedmodels[file.name].shapes = [];
    parsedmodels[file.name].text = [];

    setTimeout(function(){document.getElementById("myPBar").style.width = (100*(Object.keys(parsedmodels).length)/numfiles) + "%";},1)
    
    if (Object.keys(parsedmodels).length === numfiles) {
        select = document.getElementById("onloadf1")
        select.onchange = function() {onLoadSwitch(this)};
        select.selectedIndex = 0;
        currentparsed = select.value;
        graph = parsedmodels[currentparsed];

        setdisplay()
        loadInitialGraph()
        reDefineSimulation()
        node.classed("selected",function(d){return d.selected})
        simulation.restart()

        fluxmax = fluxmaxtmp;
        fluxmin = fluxmintmp;

        document.getElementById("fluxmax").value = fluxmax;
        document.getElementById("fluxmin").value = fluxmin;

        defineFluxColorVectors()
        defineFluxColorBar()
        reDefineColors()

        setTimeout(function(){document.getElementsByClassName("myProgress")[0].remove()},100)
    }

}
var numfiles;
function loadFilterFiles() {
    var input, file, fr;
    input = document.getElementById('filefilter');
    
    document.getElementById("onloadoptionmid").style.display = "none";
    document.getElementById("onloadoption2").style.display = "none";

    //select = document.getElementById("onloadf1")
    //select.remove();

    var place = document.getElementById("onloadoptions");
    var select = document.createElement("select");
    select.id = "onloadf1";
    place.appendChild(select);
    numfiles = input.files.length;

    a = document.createElement("a")
    a.innerHTML = "&#8249";
    a.className = "scrollopts";
    a.onclick = function(){previousScroll("onloadf1")}
    place.appendChild(a)
    a = document.createElement("a")
    a.innerHTML = "&#8250";
    a.className = "scrollopts";
    a.onclick = function(){nextScroll("onloadf1")}
    place.appendChild(a)


    opts = document.getElementById("onloadoptions");
    div1 = document.createElement("div");
    div1.className = "myProgress";
    div1.style = 'width: 100px; background-color: #808080;'
    opts.appendChild(div1);

    div2 = document.createElement("div");
    div2.className = "myBar";
    div2.id = "myPBar";
    div2.style = 'width: 1%; height: 10px; background-color: #008000';
    div1.appendChild(div2)

    var i = 0;
    (function doSort() {

        fr = new FileReader();

        fr.onloadend = (function(file) {
            return function(e) {
                receivedTextFilterFiles(e, file)
            };
        })(input.files[i]);

        fr.readAsText(input.files[i])

        var option = document.createElement("option")
        option.innerHTML = input.files[i].name;
        option.id = input.files[i].name;
        select.appendChild(option)

        i++
        if (i < input.files.length) {setTimeout(doSort,0)}
    })();

}

//Switch flux values
//Load flux values
function nextScrollF(nodeid) {
    x = document.getElementById(nodeid);
    if (x.selectedIndex == x.options.length-1) {return;}
    x.selectedIndex++
    FluxSetSwitch(x)
}
function previousScrollF(nodeid) {
    x = document.getElementById(nodeid);
    if (x.selectedIndex == 0) {return;}
    x.selectedIndex--
    FluxSetSwitch(x)
}
function FluxSetSwitch(opt) {
    if(tracking){trackMet()}
    //Define index to switch it to
    var id = opt.selectedIndex;
    //Remove previous color breaks
    var x = document.getElementsByClassName("rxnbreakcol");
    while (x.length > 0) {
        var tmp = x[0].nextSibling
        tmp.previousSibling.previousSibling.remove()
        tmp.previousSibling.remove()
        tmp.nextSibling.remove()
        tmp.remove()
        delete tmp;
        var x = document.getElementsByClassName("rxnbreakcol");
    }
    //Reset color breaks
    rxncolorbreaks = fluxobj.rcbs[id];
    rxncolor = fluxobj.rcs[id]
    fluxmax = rxncolorbreaks[rxncolorbreaks.length-1];
    fluxmin = rxncolorbreaks[0];
    document.getElementById("fluxmax").value = fluxmax;
    document.getElementById("edgemax").value = rgbToHex(rxncolor[rxncolor.length-1]);
    document.getElementById("fluxmin").value = fluxmin;
    document.getElementById("edgemin").value = rgbToHex(rxncolor[0]);
    if (rxncolorbreaks.length > 2) {
        for (var i = 1; i < rxncolorbreaks.length-1; i++) {
            addReactionColorBreak(document.getElementById("addrxnbreak"));
            var vec = document.getElementsByClassName("rxnbreakval");
            vec[vec.length-1].valueAsNumber = rxncolorbreaks[i];
            var vec = document.getElementsByClassName("rxnbreakcol");
            vec[vec.length-1].value = rgbToHex(rxncolor[i]);
        }
    }
    defineFluxColorBar()
    //Reset all values to null
    for (j in parsedmodels) {
        parsedmodels[j].nodes.forEach(function(d){
            d.flux = null;
            return d;
        })
    }
    //Set values to new
    var rxn = Object.keys(fluxobj);
    rxn.shift(); rxn.pop(); rxn.pop();
    for (j in parsedmodels) {
        parsedmodels[j].nodes.forEach(function(d){
            index = rxn.indexOf(d.class);
            if (index != -1 && d.group == 1) {d.flux = fluxobj[rxn[index]][id]}
            return d;
        })
        parsedmodels[j].links.forEach(function(d){
            if (d.source.flux == null && d.target.flux == null) {
                d.flux = null;
            } else {
                d.flux = d.source.flux + d.target.flux;
            }
        })
    }
    reDefineColors()
    manageTooltips()
    node.classed("selected",function(d){return d.selected})
}
function receivedTextFlux(e) {
    //split input by line
    e = e.target.result.split(/\r\n|\r|\n/);     if (e[e.length-1] == "") {e.pop()}
    //Get titles
    ttls = e[0].split('\t');
    if (ttls[0].length == 0) {ttls.shift()}
    if (ttls[ttls.length-1] == 0) {ttls.pop()}
    fluxobj.ttls = ttls;
    //save values
    for (var i = 1; i < e.length; i++) {
        //Parse and save
        tmp = e[i].split('\t');
        if (ttls.length >= tmp.length) {ttls.shift();fluxobj.ttls = ttls;}
        var rxn = tmp[0];
        if (rxn == "") {continue;}
        tmp.shift();
        tmp = tmp.map(d => {if (isNaN(d) || d == "") {d = null;} else {d = Number(d);}; return d;})
        fluxobj[rxn] = tmp;
        //Make max and min
        fluxmax = Math.max(...tmp,fluxmax)
        fluxmin = Math.min(...tmp,fluxmin)
    }
    //Make options
    wind = document.getElementById("onloadoptions");
    if (document.getElementById("onloadoptions").childElementCount != 0) {
        var br = document.createElement("br");
        wind.appendChild(br);
    } 
    var a = document.createElement("a");
    a.innerHTML = "Reaction Color Data";
    a.style="font-weight:bold"
    wind.appendChild(a);
    var br = document.createElement("br");
    wind.appendChild(br);
    var select = document.createElement("select");
    select.id = "fluxscroll"
    select.onchange = function() {FluxSetSwitch(this)};
    for (var i = 0; i < ttls.length; i++) {
        var option = document.createElement("option");
        option.innerHTML = ttls[i];
        select.appendChild(option);
    }
    wind.appendChild(select)

    //make buttons
    a = document.createElement("a")
    a.innerHTML = "&#8249";
    a.className = "scrollopts";
    a.onclick = function(){previousScrollF("fluxscroll")}
    wind.appendChild(a)
    a = document.createElement("a")
    a.innerHTML = "&#8250";
    a.className = "scrollopts";
    a.onclick = function(){nextScrollF("fluxscroll")}
    wind.appendChild(a)

    //Get min and max fluxes and define colors
    document.getElementById("fluxmax").value = fluxmax;
    document.getElementById("fluxmin").value = fluxmin;
    
    //Save initial color scales
    var rcs = [];
    var rcbs = [];
    rxncolorbreaks = [fluxmin, fluxmax];
    for (var i = 0; i < ttls.length; i++) {
        rcs.push(rxncolor);
        rcbs.push(rxncolorbreaks);
    }
    fluxobj.rcs = rcs;
    fluxobj.rcbs = rcbs;

    //define colors
    defineFluxColorVectors()
    defineFluxColorBar()

    //Set values to initial
    var rxn = Object.keys(fluxobj);
    rxn.shift(); rxn.pop(); rxn.pop();
    for (j in parsedmodels) {
        parsedmodels[j].nodes.forEach(function(d){
            index = rxn.indexOf(d.class);
            if (index != -1 && d.group == 1) {d.flux = fluxobj[rxn[index]][0]}
            return d;
        })
        parsedmodels[j].links.forEach(function(d){
            if (d.source.flux == null && d.target.flux == null) {
                d.flux = null;
            } else {
                d.flux = d.source.flux + d.target.flux;
            }
        })
    }
    reDefineColors()
    node.classed("selected",function(d){return d.selected})
    manageTooltips()
    simulation.restart()
}
function loadFileFlux() {
    var input, file, fr;
    input = document.getElementById('fileinputflux');
        file = input.files[0];
        fr = new FileReader();
        fr.onload = receivedTextFlux;
        fr.readAsText(file);
}
function loadFileGene() {
    var input, file, fr;
    input = document.getElementById('fileinputgene');
        file = input.files[0];
        fr = new FileReader();
        fr.onload = receivedTextGene;
        fr.readAsText(file);
}
var tmp;
function receivedTextGene(e) {
    e = e.target.result.split(/\r\n|\r|\n/);
    //Gell all reactions and genes
    allrx = [];
    allgr = [];
    //Get gene-reaction rule field
    grr = document.getElementById("gexfield").value;
    //get characters to remove
    grrem = document.getElementById("gexrem").value;
    grrem = '(' + grrem.replace(/;/g,')|(') + ')'
    var grrem = new RegExp(grrem,'g');
    //get characters to split
    grspl = document.getElementById("gexsplit").value;
    grspl = '[' + grspl.replace(/;/g,',') + ']'
    var grspl = new RegExp(grspl,'i');
    //parse
    for (var g in parsedmodels) {
        for (n in parsedmodels[g].nodes) { 
            d = parsedmodels[g].nodes[n];
            if (d.group == 2) {continue;}
            if (allrx.indexOf(d.id) == -1){
                allrx.push(d.id)
                tmp = d[grr]
                tmp = tmp.replace(grrem,'')
                tmp = tmp.split(grspl)
                for (var i = tmp.length - 1; i >= 0; i--) {
                    if (tmp[i] == "") {tmp.splice(i,1); continue}
                    tmp[i] = tmp[i].trim()
                }
                allgr.push(tmp.filter(onlyUnique))
            }
        }
    }
    //make gex object
    gex = {};
    for (var i = 1; i < e.length; i++) {
        tmp = e[i].split('\t')
        if(tmp.length == 1) {continue}
        tmp = tmp.map(function(d,i){if(i == 0){return d}else{return Number(d)}})
        lab = tmp.shift();
        gex[lab] = tmp;
    }
    n = gex[Object.keys(gex)[1]].length

    //Map to reaction values
    tmp = e[0];
    for (var i = 0; i < allrx.length; i++) {
        if (allgr[i].length == 0) {continue}
        var z = [];
        for (var j = 0; j < n; j++){z.push([])};
        allgr[i].map(function(d){if (d in gex) {gex[d].map(function(l,j){z[j].push(l)})}})
        
        mapfun = document.getElementById('gexmap').value;
        if (mapfun == "Max") {
            z = z.map(function(d){return Math.max(...d)})
        } else if (mapfun == "Min") {
            z = z.map(function(d){return Math.min(...d)})
        } else if (mapfun == "Mean") {
            z = z.map(function(d){
                sum = d.reduce(function(a, b) { return a + b; });
                return sum / d.length;
            })
        } else if (mapfun == "Median") {
            z = z.map(function(d){
                d = d.sort()
                if (d.length % 2 == 1) {
                    return d[d.length/2 - 0.5]
                } else {
                    return (d[d.length/2] + d[d.length/2 -1])/2
                }
            })
        }
        tmp = tmp + '\n' + allrx[i] + '\t' + z.join('\t')
    }
    var e = {};
    e.target = {};
    e.target.result = tmp;
    receivedTextFlux(e)
    closeEdit()
}
function downloadEscher() {
    var escher1 = {
        map_name: "new_map",
        map_id: "",
        map_description: "",
        homepage: "https://escher.github.io",
        schema: "https://escher.github.io/escher/jsonschema/1-0-0#"
    }

    var escher2 = {
        nodes: {},
        reactions: {}
    }

    var nodecount = 0;
    var rxncount = 0;
    
    graph.nodes.forEach(function(d){
        if (d.group == 2) {
            escher2.nodes[nodecount] = {
                x: d.x * Number(document.getElementById("eschescale").value),
                y: d.y * Number(document.getElementById("eschescale").value),
                node_type: "metabolite",
                bigg_id: d.class,
                node_is_primary: !d.secondary,
                label_x: d.x * Number(document.getElementById("eschescale").value),
                label_y: d.y * Number(document.getElementById("eschescale").value),
                name: d.name,
            }
            d.eschercount = nodecount;
            nodecount++;
        }
    })
    
    var segcount = 0;
    graph.nodes.forEach(function(d){
        if (d.group == 1) {
            //Initialize reaction
            escher2.reactions[rxncount] = {
                metabolites: [],
                gene_reaction_rule: d.gene_reaction_rule,
                label_x: (d.x + d.labelshift[0]) * Number(document.getElementById("eschescale").value),
                label_y: (d.y + d.labelshift[1]) * Number(document.getElementById("eschescale").value),
                bigg_id: d.class,
                name: d.name,
                subsystem: d.subsystem,
                reversibility: d[document.getElementById("lbfield").value] < 0
            }
            var metcount = 0;
            for (j in d.metabolites) {
                escher2.reactions[rxncount].metabolites[metcount] = {
                    bigg_id: j,
                    coefficient: d.metabolites[j]
                };
                metcount++;
            }
            //make midmarker
            escher2.nodes[nodecount] = {
                x: d.x * Number(document.getElementById("eschescale").value),
                y: d.y * Number(document.getElementById("eschescale").value),
                node_type: "midmarker"
            };
            nodecount++;
            //get source and target information
            var src = [],
            tgt = [];
            graph.links.forEach(function(e){
                if (e.target.id === d.id) {
                    src.push(e.index)
                } else if (e.source.id === d.id) {
                    tgt.push(e.index)
                }
            })
            srcadded = 0;
            //parse
            if (src.length > 0) {
                srcadded = 1;
                //add marker
                escher2.nodes[nodecount] = {
                    x: d.x * Number(document.getElementById("eschescale").value),
                    y: d.y * Number(document.getElementById("eschescale").value),
                    node_type: "multimarker"
                };
                nodecount++;
                //Add segment
                escher2.reactions[rxncount].segments = {};
                escher2.reactions[rxncount].segments[segcount] = {
                    from_node_id: nodecount-1 + "",
                    to_node_id: nodecount-2 + "",
                    b1: null,
                    b2: null
                };
                segcount++;
                src.forEach(function(e){
                    if (d.bezi[0] == null) {
                        escher2.reactions[rxncount].segments[segcount] = {
                            from_node_id: nodecount-1 + "",
                            to_node_id: graph.links[e].source.eschercount + "",
                            b1: {
                                x: graph.links[e].source.x * Number(document.getElementById("eschescale").value),
                                y: graph.links[e].source.y * Number(document.getElementById("eschescale").value)
                            },
                            b2: {
                                x: d.x * Number(document.getElementById("eschescale").value),
                                y: d.y * Number(document.getElementById("eschescale").value)
                            }
                        }
                    } else {
                        escher2.reactions[rxncount].segments[segcount] = {
                            from_node_id: nodecount-1 + "",
                            to_node_id: graph.links[e].source.eschercount + "",
                            b1: {
                                x: (d.x + d.bezi[0]) * Number(document.getElementById("eschescale").value),
                                y: (d.y + d.bezi[1]) * Number(document.getElementById("eschescale").value)
                            },
                            b2: {
                                x: (0.25*graph.links[e].source.x + 0.75*(d.x + d.bezi[0])) * Number(document.getElementById("eschescale").value),
                                y: (0.25*graph.links[e].source.y + 0.75*(d.y + d.bezi[1])) * Number(document.getElementById("eschescale").value)
                            }
                        }
                    }
                        segcount++;
                })
            }

            if (tgt.length > 0) {
                //add marker
                escher2.nodes[nodecount] = {
                    x: d.x * Number(document.getElementById("eschescale").value),
                    y: d.y * Number(document.getElementById("eschescale").value),
                    node_type: "multimarker"
                };
                nodecount++;
                //Add segment
                if (srcadded == 0) {escher2.reactions[rxncount].segments = {};}
                escher2.reactions[rxncount].segments[segcount] = {
                    from_node_id: nodecount-1 + "",
                    to_node_id: nodecount-2-srcadded + "",
                    b1: null,
                    b2: null
                };
                segcount++;
                tgt.forEach(function(e){
                    if (d.bezi[0] == null) {
                        escher2.reactions[rxncount].segments[segcount] = {
                            from_node_id: nodecount-1 + "",
                            to_node_id: graph.links[e].target.eschercount + "",
                            b1: {
                                x: graph.links[e].target.x * Number(document.getElementById("eschescale").value),
                                y: graph.links[e].target.y * Number(document.getElementById("eschescale").value)
                            },
                            b2: {
                                x: d.x * Number(document.getElementById("eschescale").value),
                                y: d.y * Number(document.getElementById("eschescale").value),
                            }
                        }
                    } else {
                        escher2.reactions[rxncount].segments[segcount] = {
                            from_node_id: nodecount-1 + "",
                            to_node_id: graph.links[e].target.eschercount + "",
                            b1: {
                                x: (d.x + d.bezi[2]) * Number(document.getElementById("eschescale").value),
                                y: (d.y + d.bezi[3]) * Number(document.getElementById("eschescale").value)
                            },
                            b2: {
                                x: (0.25*graph.links[e].target.x + 0.75*(d.x + d.bezi[2])) * Number(document.getElementById("eschescale").value),
                                y: (0.25*graph.links[e].target.y + 0.75*(d.y + d.bezi[3])) * Number(document.getElementById("eschescale").value)
                            }
                        }
                    }
                    segcount++;
                })
            }
            rxncount++
        }
    })

    if (graph.text.length > 0) {
        escher2.text_labels = [];
        for (var i = 0; i < graph.text.length; i++){
            escher2.text_labels[i] = {
                x: graph.text[i].x * Number(document.getElementById("eschescale").value),
                y: graph.text[i].y * Number(document.getElementById("eschescale").value),
                text: graph.text[i].text
            }
        }
    } else {
        escher2.text_labels = {};
    }
    escher2.canvas = {
        height: parentHeight * Number(document.getElementById("eschescale").value),
        widt: parentWidth * Number(document.getElementById("eschescale").value),
        x: 0,
        y: 0
    }

    var escher = [];
    escher[0] = escher1;
    escher[1] = escher2;

    //var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(graph));
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(escher)));
    element.setAttribute('download', 'ESCHER.json');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

//Switch concentration data
function nextScrollC(nodeid) {
    x = document.getElementById(nodeid);
    if (x.selectedIndex == x.options.length-1) {return;}
    x.selectedIndex++
    ConcSetSwitch(x)
}
function previousScrollC(nodeid) {
    x = document.getElementById(nodeid);
    if (x.selectedIndex == 0) {return;}
    x.selectedIndex--
    ConcSetSwitch(x)
}
function ConcSetSwitch(opt) {
    if(tracking){trackMet()}
    //Define index to switch it to
    //Define index to switch it to
    var id = opt.selectedIndex;
    //Remove previous color breaks
    var x = document.getElementsByClassName("metbreakcol");
    while (x.length > 0) {
        var tmp = x[0].nextSibling
        tmp.previousSibling.previousSibling.remove()
        tmp.previousSibling.remove()
        tmp.nextSibling.remove()
        tmp.remove()
        delete tmp;
        var x = document.getElementsByClassName("metbreakcol");
    }
    //Reset color breaks
    metcolorbreaks = concobj.mcbs[id];
    metcolor = concobj.mcs[id]
    concentrationmax = metcolorbreaks[metcolorbreaks.length-1];
    concentrationmin = metcolorbreaks[0];
    document.getElementById("metmaxvalue").value = concentrationmax;
    document.getElementById("metmax").value = rgbToHex(metcolor[metcolor.length-1]);
    document.getElementById("metminvalue").value = concentrationmin;
    document.getElementById("metmin").value = rgbToHex(metcolor[0]);
    if (metcolorbreaks.length > 2) {
        for (var i = 1; i < metcolorbreaks.length-1; i++) {
            addMetaboliteColorBreak(document.getElementById("addmetbreak"));
            var vec = document.getElementsByClassName("metbreakval");
            vec[vec.length-1].valueAsNumber = metcolorbreaks[i];
            var vec = document.getElementsByClassName("metbreakcol");
            vec[vec.length-1].value = rgbToHex(metcolor[i]);
        }
    }
    defineMetColorBar()

    //Reset all values to null
    for (j in parsedmodels) {
        parsedmodels[j].nodes.forEach(function(d){
            d.concentration = null;
            return d;
        })
    }
    //Set values to new
    var met = Object.keys(concobj);
    met.shift(); met.pop(); met.pop();
    for (j in parsedmodels) {
        parsedmodels[j].nodes.forEach(function(d){
            index = met.indexOf(d.class);
            if (index != -1 && d.group == 2) {d.concentration = concobj[met[index]][id]}
            return d;
        })
        parsedmodels[j].links.forEach(function(d){
            if (d.source.concentration == null && d.target.concentration == null) {
                d.concentration = null;
            } else {
                d.concentration = d.source.concentration + d.target.concentration;
            }
        })
    }
    reDefineColors()
    node.classed("selected",function(d){return d.selected})
}
//Load concentration values
function receivedTextConcentration(e) {
    //split input by line
    e = e.target.result.split(/\r\n|\r|\n/);
    if (e[e.length-1] == "") {e.pop()}
    //Get titles
    ttls = e[0].split('\t');
    if (ttls[0].length == 0) {ttls.shift()}
    if (ttls[ttls.length-1] == 0) {ttls.pop()}
    concobj.ttls = ttls;
    //save values
    for (var i = 1; i < e.length; i++) {
        //Parse and save
        tmp = e[i].split('\t');
        if (ttls.length >= tmp.length) {ttls.shift();concobj.ttls = ttls;}
        var met = tmp[0];
        if (met == "") {continue;}
        tmp.shift();
        tmp = tmp.map(d => {if (isNaN(d) || d == "") {d = null;} else {d = Number(d);}; return d;})
        concobj[met] = tmp;
        //Make max and min
        concentrationmax = Math.max(...tmp,concentrationmax)
        concentrationmin = Math.min(...tmp,concentrationmin)
    }
    //Make options
    wind = document.getElementById("onloadoptions");
    if (document.getElementById("onloadoptions").childElementCount != 0) {
        var br = document.createElement("br");
        wind.appendChild(br);
    } 
    var a = document.createElement("a");
    a.innerHTML = "Metabolite Color Data";
    a.style="font-weight:bold"
    wind.appendChild(a);
    var br = document.createElement("br");
    wind.appendChild(br);
    var select = document.createElement("select");
    select.id = "concscroll";
    select.onchange = function() {ConcSetSwitch(this)};
    for (var i = 0; i < ttls.length; i++) {
        var option = document.createElement("option");
        option.innerHTML = ttls[i];
        select.appendChild(option);
    }
    wind.appendChild(select)

    //make buttons
    a = document.createElement("a")
    a.innerHTML = "&#8249";
    a.className = "scrollopts";
    a.onclick = function(){previousScrollC("concscroll")}
    wind.appendChild(a)
    a = document.createElement("a")
    a.innerHTML = "&#8250";
    a.className = "scrollopts";
    a.onclick = function(){nextScrollC("concscroll")}
    wind.appendChild(a)

    //Get min and max fluxes and define colors
    document.getElementById("metmaxvalue").value = concentrationmax;
    document.getElementById("metminvalue").value = concentrationmin;
    
    //Save initial color scales
    var mcs = [];
    var mcbs = [];
    metcolorbreaks = [concentrationmin,concentrationmax];
    for (var i = 0; i < ttls.length; i++) {
        mcs.push(metcolor);
        mcbs.push(metcolorbreaks);
    }
    concobj.mcs = mcs;
    concobj.mcbs = mcbs;
    //Set values to initial
    var met = Object.keys(concobj);
    met.shift(); met.pop(); met.pop();
    for (j in parsedmodels) {
        parsedmodels[j].nodes.forEach(function(d){
            index = met.indexOf(d.class);
            if (index != -1 && d.group == 2) {d.concentration = concobj[met[index]][0]}
            return d;
        })
    }
    defineMetColorVectors()
    defineMetColorBar()
    reDefineColors()
    node.classed("selected",function(d){return d.selected})
    simulation.restart()
}
function loadFileConcentration() {
    var input, file, fr;
    input = document.getElementById('fileinputconcentration');
        file = input.files[0];
        fr = new FileReader();
        fr.onload = receivedTextConcentration;
        fr.readAsText(file);
}

function receivedTextSecondary(e) {
    e = e.target.result.split(/\r\n|\r|\n/);     if (e[e.length-1] == "") {e.pop()}
    e = e.join(')|(?:')
    e = '(?:' + e + ')'
    shelveList(e)
}
function loadFileSecondary() {
    defineBackupGraph()
    var input, file, fr;
    input = document.getElementById('fileinputsecondary');
        file = input.files[0];
        fr = new FileReader();
        fr.onload = receivedTextSecondary;
        fr.readAsText(file);
}

var mev;
function downloadMEV() {
    //initialize
    mev = {
        versionMetExploreViz: "1.6.2",
        linkStyle: {
            size: 64,
            lineWidth: 2,
            markerWidth: 5,
            markerHeight: 5,
            markerInColor: "red",
            markerOutColor: "green",
            markerStrokeColor: "black",
            markerStrokeWidth: "0.7",
            strokeColor: "black"
        },
        reactionStyle: {
            height: 15,
            width: 30,
            rx: 3,
            ry: 3,
            label: "name",
            strokeColor: "black",
            fontSize: 9,
            strokeWidth: 1,
            useAlias: false
        },
        generalStyle: {
            websiteName: "MetExplore",
            colorMinMappingContinuous: "yellow",
            colorMaxMappingContinuous: "blue",
            maxReactionThreshold: 500,
            displayLabelsForOpt: false,
            displayLinksForOpt: false,
            displayConvexhulls: false,
            displayCaption: false,
            eventForNodeInfo: true,
            loadButtonHidden: false,
            windowsAlertDisable: false
        },
        metaboliteStyle: {
            height: 14,
            width: 14,
            rx: 7,
            ry: 7,
            strokeWidth: 1,
            fontSize: 7,
            label: "name",
            strokeColor: "#b2ae92",
            useAlias: false
        },
        comparedPanels: [],
        linkedByTypeOfMetabolite: false,
        sessions: {
            viz: {
                id: "viz",
                animated: document.getElementById("mezanimated").checked,
                d3Data: {
                    id: "viz",
                    nodes: [],
                    links: []
                },
                colorMappings: [],
                linked: false,
                active: true,
                duplicatedNodes: [],
                selectedNodes: [],
                resizable: false
            }
        }
    }

    //Define variables
    var namef = document.getElementById("namefield").value,
    lbf = document.getElementById("lbfield").value,
    scalef = Number(document.getElementById("eschescale").value),
    pathf = document.getElementById("pathfield").value,
    compf = document.getElementById("compfield").value;

    //Find split metabolites
    var sm = []
    for (var i = 0; i < graph.nodes.length-1; i++) {
        for (var j = i+1; j < graph.nodes.length; j++) {
            if (graph.nodes[i].class == graph.nodes[j].class && sm.indexOf(graph.nodes[i].class) == -1){
                sm.push(graph.nodes[i].class)
            }
        }
    }

    //mev.sessions.viz.d3Data.nodes
    //Print reaction nodes
    graph.nodes.forEach(function(d){
        var mevnewnode = {
            name: namef in d ? d[namef] : d.class,
            pathways: [pathf in d ? d[pathf] : ""],
            dbIdentifier: d.class,
            x: d.x*scalef,
            y: d.y*scalef,
            px: d.x*scalef,
            py: d.y*scalef,
            selected: false,
            locked: false,
            labelVisible: true,
        }
        if (d.group == 1) {
            mevnewnode = Object.assign(mevnewnode,{
                ec: "",
                id: d.id,
                reactionReversibility: lbf in d ? (d[lbf] < 0 ? true : false) : false,
                biologicalType: "reaction",
                duplicated: false,
            })
        } else {
            mevnewnode = Object.assign(mevnewnode,{
                compartment: compf in d ? d[compf] : "c",
                biologicalType: "metabolite",
                svg: "undefined",
                svgWidth: "0",
                svgHeight: "0",
            })
            if (sm.indexOf(d.class) != -1) { //if it has been split
                //find related reaction
                for (var i = 0; i < graph.links.length; i++) {
                    l = graph.links[i];
                    if (l.source.id == d.id) {
                        var rx = l.target.id;
                        break;
                    } else if (l.target.id == d.id) {
                        var rx = l.source.id;
                        break;
                    }
                }
                //make new node
                mevnewnode = Object.assign(mevnewnode,{
                    identifier: d.id,
                    id: d.id + "-" + rx,
                    isSideCompound: true,
                    duplicated: true,
                })
            } else {
                mevnewnode = Object.assign(mevnewnode,{
                    id: d.id,
                    isSideCompound: false,
                    duplicated: false,
                })
            }
        }
        mev.sessions.viz.d3Data.nodes.push(mevnewnode)
    })

    //Print links
    graph.links.forEach(function(d){
        var mevnewlink = {
            source: d.source.index,
            target: d.target.index
        }
        if (d.source.group == 1) { //If the source is a reaction
            mevnewlink = Object.assign(mevnewlink,{
                interaction: "out",
                reversible: mev.sessions.viz.d3Data.nodes[d.source.index].reactionReversibility,
                id: "identifier" in mev.sessions.viz.d3Data.nodes[d.target.index] ? 
                mev.sessions.viz.d3Data.nodes[d.target.index].id + "-" + mev.sessions.viz.d3Data.nodes[d.source.index].id : 
                mev.sessions.viz.d3Data.nodes[d.target.index].id + " -- " + mev.sessions.viz.d3Data.nodes[d.source.index].id
            })
        } else {
            mevnewlink = Object.assign(mevnewlink,{
                interaction: "in",
                reversible: mev.sessions.viz.d3Data.nodes[d.target.index].reactionReversibility,
                id: "identifier" in mev.sessions.viz.d3Data.nodes[d.source.index] ? 
                mev.sessions.viz.d3Data.nodes[d.source.index].id + "-" + mev.sessions.viz.d3Data.nodes[d.target.index].id : 
                mev.sessions.viz.d3Data.nodes[d.source.index].id + " -- " + mev.sessions.viz.d3Data.nodes[d.target.index].id
            })
        }
        mev.sessions.viz.d3Data.links.push(mevnewlink)
    })

    //var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(graph));
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(mev)));
    element.setAttribute('download', 'MetExploreViz.json');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

//Switch size values
//Load size values
function nextScrollRS(nodeid) {
    x = document.getElementById(nodeid);
    if (x.selectedIndex == x.options.length-1) {return;}
    x.selectedIndex++
    RxnSizeSetSwitch(x)
}
function previousScrollRS(nodeid) {
    x = document.getElementById(nodeid);
    if (x.selectedIndex == 0) {return;}
    x.selectedIndex--
    RxnSizeSetSwitch(x)
}
function RxnSizeSetSwitch(opt) {
    if(tracking){trackMet()}
    //Define index to switch it to
    var id = sizerxnobj.ttls.indexOf(opt.value);
    
    //Reset all values to null
    for (j in parsedmodels) {
        parsedmodels[j].nodes.filter(function(d){return d.group == 1})
        .forEach(function(d){
            d.size = null;
            return d;
        })
    }
    //Set values to new
    var rxn = Object.keys(sizerxnobj);
    rxn.shift();
    
    for (j in parsedmodels) {
        parsedmodels[j].nodes.forEach(function(d){
            index = rxn.indexOf(d.class);
            if (index != -1 && d.group == 1) {d.size = sizerxnobj[rxn[index]][id]}
            return d;
        })
    }
    reDefineSimulation()
    simulation.alpha(0)
}
function receivedTextSizeRxn(e) {
    //split input by line
    e = e.target.result.split(/\r\n|\r|\n/);     if (e[e.length-1] == "") {e.pop()}
    //Get titles
    ttls = e[0].split('\t');
    if (ttls[0].length == 0) {ttls.shift()}
    if (ttls[ttls.length-1] == 0) {ttls.pop()}
    sizerxnobj.ttls = ttls;
    //save values
    for (var i = 1; i < e.length; i++) {
        //Parse and save
        tmp = e[i].split('\t');
        if (ttls.length >= tmp.length) {ttls.shift();sizerxnobj.ttls = ttls;}
        var rxn = tmp[0];
        if (rxn == "") {continue;}
        tmp.shift();
        tmp = tmp.map(d => {if (isNaN(d) || d == "") {d = null;} else {d = Math.abs(Number(d));}; return d;})
        sizerxnobj[rxn] = tmp;
        //Make max and min
        maxrxnsize = Math.max(...tmp,maxrxnsize)
        minrxnsize = Math.min(...tmp,minrxnsize)
    }
    if (minrxnsize < 0) {minrxnsize = 0;}
    document.getElementById("minrxnsize").value = minrxnsize;
    document.getElementById("maxrxnsize").value = maxrxnsize;
    //Make options
    wind = document.getElementById("onloadoptions");
    if (document.getElementById("onloadoptions").childElementCount != 0) {
        var br = document.createElement("br");
        wind.appendChild(br);
    } 
    var a = document.createElement("a");
    a.innerHTML = "Reaction Size Data";
    a.style="font-weight:bold"
    wind.appendChild(a);
    var br = document.createElement("br");
    wind.appendChild(br);
    var select = document.createElement("select");
    select.id = "rxnsizescroll"
    select.onchange = function() {RxnSizeSetSwitch(this)};
    for (var i = 0; i < ttls.length; i++) {
        var option = document.createElement("option");
        option.innerHTML = ttls[i];
        select.appendChild(option);
    }
    wind.appendChild(select)

    //make buttons
    a = document.createElement("a")
    a.innerHTML = "&#8249";
    a.className = "scrollopts";
    a.onclick = function(){previousScrollRS("rxnsizescroll")}
    wind.appendChild(a)
    a = document.createElement("a")
    a.innerHTML = "&#8250";
    a.className = "scrollopts";
    a.onclick = function(){nextScrollRS("rxnsizescroll")}
    wind.appendChild(a)

    //Set values to initial
    var rxn = Object.keys(sizerxnobj);
    rxn.shift();
    for (j in parsedmodels) {
        parsedmodels[j].nodes.forEach(function(d){
            index = rxn.indexOf(d.class);
            if (index != -1 && d.group == 1) {d.size = sizerxnobj[rxn[index]][0]}
            return d;
        })
    }
    reDefineSimulation()
    simulation.alpha(0)
}
function loadFileSizeRxn() {
    var input, file, fr;
    input = document.getElementById('fileinputsizerxn');
        file = input.files[0];
        fr = new FileReader();
        fr.onload = receivedTextSizeRxn;
        fr.readAsText(file);
}

//Switch size values
//Load size values
function nextScrollMS(nodeid) {
    x = document.getElementById(nodeid);
    if (x.selectedIndex == x.options.length-1) {return;}
    x.selectedIndex++
    MetSizeSetSwitch(x)
}
function previousScrollMS(nodeid) {
    x = document.getElementById(nodeid);
    if (x.selectedIndex == 0) {return;}
    x.selectedIndex--
    MetSizeSetSwitch(x)
}
function MetSizeSetSwitch(opt) {
    if(tracking){trackMet()}
    //Define index to switch it to
    var id = sizemetobj.ttls.indexOf(opt.value);
    
    //Reset all values to null
    for (j in parsedmodels) {
        parsedmodels[j].nodes.filter(function(d){return d.group == 2})
        .forEach(function(d){
            d.size = null;
            return d;
        })
    }
    //Set values to new
    var met = Object.keys(sizemetobj);
    met.shift();
    
    for (j in parsedmodels) {
        parsedmodels[j].nodes.forEach(function(d){
            index = met.indexOf(d.class);
            if (index != -1 && d.group == 2) {d.size = sizemetobj[met[index]][id]}
            return d;
        })
    }
    reDefineSimulation()
    simulation.alpha(0)
}
function receivedTextSizeMet(e) {
    //split input by line
    e = e.target.result.split(/\r\n|\r|\n/);     if (e[e.length-1] == "") {e.pop()}
    //Get titles
    ttls = e[0].split('\t');
    if (ttls[0].length == 0) {ttls.shift()}
    if (ttls[ttls.length-1] == 0) {ttls.pop()}
    sizemetobj.ttls = ttls;
    //save values
    for (var i = 1; i < e.length; i++) {
        //Parse and save
        tmp = e[i].split('\t');
        if (ttls.length >= tmp.length) {ttls.shift();sizemetobj.ttls = ttls;}
        var met = tmp[0];
        if (met == "") {continue;}
        tmp.shift();
        tmp = tmp.map(d => {if (isNaN(d) || d == "") {d = null;} else {d = Math.abs(Number(d));}; return d;})
        sizemetobj[met] = tmp;
        //Make max and min
        maxmetsize = Math.max(...tmp,maxmetsize)
        minmetsize = Math.min(...tmp,minmetsize)
    }
    if (minmetsize < 0) {minmetsize = 0;}
    document.getElementById("minmetsize").value = minmetsize;
    document.getElementById("maxmetsize").value = maxmetsize;
    //Make options
    wind = document.getElementById("onloadoptions");
    if (document.getElementById("onloadoptions").childElementCount != 0) {
        var br = document.createElement("br");
        wind.appendChild(br);
    } 
    var a = document.createElement("a");
    a.innerHTML = "Metabolite Size Data";
    a.style="font-weight:bold"
    wind.appendChild(a);
    var br = document.createElement("br");
    wind.appendChild(br);
    var select = document.createElement("select");
    select.id = "metsizescroll"
    select.onchange = function() {MetSizeSetSwitch(this)};
    for (var i = 0; i < ttls.length; i++) {
        var option = document.createElement("option");
        option.innerHTML = ttls[i];
        select.appendChild(option);
    }
    wind.appendChild(select)

    //make buttons
    a = document.createElement("a")
    a.innerHTML = "&#8249";
    a.className = "scrollopts";
    a.onclick = function(){previousScrollMS("metsizescroll")}
    wind.appendChild(a)
    a = document.createElement("a")
    a.innerHTML = "&#8250";
    a.className = "scrollopts";
    a.onclick = function(){nextScrollMS("metsizescroll")}
    wind.appendChild(a)

    //Set values to initial
    var met = Object.keys(sizemetobj);
    met.shift();
    for (j in parsedmodels) {
        parsedmodels[j].nodes.forEach(function(d){
            index = met.indexOf(d.class);
            if (index != -1 && d.group == 2) {d.size = sizemetobj[met[index]][0]}
            return d;
        })
    }
    reDefineSimulation()
    simulation.alpha(0)
}
function loadFileSizeMet() {
    var input, file, fr;
    input = document.getElementById('fileinputsizemet');
        file = input.files[0];
        fr = new FileReader();
        fr.onload = receivedTextSizeMet;
        fr.readAsText(file);
}

//Switch size values
//Load size values
function nextScrollW(nodeid) {
    x = document.getElementById(nodeid);
    if (x.selectedIndex == x.options.length-1) {return;}
    x.selectedIndex++
    WidthSetSwitch(x)
}
function previousScrollW(nodeid) {
    x = document.getElementById(nodeid);
    if (x.selectedIndex == 0) {return;}
    x.selectedIndex--
    WidthSetSwitch(x)
}
function WidthSetSwitch(opt) {
    if(tracking){trackMet()}
    //Define index to switch it to
    var id = linkwidthobj.ttls.indexOf(opt.value);
    
    //Reset all values to null
    for (j in parsedmodels) {
        parsedmodels[j].links.forEach(function(l){
            l.width = null;
            return l;
        })
        parsedmodels[j].nodes.forEach(function(d){
            d.width = null;
            return d;
        })
    }
    //Set values to new
    var rxn = Object.keys(linkwidthobj);
    rxn.shift();
    for (j in parsedmodels) {
        parsedmodels[j].links.forEach(function(l){
            if (l.source.group == 1) {
                index = rxn.indexOf(l.source.class);
                if (index != -1) {
                    l.width = linkwidthobj[rxn[index]][id];
                    l.source.width = linkwidthobj[rxn[index]][id];
                }
            } else if (l.target.group == 1) {
                index = rxn.indexOf(l.target.class);
                if (index != -1) {
                    l.width = linkwidthobj[rxn[index]][id];
                    l.target.width = linkwidthobj[rxn[index]][id];
                }
            }
            return l;
        })
    }
    reDefineSimulation()
    simulation.alpha(0)
}
function receivedTextWidth(e) {
    //split input by line
    e = e.target.result.split(/\r\n|\r|\n/);     if (e[e.length-1] == "") {e.pop()}
    //Get titles
    ttls = e[0].split('\t');
    if (ttls[0].length == 0) {ttls.shift()}
    if (ttls[ttls.length-1] == 0) {ttls.pop()}
    linkwidthobj.ttls = ttls;
    //save values
    for (var i = 1; i < e.length; i++) {
        //Parse and save
        tmp = e[i].split('\t');
        if (ttls.length >= tmp.length) {ttls.shift();linkwidthobj.ttls = ttls;}
        var rxn = tmp[0];
        if (rxn == "") {continue;}
        tmp.shift();
        tmp = tmp.map(d => {if (isNaN(d) || d == "") {d = null;} else {d = Math.abs(Number(d));}; return d;})
        linkwidthobj[rxn] = tmp;
        //Make max and min
        maxwidth = Math.max(...tmp,maxwidth)
        minwidth = Math.min(...tmp,minwidth)
    }
    if (minwidth < 0) {minwidth = 0;}
    document.getElementById("minwidth").value = minwidth;
    document.getElementById("maxwidth").value = maxwidth;
    //Make options
    wind = document.getElementById("onloadoptions");
    if (document.getElementById("onloadoptions").childElementCount != 0) {
        var br = document.createElement("br");
        wind.appendChild(br);
    } 
    var a = document.createElement("a");
    a.innerHTML = "Reaction Width Data";
    a.style="font-weight:bold"
    wind.appendChild(a);
    var br = document.createElement("br");
    wind.appendChild(br);
    var select = document.createElement("select");
    select.id = "widthscroll"
    select.onchange = function() {WidthSetSwitch(this)};
    for (var i = 0; i < ttls.length; i++) {
        var option = document.createElement("option");
        option.innerHTML = ttls[i];
        select.appendChild(option);
    }
    wind.appendChild(select)

    //make buttons
    a = document.createElement("a")
    a.innerHTML = "&#8249";
    a.className = "scrollopts";
    a.onclick = function(){previousScrollW("widthscroll")}
    wind.appendChild(a)
    a = document.createElement("a")
    a.innerHTML = "&#8250";
    a.className = "scrollopts";
    a.onclick = function(){nextScrollW("widthscroll")}
    wind.appendChild(a)

    //Set values to initial
    var rxn = Object.keys(linkwidthobj);
    rxn.shift();
    for (j in parsedmodels) {
        parsedmodels[j].links.forEach(function(l){
            if (l.source.group == 1) {
                index = rxn.indexOf(l.source.class);
                if (index != -1) {
                    l.width = linkwidthobj[rxn[index]][0];
                    l.source.width = linkwidthobj[rxn[index]][0];
                }
            } else if (l.target.group == 1) {
                index = rxn.indexOf(l.target.class);
                if (index != -1) {
                    l.width = linkwidthobj[rxn[index]][0];
                    l.source.width = linkwidthobj[rxn[index]][0];
                }
            }
            
            return l;
        })
    }
    reDefineSimulation()
    simulation.alpha(0)
}
function loadFileWidth() {
    var input, file, fr;
    input = document.getElementById('fileinputwidth');
        file = input.files[0];
        fr = new FileReader();
        fr.onload = receivedTextWidth;
        fr.readAsText(file);
}