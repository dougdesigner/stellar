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
      vis.margin = { top: 100, right: 100, bottom: 100, left: 100 };
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

      // Define line generator
      vis.line = d3.line()
          .x(d => vis.x(d.Quarter))
          .y(d => vis.y(d['Market Share']));

      // Initialize view to Market Share
      vis.view = "Market Share";

      // Add event listener for the Market Share radio button
      d3.select('#cloudShare').on('change', function() {
          if (this.checked) {
              vis.view = "Market Share";
              vis.wrangleData();
          }
      });

      // Add event listener for the Growth Rate radio button
      d3.select('#cloudGrowth').on('change', function() {
          if (this.checked) {
              vis.view = "Growth Rate";
              vis.wrangleData();
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
        .attr("x", vis.width / 2)
        .attr("y", -80)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .style("fill", "white")
        .attr("class", "font-mono")
        .text("AWS is the Market Leader in Cloud Computing");

      // Add subtitle
      vis.svg.append("text")
          .attr("x", vis.width / 2)
          .attr("y", -50)
          .attr("text-anchor", "middle")
          .style("font-size", "16px")
          .style("fill", "#94A3B8")
          .text("Cloud computing power is consolidated in the hands of Amazon, Microsoft, and Google");

      // Tooltip
      vis.tooltip = d3.select('body').append('div')
      .attr("class", "tooltip")
      .attr("id", "line-tooltip")      
      .style("opacity", 0);

      vis.wrangleData();
  }

  wrangleData() {
      let vis = this;

      // Convert market share to numeric values
      vis.data.forEach(d => {
          d['Market Share'] = +d['Market Share'].replace('%', '')  / 100;
          d['Growth Rate'] = +d['Growth Rate'].replace('%', '')  / 100;
      });

      // Process data to group by company
      vis.companyData = Array.from(d3.group(vis.data, d => d.Company), ([key, value]) => ({ key, value }));

      vis.updateVis();
  }

  updateVis() {
    let vis = this;

    // Set domains for the scales
    vis.x.domain([...new Set(vis.data.map(d => d.Quarter))]);
    vis.y.domain([0, d3.max(vis.data, d => d['Market Share'])]);

    // Create a color scale based on company names
    const companyNames = vis.companyData.map(d => d.key);
    const colorScale = d3.scaleOrdinal()
                         .domain(companyNames)
                         .range(d3.schemeCategory10);

    // Remove any existing companies to prevent duplicates
    vis.svg.selectAll(".company").remove();

    // Create a group for each company and bind data
    vis.companies = vis.svg.selectAll(".company")
        .data(vis.companyData, d => d.key)
        .enter().append("g")
        .attr("class", "company");

    // Draw lines for each company
    vis.companies.append("path")
        .datum(d => d.value)
        .attr("fill", "none")
        .attr("stroke", d => {
          // console.log("Company Key:", d[0].Company);
          return colorScale(d[0].Company);
        })
        .attr("stroke-width", 4)
        .attr("stroke-linecap", "round")
        .attr("d", vis.line);

    // Draw circles for each data point
    vis.companies.selectAll("circle")
        .data(d => d.value)
        .enter().append("circle")
        .attr("fill", d => colorScale(d.Company))
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .attr("cx", d => vis.x(d.Quarter))
        .attr("cy", d => vis.y(d['Market Share']))
        .attr("r", 6)
        .on("mouseover", function(event, d) {
          vis.tooltip.transition()        
              .duration(200)      
              .style("opacity", 1);      
          vis.tooltip.html(
              `<span class="text-lg font-bold text-slate-700">${d.Company}</span><<br/>
              <span class="text-base font-medium text-slate-500">Market Share: 
                  <span class="text-slate-600 font-bold">${d.MarketShare}%</span>
              </span><br/>
              <span class="text-base font-medium text-slate-500">Quarter: 
                  <span class="text-slate-600 font-bold">${d.Quarter}</span>
              </span><br/>
              <span class="text-base font-medium text-slate-500">YoY Growth Rate: 
                  <span class="text-emerald-600 font-bold">+${d.GrowthRate}%</span>
              </span>`
          )
          .style("left", (event.pageX) + "px")     
          .style("top", (event.pageY - 28) + "px");
      })                  
      .on("mouseout", function(d) {       
          vis.tooltip.transition()        
              .duration(500)      
              .style("opacity", 0);   
      });

    // Create axes
    vis.svg.append("g")
        .attr("transform", `translate(0, ${vis.height})`)
        .call(d3.axisBottom(vis.x));

    vis.svg.append("g")
        .call(d3.axisLeft(vis.y).tickFormat(d3.format(".0%")));

    // Create a legend group at the bottom of the SVG
    const legend = vis.svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(0, ${vis.height + 80})`);

    // Determine spacing for the legend items
    const legendItemWidth = 150;
    const legendItemHeight = 20;

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
