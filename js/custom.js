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

}