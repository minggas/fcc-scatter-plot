const end = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

const margin = {
  top: 80,
  right: 30,
  bottom: 40,
  left: 80
};
let w = 920 - margin.left - margin.right,
    h = 630 - margin.top - margin.bottom;
//Color function
const legendColor = d3.scaleOrdinal(d3.schemeSet1);
//Place function
String.prototype.ordinalNumber = function () {
  if (this[this.length - 1] === "1") {
    return this + "st";
  }
  if (this[this.length - 1] === "2") {
    return this + "nd";
  }
  if (this[this.length - 1] === "3") {
    return this + "rd";
  }
  return this + "th";
};
//Tooltip
let tooltip = d3.select(".container").append("div").attr("id", "tooltip").style("opacity", 0);
//Chart container
let svgContainer = d3.select(".container").append("svg").attr("class", "chart").attr("width", w + margin.left + margin.right).attr("height", h + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Fetch the data
d3.json(end).then(data => {
  data.forEach(d => {
    var parsedTime = d.Time.split(":");
    d.MinTime = d.Time;
    d.Time = new Date(Date.UTC(1970, 0, 1, 0, parsedTime[0], parsedTime[1]));
  });

  //Scale the chart with the data
  let xScale = d3.scaleLinear().domain([d3.min(data, d => d.Year - 1), d3.max(data, d => d.Year + 1)]).range([0, w]);
  let yScale = d3.scaleTime().domain(d3.extent(data, d => d.Time)).range([0, h]);

  //Make the Axis
  const timeFormat = d3.timeFormat("%M:%S");
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
  const yAxis = d3.axisLeft(yScale).tickFormat(timeFormat);

  //Put the X axis on the chart
  svgContainer.append("g").attr("class", "x axis").attr("id", "x-axis").attr("transform", "translate(0," + h + ")").call(xAxis).append("text").attr("class", "x-axis-label").attr("x", w).attr("y", -6).style("text-anchor", "end").text("Year");

  //Put the Y axis on the chart
  svgContainer.append("g").attr("class", "y axis").attr("id", "y-axis").call(yAxis);

  svgContainer.append("text").attr("class", "label").attr("transform", "rotate(-90)").attr("x", -150).attr("y", -44).style("font-size", 18).text("Time in Minutes");

  //Put the chart on the DOM
  svgContainer.selectAll(".dot").data(data).enter().append("svg:a").attr("xlink:href", d => d.URL).attr("target", "_blank").append("circle").attr("class", "dot").attr("data-xvalue", (d, i) => parseInt(d.Year)).attr("data-yvalue", (d, i) => d.Time.toISOString()).attr("cx", d => xScale(d.Year)).attr("cy", d => yScale(d.Time)).attr("r", 5).style("fill", d => legendColor(d.Doping !== ""))
  //Make the tooltip show data with the mouse over
  .on("mouseover", (d, i) => {
    tooltip.transition().duration(200).style("opacity", 0.8);
    tooltip.html(`${d.Name}: ${d.Nationality} - ${d.Place.toString().ordinalNumber()} Place<br/>Year: ${d.Year} Time: ${d.MinTime}<br/><br/>${d.Doping}`).attr("data-year", d.Year).style("left", d3.event.pageX + 15 + "px").style("top", d3.event.pageY - 5 + "px");
  }).on("mouseout", function (d) {
    tooltip.transition().duration(200).style("opacity", 0);
  });
  //Add Title and Subtitle
  svgContainer.append("text").attr("id", "title").attr("x", w / 2).attr("y", -margin.top / 2).attr("text-anchor", "middle").style("font-size", "2rem").text("Doping in Bycicle Racing");

  svgContainer.append("text").attr("x", w / 2).attr("y", -margin.top / 2 + 25).attr("text-anchor", "middle").style("font-size", "1rem").text("35 Fastest Time up Alpe d'Huez");

  //Add the Legend to the Chart
  let legend = svgContainer.selectAll("legend").data(legendColor.domain()).enter().append("g").attr("id", "legend").attr("transform", function (d, i) {
    return "translate(0," + (h / 2 - i * 20) + ")";
  });

  legend.append("rect").attr("x", w - 18).attr("width", 18).attr("height", 18).style("fill", legendColor);

  legend.append("text").attr("x", w - 24).attr("y", 9).attr("dy", ".35em").style("text-anchor", "end").text(d => {
    if (d) return "Riders with doping allegations";else {
      return "No doping allegations";
    }
  });
}).catch(err => {
  alert(err);
});
