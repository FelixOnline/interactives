window.onload = function() {
  console.log("1673-heatmap JS loaded!");

  var margin = {top: 225, right: 100, bottom: 100, left: 275};

  var width = 1400 - margin.left - margin.right,
      height = 725 - margin.top - margin.bottom;

  var svg = d3.select("#departmentHeatmap").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv("https://raw.githubusercontent.com/FelixOnline/interactives/master/1673/staff-survey/heatmap-iii/data.csv", (error, data) => {
    if (error) throw error;

    var formattedData = formatData(data);
    var extent = getExtent(formattedData);

    // Create colour scale
    var colourScale = d3.scaleLinear();

    colourScale.range(["#f9f9ff", "#0000FF"])
    colourScale.domain([extent[1], extent[0]]);

    drawHeatMap(formattedData, {height: height, width: width, xLength: formattedData[0].facultyResults.length, rowLabelXPadding: 10, columnLabelYPadding: 10}, colourScale);
  });

  // Get extent of percentage
  function getExtent(data) {
    var minPercentage = d3.min(data, d => {
      return d3.min(d.facultyResults, d1 => {
        if (d1.percentage) {
          return d1.percentage;
        } else {
          return 100;
        }
      });
    });

    var maxPercentage = d3.max(data, d => {
      return d3.max(d.facultyResults, d1 => {
        if (d1.percentage) {
          return d1.percentage;
        } else {
          return 0;
        }
      });
    });

    return [minPercentage, maxPercentage];
  }

  // Format data into nice arrays
  function formatData(data) {
    var questions = [];

    data.forEach(d => {
      var facultiesArray = [];
      for (var faculty in d) {
        if (faculty != "Question Class") {
          facultiesArray.push({
            faculty: faculty,
            percentage: +d[faculty].slice(0, -1)
          });
        }
      }
      questions.push({
        questionClass: d["Question Class"],
        facultyResults: facultiesArray
      });
    });

    return questions;
  }


  // Refactor and pass position of label via config
  function showLabel(d) {
    var coords = [d3.event.clientX, d3.event.clientY];
    var top = coords[1] + 30,
        left = coords[0] - 50;

      d3.select(".tooltip")
      .style("top", top + "px")
      .style("left", left + "px")
      .transition()
      .duration(200)
      .style("opacity", 1)

    d3.select(".tooltip")
      .html(d.percentage + "%")

  }

  function moveLabel() {
    var coords = [d3.event.clientX, d3.event.clientY];

    var top = coords[1] + 30,
        left = coords[0] - 50;

      d3.select(".tooltip")
      .style("top", top + "px")
      .style("left", left + "px");
  }

  function hideLabel(d) {
    d3.select(".tooltip")
      .transition()
      .duration(200)
      .style("opacity", 0);
  }

  // Draw the heatmap
  function drawHeatMap(data, config, colourScale) {
    var rectWidth = config.width / config.xLength,
        rectHeight = config.height / data.length;

    var rowGroups = svg.selectAll("g")
      .data(data).enter()
      .append("g")
        .attr("class", "row-group")
        .attr("transform", (d, i) => "translate(" + [0, i * rectHeight] + ")");

    var rects = rowGroups.selectAll("rect")
      .data(d => d.facultyResults).enter()
      .append("rect")
        .attr("class", "row")
        .attr("width", rectWidth)
        .attr("height", rectHeight)
        .attr("x", (d, i) => i * rectWidth)
        .style("fill", d => colourScale(d.percentage))
        .on("mouseover", showLabel)
        .on("mousemove", moveLabel)
        .on("mouseout", hideLabel);

    // Refactor
    var title = svg.append("text")
      .attr("y", -175)
      .attr("x", width / 2)
      .attr("text-anchor", "middle")
      .attr("class", "title")
      .text("Percentage of Postitive Responses for Question Classes by Department")

    // Refactor
    var rowLabels = rowGroups.append("text")
      .attr("x", -config.rowLabelXPadding)
      .attr("y", rectHeight / 1.5)
      .attr("text-anchor", "end")
      .text(d => d.questionClass);

    // Refactor
    var columnLabels = svg.append("g")
      .attr("class", "columnLabels")
      .selectAll("text")
      .data(data[0].facultyResults).enter()
      .append("g")
        .attr("transform", (d, i) => "translate(" + [i * rectWidth + (rectWidth / 2), -config.columnLabelYPadding] + ")")
        .append("text")
          .attr("text-anchor", "start")
          .attr("transform", "rotate(-45)")
          .text(d => d.faculty);

    var legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", "translate(" + [0, height + rectHeight] + ")")

    var legendLinear = d3.legendColor()
      .shapeWidth(rectWidth)
      .shapeHeight(rectHeight)
      .shapePadding(0)
      .orient('horizontal')
      .scale(colourScale)
      .labelFormat(d => Math.round(d) + "%");

    legend.call(legendLinear);

    var div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
  }
};