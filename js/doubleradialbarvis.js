function createRadialChart(parentElement, data) {

    const element = document.getElementById(parentElement);

    // set the dimensions and margins of the graph
    const margin = {top: 100, right: 0, bottom: 100, left: 0},
        width = element.offsetWidth - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom,
        innerRadius = 120,
        outerRadius = Math.min(width, height) / 2;   // the outerRadius goes from the middle of the SVG area to the border

    const companyImage = [
        { company: "AWS", imageUrl: "/images/m7/AWS.svg" },
        // { company: "Microsoft", imageUrl: "/images/m7/Azure.svg" },
        // { company: "Google", imageUrl: "/images/m7/GoogleCloud.svg" },
    ];

    const companyImagesLight = [
        { company: "Amazon", imageUrl: "/images/m7/AWS-light.svg" },
        { company: "Microsoft", imageUrl: "/images/m7/Azure.svg" },
        { company: "Google", imageUrl: "/images/m7/GoogleCloud.svg" },
    ];

    // Tooltip
    let tooltip = d3.select('body').append('div')
    .attr("class", "tooltip")
    .attr("id", "doubleradialbar-tooltip")      
    .style("opacity", 0);

    // append the svg object
    const svg = d3.select("#" + parentElement)
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", `translate(${width/2 + margin.left}, ${height/2 + margin.top})`);

    d3.csv(data).then( function(data) {

    data = data.filter(d => d.Company === "Amazon");

    data.forEach(d => {
        d.MarketShareValue = parseFloat(d['Market Share'].replace('%', ''));
        d.GrowthRateValue = +d['Growth Rate'].replace('%', '');
    });

    console.log(data);

    // X scale: common for 2 data series
    const x = d3.scaleBand()
        .range([0, 2 * Math.PI])    // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
        .align(0)                  // This does nothing
        .domain(data.map(d => d.Quarter)); // The domain of the X axis is the list of states.

    // Y scale outer variable
    const y = d3.scaleRadial()
        .range([innerRadius, outerRadius])   // Domain will be define later.
        .domain([0, 100]); // Domain of Y is from 0 to the max seen in the data

    // Second barplot Scales
    const ybis = d3.scaleRadial()
        .range([innerRadius, 5])   // Domain will be defined later.
        .domain([0, 100]);

    
    // Find the min and max values of MarketShareValue
    const marketShareExtent = d3.extent(data, d => d.MarketShareValue);
    const growthExtent = d3.extent(data, d => d.GrowthRateValue);


    // Create a linear scale for purple
    const purpleColorScale = d3.scaleLinear()
        .domain(marketShareExtent)
        .range(["#a855f7", "#581C87"]);
    
    purpleColorScale.range(["#581C87", "#a855f7"]);

    // Create a linear scale for emerald
    const emeraldColorScale = d3.scaleLinear()
        .domain(growthExtent)
        .range(["#34d399", "#065F46"]);

    emeraldColorScale.range(["#065F46", "#34d399"]);

    // Add the bars
    svg.append("g")
        .selectAll("path")
        .data(data)
        .join("path")
        .attr("fill", d => purpleColorScale(d.MarketShareValue))
        .attr("class", "outer-bar")
        .attr("d", d3.arc()     // imagine your doing a part of a donut plot
            .innerRadius(innerRadius)
            .outerRadius(d => y(d.MarketShareValue))
            .startAngle(d => x(d.Quarter))
            .endAngle(d => x(d.Quarter) + x.bandwidth())
            .padAngle(0.01)
            .padRadius(innerRadius))
        .on("mouseover", function(event, d) {
                // let imageUrl = companyImages.find(img => img.company === d.data.Company).imageUrl;
    
                tooltip.transition()    
                    .duration(200)    
                    .style("opacity", 1);    
                tooltip.html(
                    `
                    <img class="tooltip-company-img" src="${companyImagesLight[0].imageUrl}" width="40" height="40" />
                    <span class="text-lg font-bold text-slate-700">Amazon Web Services</span><br/>
                    <span class="text-base font-medium text-slate-500">Quarter: 
                        <span class="text-slate-600 font-bold">${d.Quarter}</span>
                    </span><br/>
                    <span class="text-base font-medium text-slate-500">Market Cap: 
                        <span class="text-slate-600 font-bold">${d['Market Share']}</span>
                    </span>
                    `
                )  
                .style("left", (event.pageX + 20) + "px")   
                .style("top", (event.pageY - 20) + "px");  
            })          
            .on("mouseout", function(d) {   
                tooltip.transition()    
                    .duration(500)    
                    .style("opacity", 0); 
            });

    // Add the labels
    svg.append("g")
        .selectAll("g")
        .data(data)
        .join("g")
            .attr("text-anchor", function(d) { return (x(d.Quarter) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
            .attr("transform", function(d) { return "rotate(" + ((x(d.Quarter) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")"+"translate(" + (y(d.MarketShareValue)+10) + ",0)"; })
        .attr("class", "outer-label")
        .append("text")
            .text(d => d['Market Share'] + " - " + d.Quarter)
            .attr("transform", function(d) { return (x(d.Quarter) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
            .style("font-size", "11px")
            .style("fill", "white")
            .attr("alignment-baseline", "middle");


    // Add the inner bars
    svg.append("g")
        .selectAll("path")
        .data(data)
        .join("path")
        .attr("class", "inner-bar")
        .attr("fill", d => emeraldColorScale(d.GrowthRateValue))
        .attr("d", d3.arc()     // imagine your doing a part of a donut plot
            .innerRadius( d => ybis(0))
            .outerRadius( d => ybis(d.GrowthRateValue))
            .startAngle(d => x(d.Quarter))
            .endAngle(d => x(d.Quarter) + x.bandwidth())
            .padAngle(0.01)
            .padRadius(innerRadius))
        .on("mouseover", function(event, d) {
            // let imageUrl = companyImages.find(img => img.company === d.data.Company).imageUrl;

            tooltip.transition()    
                .duration(200)    
                .style("opacity", 1);    
            tooltip.html(
                `
                <img class="tooltip-company-img" src="${companyImagesLight[0].imageUrl}" width="40" height="40" />
                <span class="text-lg font-bold text-slate-700">Amazon Web Services</span><br/>
                <span class="text-base font-medium text-slate-500">Quarter: 
                    <span class="text-slate-600 font-bold">${d.Quarter}</span>
                </span><br/>
                <span class="text-base font-medium text-slate-500">YoY Growth Rate: 
                    <span class="text-emerald-600 font-bold">+${d['Growth Rate']}</span>
                </span>`
            )  
            .style("left", (event.pageX + 20) + "px")   
            .style("top", (event.pageY - 20) + "px");  
        })          
        .on("mouseout", function(d) {   
            tooltip.transition()    
                .duration(500)    
                .style("opacity", 0); 
        })

    });

    // // Add a title at the center
    // svg.append("text")
    //     .attr("text-anchor", "middle")
    //     .attr("y", -20) // Adjust the position as needed
    //     .style("font-size", "24px")
    //     .style("fill", "black")
    //     .text("AWS");

    // Assuming you want to add the image of the first company in companyImage array
    if (companyImage.length > 0) {
        svg.append("image")
            .attr("xlink:href", companyImage[0].imageUrl)
            .attr("x", -40) // Adjust x, y, width, and height as needed
            .attr("y", -40)
            .attr("width", 80)
            .attr("height", 80);
    }

    const legendData = [
        { title: "Market Share", color: "#a855f7" },
        { title: "YoY Growth Rate", color: "#34d399" },
    ];

    // Create a legend group
    const legend = svg.append("g")
        .attr("transform", `translate(${-width/2}, ${height/2 - 0})`); // Adjust positioning as needed

    // Add legend items
    legendData.forEach((d, i) => {
        const legendItem = legend.append("g")
            .attr("transform", `translate(${30}, ${30 * i})`); // Spacing between legend items

        // Add colored rectangle
        legendItem.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", d.color);

        // Add text label
        legendItem.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", "0.35em") // Center text vertically
            .text(d.title)
            .style("fill", "white")
            .style("font-weight", "bold")
            .style("font-size", "16px")
            .style("text-anchor", "start");
    });

}

createRadialChart('my_dataviz', 'data/cloudsDouble.csv');
