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

function diagline() {
    addNoise()
    diaglining = true;

    simulation.stop()

    //Get selected data
    afx = [];
    afy = [];
    meany = 0;
    selected.forEach(function(d) {
        afx.push(graph.nodes[d].x);
        afy.push(graph.nodes[d].y);
    })

    if (document.getElementById("orderby").value == "selection order") {
        
    } else if (document.getElementById("orderby").value == "Position") {
        var list = [];
        for (var j = 0; j < afx.length; j++) 
            list.push({'x': afx[j], 'y': afy[j], 'selected': selected[j]});

        list.sort(function(a, b) {return ((a.x < b.x) ? -1 : ((a.x == b.x) ? 0 : 1));});
        for (var k = 0; k < list.length; k++) {
            afx[k] = list[k].x;
            afy[k] = list[k].y;
            selected[k] = list[k].selected;
        }
    }

    afxmax = Math.max(...afx);
    afxmin = Math.min(...afx);
    if (afx[0] < afx[afx.length-1]) {
        dxstep = (afxmin - afxmax)/(afx.length - 1);
        refx = afxmax;
        refx2 = afxmin;
    } else {
        dxstep = (afxmax - afxmin)/(afx.length - 1);
        refx = afxmin;
        refx2 = afxmax;
    }

    afymax = Math.max(...afy);
    afymin = Math.min(...afy);
    if (afy[0] < afy[afy.length-1]) {
        dystep = (afymax - afymin)/(afy.length - 1);
        refy = afymin;
        refy2 = afymax;
    } else {
        dystep = (afymin - afymax)/(afy.length - 1);
        refy = afymax;
        refy2 = afymin;
    }

    if (document.getElementById("reverseline").checked) {afy.reverse();afx.reverse();selected.reverse()}

    graph.nodes.forEach(function(d) {
        if (d.selected) {
            d.fy = refy + afx.indexOf(d.x) * dystep;
            d.fx = refx2 - afx.indexOf(d.x) * dxstep;
            d.isfixed = true;
            d.stepnum = afx.indexOf(d.x);
            return d
        }
    });

    var newnode = Object.assign(newnodetemp("diaglinemap",5),{
        class: "d",
        x: refx - dxstep,
        y: refy2 + dystep,
        fx: refx - dxstep,
        fy: refy2 + dystep,
        isfixed: true,
        selected: true,
        previouslySelected: true,
        fixedy: refy,
        fixedx: refx2,
        nodecount: afx.length,
        stepx: function(){return (this.fx - this.fixedx)/this.nodecount},
        stepy: function(){return (this.fy - this.fixedy)/this.nodecount}
    })
    
    graph.nodes.push(newnode)
    selected.push(graph.nodes.length-1)

    reDefineSimulation()
    node.classed("selected",function(d){return d.selected})
    simulation.restart()
}

function horzline() {
    addNoise()

    horzlining = true;

    simulation.stop()

    //Get selected data
    afx = [];
    afy = [];
    meany = 0;
    selected.forEach(function(d) {
        afx.push(graph.nodes[d].x);
        afy.push(graph.nodes[d].y);
        meany += graph.nodes[d].y;
    })
    meany = meany/afy.length;

    afxmin = Math.min(...afx);
    dxstep = (Math.max(...afx) - afxmin)/(afx.length - 1)


    if (document.getElementById("orderby").value == "selection order") {
        //afy.reverse();
    } else if (document.getElementById("orderby").value == "Position") {
        //afx.sort(function(a, b){return a - b});
        list = sortTwo(afx,selected);
        afx = list[0];
        selected = list[1];
    }

    if (afx[0] > afx[afx.length-1]) {afx.reverse();selected.reverse()}

    if (document.getElementById("reverseline").checked) {afx.reverse();selected.reverse()}
    

    graph.nodes.forEach(function(d) {
        if (d.selected) {
            d.fx = afxmin + afx.indexOf(d.x) * dxstep;
            d.fy = meany;
            d.isfixed = true;
            d.stepnum = afx.indexOf(d.x);
            return d
        }
    });

    var newnode = Object.assign(newnodetemp("horzlinemap",5),{
        class: "h",
        x: Math.max(...afx) + dxstep,
        y: meany,
        fx: Math.max(...afx) + dxstep,
        fy: meany,
        isfixed: true,
        selected: true,
        previouslySelected: true,
        fixedy: meany,
        minx: afxmin,
        nodecount: afx.length,
        step: function(){return (this.fx - this.minx)/this.nodecount}
    })
    
    graph.nodes.push(newnode)
    selected.push(graph.nodes.length-1)

    reDefineSimulation()
    node.classed("selected",function(d){return d.selected})
    simulation.restart()
}

