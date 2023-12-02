class ScatterVis {
    constructor(_parentElement, _data, _mooreData) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.filteredData = this.data;
        this.mooreData = _mooreData;

        this.initVis();
    }

    initVis() {
        let vis = this;

        const element = document.getElementById(vis.parentElement);
        // Set dimensions and margins
        vis.margin = {top: 100, right: 100, bottom: 100, left: 100};
        vis.width = element.offsetWidth - vis.margin.left - vis.margin.right;
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
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(d3.axisBottom(vis.x));

        // Add X axis label
        vis.svg.append("text")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 40)
            .style("font-weight", "bold")
            .style("font-size", "14px")
            .style("text-anchor", "middle")
            .style("fill", "#94A3B8")
            .text("Year");

        // Add Y axis
        vis.y = d3.scaleLinear()
            .domain([0, d3.max(vis.filteredData, d => d.TransistorCount) + 5000000000])
            .range([vis.height, 0]);

        let yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(vis.y).tickFormat(d => `${d / 1e9} B`));

        // Add Y axis label
        vis.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -60)
            .attr("x", -200)
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .style("font-size", "14px")
            .style("fill", "#94A3B8")
            .text("Transistors (billion)");

        // Add title
        vis.svg.append("text")
            .attr("x", vis.width / 2)
            .attr("y", -80)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .style("font-weight", "bold")
            .style("fill", "white")
            .attr("class", "font-mono")
            .text("Apple leads in CPU Transistor Design");

        // Add subtitle
        vis.svg.append("text")
            .attr("x", vis.width / 2)
            .attr("y", -50)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("fill", "#94A3B8")
            .text("The number of transistors on integrated circuits has doubled approximately every two years");

        // Add event listener to the Highlight dropdown
        d3.select("#keyCompany").on("change", function() {
            vis.selectedDesigner = this.value;
            vis.wrangleData();
        });

        // Add event listener to the Filter dropdown
        d3.select("#microType").on("change", function() {
            vis.selectedType = this.value;
            vis.wrangleData();
        });

        vis.selectedDesigner = "Apple"; // Set the initial selected designer

        vis.selectedType = "All"; // Set the initial selected designer

        vis.tooltip = d3.select("body").append("div") 
            .attr("class", "tooltip")    
            .attr("id", "chip-tooltip")   
            .style("opacity", 0);

        // Define a clip path
        vis.svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", vis.width + 10)
            .attr("height", vis.height + 10);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Filter data based on the selected processor type
        let typeFilteredData = vis.data.filter(d => {
            return vis.selectedType === "All" || !vis.selectedType || d.Type === vis.selectedType;
        });

        // Calculate the year range for the selected designer
        if (vis.selectedDesigner !== "All") {
            let designerData = typeFilteredData.filter(d => d.Designer === vis.selectedDesigner);
            vis.designerYearExtent = d3.extent(designerData, d => d.Year);
            // Optional: Expand the range slightly for better visualization
            vis.designerYearExtent[0] = new Date(vis.designerYearExtent[0].getFullYear() - 1, 0);
            vis.designerYearExtent[1] = new Date(vis.designerYearExtent[1].getFullYear() + 1, 0);
        } else {
            vis.designerYearExtent = d3.extent(typeFilteredData, d => d.Year);
        }

        // Apply type filter to the main data
        vis.filteredData = typeFilteredData;

        // Filter data based on the selected type and designer year extent
        vis.filteredData = typeFilteredData.filter(d => {
            return d.Year >= vis.designerYearExtent[0] && d.Year <= vis.designerYearExtent[1];
        });

        // Check if filteredData is empty
        if (vis.filteredData.length === 0) {
            // Update x-axis range to that of the selected designer's data
            vis.x.domain(vis.designerYearExtent);

            // Filter all original data to the selected designer's year range
            vis.filteredData = vis.data.filter(d => {
                return d.Year >= vis.designerYearExtent[0] && d.Year <= vis.designerYearExtent[1];
            });
        }

        // Filter mooreData based on the designer year range
        vis.filteredMooreData = vis.mooreData.filter(d => {
            return d.Year >= vis.designerYearExtent[0] && d.Year <= vis.designerYearExtent[1];
        });

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Add the Moore's Law line
        let line = d3.line()
            .x(d => vis.x(d.Year))
            .y(d => vis.y(d.TransistorCount))
            // .curve(d3.curveMonotoneX);

        // Update x and y scale domains
        vis.x.domain(vis.selectedDesigner !== "All" ? vis.designerYearExtent : d3.extent(vis.data, d => d.Year));
        vis.y.domain([0, d3.max(vis.data, d => d.TransistorCount) + 5000000000]);


        // Update the x-axis with the new scale
        vis.svg.select(".x-axis")
            // .transition()
            // .duration(1000)
            // .attr("clip-path", "url(#clip)")
            .call(d3.axisBottom(vis.x));

         // Update the Moore's Law line
        let mooreLine = vis.svg.selectAll(".moore-line")
            .data([vis.filteredMooreData]); // Binding data as an array of one element

        // Enter + Update
        mooreLine.enter()
            .append("path")
            .attr("class", "moore-line")
            .merge(mooreLine)
            .attr("fill", "none")
            .attr("stroke", "#a855f7")
            .attr("stroke-width", 3)
            .attr("d", line)
            // Set the initial stroke dash array and offset
            .attr("stroke-dasharray", function() {
                var totalLength = this.getTotalLength();
                return totalLength + " " + totalLength;
            })
            .attr("stroke-dashoffset", function() {
                return this.getTotalLength();
            })
            // Animate the line drawing
            .transition()
            .duration(1500)
            .attr("stroke-dashoffset", 0);

        mooreLine.exit().remove();

        // Add dots
        vis.dots = vis.svg.selectAll("circle")
            .data(vis.filteredData)

        vis.dots.enter()
            .append("circle")
            // .attr("clip-path", "url(#clip)")
            .merge(vis.dots)
            .attr("cx", d => vis.x(d.Year))
            .attr("cy", vis.height)
            .attr("r", 7)
            .style('stroke', 'white')
            .attr("class", d => d.Designer === vis.selectedDesigner ? "selected" : "pointer-events-none")
            .style("opacity", d => d.Designer === vis.selectedDesigner ? ".99" : ".22")
            .style("fill", d => d.Designer === vis.selectedDesigner ? "#ff7f0e" : "#1f77b4")
            .style("stroke", "white")
            .attr('stroke-width', 2)
            .on("mouseover", function(event, d) {
                if (d.TransistorCount > 1e9) {

                }
                const trans = d.value / 1e9
                vis.tooltip.transition()    
                    .duration(200)    
                    .style("opacity", 1); 
                       
                vis.tooltip.html(
                    `<span class="text-lg font-bold text-slate-700">${d.Designer}</span><<br/>
                    <span class="text-base font-medium text-slate-500">Processor: 
                        <span class="text-slate-600 font-bold">${d.Processor}</span>
                    </span><br/>
                    <span class="text-base font-medium text-slate-500">Type: 
                        <span class="text-slate-600 font-bold">${d.Type}</span>
                    </span><br/>
                    <span class="text-base font-medium text-slate-500">Transistors: 
                        <span class="text-slate-600 font-bold">${d3.format(".4s")(d.TransistorCount)}</span>
                    </span><br/>
                    <span class="text-base font-medium text-slate-500">Year: 
                        <span class="text-slate-600 font-bold">${d.Year.getFullYear()}</span>
                    </span><br/>`
                )  
                .style("left", (event.pageX + 20) + "px")   
                .style("top", (event.pageY - 20) + "px");  
            })          
            .on("mouseout", function(d) {   
                vis.tooltip.transition()    
                    .duration(500)    
                    .style("opacity", 0); 
            })
            .transition()
            .duration(1000)
            .attr("cy", d => vis.y(d.TransistorCount));
            // .style("stroke", d => d.Designer === vis.selectedDesigner ? "#ff7f0e" : "white");

        vis.dots.exit().remove();

        vis.svg.select(".legend").remove(); // Remove the existing legend
        vis.createLegend(vis.selectedDesigner); // Create a new legend with the selected designer

    }

    createLegend(selectedDesigner) {
        let vis = this;

        // Legend
        let legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(0," + (vis.height + 80) + ")");

        vis.legendData = [];

        if (vis.selectedDesigner !== "All") {
            vis.legendData = [
                { type: "line", color: "#a855f7", text: "Moore's Law" },
                { type: "circle", color: "#ff7f0e", text: `${selectedDesigner} Design` },
                { type: "circle", color: "#1f77b4", text: "Other Designer" }
            ];
        } else {
            // if (vis.selectedType === "CPU") {
            //     vis.legendData = [
            //         { type: "line", color: "#a855f7", text: "Moore's Law" },
            //         { type: "circle", color: "#1f77b4", text: "CPU" }
            //     ];
            // } else {
            //     vis.legendData = [
            //         { type: "line", color: "#a855f7", text: "Moore's Law" },
            //         { type: "circle", color: "#1f77b4", text: "GPU" }
            //     ];
            // }

            vis.legendData = [
                { type: "line", color: "#a855f7", text: "Moore's Law" },
                { type: "circle", color: "#1f77b4", text: "Mircoprocessor" }
            ];
            
        }
    
        // Create legend items
        vis.legendData.forEach(function (item, index) {
            let legendItem = legend.append("g")
                .attr("transform", "translate(" + index * 220 + ", 0)");

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
                    .attr("r", 7)
                    .attr("stroke", "white")
                    .style("fill", item.color);
            }

            legendItem.append("text")
                .attr("x", 30)
                .attr("y", 15)
                .text(item.text)
                .style("font-size", "16px")
                .style("fill", "white")
                .style("font-weight", "bold");
        });
    }
}