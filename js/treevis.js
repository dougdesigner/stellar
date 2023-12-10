class TreeVis {
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.displayData = this.data;

        this.initVis();
    }

    initVis() {
        let vis = this;

        // Initialize SVG drawing area
        vis.margin = { top: 10, right: 160, bottom: 10, left: 130 };
        vis.width = document.getElementById(vis.parentElement).offsetWidth - vis.margin.left - vis.margin.right;
        vis.height = 600 - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom);

        vis.g = vis.svg
            .append("g")
            .attr(
                "transform",
                "translate(" + vis.margin.left + "," + vis.margin.top + ")"
            );

        // Tree setup
        vis.tree = d3.tree().size([vis.height, vis.width]);

        vis.cluster = d3.cluster().size([vis.height, vis.width]);

        vis.stratify = d3.stratify().parentId(function (d) {
            return d.id.substring(0, d.id.lastIndexOf("."));
        });
        
        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Create root hierarchy from data
        vis.root = vis.stratify(vis.data);

        // Layout the tree structure
        vis.cluster(vis.root);

        // Define diagonal path generator
        vis.diagonal = function(d) {
            return "M" + d.y + "," + d.x 
            + "C" + (d.parent.y + 100) + "," + d.x 
            + " " + (d.parent.y + 100) + "," + d.parent.x 
            + " " + d.parent.y + "," + d.parent.x;
        };

        // Draw links (paths)
        vis.link = vis.g.selectAll(".link")
            .data(vis.root.descendants().slice(1))
            .enter().append("path")
            .attr("class", "link")
            .style("stroke", "#64748B")
            .attr("d", vis.diagonal);

        // Draw animated links (paths)
        vis.animatedLink = vis.g.selectAll(".animated-link")
            .data(vis.root.descendants().slice(1))
            .enter().append("path")
            .attr("class", "animated-link")
            .attr("d", vis.diagonal)
            .style("fill", "none")
            .style("stroke", "#9333EA");

        // Draw nodes (circles and text)
        vis.nodes = vis.g.selectAll(".node")
            .data(vis.root.descendants())
            .enter().append("g")
            .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
            .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
            .on("click", function (e, d) {
                if (!d.children) {
                    vis.handleLeafNodeClick(d.data.value);
                }
            });


            // Create a color scale
        const colorScale = d3.scaleOrdinal()
        .domain(['Amazon', 'Microsoft', 'Google'])
        .range(['#FF9900', '#05A6F0', '#4285F4']); // Colors for each company
            

        vis.nodes.append("circle")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1)
            .style("fill", function(d) {
                // let nodeName = d.id.substring(d.id.lastIndexOf(".") + 1);
                // if (nodeName === "Amazon") return "#FF9900";   // Specify the color for Amazon
                // if (nodeName === "Microsoft") return "#05A6F0"; // Specify the color for Microsoft
                // if (nodeName === "Google") return "#4285F4";  // Specify the color for Google
                // Leaf nodes
                if (!d.children) {
                    return "#9333EA"; // Default color for leaf nodes
                }
                return "#475569"; // Default color for other nodes
            })
            .attr("r", 5);

        vis.nodes.append("text")
            .attr("dy", 3)
            .attr("x", function(d) { return d.children ? -12 : 12; })
            .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
            .text(function(d) { return d.id.substring(d.id.lastIndexOf(".") + 1); });

        // Add Event Listener
        d3.selectAll(".custom-input")
            .on("change", function() { vis.changed(); });

        vis.timeout = setTimeout(function() {
            vis.animatedLink.interrupt();
            d3.select("input[value=\"tree\"]")
                .property("checked", true)
                .dispatch("change");
        }, 1000);

        vis.applyContinuousTransition = function() {    
            vis.animatedLink.each(function() {
                var path = d3.select(this); // Fixed context of 'this'
    
                // Clear any existing transition to avoid conflicts
                path.interrupt();
    
                var totalLength = path.node().getTotalLength();
                path
                    .attr("stroke-dasharray", totalLength + " " + totalLength)
                    .attr("stroke-dashoffset", totalLength)
                    .transition()
                    .duration(1000) // Adjust duration as needed
                    .ease(d3.easePolyIn) // You can change the easing function
                    .attr("stroke-dashoffset", 0)
                    .on("end", () => vis.animateOut(path, totalLength)); // Start the animation out
            });
        };


        vis.animateOut = function(path, totalLength) {    
            path
                .transition()
                .duration(1000) // Duration for the animation out
                .ease(d3.easePolyOut) // Change the easing function if needed
                .attr("stroke-dashoffset", -totalLength)
                .on("end", () => {
                    setTimeout(() => path.call(vis.applyContinuousTransition.bind(vis)), 1500); // Fixed context of 'this'
                });
        };

        vis.animateOut = function(path, totalLength) {    
            path
                .transition()
                .duration(2000) // Duration for the animation out
                .ease(d3.easePolyOut) // Change the easing function if needed
                .attr("stroke-dashoffset", -totalLength)
                .on("end", () => {
                    setTimeout(() => path.call(vis.applyContinuousTransition.bind(vis)), 2000); // Fixed context of 'this'
                });
        };
    
        vis.handleLeafNodeClick = function(url) {
            if (url) {
                window.open(url, "_blank");
            }
        }

        vis.changed = function() {
            // console.log("changed");
            vis.timeout = clearTimeout(vis.timeout);


            // (this.value === "tree" ? vis.tree : vis.cluster)(vis.root);
            // Correctly get the value of the changed element
            let selectedValue = d3.select('input[name="mode"]:checked').node().value;
            (selectedValue === "tree" ? vis.tree : vis.cluster)(vis.root);

            // console.log(selectedValue);

            var t = d3.transition().duration(750);
            vis.nodes.transition(t).attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });
            vis.link.transition(t).attr("d", vis.diagonal);
            vis.animatedLink.interrupt();
            vis.animatedLink.transition(t).attr("d", vis.diagonal);

            // Wait for the transition to complete before reapplying the animation
            vis.animatedLink.transition(t).attr("d", vis.diagonal).on("end", () => {
                vis.animatedLink.each(vis.applyContinuousTransition);
            });
        }
        

    }
}