function circle() {
    if (selected.length < 3) {return;}

    addNoise()
    circling = true;

    simulation.stop()

    //Get selected data
    afx = [];
    afy = [];
    meanx = 0;
    meany = 0;
    selected.forEach(function(d) {
        afx.push(graph.nodes[d].x);
        afy.push(graph.nodes[d].y);
        meanx += graph.nodes[d].x;
        meany += graph.nodes[d].y;
    })

    meanx = meanx/afx.length;
    meany = meany/afy.length;

    ciclecenter = [meanx, meany]

    dfy = Math.max(...afy) - Math.min(...afy);
    dfx = Math.max(...afx) - Math.min(...afx);
    radius = (dfx + dfy)/4;

    angles = [];
    selected.forEach(function(d){
        angles.push(Math.atan2((graph.nodes[d].y - ciclecenter[1]),(graph.nodes[d].x - ciclecenter[0])));
        graph.nodes[d].angle = angles[angles.length - 1];
    })

    if (document.getElementById("orderby").value == "selection order") {
        
    } else if (document.getElementById("orderby").value == "Position") {
        list = sortTwo(angles,selected)
        angles = list[0];
        selected = list[1];
    }

    if (document.getElementById("reverseline").checked) {angles.reverse();selected.reverse()}
    
    anglestep = (2 * Math.PI) / selected.length;

    graph.nodes.forEach(function(d) {
        if (d.selected) {
            d.circleindex = angles.indexOf(d.angle);
            curangle = -Math.PI + (angles.indexOf(d.angle)+0.5)*anglestep;
            d.fy = ciclecenter[1] + radius*Math.sin(curangle)
            d.fx = ciclecenter[0] + radius*Math.cos(curangle)
            d.angle = curangle;
            d.isfixed = true;
            return d
        }
    });

    var newnode = Object.assign(newnodetemp("circlemap",5),{
        class: "c",
        x: ciclecenter[0] - radius,
        y: ciclecenter[1],
        fx: ciclecenter[0] - radius,
        fy: ciclecenter[1],
        isfixed: true,
        selected: true,
        previouslySelected: true,
        angle: function(){return Math.atan2((this.fy - ciclecenter[1]),(this.fx - ciclecenter[0]))},
        radius: function(){return Math.sqrt(Math.pow((this.fx - ciclecenter[0]),2) + Math.pow((this.fy - ciclecenter[1]),2))},
        anglestep: anglestep,
    })
    
    
    graph.nodes.push(newnode)

    reDefineSimulation()
    node.classed("selected",function(d){return d.selected})
    simulation.restart()
}

