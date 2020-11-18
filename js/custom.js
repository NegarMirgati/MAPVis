var rangeSlider = function () {
  var slider = $(".range-slider"),
    range = $(".range-slider__range"),
    value = $(".range-slider__value");
  slider.each(function () {
    value.each(function () {
      var value = $(this).prev().attr("value");
      $(this).html(value);
    });

    range.on("input", function () {
      $(this).next(value).html(this.value);
    });
  });
};

document.addEventListener(
  "DOMContentLoaded",
  function () {
    rangeSlider();
    updateDiagram();
  },
  false
);

function NormalDensityZx(x, Mean, StdDev) {
  var a = x - Mean;
  return (
    Math.exp(-(a * a) / (2 * StdDev * StdDev)) /
    (Math.sqrt(2 * Math.PI) * StdDev)
  );
}

var getChartData = function (Mean, StdDev, p_value) {
  var chartData = new Array([]);
  chartData.push();
  var index = 0;

  lower_bound = Math.floor(Mean - 3 * StdDev);
  upper_bound = Math.floor(Mean + 3 * StdDev);

  for (var i = lower_bound; i < upper_bound; i += 0.1) {
    chartData[index] = new Array(2);

    chartData[index][0] = i;

    chartData[index][1] = (p_value / 0.4) * NormalDensityZx(i, Mean, StdDev);

    index++;
  }
  return chartData;
};

// This function updates diagram and P(err) values whenever any slider value changes
var updateDiagram = function () {
  console.log("update called!");
  var p_value = document.getElementById("p").value;
  var sigma_value = parseInt(document.getElementById("sigma").value);

  document.getElementById("err_x0_value").innerText = p_value;
  document.getElementById("err_x1_value").innerText = sigma_value;
  document.getElementById("snr_calculated").innerText = getSNR().toFixed(4);

  var voltage_x0 = parseInt(document.getElementById("voltage_0").value);
  var voltage_x1 = parseInt(document.getElementById("voltage_1").value);

  document.getElementById("err_value").innerText = calcPErr(0.1, 0.2);

  var data = new google.visualization.DataTable();

  data.addColumn("number", "X Value");
  data.addColumn("number", "Y Value");

  chart1_data = getChartData(voltage_x0, sigma_value, p_value);
  chart2_data = getChartData(voltage_x1, sigma_value, 1 - p_value);

  data.addRows(chart1_data);
  data.addRows(chart2_data);

  options = {
    legend: "none",
  };

  options.hAxis = {};
  options.hAxis.minorGridlines = {};
  options.hAxis.minorGridlines.count = 12;
  var chart = new google.visualization.AreaChart(
    document.getElementById("chart_div")
  );
  chart.draw(data, options);
};

google.load("visualization", "1", {
  packages: ["corechart"],
  callback: updateDiagram,
});

var calcPErrorZero = function () {
  var voltage_x0 = parseInt(document.getElementById("voltage_0").value);
  var voltage_x1 = parseInt(document.getElementById("voltage_1").value);
  intersection_point = (voltage_x0 + voltage_x1) / 2;
  return 1;
};

var calcPErrorOne = function () {
  return 1;
};

// calculate P(error) = P(error|X=0)P(X=0) + P(error|X=1)P(X=1) rounded to 4 digits
var calcPErr = function (P_err_x0, P_err_x1) {
  var P_x0 = document.getElementById("p").value / 100;
  var P_x1 = 1 - P_x0;
  console.log(P_x0, P_x1);
  P_err = (P_err_x0 * P_x0 + P_err_x1 * P_x1).toFixed(4);
  console.log("sssss", P_err);
  return P_err;
};

// calulates P(signal) = P(x=0) * (Voltage_x0)^2 + P(x=1) * (Voltage_x1)^2
var calcSignalPower = function () {
  var P_x0 = document.getElementById("p").value / 100;
  var P_x1 = 1 - P_x0;
  var voltage_x0 = document.getElementById("voltage_0").value;
  var voltage_x1 = document.getElementById("voltage_1").value;
  power = Math.pow(voltage_x0, 2) * P_x0 + Math.pow(voltage_x1, 2) * P_x1;
  return power;
};

var calcNoisePower = function () {
  var sigma = document.getElementById("sigma").value;
  return Math.pow(sigma, 2);
};

var getSNR = function () {
  signal_power = calcSignalPower();
  noise_power = calcNoisePower();
  return signal_power / noise_power;
};

// #NOTE : This makes the diagram responsive because the diagram will be redrawn every time the window size changes.
$(window).resize(function () {
  updateDiagram();
});
