// cloudmarketshare.js

// Set up the dimensions of the chart
const width = 600;
const height = 400;
const margin = { top: 50, right: 50, bottom: 50, left: 100 };

// Create an SVG container
const svg = d3
  .select("#chart-container")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Load the data from the CSV file
d3.csv("/data/CloudRevenueMarketShare.csv").then((data) => {
  // Convert string values to numbers
  data.forEach((d) => {
    d.Year = +d.Year;
    d.Google = +d.Google;
    d.Microsoft = +d.Microsoft;
    d.Amazon = +d.Amazon;
  });

  // Set up the scales
  const xScale = d3.scaleLinear().domain([2016, 2022]).range([0, width]);
  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => Math.max(d.Google, d.Microsoft))])
    .range([height, 0]);

  // Set up the line functions
  const line1 = d3
    .line()
    .x((d) => xScale(d.Year))
    .y((d) => yScale(d.Google));

  const line2 = d3
    .line()
    .x((d) => xScale(d.Year))
    .y((d) => yScale(d.Microsoft));

  const line3 = d3
    .line()
    .x((d) => xScale(d.Year))
    .y((d) => yScale(d.Amazon));

  // Draw the lines
  svg
    .append("path")
    .data([data])
    .attr("class", "line")
    .style("stroke", "green")
    .style("stroke-width", "6px")
    .style("fill", "none")
    .attr("d", line1);

  svg
    .append("path")
    .data([data])
    .attr("class", "line")
    .style("stroke", "blue")
    .style("fill", "none")
    .style("stroke-width", "6px")
    .attr("d", line2);

  svg
    .append("path")
    .data([data])
    .attr("class", "line")
    .style("stroke", "yellow")
    .style("fill", "none")
    .style("stroke-width", "6px")
    .attr("d", line3);

  // Add x-axis
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale).ticks(7).tickFormat(d3.format("d")));

  // Add y-axis
  svg.append("g").call(d3.axisLeft(yScale));

  svg
    .append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width / 2)
    .attr("y", height + 50)
    .style("font-size", "14px")
    .style("fill", "#94A3B8")
    .style("font-weight", "bold")
    .text("Year");

  svg
    .append("text")
    .attr("class", "y label")
    .attr("x", (-1 * height) / 2)
    .attr("y", -50)
    .attr("dy", ".75em")
    .style("fill", "#94A3B8")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .attr("transform", "rotate(-90)")
    .text("Market Share");

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 0 - margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("fill", "white")
    .style("font-weight", "bold")
    .text("Cloud Services Marketshare for the Big 3");

  svg
    .append("circle")
    .attr("cx", 500)
    .attr("cy", 15)
    .attr("r", 6)
    .style("fill", "green");
  svg
    .append("circle")
    .attr("cx", 500)
    .attr("cy", 45)
    .attr("r", 6)
    .style("fill", "blue");
  svg
    .append("circle")
    .attr("cx", 500)
    .attr("cy", 75)
    .attr("r", 6)
    .style("fill", "yellow");
  svg
    .append("text")
    .attr("x", 520)
    .attr("y", 15)
    .text("Google")
    .style("fill", "white")
    .style("font-size", "15px")
    .style("font-weight", "bold")
    .attr("alignment-baseline", "middle");
  svg
    .append("text")
    .attr("x", 520)
    .attr("y", 45)
    .text("Microsoft")
    .style("fill", "white")
    .style("font-size", "15px")
    .style("font-weight", "bold")
    .attr("alignment-baseline", "middle");
  svg
    .append("text")
    .attr("x", 520)
    .attr("y", 75)
    .text("Amazon")
    .style("fill", "white")
    .style("font-size", "15px")
    .style("font-weight", "bold")
    .attr("alignment-baseline", "middle");
});
