class StackedAreaVis {
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.filteredData = this.data;

        this.initVis();
    }

    initVis() {
        let vis = this;

        const element = document.getElementById(vis.parentElement);
        // Set dimensions and margins
        vis.margin = { top: 140, right: 100, bottom: 100, left: 100 };
        vis.width = element.offsetWidth - vis.margin.left - vis.margin.right;
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

        // Append SVG object
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Create scales
        vis.x = d3.scalePoint().range([0, vis.width]);
        vis.y = d3.scaleLinear().range([vis.height, 0]);

        // Assuming your data is time-based and Quarter is a Date object
        // vis.x = d3.scaleTime().range([0, vis.width]);

        // Group data by quarter and reshape for stacking
        vis.dataByQuarter = Array.from(d3.group(vis.data, d => d.Quarter))
            .map(([quarter, values]) => {
                let obj = { Quarter: quarter };
                values.forEach(v => {
                    obj[v.Company] = +v.RoundRevenue;
                });
                return obj;
            });

        // Set x-domain and stack keys
        vis.x.domain(vis.data.map(d => d.Quarter));
        vis.stack = d3.stack().keys(['Amazon', 'Microsoft', 'Google']);

        // Stack data
        vis.stackedData = vis.stack(vis.dataByQuarter);

        // Set y-domain
        vis.y.domain([0, d3.max(vis.stackedData, d => d3.max(d, d => d[1]))]);
        

        // Add X axis label
        vis.svg.append("text")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 60)
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .style("font-size", "14px")
            .style("fill", "#94A3B8")
            .text("Quarter");

        // Add Y axis label
        vis.svg.append("text")
            .attr("class", "y-label")
            .attr("transform", "rotate(-90)")
            .attr("y", -60)
            .attr("x", -vis.height / 2)
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .style("font-size", "14px")
            .style("fill", "#94A3B8")
            .text("Revenue (billions)");

        // Add axes groups
        vis.svg.append("g")
            .attr("class", "y-axis")

        vis.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${vis.height})`);

            // Add title
        vis.svg.append("text")
        .attr("x", 0)
        .attr("y", -80)
        .attr("text-anchor", "left")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .style("fill", "white")
        .attr("class", "font-mono")
        .text("Total Cloud Revenue Continues to Grow");

        // Add subtitle
        vis.svg.append("text")
            .attr("x", 0)
            .attr("y", -50)
            .attr("text-anchor", "left")
            .style("font-size", "16px")
            .style("fill", "#94A3B8")
            .text("Over 40 billion in total revenue the last two quarters");



        

        // init brush
        vis.brush = d3.brushX()
            .extent([[0, 0], [vis.width, vis.height]])
            .on("end", function (event) {
                const selection = event.selection;

                // If the selection is null, the brush has been cleared
                if (!selection) {
                    // Handle the removal of the brush
                    console.log("Brush has been removed");

                    // Call any function or perform actions needed when brush is cleared
                    // For example, resetting the visualization
                    selectedQuarterRange = [];
                    lineVis.wrangleData();
                    drbVisAWS.wrangleData();
                    drbVisAzure.wrangleData();
                    drbVisGC.wrangleData();
                    } else {
                        // Map pixel coordinates to quarters
                    const [x0, x1] = selection.map(d => {
                        // Find the closest quarter for each end of the brush
                        return vis.x.domain().reduce((prev, curr) => {
                            return (Math.abs(vis.x(curr) - d) < Math.abs(vis.x(prev) - d) ? curr : prev);
                        });
                    });
                    selectedQuarterRange = [x0, x1];
                    lineVis.wrangleData();
                    drbVisAWS.wrangleData();
                    drbVisAzure.wrangleData();
                    drbVisGC.wrangleData();
                    }
                
            });


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

        // Define the area generator
        var area = d3.area()
            .x(d => vis.x(d.data.Quarter)) // Center the area in the band
            .y0(d => vis.y(d[0]))
            .y1(d => vis.y(d[1]));

        // Bind data to the stack
        let areas = vis.svg.selectAll(".stack")
            .data(vis.stackedData);

        // Enter selection
        areas.enter().append("path")
            .attr("class", "stack")
            .attr("fill", d => colorScale(d.key))
            .attr("d", area);

        // Update selection
        areas.transition()
            .duration(1000)
            .attr("d", area)
            ;

        // Exit selection
        areas.exit().remove();

        // Call axes
        vis.svg.select(".x-axis")
        .transition()
        .duration(1000)
        .call(d3.axisBottom(vis.x))
        .selectAll("text")
            .attr("font-size", "12px")
            .style("text-anchor", "end") // Anchors text at the end
            .attr("dx", "-.8em") // Adjust distance from the tick
            .attr("dy", ".15em") // Adjust vertical position
            .attr("transform", "rotate(-45)"); // Rotate the text


        vis.svg.select(".y-axis")
            .transition()
            .duration(1000)
            .call(d3.axisLeft(vis.y).tickFormat(d => `$${d} B`)
            .ticks(5)
            .tickSize(-vis.width) // Extend the ticks to create grid lines
            )
        .call(g => g.selectAll(".tick line") // Style the grid lines
            .attr("stroke-opacity", 0.5))
            .attr("stroke", "#94A3B8")
        .call(g => g.select(".domain").remove()) // Optional: Remove the axis line
        .call(g => g.selectAll(".tick text") // Style the tick texts
            .attr("x", -10)
            // .attr("dy", -4)
        );

        // init brushGroup:
        vis.brushGroup = vis.svg.append("g")
            .attr("class", "brush");

        vis.brushGroup
            .call(vis.brush);


        }

}
