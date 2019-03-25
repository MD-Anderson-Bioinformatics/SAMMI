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

function drawNewText(evt) {
    // sc = gDraw.attr("transform");
    // re = /([-.0-9]+)/;
    // trs = [];
    // for (var i = 0; i < 3; i++) {
    //     m = re.exec(sc);
    //     trs.push(Number(m[1]))
    //     sc = sc.replace(m[1],"")
    // }
    trs = curtr;
    
    graph.text.push({
        text: "New Text",
        x: (evt.offsetX - trs[0])/trs[2],
        y: (evt.offsetY - trs[1])/trs[2],
        index: graph.text.length
    })
    drawTexts()
    document.getElementById("textingImage").style = "opacity: 1;"
}

function drawTexts() {
    y = document.getElementsByClassName("addedtext")
    while (y.length > 0) {y[0].remove()}

    addedText = gDraw.append("g")
    .attr("class","addedtext")
    .selectAll("text")
    .data(graph.text)
    .enter().append("text")
    .style("font-size",document.getElementById("addedtextsize").value + "px")
    .attr("x",function(d){return d.x})
    .attr("y",function(d){return d.y})
    .text(function(d){return d.text})
    .on("dblclick",editAddedText)
    .on("mouseover",() => {document.body.style.cursor = "pointer"})
    .on("mouseout",() => {document.body.style.cursor = "auto"})
    .call(d3.drag()
    .on("drag",draggedtext))
}

function draggedtext(d) {
    d.x += d3.event.dx;
    d.y += d3.event.dy;
    addedText.attr("x", function(d) {return d.x;});
    addedText.attr("y", function(d) {return d.y;});
}

function editAddedText(d) {
    wd = document.getElementById("dialog2");

    while (wd.hasChildNodes()) {wd.children[0].remove()}

    wd.style = "display:block;";
    document.getElementsByClassName("ui-dialog-titlebar")[1].style = "display:block;";

    if (document.getElementsByClassName("ui-dialog-titlebar")[1].childElementCount == 2) {
        span = document.createElement("span")
        span.id = "ui-id-2"
        span.className = "ui-dialog-title"
        span.innerHTML = "X"
        span.onclick = function(){closeEdit()}
        span.style = "cursor: context-menu;float: right"
        document.getElementsByClassName("ui-dialog-titlebar")[1].appendChild(span)
    }

    input = document.createElement("input")
    input.type = "text";
    input.setAttribute("nodeindex",d.index);
    input.onclick = function(){typing = true;}
    input.onblur = function(){typing = false;}
    input.id = "editaddedtext"
    input.value = d.text;
    input.onkeydown = function() {
        typing = true;
        setTimeout(function(){
            graph.text[Number(document.getElementById("editaddedtext").attributes.nodeindex.value)].text = document.getElementById("editaddedtext").value;
            addedText.text(function(d){return d.text},
            100)})
    }
    wd.appendChild(input)
}

function drawNewShape(evt) {
    document.getElementById("shapingImage").style = "";

    sc = gDraw.attr("transform");
    re = /([-.0-9]+)/;
    // trs = [];
    // for (var i = 0; i < 3; i++) {
    //     m = re.exec(sc);
    //     trs.push(Number(m[1]))
    //     sc = sc.replace(m[1],"")
    // }
    trs = curtr;
    var index = graph.shapes.length;
    graph.shapes[index] = {
        x: (evt.offsetX - trs[0])/trs[2],
        y: (evt.offsetY - trs[1])/trs[2],
        width: 100,
        height: 100,
        index: index
    }

    reDefineSimulation()
    simulation.alpha(0)
    //var i = 0;
    //while (addedShapes[i] != null) {i++}

    //drawGeneralShape(i)
}
function drawGeneralShape(i) {
    addedShapes[i] = gDraw.append('rect')
    .attr("class","addedshape")
    .attr("x",graph.shapes[i].x)
    .attr("y",graph.shapes[i].y)
    .attr("width",graph.shapes[i].width)
    .attr("height",graph.shapes[i].height)
    .attr("index",i)
    .attr("style","fill:transparent;stroke-width:3;stroke:rgb(0,0,0)")
    .call(d3.drag()
        .on("start", function() {resizeShapeStart(this)})
        .on("drag", function() {resizeShapeIng(this)})
        .on("end", function() {resizeShapeEnd(this)}))
    .on("mousemove", function () {shapeCursor(this)})
    .on("mouseout", function () {document.body.style.cursor = "auto"})
}
function shapeCursor(d) {
    var te = false,
    be = false,
    re = false,
    le = false;

    pos = d.getBoundingClientRect();

    if (Math.abs(d3.event.x - pos["x"]) < 6) {le = true;}
    if (Math.abs(d3.event.x - pos["x"] - pos["width"]) < 6) {re = true;}
    if (Math.abs(d3.event.y - pos["y"]) < 6) {te = true;}
    if (Math.abs(d3.event.y - pos["y"] - pos["height"]) < 6) {be = true;}
    
    if (le && !te && !be) {document.body.style.cursor = "w-resize";return}
    if (le && te) {document.body.style.cursor = "nw-resize"; return}
    if (le && be) {document.body.style.cursor = "ne-resize"; return}
    if (be && !le && !re) {document.body.style.cursor = "n-resize"; return}
    if (be && re) {document.body.style.cursor = "nw-resize"; return}
    if (re && !be && !te) {document.body.style.cursor = "w-resize"; return}
    if (re && te) {document.body.style.cursor = "ne-resize"; return}
    if (te) {document.body.style.cursor = "n-resize"; return}
    document.body.style.cursor = "auto";
}

