const element = document.getElementById("treevis");
        var elementWidth = element.offsetWidth;

        var marginRight = 300
        var marginLeft = 100

        var svg = d3.select("#treevis").append("svg"),
            width = elementWidth,
            height = 600,
            g = svg.append("g").attr("transform", "translate(122,0)");

        svg.attr("width", width)
            .attr("height", height)
        
        var tree = d3.tree()
            .size([height - 40, width - marginRight]);
        
        var cluster = d3.cluster()
            .size([height, width - marginRight]);
        
        var stratify = d3.stratify()
            .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });
        
        d3.csv("data/stack.csv").then(data => {
                      
          var root = stratify(data);
        
          cluster(root);
        
          var link = g.selectAll(".link")
              .data(root.descendants().slice(1))
              .enter().append("path")
              .attr("class", "link")
              .style("stroke", "#64748B")
              .attr("d", diagonal);

        var animatedLink = g.selectAll(".animated-link")
            .data(root.descendants().slice(1))
            .enter().append("path")
            .attr("class", "animated-link")
            .attr("d", diagonal)
            .style("fill", "none")
            .style("stroke", "#9333EA");


        function applyContinuousTransition() {
            var path = d3.select(this);

            // Clear any existing transition to avoid conflicts
            path.interrupt();

            var totalLength = path.node().getTotalLength();
            path.attr("stroke-dasharray", totalLength + " " + totalLength + " " + totalLength)
                .attr("stroke-dashoffset", totalLength)
                .transition()
                .duration(1000) // Adjust duration as needed
                .ease(d3.easePolyIn) // You can change the easing function
                .attr("stroke-dashoffset", 0)
                .on("end", () => animateOut(path, totalLength)); // Start the animation out
        }

        function animateOut(path, totalLength) {
            path.transition()
                .duration(1000) // Duration for the animation out
                .ease(d3.easePolyOut) // Change the easing function if needed
                .attr("stroke-dashoffset", -totalLength)
                .on("end", function() {
                    setTimeout(() => applyContinuousTransition.call(this), 1500); // Add a delay before restarting
                });
        }

        
          var node = g.selectAll(".node")
              .data(root.descendants())
              .enter().append("g")
              .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
              .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
              .on("click", function(e, d) {
                // Check if the node is a leaf node (has no children)
                    if (!d.children) {
                        // console.log(d);
                        handleLeafNodeClick(d.data.value);
                    }
                });
        
          node.append("circle")
                .attr("stroke", "#fff")
                .attr("stroke-width", 1)
                .attr("r", 5)
                ;
        
          node.append("text")
              .attr("dy", 3)
              .attr("x", function(d) { return d.children ? -12 : 12; })
              .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
              .text(function(d) { return d.id.substring(d.id.lastIndexOf(".") + 1); });
            
        
          // Add Event Listener
          d3.selectAll(".custom-input")
              .on("change", changed);
        
          var timeout = setTimeout(function() {
            animatedLink.interrupt();
            d3.select("input[value=\"tree\"]")
                .property("checked", true)
                .dispatch("change");
          }, 1000);
        
          function changed() {
            timeout = clearTimeout(timeout);
            (this.value === "tree" ? tree : cluster)(root);
            var t = d3.transition().duration(750);
            node.transition(t).attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });
            link.transition(t).attr("d", diagonal);
            animatedLink.interrupt();
            animatedLink.transition(t).attr("d", diagonal);

            // Wait for the transition to complete before reapplying the animation
            animatedLink.transition(t).attr("d", diagonal).on("end", () => {
                animatedLink.each(applyContinuousTransition);
            });
          }

        }).catch(error => {
            console.error("Error loading CSV: ", error);
        });

        
        function diagonal(d) {
          return "M" + d.y + "," + d.x
              + "C" + (d.parent.y + 100) + "," + d.x
              + " " + (d.parent.y + 100) + "," + d.parent.x
              + " " + d.parent.y + "," + d.parent.x;
        }

        function handleLeafNodeClick(url) {
            // console.log("URL: ", url);
            // Only open the URL if it's defined
            if (url) {
                window.open(url, '_blank');
            }
        }