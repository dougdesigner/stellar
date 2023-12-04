class LineVis {
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
      vis.margin = { top: 100, right: 140, bottom: 100, left: 100 };
      vis.width = element.offsetWidth - vis.margin.left - vis.margin.right;
      vis.height = 600 - vis.margin.top - vis.margin.bottom;

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

      // Initialize view to Market Share
      vis.view = "Market Share";

      // Add event listener for the Market Share radio button
      d3.select('#cloudShare').on('change', function() {
          if (this.checked) {
              vis.view = "Market Share";
              vis.updateVis();
          }
      });

      // Add event listener for the Growth Rate radio button
      d3.select('#cloudGrowth').on('change', function() {
          if (this.checked) {
              vis.view = "Growth Rate";
              vis.updateVis();
          }
      });

      // Add X axis label
      vis.svg.append("text")
        .attr("x", vis.width / 2)
        .attr("y", vis.height + 60)
        .style("font-weight", "bold")
        .style("font-size", "14px")
        .style("text-anchor", "middle")
        .style("fill", "#94A3B8")
        .text("Quarter");

      // Add Y axis label
      vis.svg.append("text")
        .attr("class", "y-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -60)
        .attr("x", -200)
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .style("font-size", "14px")
        .style("fill", "#94A3B8")
        .text("Market Share (%)");

      // Add title
      vis.svg.append("text")
        .attr("x", 0)
        .attr("y", -80)
        .attr("text-anchor", "left")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .style("fill", "white")
        .attr("class", "font-mono")
        .text("Amazon is the Market Leader in Cloud Computing");

      // Add subtitle
      vis.svg.append("text")
          .attr("x", 0)
          .attr("y", -50)
          .attr("text-anchor", "left")
          .style("font-size", "16px")
          .style("fill", "#94A3B8")
          .text("Cloud computing power is consolidated in the hands of Amazon, Microsoft, and Google");

      // Tooltip
      vis.tooltip = d3.select('body').append('div')
      .attr("class", "tooltip")
      .attr("id", "line-tooltip")      
      .style("opacity", 0);

      // Add axes groups
      vis.svg.append("g")
        .attr("class", "y-axis")

      vis.svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${vis.height})`)

        // Process data to group by company
        vis.companyData = Array.from(d3.group(vis.data, d => d.Company), ([key, value]) => ({ key, value }));

      vis.wrangleData();
  }

  wrangleData() {
      let vis = this;

      vis.updateVis();
  }

  updateVis() {
    let vis = this;

    // Set domains for the scales
    vis.x.domain([...new Set(vis.data.map(d => d.Quarter))]);
    // Update the y-scale domain based on the selected view
    vis.y.domain([0, d3.max(vis.data, d => d[vis.view])]);
    // vis.y.domain([0, d3.max(vis.data, d => d['Market Share'])]);

    // Create a color scale based on company names
    const companyNames = vis.companyData.map(d => d.key);
    // const colorScale = d3.scaleOrdinal()
    //   .domain(companyNames)
    //   .range(d3.schemeCategory10);

    // Define your array of hex colors
    const myColors = ['#05A6F0', '#4285F4', '#FF9900'];

    // Create a scale
    const colorScale = d3.scaleOrdinal()
        .domain(["Microsoft", "Google", "Amazon"])
        .range(myColors);

    // Bind data to company groups
    vis.companies = vis.svg.selectAll(".company")
        .data(vis.companyData, d => d.key);

    // Enter selection: Create new groups for new data
    vis.companies.enter().append("g")
        .attr("class", "company")
        .merge(vis.companies) // Merge enter and update selections
        .each(function(d) {
            let companyGroup = d3.select(this);

            // Define line generator
            vis.line = d3.line()
                .x(d => vis.x(d.Quarter))
                .y(d => vis.y(d[vis.view]));

            // Draw lines for each company
            let lines = companyGroup.selectAll(".line")
                .data([d.value]); // Wrap data in an array to create one line per group

            lines.enter().append("path")
                .attr("class", "line")
                .merge(lines)
                .attr("fill", "none")
                .attr("stroke", d => colorScale(d[0].Company))
                .attr("stroke-width", 4)
                .attr("stroke-linecap", "round")
                .transition()
                .duration(1000)
                .attr("d", vis.line);

            lines.exit().remove();

            const companyCloud = [
                { company: "Amazon", cloud: "Amazon Web Services" },
                { company: "Microsoft", cloud: "Microsoft Azure" },
                { company: "Google", cloud: "Google Cloud" },
            ];

            const companyImages = [
                { company: "Amazon", imageUrl: "/images/m7/AWS.svg" },
                { company: "Microsoft", imageUrl: "/images/m7/Azure.svg" },
                { company: "Google", imageUrl: "/images/m7/GoogleCloud.svg" },
            ];

            const companyImagesLight = [
                { company: "Amazon", imageUrl: "/images/m7/AWS-light.svg" },
                { company: "Microsoft", imageUrl: "/images/m7/Azure.svg" },
                { company: "Google", imageUrl: "/images/m7/GoogleCloud.svg" },
            ];


            // Draw circles for each data point
            let dots = companyGroup.selectAll("circle")
                .data(d.value, d => d.Quarter);

            dots.enter().append("circle")
                .merge(dots)
                .attr("fill", d => colorScale(d.Company))
                .attr("stroke", "white")
                .attr("stroke-width", 2)
                .attr("cx", d => vis.x(d.Quarter))
                .attr("r", 6)
                .on("mouseover", function(event, d) {

                let matchingCompany = companyCloud.find(c => c.company === d.Company).cloud;
                let imageUrl = companyImagesLight.find(img => img.company === d.Company).imageUrl;

                  vis.tooltip.transition()        
                    .duration(200)      
                    .style("opacity", 1);

                  vis.tooltip.html(
                      `
                      <img class="tooltip-company-img" src="${imageUrl}" width="40" height="40" />
                      <span class="text-lg font-bold text-slate-700">${matchingCompany}</span><br/>
                      <span class="text-base font-medium text-slate-500">Market Share: 
                          <span class="text-slate-600 font-bold">${d.MarketShare}%</span>
                      </span><br/>
                      <span class="text-base font-medium text-slate-500">Quarter: 
                          <span class="text-slate-600 font-bold">${d.Quarter}</span>
                      </span><br/>
                      <span class="text-base font-medium text-slate-500">YoY Growth Rate: 
                          <span class="text-emerald-600 font-bold">+${d.GrowthRate}%</span>
                      </span>`)
                      .style("left", (event.pageX + 20) + "px")   
                      .style("top", (event.pageY - 20) + "px");
                })
                .on("mouseout", d => {
                  vis.tooltip.transition()        
                  .duration(500)      
                  .style("opacity", 0);
                })
                .transition()
                .duration(1000)
                .attr("cy", d => vis.y(d[vis.view]));

            // Find the last data point for each company
            let lastDataPoint = d.value[d.value.length - 1];

            // Append an image at the last data point
            companyGroup.selectAll(".company-img").data([lastDataPoint])
                .enter().append("image")
                .merge(companyGroup.selectAll(".company-img"))
                .attr("class", "company-img")
                .attr("xlink:href", function(d) {
                    // Find the imageUrl for the current company
                    let imageUrl = companyImages.find(img => img.company === d.Company).imageUrl;
                    return imageUrl;
                })
                .attr("x", d => vis.x(d.Quarter) + 20) // Position slightly right to the last circle
                .transition()
                .duration(1000)
                .attr("y", d => vis.y(d[vis.view]) - 20) // Adjust y position based on your needs
                .attr("width", 40)   // Set image width
                .attr("height", 40); // Set image height

            dots.exit().remove();


      


 

        });

    // Exit selection: Remove old groups
    vis.companies.exit().remove();

    if (vis.view === "Market Share") {
    d3.selectAll(".y-label").text("Market Share (%)");

    } else {
        d3.selectAll(".y-label").text("YoY Growth (%)");
    }

    // Call axes
    vis.svg.selectAll(".x-axis")
        .call(d3.axisBottom(vis.x));

    vis.svg.selectAll(".y-axis")
      .transition()
      .duration(1000)
      .call(d3.axisLeft(vis.y).tickFormat(d3.format(".0%")));

    // Create a legend group at the bottom of the SVG
    const legend = vis.svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(0, ${vis.height + 75})`);

    // Determine spacing for the legend items
    const legendItemWidth = 150;

    // Add legend items for each company
    companyNames.forEach((company, index) => {
        const legendItem = legend.append("g")
            .attr("class", "legend-item")
            .attr("transform", `translate(${index * legendItemWidth}, 0)`);

        legendItem.append("rect")
            .attr("width", 20)
            .attr("height", 20)
            .attr("rx", 5)
            .attr("stroke", "white")
            .attr("fill", colorScale(company));

        legendItem.append("text")
            .attr("x", 30)
            .attr("y", 12)
            .text(company)
            .style("fill", "white")
            .style("font-weight", "bold")
            .style("font-size", "16px")
            .attr("text-anchor", "start")
            .attr("alignment-baseline", "middle");
    });

}
 
}
