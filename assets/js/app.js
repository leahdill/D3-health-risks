// Define SVG area dimensions
var svgWidth = 960;
var svgHeight = 500;

// Define the chart's margins as an object
var margin = {
    top:20,
    right: 40,
    bottom: 80,
    left: 100
};

// Define dimensions of the chart area
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Select body, append SVG area to it, and set its dimensions
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width",svgWidth)
    .attr("height", svgHeight);

// Append a group area, then set its margins
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

var initialXAxis = "poverty";

function scale1(data1, initialXAxis) {
     return d3.scaleLinear()
        .domain([d3.min(data1, d=> d[initialXAxis])*0.8,
        d3.max(data1, d => d[initialXAxis]) * 1.2
    ])
    .range([0,width]);
}

function renderAxes1(XScale1, xAxis1) {
    var bottomAxis = d3.axisBottom(XScale1);

    xAxis1.transition()
    .duration(1000)
    .call(bottomAxis);

    return xAxis1
}

function renderCircles1(circlesGroup1, XScale1, initialXAxis) {
    circlesGroup1.transition()
    .duration(1000)
    .attr("cx", d => XScale1(d[initialXAxis]));

    return circlesGroup1;
}

function ToolTip1(initialXAxis, circlesGroup1) {
    var label;

    if (initialXAxis === "poverty") {
        label = "Impoverished(%)";
    }
    else if (xAxis1 === "age") {
        label = "Age (Median)";
    }
    else {
        label = "Household Income (Median)";
    }

    var toolTip = d3.tip()
    .attr("class", "d3-tooltip")
    .offset([30, -60])
    .html(function(d){
        var pov = "<div> "+ d.poverty + " </div>"
        var state = "<div> "+ d.state + " </div>"
        var obe = "<div> "+ d.obesity + " </div>"
        return state + pov + obe;
    });

    circlesGroup1.call(toolTip);

    circlesGroup1.on("mouseover", function(data1){
        toolTip.show(data1);
    })
        .on("mouseout", function(data1, index){
            toolTip.hide(data1);
        });
    return circlesGroup1;
}

var toolTip = d3.tip()
    .attr("class", "d3-tooltip")
    .offset([30, -60])
    .html(function(d){
        var pov = "<div> "+ d.poverty + " </div>"
        var state = "<div> "+ d.state + " </div>"
        var obe = "<div> "+ d.obesity + " </div>"
        return state + pov + obe;
    });

//Import data from data.csv

d3.csv("assets/data/data.csv").then(function(data,err){
    if (err) throw err;

    data.forEach(function(data){
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.low;
        data.smokes = +data.smokes;
        data.income = +data.income;
        data.obesity = +data.obesity
    });

    var xLinearScale = scale1(data, initialXAxis);

    var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.healthcare)])
    .range([height,0]);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var xAxis1 = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    chartGroup.append("g")
    .call(leftAxis);

    var circlesGroup1 = chartGroup.selectAll("g theCircles")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[initialXAxis]))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r",20)
    .attr("fill", "blue")
    .attr("opacity", ".5")
    .on("mouseover", function(d){toolTip.show(d)})
    .on("mouseout", function(d){toolTip.hide(d)});

    var labelsGroup = chartGroup.append("g")
    .attr("transform",`translate(${width/2}, ${height + 20})`);

    var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty")
    .classed("active", true)
    .text("Impoverished(%)");

    var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age")
    .classed("inactive", true)
    .text("Age(Median)");

    chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height/2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Poor Healthcare (%)");

    var circlesGroup1 = ToolTip1(initialXAxis, circlesGroup1);

    labelsGroup.selectAll("text")
    .on("click", function(){

        var value = d3.select(this).attr("value");
        if (value !== initialXAxis){
            initialXAxis = value;
            
            xLinearScale = scale1(data1, initialXAxis);

            xAxis1 = renderAxes1(xLinearScale, xAxis1);

            circlesGroup1 = renderCircles1(circlesGroup1, xLinearScale, initialXAxis);

            if (initialXAxis === "age") {
                ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                povertyLabel
                    .classed("active", false)
                    .classed("inacitve", true);
            }
            else {
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
        }
    });
}).catch(function(err){
    console.log(err);
});