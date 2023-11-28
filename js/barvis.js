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
        vis.height = 500 - this.margin.top - this.margin.bottom;

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

        vis.xAxis = vis.svg.append("g").attr("class", "x axis");
        vis.yAxis = vis.svg.append("g").attr("class", "y axis");

        // Color scale for Chip Series
        vis.colorScale = d3.scaleOrdinal()
            .domain(["Baseline", "Pro", "Max", "Ultra"])
            .range(d3.schemeTableau10);

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
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 40)
            .style("font-weight", "bold")
            .style("font-size", "14px")
            .style("text-anchor", "middle")
            .style("fill", "#94A3B8")
            .attr("class", "sortAxisLabel")
            .text("Generation");

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

        // Add title
        vis.svg.append("text")
            .attr("x", vis.width / 2)
            .attr("y", -80)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .style("font-weight", "bold")
            .style("fill", "white")
            .attr("class", "font-mono")
            .text("Apple Silicon (M Series) Transistor Trends");

        // Add subtitle
        vis.svg.append("text")
            .attr("x", vis.width / 2)
            .attr("y", -50)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("fill", "#94A3B8")
            .text("Each new generation of Apple Silicon has increased in transistor count except for the Pro Version");

        // Initialize the legend group
        vis.legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(0,${vis.height + 80})`);

        // Tooltip
        vis.tooltip = d3.select('body').append('div')
            .attr("class", "tooltip")
            .attr("id", "bar-tooltip")      
            .style("opacity", 0);

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
            vis.groupings = ["M1", "M2", "M3"];
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
        vis.xAxis.attr("transform", `translate(0,${vis.height})`).call(d3.axisBottom(vis.xScale0));
        vis.yAxis.call(d3.axisLeft(vis.yScale).tickFormat(d => `${d / 1e9} B`));

        var series = vis.svg.selectAll(".series")
            .data(Array.from(vis.nestedData.entries()), d => d[0])
            .join(
                enter => enter.append("g").attr("class", "series"),
                update => update,
                exit => exit.remove()
            )
            .attr("transform", d => `translate(${vis.xScale0(d[0])},0)`);

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
                        date: item ? item.ReleaseDate : null // Format the date
                    };
                });
            }, d => d.key);
            
        bars.enter().append("rect")
            .merge(bars)
            .attr("x", d => vis.xScale1(d.key))
            .attr("rx", "6")
            .attr("stroke", "white")
            .attr("stroke-width", "2")
            .attr("width", vis.xScale1.bandwidth())
            .attr("y", d => vis.height)
            .attr("height", d => 0)
            .attr("fill", d => d.version ? vis.colorScale(d.version) : "#ccc")
            .on("mouseover", function(event, d) {
                console.log(d.date)
                const trans = d.value / 1e9
                vis.tooltip.transition()        
                    .duration(200)      
                    .style("opacity", 1);      
                vis.tooltip.html(
                    `<span class="text-lg font-bold text-slate-600">${d.product}</span><<br/>
                    <span class="text-base font-medium text-slate-500">Transistors: 
                        <span class="text-slate-500 font-bold">${trans} billion</span>
                    </span><br/>
                    <span class="text-base font-medium text-slate-500">Release Date: 
                        <span class="text-slate-500 font-bold">${d.date}</span>
                    </span>`
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
            .attr("x", 25)
            .attr("y", 12)
            .text(d => d)
            .style("fill", "white")
            .style("font-weight", "bold")
            .style("font-size", "16px")
            .attr("alignment-baseline", "middle");
    }

}