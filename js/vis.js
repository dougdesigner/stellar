// Load data with promises
let promises = [
    d3.csv("data/transistors.csv"),
    d3.csv("data/moore.csv"),
    d3.csv("data/apple.csv"),
    d3.csv("data/aws.csv"),
    d3.csv("data/azure.csv")
];

Promise.all(promises)
    .then(function (data) {
        createVis(data)
    })
    .catch(function (err) {
        console.log(err)
    });

function createVis(data) {
    let chipData = data[0];
    let mooreData = data[1];
    let appleData = data[2];
    let awsData = data[3];
    let azureData = data[4];

    let sp500Data = [
        { Company: 'Apple', Percentage: '7.07%', MarketCap: '$2.950 trillion', ReturnYTD: '+22%' },
        { Company: 'Microsoft', Percentage: '6.74%', MarketCap: '$2.81 trillion', ReturnYTD: '+45%' },
        { Company: 'Alphabet', Percentage: '4.08%', MarketCap: '$1.701 trillion', ReturnYTD: '+49%' },
        { Company: 'Amazon', Percentage: '3.57%', MarketCap: '$1.49 trillion', ReturnYTD: '+58%' },
        { Company: 'NVIDIA', Percentage: '2.88%', MarketCap: '$1.20 trillion', ReturnYTD: '+241%' },
        { Company: 'Tesla', Percentage: '1.79%', MarketCap: '$744.82 billion', ReturnYTD: '+67%' },
        { Company: 'Meta', Percentage: '2.06%', MarketCap: '$861.01 billion', ReturnYTD: '+150%' },
        { Company: 'Other Companies', Percentage: '71.81%', MarketCap: '$35.94 trillion', ReturnYTD: '+6%' }
    ];

    // Parse the data
    chipData.forEach(d => {
        d.Year = new Date(d.Year.trim());
        d.TransistorCount = parseInt(d["Transistor count"].replace(/,/g, ''), 10);
    });

    mooreData.forEach(d => {
        d.Year = new Date(d.Year.trim());
        d.TransistorCount = parseInt(d["TransistorCount"].replace(/,/g, ''), 10);
    });

    appleData.forEach(d => {
        d.ReleaseDate = new Date(d.ReleaseDate);
        d.TransistorCount = parseInt(d["Transistor Count"] , 10);
    });

    // console.log(appleData)

    // Create visualization instances
    let chipVis = new ChipVis("chipvis", chipData, mooreData);
    let appleVis = new AppleVis("applevis", appleData);
    let sp500Vis = new DonutChart("sp500vis", sp500Data);

}


