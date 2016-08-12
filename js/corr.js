function corr(parent) {
pos = {"prochloro":0, "synecho":1, "picoeuk":2, "beads":3}
  var margin = {top: 50, right: 0, bottom: 100, left: 80}
  var width = 960 - margin.left - margin.right
  var height = 430 - margin.top - margin.bottom
  var gridSize = Math.floor(width / 13)
  var legendElementWidth = gridSize * 0.4
  var buckets = 10
  var colors = ["#ffffd9",
                "#edf8b1",
                "#c7e9b4",
                "#7fcdbb",
                "#41b6c4",
                "#1d91c0",
                "#225ea8",
                "#253494",
                "#081d58",
                "#000D30"]
  var labels = ["prochloro", "synecho", "picoeuk", "beads"]

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "http://localhost:9999", false);
  xhr.setRequestHeader("Content-type", "application/json");
  var jdata = JSON.stringify({"id":"corr"});
  xhr.send(jdata);
  var json = JSON.parse(xhr.responseText);

  var data = []
  var corrs = JSON.parse(json["corr"])
      for (label of labels) {
        for (label2 of labels) {
          data.push({day: label, hour: label2, value: corrs[label][label2]})
        }
      }

  var colorScale = d3.scale.quantize()
      .domain([Math.floor(d3.min(data, function (d) { return d.value; })),
             buckets - 1,
             Math.floor(d3.max(data, function (d) { return d.value; }))])
              .range(colors);

  var svg = parent.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var xLabels = svg.selectAll(".xLabel").data(labels)
      .enter().append("text")
      .text(function(d) { return d; })
      .attr("x", function(d, i) { return i * gridSize; })
      .attr("y", 0)
      .style("text-anchor", "middle")
      .attr("transform", "translate(" + gridSize / 2 + ", -6)")
      .attr("class",
        function(d, i) {
          return ((i >= 7 && i <= 16) ? "xLabel mono axis axis-worktime"
                                      : "xLabel mono axis");
        }
      );

  var yLabels = svg.selectAll(".yLabel").data(labels)
      .enter().append("text")
      .text(function (d) { return d; })
      .attr("x", 0)
      .attr("y", function (d, i) { return i * gridSize; })
      .style("text-anchor", "end")
      .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
      .attr("class",
        function (d, i) {
          return ((i >= 0 && i <= 4) ? "yLabel mono axis axis-workweek"
                                     : "yLabel mono axis");
        }
      );

  var heatMap = svg.selectAll(".corr").data(data)
      .enter().append("rect")
      .attr("x", function(d) { return pos[d.hour] * gridSize; })
      .attr("y", function(d) { return pos[d.day] * gridSize; })
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("class", "corr bordered")
      .attr("width", gridSize)
      .attr("height", gridSize)
      .style("fill", colors[0]);
  heatMap.transition().duration(0)
      .style("fill", function(d) { return colorScale(d.value); });
  heatMap.append("title").text(function(d) { return d.value; });

  var legend = svg.selectAll(".legend").data(range(0, buckets-1))
      .enter().append("g")
      .attr("class", "legend");
  legend.append("rect")
      .attr("x", function(d, i) { return legendElementWidth * i; })
      .attr("y", height)
      .attr("width", legendElementWidth)
      .attr("height", gridSize / 4)
      .style("fill", function(d, i) { return colors[i]; });
  legend.append("text")
      .attr("class", "mono")
      .text(function(d) { return d; })
      //.text(function(d) { return "≥ " + d; })
      .attr("x", function(d, i) { return legendElementWidth * i; })
      .attr("y", height-30 + gridSize);

      function range(start, end) {
        var foo = ["-1.0"];
        for (var i = start; i <= end-2; i++) {
          foo.push(" ")
        }
        foo.push("1.0")
        return foo;
      }
}
