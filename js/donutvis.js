class DonutChart {
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.displayData = [];

        this.initVis();
    }

    initVis() {
        let vis = this;

        const element = document.getElementById(vis.parentElement);
        // Set dimensions and margins
        vis.margin = { top: 160, right: 20, bottom: 100, left: 20 };
        // vis.width = 800 - vis.margin.left - vis.margin.right;
        vis.width = element.offsetWidth - vis.margin.left - vis.margin.right;
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
            .outerRadius(vis.radius * 0.8)
            .cornerRadius(2)
            .padAngle(.02);

        // Tooltip
        vis.tooltip = d3.select('body').append('div')
            .attr("class", "tooltip")
            .attr("id", "donut-tooltip")      
            .style("opacity", 0);
        
        // Append Title
        vis.svg.append("text")
            .attr("x", 0)
            .attr("y", -vis.height / 2 - 100 )
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .style("font-weight", "bold")
            .style("fill", "white")
            .attr('class', 'font-mono')
            .text("The 'Magnificent 7' represent >28% of the S&P 500");

        // Append Subtitle
        vis.svg.append("text")
            .attr("x", 0)
            .attr("y", -vis.height / 2 - 70)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("fill", "#94A3B8")
            .text("Share of Apple, Microsoft, Alphabet, Amazon, Nvidia, Meta, and Tesla by Market Cap");

        // Append central label
        vis.svg.append("text")
            .attr("class", "center-label fill-slate-200")
            .attr("text-anchor", "middle")
            .attr("dy", ".5em")  // Adjust for vertical alignment
            // .attr("dy", "-0.5em")  // Adjust for vertical alignment
            .style("font-size", "16px")  // Adjust font size as needed
            .style("font-weight", "bold")
            .text("S&P 500");

            
        // Append legend group to your SVG
        vis.legend = vis.svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(-${vis.width / 2}, ${vis.height / 2 + 40})`);  // Adjust this to position your legend

        // Append central subtitle
        // vis.svg.append("text")
        //     .attr("class", "center-subtitle")
        //     .attr("text-anchor", "middle")
        //     .attr("dy", "1.25em")  // Adjust for vertical alignment
        //     .style("font-size", "18px")  // Adjust font size as needed
        //     .style('fill', 'whitesmoke')
        //     .style('font-weight', 'bold')
        //     .text("29%");

        vis.sp500Filter = "allSP500"; // Set the initial view

        // Add event listeners to radio buttons
        d3.select("#allSP500").on("change", function() {
            if(this.checked) {
                vis.sp500Filter = "allSP500";
            }
            vis.wrangleData();
        });

        d3.select("#onlyM7").on("change", function() {
            if(this.checked) {
                vis.sp500Filter = "onlyM7";
            }
            vis.wrangleData();
        });
        
        // Update chart with data
        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        if (vis.sp500Filter === 'allSP500') {
            vis.displayData = vis.data; // Full dataset
            vis.svg.select('.center-label')
                .text("S&P 500");

            // Calculate proportional percentage for each data item
            vis.displayData.forEach(d => {
                d.proportionalPercentage = d.Percentage.replace('%', '') / 100;
            });

        } else if (vis.sp500Filter === 'onlyM7') {
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

        // console.log(vis.displayData);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        const companyImages = [
            { company: "Apple", imageUrl: "/images/m7/Apple.svg" },
            { company: "Microsoft", imageUrl: "/images/m7/Microsoft.svg" },
            { company: "Google", imageUrl: "/images/m7/Google-g.svg" },
            { company: "Amazon", imageUrl: "/images/m7/Amazon-a.svg" },
            { company: "Nvidia", imageUrl: "/images/m7/Nvidia-n.svg" },
            { company: "Meta", imageUrl: "/images/m7/Meta-m.svg" },
            { company: "Tesla", imageUrl: "/images/m7/Tesla-T.svg" },
            { company: "S&P 493", imageUrl: "/images/m7/S&P.svg" },
        ];

        // Bind data to path elements
        let arcs = vis.svg.selectAll('path')
            .data(vis.pie(vis.displayData), d => d.data.Company);

        // Define your array of hex colors
        const myColors = ['#000000', '#05A6F0', '#FBBC05', '#FF9900', '#77B900', '#0065E2', '#E82127', '#64748B'];

        // Create a scale
        const colorScale = d3.scaleOrdinal()
            .domain(["Apple", "Microsoft", "Google", "Amazon", "Nvidia", "Meta", "Tesla", "S&P 493"])
            .range(myColors);

        // Add donut chart arcs
        arcs.enter()
            .append('path')
            .attr('fill', (d) => colorScale(d.data.Company)) // Change color scheme if needed
            .attr('stroke', 'white')
            .style('stroke-width', '2px')
            .each(function(d) { 
                // Initialize new arcs with a start and end angle of zero
                this._current = { startAngle: 0, endAngle: 0 }; 
            })
            .merge(arcs)
            .on("mouseover", function(event, d) {
                let imageUrl = companyImages.find(img => img.company === d.data.Company).imageUrl;

                vis.tooltip.transition()    
                    .duration(200)    
                    .style("opacity", 1);    
                vis.tooltip.html(
                    `
                    <img class="tooltip-company-img" src="${imageUrl}" width="40" height="40" />
                    <span class="text-lg font-bold text-slate-700">${d.data.Company}</span><<br/>
                    <span class="text-base font-medium text-slate-500">Percentage: 
                        <span class="text-slate-600 font-bold">${Number((d.data.proportionalPercentage * 100).toFixed(2))}%</span>
                    </span><br/>
                    <span class="text-base font-medium text-slate-500">Market Cap: 
                        <span class="text-slate-600 font-bold">${d.data.MarketCap}</span>
                    </span><br/>
                    <span class="text-base font-medium text-slate-500">Return YTD: 
                        <span class="text-emerald-500 font-bold">${d.data.ReturnYTD}
                    </span>`
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
            .duration(600) // Duration of the transition
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

        // Add labels for manficent 7
        const displayLabels = vis.displayData.length === 7;

        // Define an outer arc for label lines
        const outerArc = d3.arc()
            .innerRadius(vis.radius * .8)  // Increased radius for label separation
            .outerRadius(vis.radius * 1.2);

        const midAngle = d => d.startAngle + (d.endAngle - d.startAngle) / 2;

        vis.svg.selectAll('polyline').remove();

        // Handle label lines
        let labelLines = vis.svg.selectAll('polyline')
            .data(vis.pie(vis.displayData), d => d.data.Company);

        labelLines.enter()
            .append('polyline')
            .merge(labelLines)
            .attr('points', (d, i) => {
                const outerArcPos = outerArc.centroid(d);
                const labelOffset = i % 2 * -10; // Adjusted multiplier for y-coordinate
                outerArcPos[1] += labelOffset; // Add the offset to the y-coordinate of the outerArc's position
                const pos = [ // Adjust the last point position
                    vis.radius * (midAngle(d) < Math.PI ? 1 : -1), // This keeps the x-coordinate aligned with left or right
                    outerArcPos[1] // Use the adjusted y-coordinate
                ];
                return [vis.arc.centroid(d), outerArcPos, pos];
                
            })
            .style('fill', 'none')
            .style('stroke', (d) => colorScale(d.data.Company))
            .style('stroke-width', 1.5)
            .style('opacity', 0)
            .transition()
            .duration(1000)
            .style('opacity', displayLabels ? 1 : 0);

        labelLines.exit().remove();

        // Remove existing labels
        vis.svg.selectAll('text.label-title').remove();

        // Handle company name labels (title)
        let labels = vis.svg.selectAll('text.label-title')
            .data(vis.pie(vis.displayData), d => d.data.Company);

        labels.enter()
            .append('text')
            .attr('class', 'label-title')
            .merge(labels)
            .style('opacity', 0)
            .style('text-anchor', d => midAngle(d) < Math.PI ? 'start' : 'end')
            .style('font-weight', 'bold')
            .style('font-size', '16px')
            .style('fill', 'white')
            .text(d => d.data.Company)
            .attr('transform', (d, i) => {
                const outerArcPos = outerArc.centroid(d);
                const labelOffset = i % 2 * -10; // Adjusted multiplier for y-coordinate
                outerArcPos[1] += labelOffset; // Add the offset to the y-coordinate of the outerArc's position
                const pos = [ // Adjust the last point position
                    vis.radius * (midAngle(d) < Math.PI ? 1 : -1), // This keeps the x-coordinate aligned with left or right
                    outerArcPos[1] // Use the adjusted y-coordinate
                ];
                return `translate(${pos[0]}, ${pos[1]})`;
            })
            .attr('dy', '0.35em')
            .attr('dx', d => midAngle(d) < Math.PI ? 10 : -10)
            .transition()
            .duration(1000) // duration of the initial loading animation
            .style('opacity', displayLabels ? 1 : 0);

        labels.exit().remove();

        vis.svg.selectAll('text.label-subtitle').remove();

        // Handle percentage labels (subtitle)
        let subLabels = vis.svg.selectAll('text.label-subtitle')
            .data(vis.pie(vis.displayData), d => d.data.Company);

        subLabels.enter()
            .append('text')
            .attr('class', 'label-subtitle')
            .merge(subLabels)
            .style('opacity', 0)
            .attr('transform', (d, i) => {
                const outerArcPos = outerArc.centroid(d);
                const labelOffset = i % 2 * -10; // Adjusted multiplier for y-coordinate
                outerArcPos[1] += labelOffset; // Add the offset to the y-coordinate of the outerArc's position
                const pos = [ // Adjust the last point position
                    vis.radius * (midAngle(d) < Math.PI ? 1 : -1), // This keeps the x-coordinate aligned with left or right
                    outerArcPos[1] // Use the adjusted y-coordinate
                ];
                return `translate(${pos[0]}, ${pos[1] +20})`;
            })
            .attr('dy', '0.35em')
            .attr('dx', d => midAngle(d) < Math.PI ? 10 : -10)
            .style('text-anchor', d => midAngle(d) < Math.PI ? 'start' : 'end')
            .style('font-size', '14px')
            .style('fill', 'whitesmoke')
            .style('font-weight', 'bold')
            .text(d => `${Number((d.data.proportionalPercentage * 100).toFixed(2))}%`)
            .transition()
            .duration(2000) // duration of the initial loading animation
            .style('opacity', displayLabels ? 1 : 0);

        subLabels.exit().remove();

        // Data for legend
        const legendData = vis.displayData.map(d => ({ Company: d.Company, Color: colorScale(d.Company) }));

        // Create legend items
        const legendItem = vis.legend.selectAll('.legend-item')
            .data(legendData)
            .enter()
            .append('g')
            .attr('class', 'legend-item')
            .attr('transform', (d, i) => `translate(${i * 110}, 0)`);  // Adjust spacing between legend items

        // Draw rectangles for color indicators
        legendItem.append('rect')
            .attr('width', 20)  // Size of the color box
            .attr('height', 20)
            .attr('stroke', 'white')
            .attr('rx', 5)  // Rounded corners
            .attr('fill', d => d.Color);

        // Add company names as labels
        legendItem.append('text')
            .attr('x', 25)  // Position text to the right of the color box
            .attr('y', 15)  // Adjust vertical position to align with the box
            .text(d => d.Company)
            .style('font-size', '14px')
            .attr('class', 'fill-slate-50 font-bold')
            .attr('text-anchor', 'start');
        
    }

}
