class StackedBarVis {
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.filteredData = this.data; // Assuming the data is formatted as required

        this.initVis();
    }

    initVis() {
        let vis = this;

        const element = document.getElementById(vis.parentElement);
        // Set dimensions and margins
        vis.margin = { top: 60, right: 140, bottom: 40, left: 100 };
        vis.width = element.offsetWidth - vis.margin.left - vis.margin.right;
        vis.height = 240 - vis.margin.top - vis.margin.bottom;

        // Append SVG object
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Create scales
        vis.x = d3.scaleBand().range([0, vis.width]).padding(0.25);
        vis.y = d3.scaleLinear().range([vis.height, 0]);

        // Group data by quarter and reshape for stacking
        let dataByQuarter = Array.from(d3.group(vis.data, d => d.Quarter))
            .map(([quarter, values]) => {
                let obj = { Quarter: quarter };
                values.forEach(v => {
                    obj[v.Company] = v['Market Share'];
                });
                return obj;
            });

        // Set x-domain and stack keys
        vis.x.domain(dataByQuarter.map(d => d.Quarter));
        vis.stack = d3.stack().keys(['Amazon', 'Microsoft', 'Google']);

        // Stack data
        vis.stackedData = vis.stack(dataByQuarter);

        // Add X axis label
        vis.svg.append("text")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 40)
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .style("font-size", "14px")
            .style("fill", "#94A3B8")
            .text("Quarter");

        // // Add Y axis label
        // vis.svg.append("text")
        //     .attr("class", "y-label")
        //     .attr("transform", "rotate(-90)")
        //     .attr("y", -60)
        //     .attr("x", -vis.height / 2)
        //     .style("text-anchor", "middle")
        //     .style("font-weight", "bold")
        //     .style("font-size", "14px")
        //     .style("fill", "#94A3B8")
        //     .text("Market Share (%)");

        // Add axes groups
        vis.svg.append("g")
            .attr("class", "y-axis")

        vis.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${vis.height})`);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Create a color scale
        const colorScale = d3.scaleOrdinal()
            .domain(['Amazon', 'Microsoft', 'Google'])
            .range(['#FF9900', '#05A6F0', '#4285F4']); // Colors for each company

        // Bind data to stack
        let bars = vis.svg.selectAll(".stack")
            .data(vis.stackedData);

        // Enter selection
        bars.enter().append("g")
            .attr("class", "stack")
            .attr("fill", d => colorScale(d.key))
            .selectAll("rect")
            .data(d => d)
            .enter().append("rect")
                .attr("x", d => vis.x(d.data.Quarter))
                .attr("y", d => vis.y(d[1]))
                .attr("height", d => vis.y(d[0]) - vis.y(d[1]))
                .attr("width", vis.x.bandwidth());

        // Update selection
        bars.selectAll("rect")
            .data(d => d)
            .transition()
            .duration(1000)
            .attr("x", d => vis.x(d.data.Quarter))
            .attr("y", d => vis.y(d[1]))
            .attr("height", d => vis.y(d[0]) - vis.y(d[1]))
            .attr("width", vis.x.bandwidth());

        // Exit selection
        bars.exit().remove();

        // Call axes
        vis.svg.select(".x-axis")
            .call(d3.axisBottom(vis.x));

        vis.svg.select(".y-axis")
            .transition()
            .duration(1000)
            .call(d3.axisLeft(vis.y).ticks(5).tickFormat(d => `${d * 100}%`));

        // Initialize brush component
		let brush = d3.brushX()
            .extent([[0, 0], [vis.width, vis.height]])
            .on("brush", brushed);

        // Append brush component here
        vis.svg.append("g")
            .attr("class", "x brush")
            .call(brush)
            .selectAll("rect")
            .attr("y", -6)
            .attr("height", vis.height + 7);

    }

}
