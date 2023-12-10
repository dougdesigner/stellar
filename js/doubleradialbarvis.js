class DoubalRadialBarVis {
    constructor(_parentElement, _data, _company) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.company = _company;
        this.displayData = [];

        // Initialize visualization
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.element = document.getElementById(vis.parentElement);

        vis.margin = {top: 20, right: 0, bottom: 20, left: 0},
        vis.width = vis.element.offsetWidth - vis.margin.left - vis.margin.right,
        vis.height = 260 - vis.margin.top - vis.margin.bottom,

        vis.innerRadius = 40,
        vis.outerRadius = Math.min(vis.width, vis.height) / 2;

        // Define tooltip
        vis.tooltip = d3.select('body').append('div')
            .attr("class", "tooltip")
            .attr("id", "custom-tooltip")
            .style("opacity", 0);

        // Append SVG
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
                .attr("width", vis.width + vis.margin.left + vis.margin.right)
                .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
                .attr("transform", `translate(${vis.width/2 + vis.margin.left}, ${vis.height/2 + vis.margin.top})`);

        // Isometric top view
        // vis.svg.append("g")
        //     .attr("transform", "rotate(-30) skewX(30) scaleY(0.86062)");

        // Tooltip
        vis.tooltip = d3.select('body').append('div')
            .attr("class", "tooltip")
            .attr("id", "doubleradialbar-tooltip")      
            .style("opacity", 0);

        // Define the gradient
        const gradient = vis.svg.append("defs")
        .append("linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%") // Gradient starts at the left
        .attr("y1", "100%")
        .attr("x2", "0%") // and goes to the right
        .attr("y2", "0%");

        // Define start and end colors of the gradient
        gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "blue"); // Start color
        gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "red"); // End color

        // Define a new gradient like the one above
        const gradient2 = vis.svg.append("defs")
        .append("linearGradient")
        .attr("id", "gradient2")
        .attr("x1", "0%") // Gradient starts at the bottom
        .attr("y1", "100%")
        .attr("x2", "0%") // and goes to the top
        .attr("y2", "0%");

        // Define start and end colors of the gradient
        gradient2.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "aqua"); // Start color
        gradient2.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "blue"); // End color

        // Define a new gradient like the one above
        const gradient3 = vis.svg.append("defs")
        .append("linearGradient")
        .attr("id", "gradient3")
        .attr("x1", "0%") // Gradient starts at the bottom
        .attr("y1", "100%")
        .attr("x2", "0%") // and goes to the top
        .attr("y2", "0%");
        // .attr("gradientUnits", "userSpaceOnUse");

        // Define start and end colors of the gradient
        gradient3.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "fuchsia"); // Start color
        gradient3.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "darkorange"); // End color




        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // console.log(vis.company);

        vis.data = vis.data.filter(d => d.Company === vis.company);

        // Find the min and max values of MarketShareValue and GrowthRateValue
        vis.marketShareExtent = d3.extent(vis.data, d => d.MarketShareValue);
        vis.growthExtent = d3.extent(vis.data, d => d.GrowthRateValue);

        // Update the visualization
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        const companyImage = [
            { company: "Amazon", imageUrl: "/images/m7/AWS.svg" },
            { company: "Microsoft", imageUrl: "/images/m7/Azure.svg" },
            { company: "Google", imageUrl: "/images/m7/GoogleCloud.svg" },
        ];
    
        const companyImagesLight = [
            { company: "Amazon", imageUrl: "/images/m7/AWS-light.svg" },
            { company: "Microsoft", imageUrl: "/images/m7/Azure.svg" },
            { company: "Google", imageUrl: "/images/m7/GoogleCloud.svg" },
        ];

        const cloudName = [
            { company: "Amazon", name: "Amazon Web Services" },
            { company: "Microsoft", name: "Microsoft Azure" },
            { company: "Google", name: "Google Cloud" },
        ];

        function getCloudCompany(company) {
            const cloud = cloudName.find(c => c.company === company);
            return cloud ? cloud.name : null;
        }

        function getCenterImage(company) {
            const cloud = companyImage.find(c => c.company === company);
            return cloud ? cloud.imageUrl : null;
        }

        function getTooltipImage(company) {
            const cloud = companyImagesLight.find(c => c.company === company);
            return cloud ? cloud.imageUrl : null;
        }

        // X scale for both bars
        vis.x = d3.scaleBand()
            .range([0, 2 * Math.PI])    
            .align(0)                  
            .domain(vis.data.map(d => d.Quarter)); 

        // Y scale for outer bars
        vis.y = d3.scaleRadial()
            .range([vis.innerRadius, vis.outerRadius])   
            .domain([0, 100]); 

        // Y scale for inner bars
        vis.ybis = d3.scaleRadial()
            .range([vis.innerRadius, 5])   
            .domain([0, 100]);

        // Create a linear scale for purple
        vis.purpleColorScale = d3.scaleLinear()
            .domain(vis.marketShareExtent)
            .range(["#581C87", "#a855f7"]);

        // Create a linear scale for emerald
        vis.emeraldColorScale = d3.scaleLinear()
            .domain(vis.growthExtent)
            .range(["#065F46", "#34d399"]);
            
        // Add the outer bars
        // vis.svg.append("g")
        //     .selectAll("path")
        //     .data(vis.data)
        //     .join("path")
        //     .attr("fill", d => vis.purpleColorScale(d.MarketShareValue))
        //     .attr("d", d3.arc()
        //         .innerRadius(vis.innerRadius)
        //         .outerRadius(d => vis.y(d.MarketShareValue))
        //         .startAngle(d => vis.x(d.Quarter))
        //         .endAngle(d => vis.x(d.Quarter) + vis.x.bandwidth())
        //         .padAngle(0.01)
        //         .padRadius(vis.innerRadius))
        //         .on("mouseover", function(event, d) {
        //             // let imageUrl = companyImages.find(img => img.company === d.data.Company).imageUrl;
        
        //             vis.tooltip.transition()    
        //                 .duration(200)    
        //                 .style("opacity", 1);    
        //             vis.tooltip.html(
        //                 `
        //                 <img class="tooltip-company-img" src="${getTooltipImage(vis.company)}" width="40" height="40" />
                        
        //                 <span class="text-lg font-bold text-slate-700">${getCloudCompany(vis.company)}</span><br/>
        //                 <span class="text-base font-medium text-slate-500">Quarter: 
        //                     <span class="text-slate-600 font-bold">${d.Quarter}</span>
        //                 </span><br/>
        //                 <span class="text-base font-medium text-slate-500">Market Share: 
        //                     <span class="text-purple-600 font-bold">${d.MarketShareValue}%</span>
        //                 </span><br/>
        //                 <span class="text-base font-medium text-slate-500">YoY Growth Rate: 
        //                     <span class="text-emerald-600 font-bold">+${d.GrowthRateValue}%</span>
        //                 </span>
        //                 `
        //             )  
        //             .style("left", (event.pageX + 20) + "px")   
        //             .style("top", (event.pageY - 20) + "px");  
        //         })          
        //         .on("mouseout", function(d) {   
        //             vis.tooltip.transition()    
        //                 .duration(500)    
        //                 .style("opacity", 0); 
        //         });

        // Add the inner bars
        // vis.svg.append("g")
        //     .selectAll("path")
        //     .data(vis.data)
        //     .join("path")
        //     .attr("fill", d => vis.emeraldColorScale(d.GrowthRateValue))
        //     .attr("d", d3.arc()
        //         .innerRadius(d => vis.ybis(0))
        //         .outerRadius(d => vis.ybis(d.GrowthRateValue))
        //         .startAngle(d => vis.x(d.Quarter))
        //         .endAngle(d => vis.x(d.Quarter) + vis.x.bandwidth())
        //         .padAngle(0.01)
        //         .padRadius(vis.innerRadius))
        //     .on("mouseover", function(event, d) {
        //         // let imageUrl = companyImages.find(img => img.company === d.data.Company).imageUrl;
    
        //         vis.tooltip.transition()    
        //             .duration(200)    
        //             .style("opacity", 1);    
        //         vis.tooltip.html(
        //             `
        //             <img class="tooltip-company-img" src="${getTooltipImage(vis.company)}" width="40" height="40" />
        //             <span class="text-lg font-bold text-slate-700">${getCloudCompany(vis.company)}</span><br/>
        //             <span class="text-base font-medium text-slate-500">Quarter: 
        //                 <span class="text-slate-600 font-bold">${d.Quarter}</span>
        //             </span><br/>
        //             <span class="text-base font-medium text-slate-500">Market Share: 
        //                     <span class="text-purple-600 font-bold">${d.MarketShareValue}%</span>
        //                 </span><br/>
        //             <span class="text-base font-medium text-slate-500">YoY Growth Rate: 
        //                 <span class="text-emerald-600 font-bold">+${d.GrowthRateValue}%</span>
        //             </span>`
        //         )  
        //         .style("left", (event.pageX + 20) + "px")   
        //         .style("top", (event.pageY - 20) + "px");  
        //     })          
        //     .on("mouseout", function(d) {   
        //         vis.tooltip.transition()    
        //             .duration(500)    
        //             .style("opacity", 0); 
        //     });

        // Add outer labels
        // vis.svg.append("g")
        //     .selectAll("g")
        //     .data(vis.data)
        //     .join("g")
        //     .attr("text-anchor", function(d) { return (vis.x(d.Quarter) + vis.x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
        //     .attr("transform", function(d) { return "rotate(" + ((vis.x(d.Quarter) + vis.x.bandwidth() / 2) * 180 / Math.PI - 90) + ")"+"translate(" + (vis.y(d.MarketShareValue)+10) + ",0)"; })
        //     .attr("class", "outer-label")
        //     .append("text")
        //     .text(d => d.MarketShareValue + "%")
        //     .attr("class", "text-base font-medium fill-purple-400")
        //     .attr("transform", function(d) { return (vis.x(d.Quarter) + vis.x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
        //     .style("font-size", "11px")
        //     .attr("alignment-baseline", "middle");

                        // Layer 4
                        vis.svg.append("g")
                        .attr("transform", "translate(0, 80) rotate(30) skewX(-30) scale(1, 0.86062)")
                        .append("rect")
                            .attr("x", -40)
                            .attr("y", -40)
                            .attr("width", 80)
                            .attr("height", 80)
                            .attr("rx", 4)
                            .attr("fill", "url(#gradient3)");

                // Overlayer 4
                vis.svg.append("g")
                .attr("transform", "translate(0, 80) rotate(30) skewX(-30) scale(1, 0.86062)")
                .append("rect")
                    .attr("x", -40)
                    .attr("y", -40)
                    .attr("width", 80)
                    .attr("height", 80)
                    .attr("rx", 4)
                    .attr("opacity", 0.1)
                    .attr("blend-mode", "multiply")
                    // .attr("fill", "url(#circles-9)")
                    .attr("fill", "url(#horizontal-stripe-9)");


                // Layer 3.2
                vis.svg.append("g")
                .attr("transform", "translate(0, 48) rotate(30) skewX(-30) scale(1, 0.86062)")
                .append("rect")
                    .attr("x", -40)
                    .attr("y", -40)
                    .attr("width", 80)
                    .attr("height", 80)
                    .attr("rx", 4)
                    .attr("opacity", 0.25)
                    .attr("fill", "url(#gradient2)");

        // Layer 3
        vis.svg.append("g")
        .attr("transform", "translate(0, 40) rotate(30) skewX(-30) scale(1, 0.86062)")
        .append("rect")
            .attr("x", -40)
            .attr("y", -40)
            .attr("width", 80)
            .attr("height", 80)
            .attr("rx", 4)
            .attr("fill", "url(#gradient2)");

        // Layer 2
        vis.svg.append("g")
        .attr("transform", "translate(0, 32) rotate(30) skewX(-30) scale(1, 0.86062)")
        .append("rect")
            .attr("x", -40)
            .attr("y", -40)
            .attr("width", 80)
            .attr("height", 80)
            .attr("rx", 4)
            .attr("fill", "url(#gradient2)");

        // Pattern Overlay 2
        vis.svg.append("g")
        .attr("transform", "translate(0, 32) rotate(30) skewX(-30) scale(1, 0.86062)")
        .append("rect")
            .attr("x", -40)
            .attr("y", -40)
            .attr("width", 80)
            .attr("height", 80)
            .attr("rx", 4)
            .attr("opacity", 0.1)
            .attr("blend-mode", "multiply")
            // alternative blend mode
            // .attr("mix-blend-mode", "multiply")
            .attr("fill", "url(#dots-5)");

        // Layer 1        
        vis.svg.append("g")
            .attr("transform", "translate(0, 15) rotate(30) skewX(-30) scale(1, 0.86062)")
            .append("rect")
                .attr("x", -30)
                .attr("y", -30)
                .attr("width", 60)
                .attr("height", 60)
                .attr("rx", 4)
                .attr("fill", "url(#gradient)");

        // Pattern Overlay 1
        vis.svg.append("g")
            .attr("transform", "translate(0, 15) rotate(30) skewX(-30) scale(1, 0.86062)")
            .append("rect")
                .attr("x", -30)
                .attr("y", -30)
                .attr("width", 60)
                .attr("height", 60)
                .attr("rx", 4)
                .attr("opacity", 0.1)
                // .attr("stroke-width", 2)
                // .attr("stroke", "black")
                .attr("blend-mode", "multiply")
                .attr("fill", "url(#dots-9)");


        // Logo background
        vis.svg.append("g")
        .attr("transform", "rotate(30) skewX(-30) scale(1, 0.86062)")
        .append("rect")
            .attr("x", -20)
            .attr("y", -20)
            .attr("width", 40)
            .attr("height", 40)
            .attr("rx", 4)
            .attr("stroke-width", 2)
            .attr("stroke", "#0F172A")
            .attr("fill", "#1E293B");

        // vis.svg.append("g")
        //     .attr("transform", "rotate(30) skewX(-30) scale(1, 0.86062)")
        //     .append("rect")
        //         .attr("x", -20)
        //         .attr("y", -20)
        //         .attr("width", 40)
        //         .attr("height", 40)
        //         .attr("rx", 4)
        //         .attr("fill", "url(#dots-5) slategray");


        // Company Logo
        vis.svg.append("g")
            .attr("transform", "rotate(30) skewX(-30) scale(1, 0.86062)")
            .append("image")    
            .attr("href", getCenterImage(vis.company))
            .attr("x", -16) 
            .attr("y", -16)
            .attr("width", 32)
            .attr("height", 32);


        

            const legendData = [
                { title: "Market Share", color: "#a855f7" },
                { title: "YoY Growth Rate", color: "#34d399" },
            ];

            // // Create a legend group
            // const legend = vis.svg.append("g")
            //     .attr("transform", `translate(${-width/2 + 140}, ${height/2 - 40})`); // Adjust positioning as needed

            // // Add legend items
            // legendData.forEach((d, i) => {
            //     const legendItem = legend.append("g")
            //         .attr("transform", `translate(${30}, ${30 * i})`); // Spacing between legend items

            //     // Add colored rectangle
            //     legendItem.append("rect")
            //         .attr("width", 18)
            //         .attr("height", 18)
            //         .style("fill", d.color);

            //     // Add text label
            //     legendItem.append("text")
            //         .attr("x", 24)
            //         .attr("y", 9)
            //         .attr("dy", "0.35em") // Center text vertically
            //         .text(d.title)
            //         .style("fill", "white")
            //         .style("font-weight", "bold")
            //         .style("font-size", "16px")
            //         .style("text-anchor", "start");
            // });

    }

}
