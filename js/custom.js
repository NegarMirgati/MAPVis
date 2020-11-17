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
    // #TODO: feed real data to calcPErr func
    document.getElementById('err_value').innerText = calcPErr(0.1, 0.2)

}

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