var shapingleft = false,
shapingright = false
shapingup = false,
shapingdown = false;
function resizeShapeStart(d) {
    if (Math.abs(d3.event.x - Number(d.attributes["x"].nodeValue)) < 6) {shapingleft = true;}
    if (Math.abs(d3.event.x - Number(d.attributes["x"].nodeValue) - Number(d.attributes["width"].nodeValue)) < 6) {shapingright = true;}
    if (Math.abs(d3.event.y - Number(d.attributes["y"].nodeValue)) < 6) {shapingup = true;}
    if (Math.abs(d3.event.y - Number(d.attributes["y"].nodeValue) - Number(d.attributes["height"].nodeValue)) < 6) {shapingdown = true;}
}
var tmp
function resizeShapeIng(d) {
    //If shape is to be deleted
    if (Number(d.attributes["width"].nodeValue) < 0 || Number(d.attributes["height"].nodeValue) < 0) {
        graph.shapes[Number(d.attributes["index"].value)].delete = true;
        return
    }
    if (shapingleft) {
        d.attributes["x"].nodeValue = Number(d.attributes["x"].nodeValue) + d3.event.dx;
        d.attributes["width"].nodeValue = Number(d.attributes["width"].nodeValue) - d3.event.dx;
    }
    if (shapingright) {
        d.attributes["width"].nodeValue = Number(d.attributes["width"].nodeValue) + d3.event.dx;
    }
    if (shapingup) {
        d.attributes["y"].nodeValue = Number(d.attributes["y"].nodeValue) + d3.event.dy;
        d.attributes["height"].nodeValue = Number(d.attributes["height"].nodeValue) - d3.event.dy;
    }
    if (shapingdown) {
        d.attributes["height"].nodeValue = Number(d.attributes["height"].nodeValue) + d3.event.dy;
    }
    graph.shapes[Number(d.attributes["index"].value)].x = Number(d.attributes["x"].nodeValue);
    graph.shapes[Number(d.attributes["index"].value)].y = Number(d.attributes["y"].nodeValue);
    graph.shapes[Number(d.attributes["index"].value)].width = Number(d.attributes["width"].nodeValue);
    graph.shapes[Number(d.attributes["index"].value)].height = Number(d.attributes["height"].nodeValue);
    node.filter(function(n) { return n.trap == d.attributes["index"].value })
    .each(function(s) { 
        trapNodes(s)
    })
    ticked()
}
function resizeShapeEnd(d) {
    shapingleft = false;
    shapingright = false;
    shapingup = false;
    shapingdown = false;

    for (var i = graph.shapes.length-1; i > -1; i--) {
        if (graph.shapes[i].delete == true) {
            //pause
            simulation.stop()
            //update node trap number
            for (var j = 0; j < graph.nodes.length; j++) {
                if (graph.nodes[j].trap == graph.shapes[i].index) {
                    graph.nodes[j].trap = -1
                } else if (graph.nodes[j].trap > graph.shapes[i].index) {
                    graph.nodes[j].trap--
                }
            }
            //remove shape
            graph.shapes.splice(i,1)
            //redefine indexes
            for (var j = 0; j < graph.shapes.length; j++) {
                graph.shapes[j].index = j;
            }
            //restart
            simulation.restart()
        }
    }
}

function drawShapes() {
    addedShapes = [];

    for (var i = 0; i < graph.shapes.length; i++) {drawGeneralShape(i)}
}

function trapNodes(gnode) {
    if (gnode.x < graph.shapes[gnode.trap].x) {
        gnode.x = graph.shapes[gnode.trap].x;
    }
    if (gnode.x > (graph.shapes[gnode.trap].x + graph.shapes[gnode.trap].width )) {
        gnode.x = graph.shapes[gnode.trap].x + graph.shapes[gnode.trap].width;
    }
    if (gnode.y < graph.shapes[gnode.trap].y) {
        gnode.y = graph.shapes[gnode.trap].y;
    } 
    if (gnode.y > (graph.shapes[gnode.trap].y + graph.shapes[gnode.trap].height)) {
        gnode.y = graph.shapes[gnode.trap].y + graph.shapes[gnode.trap].height;
    }
}

function defineTrap(node) {
    node.trap = -1;
    graph.shapes.forEach(function(s){
        if (node.x >= s.x && node.x <= (s.x + s.width) && node.y >= s.y && node.y <= (s.y + s.height)) {node.trap = s.index; return;}
    })
}

function untrap() {
    node.filter(function(d) { return d.selected})
    .each(function(d) { 
        d.trap = -1;
    })
}