
document.addEventListener('DOMContentLoaded', (event) => {
    usaCurrentData();
    usaCasesGraph();
    lineChart("usaLineGraph", getJsonUsaDaily());
    barChart('usaBarGraph', getJsonUsaDaily());
   
   
});

/* Function: usaCurrentData
 * Parameters: none
 * Returns: none
 * Description: Makes get request to recive JSON data with current USA data.
 *      Displays total number of current cases, deaths, and hospitalizations. 
 * 
 */
function usaCurrentData() {

    let req = new XMLHttpRequest();
    req.open("GET", "https://covidtracking.com/api/us", false);
    req.send(null);

    let dataRes = JSON.parse(req.responseText);
  
    document.getElementById('usaCases').innerText = dataRes[0].positive;
    
    document.getElementById('usaHospitalized').innerText = dataRes[0].hospitalizedCurrently;

    document.getElementById('usaDeaths').innerText = dataRes[0].death;

    usaDouble(dataRes);

    pieChart("usaPieGraph", dataRes);
}

function usaDouble(usaData) {
    var currentDayPos = usaData[0].positive;
    var dailyUSAData = getJsonUsaDaily();
    let numDaysCounter = 0;
    if (dailyUSAData[numDaysCounter].positive < currentDayPos / 2) {
        document.getElementById('usaDouble').innerText = '< 1';
    }
    else {
        while (dailyUSAData[numDaysCounter].positive > currentDayPos / 2) {
            numDaysCounter++;
        }
        document.getElementById('usaDouble').innerText = numDaysCounter + 1;
    }
}

function usaCasesGraph() {

    let req = new XMLHttpRequest();
    req.open("GET", "https://covidtracking.com/api/states", false);
    req.send(null);

    let dataRes = JSON.parse(req.responseText);
    
    let infectedNumber = totalCases() / 20;
    
    var chart = JSC.chart('chartDiv', {
        debug: false,
        type: 'map',
        title_label_text: '',
        palette: {
            pointValue: '{%zValue}',
            colors: [
                '#f7fcfd',
                '#e5f5f9',
                '#ccece6',
                '#99d8c9',
                '#66c2a4',
                '#41ae76',
                '#238b45',
                '#006d2c',
                '#00441b'
            ],
            ranges: { min: 0, max: infectedNumber, interval: infectedNumber / 10 },
            defaultRange_legendEntry_value:
                '%min - %max'
        }, 
      
        legend_title_label_text: 'Cumulative Cases',

        defaultPoint: {
            label_text: '%stateCode',
            tooltip: '<b>%name<b/> <br/>Cases: %zValue'
        },

        /* Pad the map data points for separation from the chart area boundary. */
        defaultSeries_shape_padding: .02,
        series: [
            {
                map: 'us',
                defaultPoint_events_click: mapClick,
                points: dataRes.map(function (arrItem) {
                    return {
                        map: 'US.' + arrItem.state,
                        z: arrItem.positive
                    };
                })
            }
        ]  
    });
}

function getJsonUsaDaily() {
    let req = new XMLHttpRequest();
    req.open("GET", "https://covidtracking.com/api/us/daily", false);
    req.send(null);

    let dataRes = JSON.parse(req.responseText);
    return dataRes;
}

function getJsonStateDaily(stateSelected) {
    let req = new XMLHttpRequest();
    req.open("GET", "https://covidtracking.com/api/states/daily", false);
    req.send(null);
    let data = JSON.parse(req.responseText);

    var stateObj = function(cases, hospital, deaths, date, positiveInc, recoveredCases){

        this.positive = cases;
        this.hospitalized = hospital;
        this.death = deaths;
        this.date = date;
        this.positiveIncrease = positiveInc;
        this.recovered = recoveredCases;
    }
   
    var stateArray = [];
    for (var i = 0; i < data.length; i ++) {
        if (data[i].state === stateSelected) {
            stateArray.push(new stateObj(data[i].positive, data[i].hospitalized, data[i].death, data[i].date, data[i].positiveIncrease, data[i].recoveredCases));          
        }
    }
    return stateArray;
}

 function totalCases() {

     let req = new XMLHttpRequest();
     req.open("GET", "https://covidtracking.com/api/us", false);
     req.send(null);

     let dataRes = JSON.parse(req.responseText);
     return dataRes[0].positive;
 }

function makeStateMap(jsonStateData) {

    var stateMap = new Map()

    for (var i = 0; i < jsonStateData.length - 5; i++) {
        stateMap.set(jsonStateData[i].state, i);
    }
    
    return stateMap
}

function mapClick(data) {

    displayStateData(data.currentTarget.userOptions.attributes.postal);
    document.getElementById('stateSelected').innerText = data.currentTarget.userOptions.attributes.state;    
}

function displayStateData(stateSelected) {

    let req = new XMLHttpRequest();
    req.open("GET", "https://covidtracking.com/api/states", false);
    req.send(null);

    let dataRes = JSON.parse(req.responseText);
    var hashMap = makeStateMap(dataRes);

    let selectedStateIndex = hashMap.get(stateSelected);

    displayNumCasesState(dataRes, selectedStateIndex);
    displayHospitalizedState(dataRes, selectedStateIndex);
    displayDeathsState(dataRes, selectedStateIndex);
    statesDoubleRate(dataRes, selectedStateIndex, getJsonStateDaily(stateSelected))
    lineChart("stateLineGraph", getJsonStateDaily(stateSelected));
    barChart("stateBarGraph", getJsonStateDaily(stateSelected));
    pieChart("statePieGraph", getJsonStateDaily(stateSelected))
}

