let scatterVis, barVis, donutVis, lineVis, stackedVis, customVisAWS, customVisAzure, customVisGC, treeVis;

// Load data with promises
let promises = [
    d3.csv("data/moore.csv"),
    d3.csv("data/apple.csv"),
    d3.csv("data/aws.csv"),
    d3.csv("data/azure.csv"),
    d3.csv("data/transistors-cpu.csv"),
    d3.csv("data/transistors-gpu.csv"),
    d3.csv("data/clouds.csv"),
    d3.csv("data/stack.csv")
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
    });

    // Create visualization instances
    scatterVis = new ScatterVis("chipvis", chipData, mooreData);
    barVis = new BarVis("applevis", appleData);
    donutVis = new DonutChart("sp500vis", sp500Data);
    lineVis = new LineVis("cloudvis", cloudData);
    stackedVis = new StackedBarVis("stackedvis", cloudData);
    customVisAWS = new CustomVis("custom-aws", cloudData, "Amazon");
    customVisAzure = new CustomVis("custom-azure", cloudData, "Microsoft");
    customVisGC = new CustomVis("custom-gc", cloudData, "Google");
    treeVis = new TreeVis("treevis",aiStackData);
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
    const stalenessInfo = `Data freshness: <span class='font-black'>${daysStale}</span> days since last update.`;
    
    const dataStalenessElement = document.getElementById("dataStalenessInfo");
    dataStalenessElement.innerHTML = stalenessInfo;
}

displayDataStaleness();

function brushed() {
    // React to 'brushed' event
    let selectionRange = d3.brushSelection(d3.select(".brush").node());
}