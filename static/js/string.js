//Initialize**************************************************

const circleToggle = document.querySelector("#circleBorder");
const rectangleToggle = document.querySelector("#rectangleBorder");
const nailCount = document.getElementById("nailCount");
const lineCount = document.querySelector("#lineCount");
const string_background = document.querySelector("#bgColor");
const string_line_color = document.querySelector("#lineColor");

let previousNailValue = 1;
let previousLineValue = 1;

//Functions**************************************************

function getStringParams() {
  nail_cnt = parseInt(nailCount.value);
  line_cnt = parseInt(lineCount.value);
  string_color = hex2rgb(string_line_color.value);
  background_color = hex2rgb(string_background.value);
  border_shape = rectangleToggle.checked;
  return [nail_cnt, string_color, background_color, border_shape, line_cnt];
}

function updateStringPage(params) {
  nailCount.value = params[0];
  string_line_color.value = rgbToHex(params[1][0], params[1][1], params[1][2]);

  string_background.value = rgbToHex(params[2][0], params[2][1], params[2][2]);

  if (params[3]) {
    rectangleToggle.click();
  } else {
    circleToggle.click();
  }

  lineCount.value = params[4];
}

//Event Listeners**************************************************

rectangleToggle.addEventListener("click", function () {
  borderImage.src = "static/option_images/string/rect.png";
});

circleToggle.addEventListener("click", function () {
  borderImage.src = "static/option_images/string/circle.png";
});

nailCount.addEventListener("input", function () {
  if (!this.checkValidity()) {
    // If the entered value is invalid, restore the previous value
    this.value = previousNailValue;
  } else {
    // Update the previous value for future comparisons
    previousNailValue = this.value;
  }
});

lineCount.addEventListener("input", function () {
  if (!this.checkValidity()) {
    // If the entered value is invalid, restore the previous value
    this.value = previousLineValue;
  } else {
    // Update the previous value for future comparisons
    previousLineValue = this.value;
  }
});

//Main Code**************************************************

if (localStorage.getItem("string_params")) {
  updateStringPage(JSON.parse(localStorage.getItem("string_params")));
}
