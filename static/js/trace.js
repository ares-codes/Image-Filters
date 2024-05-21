//Initialize**************************************************
lineImage = document.querySelector("#lineImage");
oneLineToggle = document.querySelector("#singleLine");
multiLineToggle = document.querySelector("#multiLine");

trace_color = document.querySelector("#tracelineColor");
trace_background = document.querySelector("#tracebgColor");

//Functions**************************************************

function getTraceParams() {
  one_line = oneLineToggle.checked;
  line_color = hex2rgb(trace_color.value);
  background_color = hex2rgb(trace_background.value);
  return [one_line, line_color, background_color];
}

function updateTracePage(params) {
  if (params[0]) {
    oneLineToggle.click();
  } else {
    multiLineToggle.click();
  }

  trace_color.value = rgbToHex(params[1][0], params[1][1], params[1][2]);
  trace_background.value = rgbToHex(params[2][0], params[2][1], params[2][2]);
}

//Event Listeners**************************************************

oneLineToggle.addEventListener("click", function () {
  lineImage.src = "static/option_images/trace/one.jpg";
});

multiLineToggle.addEventListener("click", function () {
  lineImage.src = "static/option_images/trace/multi.png";
});

//Main Code**************************************************

if (localStorage.getItem("trace_params")) {
  updateTracePage(JSON.parse(localStorage.getItem("trace_params")));
}
