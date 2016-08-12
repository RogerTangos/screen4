function linreg_train(parent, label) {
  var req = {"id": "linreg",
             "type": "train",
             "label": label,
             "sample": 25};
  var rep = request(req);
  var lat = rep["lat"];
  var long = rep["long"];
  var conc = rep["model"];
  var pred = rep["pred"];

  var rows = [];
  for (var i = 0; i < lat.length; i++) {
    rows.push({x: long[i], y: conc[i], z: lat[i]});
  }

  var axisRange = [0,10];
  var scales = [];
  var axisKeys = ["x", "y", "z"]

  initAxis(0);
  initAxis(1);
  initAxis(2);

  var x = scales[0];
  var y = scales[1];
  var z = scales[2];
  var sphereRadius = 0.2;

  var data = parent.select("scene").selectAll(".datapoint").data(rows);
  data.exit().remove();

  var newData = data.enter()
      .append("transform")
      .attr("class", "datapoint")
      .attr("scale", [sphereRadius,sphereRadius,sphereRadius])
      .append("shape");
  newData.append("appearance")
      .append("material");
  newData.append("sphere");

  data.selectAll("shape appearance material")
      .attr("diffuseColor", "blue");
  data.attr("translation",
        function(row) {
          return x(row[axisKeys[0]]) + " "
               + y(row[axisKeys[1]]) + " "
               + z(row[axisKeys[2]]);
        }
      );

  function axisName(name, axisIndex) {
    return ["x","y","z"][axisIndex] + name;
  }

  function constVecWithAxisValue(otherValue, axisValue, axisIndex) {
    var result = [otherValue,otherValue,otherValue];
    result[axisIndex] = axisValue;
    return result;
  }

  function makeSolid(selection, color) {
    selection
        .append("appearance")
        .append("material")
          .attr("diffuseColor", color||"black");
    return selection;
  }

  function initAxis(axisIndex) {
    var key = axisKeys[axisIndex];
    var tscales = [[-155,-160],[0,500],[20,25]];
    var scale = d3.scale.linear()
        .domain(tscales[axisIndex])
        .range(axisRange);
    scales[axisIndex] = scale;

    var numTicks = 8;
    var tickSize = 0.1;
    var tickFontSize = 0.35;

    var ticks = scene.selectAll("." + axisName("Tick", axisIndex))
        .data(scale.ticks(numTicks));
    var newTicks = ticks.enter()
        .append("transform")
        .attr("class", axisName("Tick", axisIndex));
    newTicks.append("shape").call(makeSolid)
        .append("box")
        .attr("size", tickSize + " " + tickSize + " " + tickSize);
    ticks.transition()
        .attr("translation", function(tick) {
            return constVecWithAxisValue(0, scale(tick), axisIndex);
        });
    ticks.exit().remove();

    var tickLabels = ticks.selectAll("billboard shape text")
        .data(function(d) {
            return [d];
        });
    var newTickLabels = tickLabels.enter()
        .append("billboard")
        .attr("axisOfRotation", "0 0 0")
        .append("shape")
        .call(makeSolid);
    newTickLabels.append("text")
        .attr("string", scale.tickFormat(10))
        .attr("solid", "true")
        .append("fontstyle")
        .attr("size", tickFontSize)
        .attr("family", "SANS")
        .attr("justify", "END MIDDLE");
    tickLabels.attr("string", scale.tickFormat(10));
    tickLabels.exit().remove();

    if (axisIndex == 0 || axisIndex == 2) {
      var gridLines = scene.selectAll("." + axisName("GridLine", axisIndex))
          .data(scale.ticks(numTicks));
      gridLines.exit().remove();
      var newGridLines = gridLines.enter()
          .append("transform")
          .attr("class", axisName("GridLine", axisIndex))
          .attr("rotation", axisIndex==0 ? [0,1,0, -Math.PI/2] : [0,0,0,0])
          .append("shape");
      newGridLines.append("appearance")
          .append("material")
          .attr("emissiveColor", "gray");
      newGridLines.append("polyline2d");
      gridLines.selectAll("shape polyline2d").transition()
          .attr("lineSegments", "0 0, " + axisRange[1] + " 0")
      gridLines.transition()
          .attr("translation", axisIndex == 0
            ? function(d) { return scale(d) + " 0 0"; }
            : function(d) { return "0 0 " + scale(d); }
          );
    }

    var scaleMin = axisRange[0];
    var scaleMax = axisRange[1];
    var newAxisLine = scene.append("transform")
        .attr("class", axisName("Axis", axisIndex))
        .attr("rotation", ([[0,0,0,0],
                            [0,0,1,Math.PI / 2],
                            [0,1,0,-Math.PI / 2]][axisIndex]))
        .append("shape");
    newAxisLine.append("appearance")
        .append("material")
        .attr("emissiveColor", "lightgray");
    newAxisLine.append("polyline2d")
        .attr("lineSegments", "0 0," + scaleMax + " 0");
    var newAxisLabel = scene
        .append("transform")
        .attr("class", axisName("AxisLabel", axisIndex))
        .attr("translation", constVecWithAxisValue(0,
            scaleMin + 1.1 * (scaleMax - scaleMin), axisIndex));
    var newAxisLabelShape = newAxisLabel
        .append("billboard")
        .attr("axisOfRotation", "0 0 0")
        .append("shape")
        .call(makeSolid);

    var labelFontSize = 0.6;
    newAxisLabelShape.append("text")
        .attr("class", axisName("AxisLabelText", axisIndex))
        .attr("solid", "true")
        .attr("string", key)
        .append("fontstyle")
        .attr("size", labelFontSize)
        .attr("family", "SANS")
        .attr("justify", "END MIDDLE");
  }
}

function linreg_test(label, lat, long, conc) {
  var req = {"id": "linreg",
             "type": "test",
             "label": label,
             "lat": lat,
             "long": long};
  var rep = request(req);
  var pred = rep["conc"];
  conc.text(pred);
}
