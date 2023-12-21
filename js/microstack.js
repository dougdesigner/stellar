class LogoVis {
    constructor(_parentElement, _data, _company, _chipData, _chip) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.company = _company;
        this.chipData = _chipData;
        this.chip = _chip;
        this.displayData = [];

        this.specificChipData = this.chipData.find(row => row.Processor === this.chip);

        // Initialize visualization
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.element = document.getElementById(vis.parentElement);

        vis.margin = {top: 20, right: 100, bottom: 0, left:100},
        vis.width = vis.element.offsetWidth - vis.margin.left - vis.margin.right,
        vis.height = 160 - vis.margin.top - vis.margin.bottom,

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
                .attr("transform", `translate(${vis.width/2 + vis.margin.left}, ${vis.margin.top})`);

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
        .attr("stop-color", "cyan"); // Start color
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
        .attr("stop-color", "lime"); // Start color
        gradient3.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "teal"); // End color




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

        // Create a linear scale for purple
        vis.purpleColorScale = d3.scaleLinear()
            .domain(vis.marketShareExtent)
            .range(["#581C87", "#a855f7"]);

        // Create a linear scale for emerald
        vis.emeraldColorScale = d3.scaleLinear()
            .domain(vis.growthExtent)
            .range(["#065F46", "#34d399"]);

        
        let transistorCount = vis.specificChipData.TransistorCount;
            
        vis.billionCount = transistorCount / 1000000000;

        vis.billionScaled = vis.billionCount * 250;

        let sqrtTransistorBillion = Math.sqrt(vis.billionScaled);



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
            .attr("fill", "url(#dots-9)");
            // .attr("fill", "url(#horizontal-stripe-9)");

        // Layer 3.2
        vis.svg.append("g")
        .attr("transform", "translate(0, 60) rotate(30) skewX(-30) scale(1, 0.86062)")
        .append("rect")
            .attr("x", -40)
            .attr("y", -40)
            .attr("width", 80)
            .attr("height", 80)
            .attr("rx", 4)
            .attr("opacity", .25)
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
            .attr("fill", "url(#horizontal-stripe-9)");

        


        // Layer 1        
        vis.svg.append("g")
            .attr("transform", "translate(0, 20) rotate(30) skewX(-30) scale(1, 0.86062)")
            .append("rect")
                .attr("x", -30)
                .attr("y", -30)
                // base the height on the square root of the vis.specifcChipData.TransistorCount
                .attr("width", 60)
                .attr("height", 60)
                .attr("rx", 4)
                .attr("fill", "url(#gradient)");

        // Pattern Overlay 1
        vis.svg.append("g")
            .attr("transform", "translate(0, 20) rotate(30) skewX(-30) scale(1, 0.86062)")
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
                .attr("fill", "url(#circles-9)");


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


        // Company Logo
        vis.svg.append("g")
            .attr("transform", "rotate(30) skewX(-30) scale(1, 0.86062)")
            .append("image")    
            .attr("href", getCenterImage(vis.specificChipData.Designer))
            .attr("x", -16) 
            .attr("y", -16)
            .attr("width", 32)
            .attr("height", 32);

        // // Designer name
        // vis.svg.append("text")
        //     .attr("transform", "translate(80, 40) rotate(30) skewX(-30) scale(1, 0.86062)")
        //     .text(`${vis.specificChipData.Designer}`)
        //     .attr("class", "text-base font-mono font-medium fill-white")


        // // Microprocessor name
        // vis.svg.append("text")
        //     .attr("transform", "translate(60, 60) rotate(30) skewX(-30) scale(1, 0.86062)")
        //     .text(`${vis.specificChipData.Processor}`)
        //     .attr("class", "text-base font-mono font-medium fill-white")

        // // Microprocessor Data
        // vis.svg.append("text")
        //     .attr("transform", "translate(40, 80) rotate(30) skewX(-30) scale(1, 0.86062)")
        //     .text(`${vis.billionCount} B Transistors`)
        //     .attr("class", "text-xs font-mono font-medium fill-white")

        // vis.svg.append("text")
        //     .attr("transform", "translate(20, 100) rotate(30) skewX(-30) scale(1, 0.86062)")
        //     .text(`${vis.specificChipData.Type}`)
        //     .attr("class", "text-xs font-mono font-medium fill-white")

    }

}
