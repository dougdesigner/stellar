class AppleVis {
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.filteredData = [];

        this.initVis();
    }

    initVis() {
        let vis = this;

        const element = document.getElementById(vis.parentElement);
        // Set the dimensions and margins
        vis.margin = { top: 100, right: 20, bottom: 80, left: 100 };
        vis.width = element.offsetWidth - vis.margin.left - vis.margin.right;
        vis.height = 500 - vis.margin.top - vis.margin.bottom;

        // Append the svg object
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // Scales for the grouped bar chart
        vis.x0 = d3.scaleBand()
            .rangeRound([0, vis.width])
            .paddingInner(0.1);

        vis.x1 = d3.scaleBand()
            .padding(0.05);

        vis.y = d3.scaleLinear()
            .rangeRound([vis.height, 0]);

        // Set versions as the main category
        vis.x0.domain(vis.data.map(d => d.Version));
        vis.x1.domain(vis.data.map(d => d['Chip Series'])).rangeRound([0, vis.x0.bandwidth()]);

        // Add the x-axis
        vis.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${vis.height})`)
            .call(d3.axisBottom(vis.x0));

        vis.svg.append("text")
            .attr("class", "axis-label")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 40)
            .style("text-anchor", "middle")
            .style("font-size", "14px")
            .style("fill", "black")
            .style("font-weight", "bold")
            .style("fill", "#94A3B8")
            .text("Chip Version");

        // Add the y-axis
        vis.svg.append("g")
            .call(d3.axisLeft(vis.y).tickFormat(d => `${d / 1e9} B`))
            .append("text")
            .attr("x", 2)
            .attr("y", vis.y(vis.y.ticks().pop()) + 0.5);

            // Add Y axis label
        vis.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -60)
            .attr("x", -140)
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .style("font-size", "14px")
            .style("fill", "#94A3B8")
            .text("Transistor Count (Billions)");

        // Append a title to the SVG container
        vis.svg.append("text")
            .attr("class", "chart-title")
            .attr("x", vis.width / 2)
            .attr("y", -80)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .style("font-weight", "bold")
            .style("fill", "white")
            .text("Apple M Series (ARM Architecture) Chips");

        vis.sort = "byVersion"; // Set the initial view

        // Add event listener for the "Sort by Version" radio button
        d3.select('#byVersion').on('change', function() {
            if (this.checked) {
                vis.sort = "byVersion";
                vis.wrangleData();
            }
        });

        // Add event listener for the "Sort by Release Date" radio button
        d3.select('#byDate').on('change', function() {
            if (this.checked) {
                vis.sort = "byDate";
                vis.wrangleData();
            }
        });

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Group data by Version
        let groupedData = d3.group(vis.data, d => d['Version']);
                // Create a new array structure for the grouped data
        vis.filteredData = Array.from(groupedData, ([Version, series]) => {
            return {
                Version: Version,
                series: series.map(d => ({
                    ChipSeries: d['Chip Series'],
                    TransistorCount: +d['Transistor Count'],
                    Version
                })),
            };
        });
     
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.y.domain([0, d3.max(vis.filteredData, d => d3.max(d.series, s => s.TransistorCount))]).nice();

        // Create a color scale for different versions
        vis.colorScale = d3.scaleOrdinal()
            .domain(vis.data.map(d => d.Version))
            .range(d3.schemeTableau10);

        // Draw the bars
        vis.versionGroups = vis.svg.selectAll(".versionGroup")
            .data(vis.filteredData)
            .enter().append("g")
            .attr("class", "versionGroup")
            .attr("transform", d => `translate(${vis.x0(d.Version)},0)`);

        vis.versionGroups.selectAll("rect")
            .data(d => d.series)
            .enter().append("rect")
            .attr("x", d => vis.x1(d.ChipSeries))
            .attr("y", d => vis.y(d.TransistorCount))
            .attr("width", vis.x1.bandwidth())
            .attr("height", d => vis.height - vis.y(d.TransistorCount))
            .style("fill", d => vis.colorScale(d.Version));

        // Add text labels above each bar
        vis.versionGroups.selectAll(".chipSeriesLabel")
            .data(d => d.series)
            .enter().append("text")
            .attr("class", "chipSeriesLabel")
            .text(d => d.ChipSeries)
            .attr("x", d => vis.x1(d.ChipSeries) + vis.x1.bandwidth() / 2)
            .attr("y", d => vis.y(d.TransistorCount) - 5)
            .attr("text-anchor", "middle")
            .style("fill", "#000")
            .style("font-size", "16px")
            .style("fill", "white")
            .style("font-weight", "medium");

        vis.createLegend();
    }

    createLegend() {
        let vis = this;

        // Define legend dimensions and position
        const legendSpacing = 120; // Increased spacing for horizontal layout
        const legendRectSize = 18;
        const legendX = 40; // Horizontal position
        const legendY = vis.height + 60; // Vertical position below the chart

        // Create legend group
        const legend = vis.svg.selectAll('.legend')
            .data(vis.colorScale.domain())
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', (d, i) => `translate(${legendX + i * legendSpacing}, ${legendY})`);

        // Add colored rectangles to legend
        legend.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', legendRectSize)
            .attr('height', legendRectSize)
            .attr('rx','6')
            .style('fill', vis.colorScale);

        // Add text labels to legend
        legend.append('text')
            .attr('x', legendRectSize + 5)
            .attr('y', legendRectSize / 2 + 2)
            .text(d => d)
            .style('text-anchor', 'start')
            .style('font-size', '16px')
            .attr('class', 'fill-slate-50 font-bold')
            .style('alignment-baseline', 'middle');
    }
}