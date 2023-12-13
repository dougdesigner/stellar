class CustomVis {
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

        vis.margin = {top: -20, right: 100, bottom: 0, left: 100},
        vis.width = vis.element.offsetWidth - vis.margin.left - vis.margin.right,
        vis.height = 350 - vis.margin.top - vis.margin.bottom,

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
                .attr("class", "microprocessor-vis")
            .append("g")
                .attr("class", "microprocessor-vis-g")
                .attr("transform", `translate(${(vis.width + vis.margin.left + vis.margin.right) / 2}, ${(vis.height/2 + vis.margin.top + vis.margin.bottom) / 2})`);

        // Tooltip
        vis.tooltip = d3.select('body').append('div')
            .attr("class", "tooltip microprocessor-tooltip")
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
        .attr("stop-color", "fuchsia"); // Start color
        gradient3.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "darkorange"); // End color

        // Define a new gradient like the one above
        const gradient4 = vis.svg.append("defs")
        .append("linearGradient")
        .attr("id", "gradient4")
        .attr("x1", "0%") // Gradient starts at the bottom
        .attr("y1", "100%")
        .attr("x2", "0%") // and goes to the top
        .attr("y2", "0%");
        // .attr("gradientUnits", "userSpaceOnUse");

        // Define start and end colors of the gradient
        gradient4.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "lime"); // Start color
        gradient4.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "teal"); // End color

        // Pattern and Gradient Scales  
        vis.color = d3.scaleOrdinal()
        .range(["url(#gradient)", "url(#gradient2)", "url(#gradient4)"])
        .domain(["AI Accelorator", "CPU", "GPU"]);

        vis.pattern = d3.scaleOrdinal()
        .range(["url(#circles-9)", "url(#horizontal-stripe-9)", "url(#dots-9)"])
        .domain(["AI Accelorator", "CPU", "GPU"]);
    


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
            { company: "Nvidia", imageUrl: "/images/m7/Nvidia-n.svg" },
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
        

        // Layer 3  - No Pattern (Foundation)      
        vis.svg.append("g")
        .attr("transform", "translate(0, 80) rotate(30) skewX(-30) scale(1, 0.86062)")
        .append("rect")
            .attr("class", "layer layer-3 gradient-layer")
            .attr("x", -30)
            .attr("y", -30)
            // base the height on the square root of the vis.specifcChipData.TransistorCount
            .attr("width", sqrtTransistorBillion)
            .attr("height", sqrtTransistorBillion)
            .attr("rx", 4)
            .attr("fill", d => vis.color(vis.specificChipData.Type));


        
        // Layer 1        
        vis.svg.append("g")
            .attr("transform", "translate(0, 60) rotate(30) skewX(-30) scale(1, 0.86062)")
            .append("rect")
                .attr("class", "layer layer-2 gradient-layer")
                .attr("x", -30)
                .attr("y", -30)
                // base the height on the square root of the vis.specifcChipData.TransistorCount
                .attr("width", sqrtTransistorBillion)
                .attr("height", sqrtTransistorBillion)
                .attr("rx", 4)
                .attr("opacity", 0.5)
                .attr("fill", d => vis.color(vis.specificChipData.Type));
        

        // Layer 1        
        vis.svg.append("g")
            .attr("transform", "translate(0, 40) rotate(30) skewX(-30) scale(1, 0.86062)")
            .append("rect")
                .attr("class", "layer layer-1 gradient-layer")
                .attr("x", -30)
                .attr("y", -30)
                // base the height on the square root of the vis.specifcChipData.TransistorCount
                .attr("width", sqrtTransistorBillion)
                .attr("height", sqrtTransistorBillion)
                .attr("rx", 4)
                .attr("fill", d => vis.color(vis.specificChipData.Type));

        // Pattern Overlay 1
        vis.svg.append("g")
            .attr("transform", "translate(0, 40) rotate(30) skewX(-30) scale(1, 0.86062)")
            .append("rect")
                .attr("class", "pattern-overlay pointer-events-none")
                .attr("x", -30)
                .attr("y", -30)
                .attr("width", sqrtTransistorBillion)
                .attr("height", sqrtTransistorBillion)
                .attr("rx", 4)
                .attr("opacity", 0.1)
                // .attr("stroke-width", 2)
                // .attr("stroke", "black")
                .attr("blend-mode", "multiply")
                .attr("fill", d => vis.pattern(vis.specificChipData.Type));


        // Logo background
        vis.svg.append("g")
        .attr("transform", "rotate(30) skewX(-30) scale(1, 0.86062)")
        .append("rect")
            .attr("class", "logo-background")
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

        // Designer name
        vis.svg.append("text")
            .attr("transform", `translate(32, 16) rotate(30) skewX(-30) scale(1, 0.86062)`)
            .text(`${vis.specificChipData.Processor}`)
            .attr("class", "text-sm font-mono font-medium fill-slate-50");


        // Microprocessor name
        vis.svg.append("text")
            .attr("transform", `translate(60, ${sqrtTransistorBillion + 40}) rotate(30) skewX(-30) scale(1, 0.86062)`)
            .text(`- ${vis.specificChipData.Designer}`)
            .attr("class", "text-xs font-mono font-light fill-slate-400");

        vis.svg.append("text")
        .attr("transform", `translate(40, ${sqrtTransistorBillion + 50}) rotate(30) skewX(-30) scale(1, 0.86062)`)
        .text(`- ${vis.specificChipData.Type}`)
        .attr("class", "text-xs font-mono font-light fill-slate-400");


        // Microprocessor Data
        vis.svg.append("text")
            .attr("transform", `translate(20, ${sqrtTransistorBillion + 60}) rotate(30) skewX(-30) scale(1, 0.86062)`)
            .text(`- ${vis.specificChipData.Year.getFullYear()}`)
            .attr("class", "text-xs font-mono font-bold fill-slate-400");


                    // Microprocessor Data
        vis.svg.append("text")
        .attr("transform", `translate(-50, ${sqrtTransistorBillion + 45}) rotate(-30) skewX(30) scale(1, 0.86062)`)
        .text(`Transistors`)
        .attr("text-anchor", "end")
        .attr("font-size", "10px")
        .attr("class", "font-mono font-normal fill-slate-400");

        // Microprocessor Data
        vis.svg.append("text")
            .attr("transform", `translate(-30, ${sqrtTransistorBillion + 60}) rotate(-30) skewX(30) scale(1, 0.86062)`)
            .text(`${vis.billionCount} B`)
            .attr("text-anchor", "end")
            .attr("class", "text-xl font-mono font-bold fill-slate-200");


   

    }

}
