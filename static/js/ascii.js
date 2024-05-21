//Initialize**************************************************

const customCharsToggle = document.querySelector("#customChars");
const recommendedCharsToggle = document.querySelector("#recommendedChars");
const charsPerRowInput = document.querySelector("#charsPerRowInput");
const ascii_background = document.getElementById("bgColor");

const singleToggle = document.querySelector("#singleColor");
const multiToggle = document.querySelector("#multiColor");
const txtColor = document.querySelector("#textColor");

const uniqueCharsInput = document.getElementById("uniqueChars");
let previousText = "";
let previousValue = 200;

//Functions**************************************************

function hasDuplicateChars(str) {
  // Check if there are duplicate characters in the string
  return new Set(str).size !== str.length;
}

function getCharsPerRow() {
  if (customCharsToggle.checked) {
    // If custom chars is toggled, get the value from the input
    return parseInt(charsPerRowInput.value, 10);
  } else {
    // If recommended chars is toggled, return null or another default value
    return null;
  }
}

function getAsciiParams() {
  // Custom Stuff to append to Form
  chars = uniqueCharsInput.value; // Get unique characters input value
  text_color = multiToggle.checked ? [] : hex2rgb(txtColor.value);
  background = hex2rgb(ascii_background.value); // Assuming getBackgroundColor returns an array
  cols = getCharsPerRow(); // Assuming getCharsPerRow returns a valid number or null
  return [chars, cols, text_color, background];
}

function updateAsciiPage(params) {
  let ascii_extra = JSON.parse(localStorage.getItem("ascii_extra_params"));
  if (ascii_extra) {
    if ("chars" in ascii_extra) {
      charsPerRowInput.value = ascii_extra["chars"];
    }

    if ("color" in ascii_extra) {
      txtColor.value = rgbToHex(
        ascii_extra["color"][0],
        ascii_extra["color"][1],
        ascii_extra["color"][2]
      );
    }
  }

  uniqueCharsInput.value = params[0];

  if (params[1] != null) {
    charsPerRowInput.value = params[1];
    customCharsToggle.click();
  } else {
    recommendedCharsToggle.click();
  }

  if (params[2].length == 0) {
    multiToggle.click();
  } else {
    singleToggle.click();
    txtColor.value = rgbToHex(params[2][0], params[2][1], params[2][2]);
  }

  ascii_background.value = rgbToHex(params[3][0], params[3][1], params[3][2]);
}

//Event Listeners**************************************************

recommendedCharsToggle.addEventListener("click", function () {
  charsPerRowInput.style.display = "none";
});

customCharsToggle.addEventListener("click", function () {
  charsPerRowInput.style.display = "inline-block";
});

singleToggle.addEventListener("click", function () {
  txtColor.style.display = "inline-block";
});

multiToggle.addEventListener("click", function () {
  txtColor.style.display = "none";
});

charsPerRowInput.addEventListener("input", function () {
  if (!this.checkValidity()) {
    // If the entered value is invalid, restore the previous value
    this.value = previousValue;
  } else {
    // Update the previous value for future comparisons
    previousValue = this.value;
  }
});

uniqueCharsInput.addEventListener("input", function () {
  if (this.value.length < 1 || hasDuplicateChars(this.value)) {
    // If length is less than 1 or duplicate characters, restore the previous value
    this.value = previousText;
  } else {
    // Update the previous value for future comparisons
    previousText = this.value;
  }
});

// Main Code**************************************************

if (localStorage.getItem("ascii_params")) {
  updateAsciiPage(JSON.parse(localStorage.getItem("ascii_params")));
}
