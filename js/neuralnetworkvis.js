class NeuralNetworkVis {
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.displayData = [];

        // Initialize visualization
        this.initVis();
    }

    initVis() {
        let vis = this;
        
        vis.element = document.getElementById(vis.parentElement);

        vis.margin = {top: 0, right: 0, bottom: 0, left: 0},
        vis.width = vis.element.offsetWidth - vis.margin.left - vis.margin.right,
        vis.height = 300 - vis.margin.top - vis.margin.bottom,
  
        vis.nodeSize = 20;

        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);
        
        vis.defineGradients();

        vis.color = d3.scaleOrdinal()
        .range(["url(#radial-gradient)", "url(#radial-gradient3)", "url(#radial-gradient2)", "#C026D3"]);
    
        // Update chart with wrangled data
        vis.wrangleData();
    }

    defineGradients() {
        let vis = this;
         // Define the radial gradient
         const radialGradient = vis.svg.append("defs")
         .append("radialGradient")
             .attr("id", "radial-gradient")
             .attr("cx", "35%") // Center x of the gradient
             .attr("cy", "35%") // Center y of the gradient
             .attr("r", "50%"); // Radius of the gradient
 
         // Define the colors of the gradient
         radialGradient.append("stop")
             .attr("offset", "0%")
             .attr("stop-color", "fuchsia"); // Light color at the center
         radialGradient.append("stop")
             .attr("offset", "100%")
             .attr("stop-color", "darkviolet"); // Darker color towards the edges
 
 
         // Define the radial gradient
         const radialGradient2 = vis.svg.append("defs")
         .append("radialGradient")
             .attr("id", "radial-gradient2")
             .attr("cx", "35%") // Center x of the gradient
             .attr("cy", "35%") // Center y of the gradient
             .attr("r", "50%"); // Radius of the gradient
 
         // Define the colors of the gradient
         radialGradient2.append("stop")
             .attr("offset", "0%")
             .attr("stop-color", "deeppink"); // Light color at the center
         radialGradient2.append("stop")
             .attr("offset", "100%")
             .attr("stop-color", "darkorchid"); // Darker color towards the edges
 
 
         // Define the radial gradient
         const radialGradient3 = vis.svg.append("defs")
         .append("radialGradient")
             .attr("id", "radial-gradient3")
             .attr("cx", "35%") // Center x of the gradient
             .attr("cy", "35%") // Center y of the gradient
             .attr("r", "50%"); // Radius of the gradient
 
         // Define the colors of the gradient
         radialGradient3.append("stop")
             .attr("offset", "0%")
             .attr("stop-color", "deepskyblue"); // Light color at the center
         radialGradient3.append("stop")
             .attr("offset", "100%")
             .attr("stop-color", "indigo"); // Darker color towards the edges
    }

    wrangleData() {
        let vis = this;

        // Update the visualization
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // console.log(vis.data);

        vis.nodes = vis.data.nodes;
        
        // console.log(vis.nodes);


        // get network size
        var netsize = {};
        vis.nodes.forEach(function (d) {
          if(d.layer in netsize) {
              netsize[d.layer] += 1;
          } else {
              netsize[d.layer] = 1;
          }
          d["lidx"] = netsize[d.layer];
        });
    
        // calc distances between nodes
        var largestLayerSize = Math.max.apply(
            null, Object.keys(netsize).map(function (i) { return netsize[i]; }));
    
        var xdist = vis.width / Object.keys(netsize).length,
            ydist = vis.height / largestLayerSize;
    
        // create node locations
        vis.nodes.map(function(d) {
            var midpoint = vis.height / 2;
            var layerHeight = netsize[d.layer] * vis.nodeSize * 1.5; // 1.5 for spacing between nodes
            var layerStart = midpoint - layerHeight / 2;

            d["x"] = (d.layer - 0.5) * xdist;
            // Last factor adjusts for spacing between nodes
            d["y"] = layerStart + (d.lidx - 0.5) * vis.nodeSize * 2.5; // Adjust y position for each node
        });
    
        // autogenerate links
        var links = [];
        vis.nodes.map(function(d, i) {
          for (var n in vis.nodes) {
            if (d.layer + 1 == vis.nodes[n].layer) {
            // Value is stroke width here
              links.push({"source": parseInt(i), "target": parseInt(n), "value": 3}) }
          }
        }).filter(function(d) { return typeof d !== "undefined"; });
    
        // draw links
        var link = vis.svg.selectAll(".link")
            .data(links)
          .enter().append("line")
            .attr("class", "link stroke-purple-500")
            .attr("opacity", 0.5)
            .attr("x1", function(d) { return vis.nodes[d.source].x; })
            .attr("y1", function(d) { return vis.nodes[d.source].y; })
            .attr("x2", function(d) { return vis.nodes[d.target].x; })
            .attr("y2", function(d) { return vis.nodes[d.target].y; })
            .style("stroke-width", function(d) { return Math.sqrt(d.value); });
    
        // draw nodes
        var node = vis.svg.selectAll(".node")
            .data(vis.nodes)
          .enter().append("g")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")"; }
            );
    
        var circle = node.append("circle")
            .attr("class", "node")
            .attr("r", vis.nodeSize)
            .style("fill", function(d) { return vis.color(d.layer); });
    
    
        node.append("text")
            .attr("dx", "-.35em")
            .attr("dy", ".35em")
            .attr("font-size", "0.5em")
            .attr("fill", "white")
            .attr("font-weight", "bold")
            .text(function(d) { return d.label; });


        // Add labels

        // Calculate midpoints for each layer to place the labels
        var layerMidpoints = {};
        for (let i = 1; i <= Object.keys(netsize).length; i++) {
            let nodesInLayer = vis.nodes.filter(node => node.layer === i);
            let min_x = d3.min(nodesInLayer, node => node.x);
            let max_x = d3.max(nodesInLayer, node => node.x);
            layerMidpoints[i] = (min_x + max_x) / 2;
        }

        // Add layer labels
        Object.keys(layerMidpoints).forEach(layer => {
            let label = "";
            let nodeCount = netsize[layer]; // Get the count of nodes in the layer
            if (layer == 1) {
                label = `Input Layer (${nodeCount})`;
            } else if (layer == Object.keys(netsize).length) {
                label = `Output Layer (${nodeCount})`;
            } else {
                label = `Hidden Layer (${nodeCount})`;
            }

            vis.svg.append("text")
                .attr("class", "layer-label")
                .attr("x", layerMidpoints[layer])
                .attr("dy", 50)
                .attr("y", -20) // Adjust this value to position the label appropriately
                .attr("text-anchor", "middle")
                .attr("fill", "white")
                .style("font-weight", "bold")
                .style("font-size", "16px")
                .text(label);
        });

        // Calculate the number of weights between layers
        var weightsBetweenLayers = {};
        for (let i = 1; i < Object.keys(netsize).length; i++) {
            weightsBetweenLayers[i] = netsize[i] * netsize[i + 1];
        }

        // Add weight labels between layers
        Object.keys(weightsBetweenLayers).forEach(layer => {
            let weightLabel = `Weights (${weightsBetweenLayers[layer]})`;

            // Calculate midpoint between layers for label positioning
            let labelXPos = (layerMidpoints[parseInt(layer)] + layerMidpoints[parseInt(layer) + 1]) / 2;
            
            vis.svg.append("text")
                .attr("class", "weight-label")
                .attr("x", labelXPos)
                .attr("y", vis.height - 10) // Position label at the bottom of the visualization
                .attr("text-anchor", "middle")
                .attr("fill", "#94A3B8")
                .attr("font-weight", "bold")
                .style("font-size", "14px")
                .text(weightLabel);
        });

    }

}
