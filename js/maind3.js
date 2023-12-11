let scatterVis, barVis, donutVis, lineVis, stackedVis, drbVisAWS, drbVisAzure, drbVisGC, treeVis, microVis, neuralVis, areaVis;
// Brushing
let selectedQuarterRange = [];

// Load data with promises
let promises = [
    d3.csv("data/moore.csv"),
    d3.csv("data/apple.csv"),
    d3.csv("data/aws.csv"),
    d3.csv("data/azure.csv"),
    d3.csv("data/transistors-cpu.csv"),
    d3.csv("data/transistors-gpu.csv"),
    d3.csv("data/clouds.csv"),
    d3.csv("data/stack.csv"),
    d3.json("data/nodes.json")
];

Promise.all(promises)
    .then(function (data) {
        createVis(data)
    })
    .catch(function (err) {
        console.log(err)
    });

function createVis(data) {
    let mooreData = data[0];
    let appleData = data[1];
    // let awsData = data[2];
    // let azureData = data[3];
    let cpuData = data[4];
    let gpuData = data[5];
    let cloudData = data[6];
    let aiStackData = data[7];
    let neuralData = data[8];

    let chipData = cpuData.concat(gpuData);

    let sp500Data = [
        { Company: 'Apple', Percentage: '7.07%', MarketCap: '$2.950 trillion', ReturnYTD: '+22%' },
        { Company: 'Microsoft', Percentage: '6.74%', MarketCap: '$2.81 trillion', ReturnYTD: '+45%' },
        { Company: 'Google', Percentage: '4.08%', MarketCap: '$1.701 trillion', ReturnYTD: '+49%' },
        { Company: 'Amazon', Percentage: '3.57%', MarketCap: '$1.49 trillion', ReturnYTD: '+58%' },
        { Company: 'Nvidia', Percentage: '2.88%', MarketCap: '$1.20 trillion', ReturnYTD: '+241%' },
        { Company: 'Tesla', Percentage: '1.79%', MarketCap: '$744.82 billion', ReturnYTD: '+67%' },
        { Company: 'Meta', Percentage: '2.06%', MarketCap: '$861.01 billion', ReturnYTD: '+150%' },
        { Company: 'S&P 493', Percentage: '71.81%', MarketCap: '$35.94 trillion', ReturnYTD: '+6%' }
    ];

    // Parse the data
    chipData.forEach(d => {
        d.Year = new Date(d.Year.trim(),0);
        d.TransistorCount = parseInt(d["Transistor count"].replace(/,/g, ''), 10);
    });

    mooreData.forEach(d => {
        d.Year = new Date(d.Year.trim(),0);
        d.TransistorCount = parseInt(d["TransistorCount"].replace(/,/g, ''), 10);
    });

    appleData.forEach(d => {
        d.ReleaseDate = d["Release Date"];
        d.TransistorCount = parseInt(d["Transistor Count"] , 10);
    });

    cloudData.forEach(d => {
        d.MarketShareValue = parseFloat(d['Market Share'].replace('%', ''));
        d.GrowthRateValue = +d['Growth Rate'].replace('%', '');
        d.MarketShare = parseFloat(d["Market Share"].replace(/,/g, ''), 10);
        d.GrowthRate = parseFloat(d["Growth Rate"].replace(/,/g, ''), 10);
        d['Market Share'] = parseFloat(d['Market Share'].replace('%', '')) / 100;
        d['Growth Rate'] = +d['Growth Rate'].replace('%', '')  / 100;
        d.RoundRevenue = Math.floor(d['Revenue'] / 1000); // Rounds to nearest billion
    });

    // Create visualization instances
    scatterVis = new ScatterVis("chipvis", chipData, mooreData);
    barVis = new BarVis("applevis", appleData);
    donutVis = new DonutChart("sp500vis", sp500Data);
    lineVis = new LineVis("cloudvis", cloudData);
    // stackedVis = new StackedBarVis("stackedvis", cloudData);
    drbVisAWS = new DoubalRadialBarVis("custom-aws", cloudData, "Amazon");
    drbVisAzure = new DoubalRadialBarVis("custom-azure", cloudData, "Microsoft");
    drbVisGC = new DoubalRadialBarVis("custom-gc", cloudData, "Google");
    treeVis = new TreeVis("treevis",aiStackData);
    neuralVis = new NeuralNetworkVis("neuralvis",neuralData);

    microAWSVis = new CustomVis("micro-aws", cloudData, "Amazon", chipData, "AWS Graviton");
    microAWSVis2 = new CustomVis("micro-aws2", cloudData, "Amazon", chipData, "AWS Graviton2");
    microAWSVis3 = new CustomVis("micro-aws3", cloudData, "Amazon", chipData, "AWS Graviton3");
    microAWSVis4 = new CustomVis("micro-aws4", cloudData, "Amazon", chipData, "AWS Graviton4");

    microVis2 = new CustomVis("micro-azure", cloudData, "Microsoft", chipData, "Azure Maia 100");

    microGCVis = new CustomVis("micro-gc", cloudData, "Google", chipData, "TPUv1");
    microGCVis3 = new CustomVis("micro-gc3", cloudData, "Google", chipData, "TPUv3");
    microGCVis4 = new CustomVis("micro-gc4", cloudData, "Google", chipData, "TPUv4");

    microNVis = new CustomVis("micro-n", cloudData, "Nvidia", chipData, "GH100 Hopper");
    microNVis2 = new CustomVis("micro-n2", cloudData, "Nvidia", chipData, "AD102 Ada Lovelace");
    microNVis3 = new CustomVis("micro-n3", cloudData, "Nvidia", chipData, "GA100 Ampere");

    areaVis = new StackedAreaVis("areavis", cloudData);

    logoVis = new LogoVis("logo-vis", cloudData, "Amazon", chipData, "AWS Graviton");
    
}










// Additional Helper Functions
function calculateDataStaleness() {
    const lastUpdatedDate = new Date("2023-11-01"); // Adjust this to your actual last update date
    const currentDate = new Date();

    const differenceInTime = currentDate.getTime() - lastUpdatedDate.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

    return differenceInDays;
}

function displayDataStaleness() {
    const daysStale = calculateDataStaleness();
    const stalenessInfo = `Data freshness: <span class='font-black'>${daysStale}</span> Days`;
    
    const dataStalenessElement = document.getElementById("dataStalenessInfo");
    dataStalenessElement.innerHTML = stalenessInfo;
}

displayDataStaleness();

// function brushed() {
//     // Get the selection range from the brush
//     let selection = d3.brushSelection(d3.select(".brush").node());

//     if (selection) {
//         // Convert the selection range (pixel values) back to data values
//         let selectedDomain = selection.map(vis.x.invert);

//         console.log(selection);
//         console.log(selectedDomain);
//         // Log the selected domain for debugging
//         console.log(selectedDomain);

//         // Update the other visualization
//         // Assuming you have a method in the other visualization class
//         otherVisualizationInstance.updateDataRange(selectedDomain);
//     }
// }