function vertline() {
    addNoise()

    vertlining = true;

    simulation.stop()

    //Get selected data
    afx = [];
    afy = [];
    meanx = 0;
    selected.forEach(function(d) {
        afx.push(graph.nodes[d].x);
        afy.push(graph.nodes[d].y);
        meanx += graph.nodes[d].x;
    })
    meanx = meanx/afx.length;

    afymax = Math.max(...afy);
    afymin = Math.min(...afy);
    dystep = (afymin - afymax)/(afy.length - 1)

    if (document.getElementById("orderby").value == "selection order") {
        //afy.reverse();
    } else if (document.getElementById("orderby").value == "Position") {
        //afy.sort(function(a, b){return b - a});
        list = sortTwo(afy,selected);
        afy = list[0];
        selected = list[1];
    }

    if (afy[0] < afy[afy.length-1]) {afy.reverse();selected.reverse()}

    if (document.getElementById("reverseline").checked) {afy.reverse();selected.reverse()}

    graph.nodes.forEach(function(d) {
        if (d.selected) {
            d.fx = meanx;
            d.fy = afymax + afy.indexOf(d.y) * dystep;
            d.isfixed = true;
            d.stepnum = afy.indexOf(d.y);
            return d
        }
    });

    var newnode = Object.assign(newnodetemp("vertlinemap",5),{
        class: "v",
        x: meanx,
        y: Math.min(...afy) + dystep,
        fx: meanx,
        fy: Math.min(...afy) + dystep,
        isfixed: true,
        selected: true,
        previouslySelected: true,
        fixedx: meanx,
        miny: afymax,
        nodecount: afy.length,
        step: function(){return (this.fy - this.miny)/this.nodecount}
    })
    
    graph.nodes.push(newnode)
    selected.push(graph.nodes.length-1)

    reDefineSimulation()
    node.classed("selected",function(d){return d.selected})
    simulation.restart()
}

function rotateNodesInit() {
    rotatinginit = true;

    simulation.stop()

    graph.nodes.forEach(function(d) {
        if (d.selected) {
            d.fy = d.y;
            d.fx = d.x;
            d.isfixed = true;
            return d
        }
    });


    //Get selected data
    afx = [];
    afy = [];
    meanx = 0;
    meany = 0;
    selected.forEach(function(d) {
        afx.push(graph.nodes[d].x);
        afy.push(graph.nodes[d].y);
        meanx += graph.nodes[d].x;
        meany += graph.nodes[d].y;
    })

    meanx = meanx/afx.length;
    meany = meany/afy.length;

    var newnode = Object.assign(newnodetemp("rotatemap",5),{
        class: "c",
        x: meanx,
        y: meany,
        fx: meanx,
        fy: meany,
        isfixed: true,
        selected: true,
        previouslySelected: true,
    })
    
    graph.nodes.push(newnode)

    reDefineSimulation()
    node.classed("selected",function(d){return d.selected})
    simulation.restart()
}
function rotateNodes() {
    rotating = true;

    simulation.stop()

    //Get selected data
    afx = [];
    afy = [];
    meanx = 0;
    meany = 0;
    selected.forEach(function(d) {
        afx.push(graph.nodes[d].x);
        afy.push(graph.nodes[d].y);
        meanx += graph.nodes[d].x;
        meany += graph.nodes[d].y;
    })

    meanx = meanx/afx.length;
    meany = meany/afy.length;

    //rotatecenter = [meanx, meany]

    dfy = Math.max(...afy) - Math.min(...afy);
    dfx = Math.max(...afx) - Math.min(...afx);
    radius = (dfx + dfy)/4;

    var angles = [],
    radiuses = [];
    
    selected.forEach(function(d){
        angles.push(Math.atan2((graph.nodes[d].y - rotatecenter[1]),(graph.nodes[d].x - rotatecenter[0])));
        radiuses.push(Math.sqrt(Math.pow(graph.nodes[d].y - rotatecenter[1],2) + Math.pow(graph.nodes[d].x - rotatecenter[0],2)))
        graph.nodes[d].angle = angles[angles.length - 1];
        graph.nodes[d].rotate = radiuses[radiuses.length - 1];
    })
    
    anglestep = (2 * Math.PI) / selected.length;

    var newnode = Object.assign(newnodetemp("rotatemap",5),{
        class: "r",
        x: rotatecenter[0] - radius,
        y: rotatecenter[1],
        fx: rotatecenter[0] - radius,
        fy: rotatecenter[1],
        px: rotatecenter[0] - radius,
        py: rotatecenter[1],
        pradius: radius,
        isfixed: true,
        selected: true,
        previouslySelected: true,
        angle: function(){return Math.atan2((this.fy - rotatecenter[1]),(this.fx - rotatecenter[0])) - Math.atan2((this.py - rotatecenter[1]),(this.px - rotatecenter[0]))},
        radius: function(){return Math.sqrt(Math.pow(this.y - rotatecenter[1],2) + Math.pow(this.x - rotatecenter[0],2))}
    })
    
    graph.nodes.push(newnode)

    reDefineSimulation()
    node.classed("selected",function(d){return d.selected})
    simulation.restart()
}

