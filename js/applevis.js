class AppleVis {
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.filteredData = this.data;

        this.initVis();
    }

    initVis() {
        let vis = this;

        const element = document.getElementById(vis.parentElement);
        // Set the dimensions and margins
        vis.margin = { top: 60, right: 100, bottom: 80, left: 100 };
        vis.width = element.offsetWidth - vis.margin.left - vis.margin.right;
        vis.height = 500 - vis.margin.top - vis.margin.bottom;

        // Append the svg object
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // Prepare the data
        vis.preparedData = vis.prepareData();

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
        vis.y.domain([0, d3.max(vis.preparedData, d => d3.max(d.series, s => s.TransistorCount))]).nice();

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
            .attr("x", -200)
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .style("font-size", "14px")
            .style("fill", "#94A3B8")
            .text("Transistor Count (Billions)");

            

        // Append a title to the SVG container
        vis.svg.append("text")
            .attr("class", "chart-title")
            .attr("x", vis.width / 2)
            .attr("y", -40)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .style("font-weight", "bold")
            .style("fill", "white")
            .text("Apple M Series (ARM Architecture) Chips");

        vis.wrangleData();
    }

    prepareData() {
        let vis = this;

        // Group data by Version
        let groupedData = d3.group(vis.data, d => d['Version']);

        // Create a new array structure for the grouped data
        let preparedData = Array.from(groupedData, ([Version, series]) => {
            return {
                Version: Version,
                series: series.map(d => ({
                    ChipSeries: d['Chip Series'],
                    TransistorCount: +d['Transistor Count'],
                    Version
                })),
            };
        });

        return preparedData;
    }

    wrangleData() {
        let vis = this;

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Create a color scale for different versions
        vis.colorScale = d3.scaleOrdinal()
            .domain(vis.data.map(d => d.Version))
            .range(d3.schemeTableau10);

        // Draw the bars
        vis.versionGroups = vis.svg.selectAll(".versionGroup")
            .data(vis.preparedData)
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
            .style("font-weight", "bold");
    }
}