const element = document.getElementById("customvis");
        var elementWidth = element.offsetWidth;

        console.log(elementWidth);

        var marginRight = 300
        var marginLeft = 100


        var svg = d3.select("#customvis").append("svg"),
            width = elementWidth,
            height = 500,
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
          
          console.log(data);
            
          var root = stratify(data);
        
          cluster(root);
        
          var link = g.selectAll(".link")
              .data(root.descendants().slice(1))
            .enter().append("path")
              .attr("class", "link")
              .attr("d", diagonal);
        
          var node = g.selectAll(".node")
              .data(root.descendants())
            .enter().append("g")
              .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
              .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });
        
          node.append("circle")
                .attr("stroke", "#fff")
                .attr("stroke-width", 1)
                .attr("r", 5);
        
          node.append("text")
              .attr("dy", 3)
              .attr("x", function(d) { return d.children ? -12 : 12; })
              .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
              .text(function(d) { return d.id.substring(d.id.lastIndexOf(".") + 1); });
        
          // Add Event Listener
          d3.selectAll(".custom-input")
              .on("change", changed);
        
          var timeout = setTimeout(function() {
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