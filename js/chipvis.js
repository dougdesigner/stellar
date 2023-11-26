class ChipVis {
    constructor(_parentElement, _data, _mooreData) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.filteredData = this.data;
        this.mooreData = _mooreData;

        this.initVis();
    }

    initVis() {
        let vis = this;

        // Set dimensions and margins
        vis.margin = {top: 100, right: 30, bottom: 60, left: 120};
        vis.width = 800 - vis.margin.left - vis.margin.right;
        vis.height = 600 - vis.margin.top - vis.margin.bottom;

        // Append SVG object
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Add X axis
        vis.x = d3.scaleTime()
            .domain(d3.extent(vis.filteredData, d => d.Year))
            .range([0, vis.width]);

        let xAxisGroup = vis.svg.append("g")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(d3.axisBottom(vis.x));

        // Add X axis label
        vis.svg.append("text")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 35)
            .style("font-weight", "bold")
            .style("font-size", "12px")
            .style("text-anchor", "middle")
            .style("fill", "white")
            .text("Year");

        // Add Y axis
        vis.y = d3.scaleLinear()
            .domain([0, d3.max(vis.filteredData, d => d.TransistorCount)])
            .range([vis.height, 0]);

        let yAxisGroup = vis.svg.append("g")
            .call(d3.axisLeft(vis.y).tickFormat(d => `${d / 1e9} B`));

        // Add Y axis label
        vis.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -60)
            .attr("x", -200)
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .style("font-size", "12px")
            .style("fill", "white")
            .text("Transistor Count (Billions)");

        // Add title
        vis.svg.append("text")
            .attr("x", vis.width / 2)
            .attr("y", -80)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .style("font-weight", "bold")
            .style("fill", "white")
            .text("Moore's Law: Transistors per Microprocessor Doubles every Two Years");

        // Add subtitle
        vis.svg.append("text")
            .attr("x", vis.width / 2)
            .attr("y", -60)
            .attr("text-anchor", "middle")
            .style("font-size", "10px")
            .style("fill", "whitesmoke")
            .text("Moore's law: The empirical regularity that the number of transistors on integrated circuits doubles approximately every two years.");

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Add the Moore's Law line
        let line = d3.line()
            .x(d => vis.x(d.Year))
            .y(d => vis.y(d.TransistorCount))
            .curve(d3.curveMonotoneX);

        vis.svg.append("path")
            .datum(vis.mooreData)
            .attr("fill", "none")
            .attr("stroke", "#a855f7")
            .attr("stroke-width", 3)
            .attr("d", line);

        // Add dots
        vis.svg.append('g')
            .selectAll("dot")
            .data(vis.filteredData)
            .enter()
            .append("circle")
            .attr("cx", d => vis.x(d.Year))
            .attr("cy", d => vis.y(d.TransistorCount))
            .attr("r", 5)
            .style('stroke', 'white')
            .style("opacity", d => d.Designer === "Apple" ? "1" : ".25")
            .style("fill", d => d.Designer === "Apple" ? "#ff7f0e" : "#7f7f7f");

        // Legend
        let legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(0," + (vis.height + 40) + ")");

        // Data for the legend
        let legendData = [
            { type: "line", color: "#a855f7", text: "Moore's Law" },
            { type: "circle", color: "#ff7f0e", text: "Apple Microprocessor" },
            { type: "circle", color: "#7f7f7f", text: "Other Designer" }
        ];

        // Create legend items
        legendData.forEach(function (item, index) {
            let legendItem = legend.append("g")
                .attr("transform", "translate(" + index * 200 + ", 0)");

            // Check the type of legend item
            if (item.type === "line") {
                // Line for Moore's Law
                legendItem.append("line")
                    .attr("x1", 0)
                    .attr("x2", 20)
                    .attr("y1", 10)
                    .attr("y2", 10)
                    .style("stroke", item.color)
                    .style("stroke-width", 3);
            } else if (item.type === "circle") {
                // Circle for Microprocessors
                legendItem.append("circle")
                    .attr("cx", 10)
                    .attr("cy", 10)
                    .attr("r", 5)
                    .style("fill", item.color);
            }

            legendItem.append("text")
                .attr("x", 30)
                .attr("y", 15)
                .text(item.text)
                .style("font-size", "12px")
                .style("fill", "white")
                .style("font-weight", "bold");
        });

    }
}