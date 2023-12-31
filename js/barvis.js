class BarVis {
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.displayData = this.data;

        this.initVis();
    }

    initVis() {
        let vis = this;

        const element = document.getElementById(vis.parentElement);
        vis.margin = { top: 100, right: 40, bottom: 100, left: 100 };
        vis.width = element.offsetWidth - vis.margin.left - vis.margin.right;
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

        // Create SVG canvas
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // Define scales and axes
        vis.xScale0 = d3.scaleBand().rangeRound([0, vis.width]).paddingInner(0.1);
        vis.xScale1 = d3.scaleBand().padding(0.05);
        vis.yScale = d3.scaleLinear().rangeRound([vis.height, 0]);

        vis.xAxis = vis.svg.append("g").attr("class", "x-axis");
        vis.yAxis = vis.svg.append("g").attr("class", "y-axis");

        // Color scale for Chip Series
        vis.colorScale = d3.scaleOrdinal()
            .domain(["Baseline", "Pro", "Max", "Ultra"])
            .range(["#FB923C", "#0284C7", "#6D28D9", "#C026D3"]);

        vis.sort = "byVersion"; // Set the initial view

        // Add event listener for the "Sort by Version" radio button
        d3.select('#bySeries').on('change', function() {
            if (this.checked) {
                vis.sort = "bySeries";
                vis.wrangleData();
            }
        });

        // Add event listener for the "Sort by Release Date" radio button
        d3.select('#byVersion').on('change', function() {
            if (this.checked) {
                vis.sort = "byVersion";
                vis.wrangleData();
            }
        });

        // Add X axis label
        vis.svg.append("text")
            .attr("class", "sortAxisLabel")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 40)
            .style("font-weight", "bold")
            .style("font-size", "14px")
            .style("text-anchor", "middle")
            .style("fill", "#94A3B8")
            .text("Generation");

        // Add Y axis label
        vis.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -60)
            .attr("x", -100)
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .style("font-size", "14px")
            .style("fill", "#94A3B8")
            .text("Transistors (billion)");

        // Add title
        vis.svg.append("text")
            .attr("x", 0)
            .attr("y", -80)
            .attr("text-anchor", "left")
            .style("font-size", "20px")
            .style("font-weight", "bold")
            .style("fill", "white")
            .attr("class", "font-mono")
            .text("Apple Silicon (M Series) Transistor Trends");

        // Add subtitle
        vis.svg.append("text")
            .attr("x", 0)
            .attr("y", -50)
            .attr("text-anchor", "left")
            .style("font-size", "16px")
            .style("fill", "#94A3B8")
            .text("Each new generation of Apple Silicon has increased in transistor count except for the Pro Version");

        // Initialize the legend group
        vis.legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(0,${vis.height + 70})`);

        // Tooltip
        vis.tooltip = d3.select('body').append('div')
            .attr("class", "tooltip")
            .attr("id", "bar-tooltip")      
            .style("opacity", 0);




        // Update the legend
        let legendEntries = vis.legend.selectAll(".legend-entry")
            .data(vis.colorScale.domain())
            .join(
                enter => enter.append("g").attr("class", "legend-entry"),
                update => update,
                exit => exit.remove()
            )
            .attr("transform", (d, i) => `translate(${i * 120},0)`);

        legendEntries.append("rect")
            .attr("x", 0)
            .attr("width", 20)
            .attr("height", 20)
            .attr("rx", "5")
            .attr("stroke", "white")
            .attr("fill", d => vis.colorScale(d));

        legendEntries.append("text")
            .attr("x", 30)
            .attr("y", 12)
            .text(d => d)
            .style("fill", "white")
            .style("font-weight", "bold")
            .style("font-size", "16px")
            .attr("alignment-baseline", "middle");




        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Data Wrangling
        if (vis.sort === "bySeries") {
            vis.groupings = ["Baseline", "Pro", "Max", "Ultra"];
            vis.nestedData = d3.group(vis.displayData, d => d["Chip Series"]);
            d3.selectAll(".sortAxisLabel").text("Generation");

        } else if (vis.sort === "byVersion") {
            vis.groupings = ["M1", "M2", "M3"];
            vis.nestedData = d3.group(vis.displayData, d => d.Version);
            d3.selectAll(".sortAxisLabel").text("Version");
        }

        // console.log(vis.displayData);
     
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.xScale0.domain(Array.from(vis.nestedData.keys()));
        vis.xScale1.domain(vis.groupings).rangeRound([0, vis.xScale0.bandwidth()]);
        vis.yScale.domain([0, d3.max(vis.displayData, d => d.TransistorCount)]);

        // Update Chart
        vis.xAxis.attr("transform", `translate(0,${vis.height})`)
            .call(d3.axisBottom(vis.xScale0));

        // Update y-axis with grid lines
        vis.yAxis.transition()
            .duration(1000)
            .call(d3.axisLeft(vis.yScale)
                .ticks(5)
                .tickFormat(d => `${d / 1e9} B`)
                .tickSize(-vis.width) // Extend the ticks to create grid lines
            )
            .call(g => g.selectAll(".tick line") // Style the grid lines
                .attr("stroke-opacity", 0.7) // Adjust opacity as needed
                    ) // Optional: dashed line style
            .call(g => g.select(".domain").remove()) // Optional: Remove the axis line
            .call(g => g.selectAll(".tick text") // Style the tick texts
                .attr("x", -10)
                .attr("font-size", "12px"));
                // .attr("dy", -4));

        var series = vis.svg.selectAll(".series")
            .data(Array.from(vis.nestedData.entries()), d => d[0])
            .join(
                enter => enter.append("g").attr("class", "series"),
                update => update,
                exit => exit.remove()
            )
            .attr("transform", d => `translate(${vis.xScale0(d[0])},0)`);


        const chipImages = [
            { Name: "M1", imageUrl: "/images/Apple/M1/M1.png" },
            { Name: "M1 Pro", imageUrl: "/images/Apple/M1/M1pro.png" },
            { Name: "M1 Max", imageUrl: "/images/Apple/M1/M1max.png" },
            { Name: "M1 Ultra", imageUrl: "/images/Apple/M1/M1ultra.png" },
            { Name: "M2", imageUrl: "/images/Apple/M2/M2.png" },
            { Name: "M2 Pro", imageUrl: "/images/Apple/M2/M2pro.png" },
            { Name: "M2 Max", imageUrl: "/images/Apple/M2/M2max.png" },
            { Name: "M2 Ultra", imageUrl: "/images/Apple/M2/M2ultra.png" },
            { Name: "M3", imageUrl: "/images/Apple/M3.jpg" },
            { Name: "M3 Pro", imageUrl: "/images/Apple/M3.jpg" },
            { Name: "M3 Max", imageUrl: "/images/Apple/M3.jpg" },
        ];

        var bars = series.selectAll("rect")
            .data(d => {
                return vis.groupings.map(v => {
                    var item;
                    if (vis.sort === "bySeries") {
                        item = d[1].find(dd => dd.Version === v);
                    } else if (vis.sort === "byVersion") {
                        item = d[1].find(dd => dd["Chip Series"] === v);
                    }
                    // console.log(item);
                    return {
                        key: v,
                        value: item ? item.TransistorCount : 0,
                        version: item ? item.Version : null,
                        product: item ? item.Product : null,
                        name: item ? item.Name : null,
                        date: item ? item.ReleaseDate : null // Format the date
                    };
                });
            }, d => d.key);
            
        bars.enter().append("rect")
            .merge(bars)
            .attr("class", d => `bar ${d.version}`)
            .attr("x", d => vis.xScale1(d.key))
            .attr("rx", "6")
            .attr("stroke", "white")
            .attr("stroke-width", "2")
            .attr("width", vis.xScale1.bandwidth())
            .attr("y", d => vis.height)
            .attr("height", d => 0)
            .attr("fill", d => d.version ? vis.colorScale(d.version) : "#ccc")
            .on("mouseover", function(event, d) {
                // console.log(d.date)
                const translateValue = d.value / 1e9

                console.log(d);

                let imageUrl = chipImages.find(img => img.Name === d.name).imageUrl;
                console.log(imageUrl);

                vis.tooltip.transition()        
                    .duration(200)      
                    .style("opacity", 1);      
                vis.tooltip.html(

                    `
                        <img class="tooltip-company-img mb-2 rounded-md" src="${imageUrl}" width="400" height="auto" />

                        <span class="text-base font-bold text-slate-700">${d.product}</span><br/>
                        
                        <span class="mt-1 text-sm font-medium text-slate-500">
                            <span class="text-2xl text-slate-600 font-semibold">${translateValue}</span>
                            Transistors (billion)
                        </span><br/>
                        <span class="mt-1 text-sm font-medium text-slate-500"> 
                            <span class="text-sm text-slate-600 font-semibold">${d.date} </span>
                            Release Date
                        </span><br/>
                    `
                )
                .style("left", (event.pageX) + "px")     
                .style("top", (event.pageY - 28) + "px");
            })                  
            .on("mouseout", function(d) {       
                vis.tooltip.transition()        
                    .duration(500)      
                    .style("opacity", 0);   
            })
            .transition()
            .duration(1000)
            .attr("height", d => vis.height - vis.yScale(d.value))
            .attr("y", d => vis.yScale(d.value));

        bars.exit().remove();

        
    }

}