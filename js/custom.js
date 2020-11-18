
var rangeSlider = function () {
    var slider = $('.range-slider'),
        range = $('.range-slider__range'),
        value = $('.range-slider__value');
    slider.each(function () {

        value.each(function () {
            var value = $(this).prev().attr('value');
            $(this).html(value);
        });

        range.on('input', function () {
            $(this).next(value).html(this.value);
        });
    });
};


document.addEventListener('DOMContentLoaded', function () {
    rangeSlider();
    updateDiagram();
}, false);


// This function updates diagram and P(err) values whenever any slider value changes
var updateDiagram = function () {
    console.log("update called!")
    var p_value = document.getElementById('p').value
    var snr_value = document.getElementById('snr').value;
    console.log(snr_value)
    console.log(p_value)

    document.getElementById('err_x0_value').innerText = p_value
    document.getElementById('err_x1_value').innerText = snr_value;
    var voltage_x1 = document.getElementById('voltage_1').value

    document.getElementById('err_value').innerText = calcPErr(0.1, 0.2)


    var data = new google.visualization.DataTable();
    //var data2 = new google.visualization.DataTable();

    data.addColumn('number', 'X Value');
    data.addColumn('number', 'Y Value');


    function NormalDensityZx(x, Mean, StdDev) {

        var a = x - Mean;

        return Math.exp(-(a * a) / (2 * StdDev * StdDev)) / (Math.sqrt(2 * Math.PI) * StdDev);

    }

    var chartData = new Array([]);
    chartData.push()
    var index = 0;

    for (var i = -3; i < 3.1; i += 0.1) {

        chartData[index] = new Array(2);

        chartData[index][0] = i;

        chartData[index][1] = p_value / 0.4 * NormalDensityZx(i, 0, 1);

        index++;

    }

    var chartData2 = new Array([]);
    chartData2.push()
    var index2 = 0;
    for (var i = 1; i < 7.1; i += 0.1) {

        chartData2[index2] = new Array(2);

        chartData2[index2][0] = i;

        chartData2[index2][1] = (1 - p_value) / 0.4 * NormalDensityZx(i, voltage_x1, voltage_x1 / snr_value);

        index2++;

    }


    data.addRows(chartData);
    data.addRows(chartData2);

    options = {
        legend: 'none'
        // chartArea: {
        //     left: 40,
        //     width: '100%'
        // },

        // width: '100%'
    };


    options.hAxis = {};

    options.hAxis.minorGridlines = {};

    options.hAxis.minorGridlines.count = 12;

    var chart = new google.visualization.AreaChart(document.getElementById('chart_div'));

    chart.draw(data, options);
    //chart.draw(data2, options);
}
google.load('visualization', '1', { packages: ['corechart'], callback: updateDiagram });


// calculate P(error) = P(error|X=0)P(X=0) + P(error|X=1)P(X=1) rounded to 4 digits
var calcPErr = function (P_err_x0, P_err_x1) {
    var P_x0 = document.getElementById('p').value / 100
    var P_x1 = 1 - P_x0
    console.log(P_x0, P_x1)
    P_err = (P_err_x0 * P_x0 + P_err_x1 * P_x1).toFixed(4)
    console.log("sssss", P_err)
    return P_err
}

// calulates P(signal) = P(x=0) * (Voltage_x0)^2 + P(x=1) * (Voltage_x1)^2
var calcSignalPower = function () {
    var P_x0 = document.getElementById('p').value / 100
    var P_x1 = 1 - P_x0
    var voltage_x0 = document.getElementById('voltage_0').value
    var voltage_x1 = document.getElementById('voltage_1').value
    power = Math.pow(voltage_x0, 2) * P_x0 + Math.pow(voltage_x1, 2) * P_x1
    return power

}

$(window).resize(function () {
    updateDiagram()
});

