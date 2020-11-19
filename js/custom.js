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

var getPdf = function (x, mean, dev, p) {
  return p * jStat.normal.pdf(x, mean, dev);
};

var getChartData = function (Mean, StdDev, p_value, intersection, flag) {
  var chartData = new Array([]);
  chartData.push();
  var index = 0;

  lower_bound = Math.floor(Mean - 3 * StdDev);
  upper_bound = Math.floor(Mean + 3 * StdDev);

  for (var i = lower_bound; i < upper_bound; i += 0.05) {
    chartData[index] = new Array(4);

    chartData[index][0] = i;
    chartData[index][1] = getPdf(i, Mean, StdDev, p_value);

    if (
      (i > intersection && flag != true) ||
      (i < intersection && flag == true)
    ) {
      chartData[index][2] = false;
    }

    chartData[index][3] =
      "opacity: 1; + color: #4EA2F1; + stroke-color: #00F603; ";

    index++;
  }
  return chartData;
};

function setChartOptions() {
  options = { legend: "none", backgroundColor: "transparent" };
  options.hAxis = {};
  options.hAxis.minorGridlines = {};
  options.hAxis.minorGridlines.count = 12;

  return options;
}

function addColumns() {
  data.addColumn("number", "X Value");
  data.addColumn("number", "Y Value");
  data.addColumn({ type: "boolean", role: "scope" });
  data.addColumn({ type: "string", role: "style" });
}

function prepareChart(rows1, rows2) {
  data = new google.visualization.DataTable();

  setChartOptions();
  addColumns();

  data.addRows(chart1_data);
  data.addRows(chart2_data);

  drawChart(data);
}

function drawChart(data) {
  chart = new google.visualization.AreaChart(
    document.getElementById("chart_div")
  );
  chart.draw(data, options);
}

// This function updates diagram and P(err) values whenever any slider value changes
var updateDiagram = function () {
  var p_0_value = parseFloat(document.getElementById("p").value);
  var p_1_value = 1 - p_0_value;
  var sigma_value = parseFloat(document.getElementById("sigma").value);
  console.log("sigmaaaaa", sigma_value);

  document.getElementById("snr_calculated").innerText = getSNR().toFixed(4);

  var voltage_x0 = parseInt(document.getElementById("voltage_0").value);
  var voltage_x1 = parseInt(document.getElementById("voltage_1").value);

  //   document.getElementById("err_value").innerText = calcPErr(0.1, 0.2);
  flag = voltage_x1 > voltage_x0;

  intersection = getIntersection();
  document.getElementById(
    "intersection_value"
  ).innerText = intersection.toFixed(4);

  // prepare chart!
  chart1_data = getChartData(0, sigma_value, p_0_value, intersection, !flag);
  chart2_data = getChartData(
    voltage_x1,
    sigma_value,
    p_1_value,
    intersection,
    flag
  );
  prepareChart(chart1_data, chart2_data);

  // probabilities
  calcPs();
};

google.load("visualization", "1", {
  packages: ["corechart"],
  callback: updateDiagram,
});

var getIntersection = function () {
  var sigma = document.getElementById("sigma").value;
  var P_x0 = document.getElementById("p").value;
  var P_x1 = 1 - P_x0;
  console.log(P_x0, P_x1, sigma);
  var voltage_x1 = parseInt(document.getElementById("voltage_1").value);
  intersection_point =
    voltage_x1 / 2 + (Math.pow(sigma, 2) / voltage_x1) * Math.log(P_x0 / P_x1);
  return intersection_point;
};

var calcPs = function () {
  intersection = getIntersection();
  var P_x0 = document.getElementById("p").value;
  var P_x1 = 1 - P_x0;
  var sigma = document.getElementById("sigma").value;
  var voltage_x1 = document.getElementById("voltage_1").value;
  p_err_0 = 0;
  p_err_1 = 0;
  text_0 = "";
  text_1 = "";

  after_intersection = intersection + 0.05;
  bell_0_value = getPdf(after_intersection, 0, sigma, P_x0);
  bell_1_value = getPdf(after_intersection, voltage_x1, sigma, P_x1);

  if (bell_0_value < bell_1_value) {
    p_err_0 = 1 - jStat.normal.cdf(intersection, 0, sigma);
    text_0 = "P(x > " + intersection.toFixed(4).toString() + ")";
  } else {
    p_err_1 = 1 - jStat.normal.cdf(intersection, voltage_x1, sigma);
    text_1 = "P(x > " + intersection.toFixed(4).toString() + ")";
  }

  before_intersection = intersection - 0.1;
  bell_0_value = getPdf(before_intersection, 0, sigma, P_x0);
  bell_1_value = getPdf(before_intersection, voltage_x1, sigma, P_x1);

  if (bell_0_value < bell_1_value) {
    p_err_0 += jStat.normal.cdf(intersection, 0, sigma);
    text_0 = "P(x < " + intersection.toFixed(4).toString() + ")";
  } else {
    p_err_1 += jStat.normal.cdf(intersection, voltage_x1, sigma);
    text_1 = "P(x < " + intersection.toFixed(4).toString() + ")";
  }

  document.getElementById("err_x0_value").innerText =
    text_0 + " = " + p_err_0.toFixed(4).toString();
  document.getElementById("err_x1_value").innerText =
    text_1 + " = " + p_err_1.toFixed(4).toString();

  calcPErr(p_err_0, p_err_1);
};

// calculate P(error) = P(error|X=0)P(X=0) + P(error|X=1)P(X=1) rounded to 4 digits
var calcPErr = function (P_err_x0, P_err_x1) {
  var P_x0 = document.getElementById("p").value;
  var P_x1 = 1 - P_x0;
  P_err = (P_err_x0 * P_x0 + P_err_x1 * P_x1).toFixed(4);
  document.getElementById("err_value").innerText = P_err;
  return P_err;
};

// calulates P(signal) = P(x=0) * (Voltage_x0)^2 + P(x=1) * (Voltage_x1)^2
var calcSignalPower = function () {
  var P_x0 = document.getElementById("p").value;
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

document.addEventListener(
  "DOMContentLoaded",
  function () {
    rangeSlider();
    updateDiagram();
  },
  false
);