function rectangleInit() {
    addNoise()
    
    rectangleinit = true;

    simulation.stop()

    //Get selected data
    var afx = [],
    afy = [];

    selected.forEach(function(d) {
        afx.push(graph.nodes[d].x);
        afy.push(graph.nodes[d].y);
    })

    afxmax = Math.max(...afx);
    afxmin = Math.min(...afx);
    afymax = Math.max(...afy);
    afymin = Math.min(...afy);

    graph.nodes.forEach(function(d) {
        if (d.selected) {
            if (d.x > afxmax) {
                d.x = afxmax;
            } if (d.x < afxmin) {
                d.x = afxmin;
            } if (d.y > afymax) {
                d.y = afymax;
            } if (d.y < afymin) {
                d.y = afymin;
            }

            var dists = [Math.abs(d.x - afxmin),
            Math.abs(d.x - afxmax),
            Math.abs(d.y - afymin),
            Math.abs(d.y - afymax)]
            var index = dists.indexOf(Math.min(...dists));

            if (index == 0) {
                d.x = afxmin;
                d.rectpos = "l";
                d.scale = (d.y-afymin)/(afymax-afymin);
            } else if (index == 1) {
                d.x = afxmax;
                d.rectpos = "r";
                d.scale = (d.y-afymin)/(afymax-afymin);
            } else if (index == 2) {
                d.y = afymin;
                d.rectpos = "t";
                d.scale = (d.x-afxmin)/(afxmax-afxmin);
            } else if (index == 3) {
                d.y = afymax;
                d.rectpos = "b";
                d.scale = (d.x-afxmin)/(afxmax-afxmin);
            }

            d.fy = d.y;
            d.fx = d.x;
            d.isfixed = true;

            return d
        }
    });

    var newnode = Object.assign(newnodetemp("rectanglemap",5),{
        class: "r",
        x: afxmax,
        y: afymax,
        fx: afxmax,
        fy: afymax,
        af: [afxmin, afxmax, afymin, afymax],
        isfixed: true,
        selected: true,
        previouslySelected: true,
        moving: 0,
    })

    graph.nodes.push(newnode)

    reDefineSimulation()
    node.classed("selected",function(d){return d.selected})
    simulation.restart()
}

function editBezier() {
    if (selected.length != 1) {
        if (graph.nodes[selected[0]].group != 1) {
            return;
        } else {
            selected.forEach(function(d){graph.nodes[d].bezi = [null,null,null,null]})
            return;
        }
    }

    d = graph.nodes[selected[0]]
    d.isfixed = true;
    d.fx = d.x;
    d.fy = d.y;
    beziering = true;

    var newnode = Object.assign(newnodetemp("beziermap",5),{
        class: "b",
        isfixed: true,
        selected: true,
        previouslySelected: true,
        refindex: d.index,
    })

    if (d.bezi[0] != null) {
        newnode.x = d.x + d.bezi[0];
        newnode.y = d.y + d.bezi[1];
        newnode.fx = d.x + d.bezi[0];
        newnode.fy = d.y + d.bezi[1];
    } else {
        newnode.x = d.x + 10;
        newnode.y = d.y + 10;
        newnode.fx = d.x + 10;
        newnode.fy = d.y + 10;
    }

    graph.nodes.push(newnode)
    reDefineSimulation()
    node.classed("selected",function(d){return d.selected})
    simulation.restart()
}