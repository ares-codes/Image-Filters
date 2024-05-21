//Initialize**************************************************

const colorPickerWrapper = document.getElementById("colorPickerWrapper");
const addColorButton = document.getElementById("addColorButton");
const deleteColorButton = document.getElementById("deleteColorButton");
const finalRow = document.getElementById("final-row");
const colorCountTitle = document.getElementById("colorCountTitle");

//Functions**************************************************

// Function to add a new color row
function addColorQuant() {
  const colorCount = getColorCount();
  if (colorCount < 254) {
    const newColor = getRandomColor();
    const colorDiv = createColorDiv(newColor);
    colorPickerWrapper.insertBefore(colorDiv, finalRow);
    updateColorEvents(); // Update events after adding a new color
    updateColorCountQuant();

    if (getColorCount() == 254) {
      addColorButton.style.backgroundColor = "grey";
    }
  } else {
    showErrorMessage("[Cannot Add More Colors]");
  }

  deleteColorButton.style.backgroundColor = "#dc3545";
}

// Function to delete the last added color
function deleteColorQuant() {
  const colorCount = getColorCount();
  if (colorCount > 2) {
    const colorElements = document.querySelectorAll(".color");
    const lastColorElement = colorElements[colorElements.length - 1];
    if (lastColorElement) {
      colorPickerWrapper.removeChild(lastColorElement);
      updateColorCountQuant();
    }
    if (getColorCount() == 2) {
      deleteColorButton.style.backgroundColor = "grey";
    }
  } else {
    showErrorMessage("[Cannot Delete More Colors]");
  }

  addColorButton.style.backgroundColor = "#28a745";
}

// Function to update color count in the title
function updateColorCountQuant() {
  const colorCount = getColorCount();
  colorCountTitle.textContent = `New Colors (${colorCount})`;
}

function getQuantParams() {
  colorDivs = document.querySelectorAll(".color");
  var palette = [];

  colorDivs.forEach(function (div) {
    var backgroundColor = window.getComputedStyle(div).backgroundColor;

    var rgbArray = backgroundColor
      .replace("rgb(", "")
      .replace(")", "")
      .split(",")
      .map(function (value) {
        return parseInt(value.trim(), 10);
      });

    // Concatenate the RGB values directly to flatten the array
    palette = palette.concat(rgbArray);
  });

  let remainder = 768 % palette.length;

  while (remainder > 0) {
    palette.push(palette[0], palette[1], palette[2]);
    remainder = 768 % palette.length;
  }

  return palette;
}

function updateQuantPageHelper(newColor) {
  const colorDiv = createColorDiv(newColor);
  colorPickerWrapper.insertBefore(colorDiv, finalRow);
}

function updateQuantPage(params) {
  const seenColors = new Set();

  const colorElements = document.querySelectorAll(".color");
  colorElements.forEach((colorElement) => {
    // Remove each color element from the target div
    colorPickerWrapper.removeChild(colorElement);
  });

  for (let i = 0; i < params.length; i += 3) {
    const color = params.slice(i, i + 3);

    // Convert the color array to a string for easy comparison
    const colorString = JSON.stringify(color);

    // Check if the color has been seen before
    if (seenColors.has(colorString)) {
      break;
    }

    // Add the color to the set of seen colors
    seenColors.add(colorString);

    // Process the current color (replace this with your logic)
    updateQuantPageHelper(rgbToHex(color[0], color[1], color[2]));
  }

  updateColorEvents();
  updateColorCountQuant();
}

//Event Listeners**************************************************

// Add event listeners for the buttons
addColorButton.addEventListener("click", addColorQuant);
deleteColorButton.addEventListener("click", deleteColorQuant);

// Main Code**************************************************

colorPickerWrapper.insertBefore(createColorDiv("black"), finalRow);
colorPickerWrapper.insertBefore(createColorDiv("white"), finalRow);

// Update initial color events
updateColorEvents();

if (localStorage.getItem("quant_params")) {
  updateQuantPage(JSON.parse(localStorage.getItem("quant_params")));
}