function statesDoubleRate(stateData, index, stateDailyData) {
    let currentDayStateData = stateData[index].positive;
    let dailyStateJsonData = stateDailyData;
    let dayCounter = 0;

    if (dailyStateJsonData[dayCounter].positive < currentDayStateData / 2) {
        document.getElementById('stateDouble').innerText = '< 1';
    }
    else {
        while (dailyStateJsonData[dayCounter].positive > currentDayStateData / 2) {
            dayCounter++;
        }
        document.getElementById('stateDouble').innerText = dayCounter + 1;
    } 
}

function displayNumCasesState(stateData,index) {

    if (stateData[index].positive === 0) {
        document.getElementById('stateCases').innerText = "Not Reported";
    }
    else {
        document.getElementById('stateCases').innerText = stateData[index].positive;
    }
}

function displayHospitalizedState(stateData, index) {

    if (stateData[index].hospitalized === 0 || stateData[index].hospitalized === null) {
        document.getElementById('stateHospitalized').innerText = "Not Reported";
    }
    else {
        document.getElementById('stateHospitalized').innerText = stateData[index].hospitalized;
    }
}

function displayDeathsState(stateData, index) {

    if (stateData[index].death === 0) {
        document.getElementById('stateDeaths').innerText = "Not Reported";
    }
    else {
        document.getElementById('stateDeaths').innerText = stateData[index].death;
    }
}

function lineChart(chartName, dataFunction) {

    var dailyData = dataFunction;
    
    // Split timestamp and data into separate arrays
    let datesArray = [], casesArray = [], deathsArray = [], hospitalArray = [] ;
    
    for (var i = dailyData.length-1; i >= 0; i--) {
        if (dailyData[i] !== null) {
            datesArray.push(dailyData[i].date);
            casesArray.push(dailyData[i].positive);
            deathsArray.push(dailyData[i].death);
            if (chartName === "usaLineGraph") {
                hospitalArray.push(dailyData[i].hospitalizedCurrently);
            }
            else {
                hospitalArray.push(dailyData[i].hospitalized);
            }
        }
        
    }
        

    var chartdata = null;
     chartdata = {
        labels: datesArray,
        datasets: [
            {
                label: 'Cases',
                backgroundColor: 'blue',
                borderColor: 'blue',
                hoverBackgroundColor: '#CCCCCC',
                hoverBorderColor: '#666666',
                data: casesArray,
                fill: false
            }, {
                label: 'Hospitalized',
                backgroundColor: 'red',
                borderColor: 'red',
                hoverBackgroundColor: '#CCCCCC',
                hoverBorderColor: '#666666',
                data: hospitalArray,
                fill: false
            },
            {
                label: 'Deaths',
                backgroundColor: 'black',
                borderColor: 'black',
                hoverBackgroundColor: '#CCCCCC',
                hoverBorderColor: '#666666',
                data: deathsArray,
                fill: false
            }            
        ]
    };

    
    document.getElementById(chartName).remove();
    var lineGraph = document.createElement("canvas");
    lineGraph.id = chartName;
    document.getElementById(chartName + "Div").appendChild(lineGraph);
    var graphTarget = $("#" + chartName);
    var line1Graph = new Chart(graphTarget, {
        type: 'line',
        data: chartdata,
        
        
        options: {
            fill: false,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: 'Culumative Cases with Outcomes',
                top,
                fontSize: 16
            }
        }
    });

    
}

function barChart(chartName, dataFunction) {
    //fix data for states as it is not the current data but past day's data
    var dailyData = dataFunction;

    // Split timestamp and data into separate arrays
    let dateArray = [], casesIncArray = [];

    for (var i = dailyData.length - 1; i >= 0; i--) {
        if (dailyData[i] !== null) {
            dateArray.push(dailyData[i].date);
            casesIncArray.push(dailyData[i].positiveIncrease);           
        }

    }


    var chartdata = null;
    chartdata = {
        labels: dateArray,
        datasets: [
            {
                label: 'New Daily Cases',
                backgroundColor: 'blue',
                borderColor: 'blue',
                hoverBackgroundColor: '#CCCCCC',
                hoverBorderColor: '#666666',
                data: casesIncArray,
                fill: false
            }
        ]
    };


    document.getElementById(chartName).remove();
    var lineGraph = document.createElement("canvas");
    lineGraph.id = chartName;
    document.getElementById(chartName + "Div").appendChild(lineGraph);
    var graphTarget = $("#" + chartName);
    var barGraph = new Chart(graphTarget, {
        type: 'bar',
        data: chartdata,


        options: {
            fill: false,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: 'New Daily Cases',
                top,
                fontSize: 16
            }
        }
    });


}

function pieChart(chartName, dataFunction) {

    var currentData = dataFunction;

    document.getElementById(chartName).remove();
    var pieGraph = document.createElement("canvas");
    pieGraph.id = chartName;
    document.getElementById(chartName + "Div").appendChild(pieGraph);
    var graphTarget = $("#" + chartName);
    var pie1Graph = new Chart(graphTarget, {
        type: 'doughnut', 
        data: {
            labels: ["Cases", "Recovered", "Deaths"],
            datasets: [{
                label: " x ",
                backgroundColor: ["blue", "green", "black"],
                data: [currentData[0].positive, currentData[0].recovered, currentData[0].death]
            }]
        },
        options: {
            title: {
                display: true,
                text: 'Total Cases vs Recovered vs Deaths'
            }
        }
    });
}