class DonutChart {
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.displayData = [];

        this.initVis();
    }

    initVis() {
        let vis = this;

        // Set dimensions and margins
        vis.margin = { top: 160, right: 20, bottom: 60, left: 20 };
        vis.width = 800 - vis.margin.left - vis.margin.right;
        vis.height = 600 - vis.margin.top - vis.margin.bottom;
        vis.radius = Math.min(vis.width, vis.height) / 2;

        // Append SVG object
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.width / 2 + vis.margin.left}, ${vis.height / 2 + vis.margin.top})`);

        // Pie generator
        vis.pie = d3.pie()
            .value(d => d.proportionalPercentage);

        // Arc generator
        vis.arc = d3.arc()
            .innerRadius(vis.radius * 0.4)
            .outerRadius(vis.radius * 0.8);

        // Tooltip
        vis.tooltip = vis.svg.append("div") 
            .attr("class", "tooltip")       
            .style("opacity", 0);
        
        // Append Title
        vis.svg.append("text")
            .attr("x", 0)
            .attr("y", -vis.height / 2 - 100 )
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .style("font-weight", "bold")
            .style("fill", "white")
            .text("The 'Magnificent 7' of the S&P 500");

        // Append Subtitle
        vis.svg.append("text")
            .attr("x", 0)
            .attr("y", -vis.height / 2 - 70)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("fill", "white")
            .text("Percentage of Apple, Microsoft, Alphabet, Amazon, NVIDIA, Tesla, and Meta");

        // Append central label
        vis.svg.append("text")
            .attr("class", "center-label")
            .attr("text-anchor", "middle")
            .attr("dy", ".5em")  // Adjust for vertical alignment
            // .attr("dy", "-0.5em")  // Adjust for vertical alignment
            // .style("font-size", "20px")  // Adjust font size as needed
            .style("font-weight", "bold")
            .style("fill", "white")
            .text("S&P 500");

        // Append central subtitle
        // vis.svg.append("text")
        //     .attr("class", "center-subtitle")
        //     .attr("text-anchor", "middle")
        //     .attr("dy", "1.25em")  // Adjust for vertical alignment
        //     .style("font-size", "18px")  // Adjust font size as needed
        //     .style('fill', 'whitesmoke')
        //     .style('font-weight', 'bold')
        //     .text("29%");

        // Update chart with data
        vis.wrangleData('allSP500');
    }

    wrangleData(selectedOption) {
        let vis = this;

        if (selectedOption === 'allSP500') {
            vis.displayData = vis.data; // Full dataset
            vis.svg.select('.center-label')
                .text("S&P 500");

            // Calculate proportional percentage for each data item
            vis.displayData.forEach(d => {
                d.proportionalPercentage = d.Percentage.replace('%', '') / 100;
            });

        } else if (selectedOption === 'onlyM7') {
            // Filter out the largest value
            const largestValue = Math.max(...vis.data.map(d => parseFloat(d.Percentage.replace('%', ''))));
            vis.displayData = vis.data.filter(d => parseFloat(d.Percentage.replace('%', '')) !== largestValue);
            vis.svg.select('.center-label')
                .text("Magnificent 7");

            // Calculate the total sum of percentages
            const totalPercentage = vis.displayData.reduce((sum, d) => sum + parseFloat(d.Percentage.replace('%', '')), 0);

            // Calculate proportional percentage for each data item
            vis.displayData.forEach(d => {
                d.proportionalPercentage = parseFloat((d.Percentage.replace('%', '')) / totalPercentage).toFixed(2);
            });
        }

        console.log(vis.displayData);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Bind data to path elements
        let arcs = vis.svg.selectAll('path')
            .data(vis.pie(vis.displayData), d => d.data.Company);


        arcs.enter()
            .append('path')
            .attr('fill', (d, i) => d3.schemeCategory10[i % 10]) // Change color scheme if needed
            .attr('stroke', 'white')
            .style('stroke-width', '2px')
            .each(function(d) { 
                // Initialize new arcs with a start and end angle of zero
                this._current = { startAngle: 0, endAngle: 0 }; 
            })
            .merge(arcs)
            // .on("mouseover", function(event, d) {
            //     vis.tooltip.transition()    
            //         .duration(200)    
            //         .style("opacity", 1);    
            //     vis.tooltip.html(
            //         `<strong>${d.data.Company}</strong><br/>
            //         Percentage: ${d.data.Percentage}<br/>
            //         Market Cap: ${d.data.MarketCap}<br/>
            //         Return (YTD): ${d.data.ReturnYTD}`
            //     )  
            //     .style("left", (event.pageX) + "px")   
            //     .style("top", (event.pageY - 28) + "px");  
            // })          
            // .on("mouseout", function(d) {   
            //     vis.tooltip.transition()    
            //         .duration(500)    
            //         .style("opacity", 0); 
            // })
            .transition()
            .duration(1000) // Duration of the transition
            .attrTween('d', function(d) {
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    return vis.arc(interpolate(t));
                };
            });
        
        // Exit selection
        arcs.exit().remove();

        // Arc tween function for animation
        function arcTween(d) {
            var i = d3.interpolate(this._current, d);
            this._current = i(0);
            return function(t) { 
                return vis.arc(i(t)); 
            };
        }

        // Define an outer arc for label lines
        const outerArc = d3.arc()
            .innerRadius(vis.radius * .9)  // Increased radius for label separation
            .outerRadius(vis.radius * 1.25);

        const midAngle = d => d.startAngle + (d.endAngle - d.startAngle) / 2;

        // Handle label lines
        let labelLines = vis.svg.selectAll('polyline')
            .data(vis.pie(vis.displayData), d => d.data.Company);

        labelLines.enter()
            .append('polyline')
            .merge(labelLines)
            .style('opacity', 0)
            .attr('points', d => {
                const pos = outerArc.centroid(d);
                pos[0] = vis.radius * (midAngle(d) < Math.PI ? 0.9 : -0.9); // Adjusted multiplier for x-coordinate
                return [vis.arc.centroid(d), outerArc.centroid(d), pos]; // Use pos directly as the endpoint
            })
            .style('fill', 'none')
            .style('stroke', (d, i) => d3.schemeCategory10[i % 10])
            .style('stroke-width', 1.5)
            .transition()
            .duration(2000)
            .style('opacity', 0.3); // duration of the initial loading animation;

        labelLines.exit().remove();

        // Handle company name labels (title)
        let labels = vis.svg.selectAll('text.label-title')
            .data(vis.pie(vis.displayData), d => d.data.Company);

        labels.enter()
            .append('text')
            .attr('class', 'label-title')
            .merge(labels)
            .style('opacity', 0)
            .attr('transform', d => {
                const pos = outerArc.centroid(d);
                return `translate(${pos[0]}, ${pos[1]})`;
            })
            .attr('dy', '0.35em')
            .style('text-anchor', d => midAngle(d) < Math.PI ? 'start' : 'end')
            .style('font-weight', 'bold')
            .style('fill', 'whitesmoke')
            .text(d => `${Number((d.data.proportionalPercentage * 100).toFixed(2))}%`)
            .transition()
            .duration(1200) // duration of the initial loading animation
            .style('opacity', 1);

        labels.exit().remove();

        // Handle percentage labels (subtitle)
        let subLabels = vis.svg.selectAll('text.label-subtitle')
            .data(vis.pie(vis.displayData), d => d.data.Company);

        subLabels.enter()
            .append('text')
            .attr('class', 'label-subtitle')
            .merge(subLabels)
            .style('opacity', 0)
            .attr('transform', d => {
                const pos = outerArc.centroid(d);
                return `translate(${pos[0]}, ${pos[1] + 20})`;
            })
            .attr('dy', '0.35em')
            .style('text-anchor', d => midAngle(d) < Math.PI ? 'start' : 'end')
            .style('font-size', '8px')
            .style('fill', 'whitesmoke')
            .style('font-weight', 'bold')
            .text(d => d.data.Company)
            .transition()
            .duration(1600) // duration of the initial loading animation
            .style('opacity', 1);

        subLabels.exit().remove();

    }


}
