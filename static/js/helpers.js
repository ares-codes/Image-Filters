//Initialize**************************************************

let uploaded_file_names =
  JSON.parse(localStorage.getItem("uploaded_file_names")) || {};

let progress_bar_text = document.getElementById("progress-text");
let customFilterWrapper = document.getElementById("customFilterWrapper");
let dropArea = document.getElementById("drop-area");

//Functions**************************************************

const hex2rgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
};

// Function to convert RGB to hex
function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

async function saveFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/upload", {
    method: "POST",
    body: formData,
  });

  const result = await response.text();
}

async function removeFile(filename) {
  const formData = new FormData();
  formData.append("filename", filename);

  const response = await fetch("/remove", {
    method: "POST",
    body: formData,
  });

  const result = await response.text();
}

// Function to fetch image data from the server and create a File object
async function createFileFromPath(imagePath) {
  try {
    // Fetch the image data using fetch API
    const response = await fetch(imagePath);

    // Check if response is successful
    if (!response || !response.ok) {
      return null;
    }

    // Check if the response contains valid image data
    const contentType = response.headers.get("content-type");
    if (
      !contentType ||
      (!contentType.startsWith("image") && !contentType.startsWith("video"))
    ) {
      return null;
    }

    const blob = await response.blob(); // Convert the response to a Blob

    // Create a File object from the Blob
    const fileName = imagePath.substring(imagePath.lastIndexOf("/") + 1); // Extract file name from path
    const file = new File([blob], fileName, { type: blob.type });

    return file;
  } catch (error) {
    return null;
  }
}

function showErrorMessage(message) {
  var element = progress_bar_text;
  element.style.opacity = 1;
  element.textContent = message;

  // Set a timeout to hide the element after 2 seconds
  setTimeout(function () {
    element.style.opacity = 0;
    element.textContent = "[Upload Media]";
  }, 2000);
}

function handleFilesSpecial(files, areaId, paramsKey, mediaId, mediaButton) {
  download_text = "";
  const dropArea = document.getElementById(areaId);

  for (const file of files) {
    if (
      file.type.startsWith("image/png") ||
      file.type.startsWith("image/jpeg")
    ) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        showErrorMessage("[File size exceeds the maximum limit (5MB)]");
        return;
      }

      if (!customFilterWrapper) {
        if (!(file.name in uploaded_file_names)) {
          saveFile(file);
          uploaded_file_names[file.name] = 0;
        }
        uploaded_file_names[file.name] += 1;
        localStorage.setItem(
          "uploaded_file_names",
          JSON.stringify(uploaded_file_names)
        );
      }

      if (!customFilterWrapper) {
        localStorage.setItem(paramsKey, file.name);
      } else {
        localStorage.setItem("custom_" + paramsKey, file.name);
      }

      const mediaElement = document.createElement("img");
      mediaElement.src = URL.createObjectURL(file);
      mediaElement.controls = true;
      mediaElement.setAttribute("id", mediaId);

      if (customFilterWrapper) {
        document.getElementById("add-filter-button").style.background =
          "lightgreen";
      }

      // Clear existing content and append the new media element to the drop area
      dropArea.innerHTML = ""; // Clear existing content
      dropArea.appendChild(mediaElement);
      dropArea.style.display = "block";
      dropArea.classList.add("media-present");
      download_button.style.background = "#43A6C6";

      if (mediaButton) {
        mediaButton.style.display = "block";
      }

      //let drop = document.getElementById("drop-area");
      if (dropArea && dropArea.classList.contains("media-present")) {
        transform_button.style.background = "#43A6C6";
      }
    } else {
      showErrorMessage("[Image Files Only]");
    }
  }
}

async function getMediaFileFromDropArea(dropAreaId, filename) {
  if (dropAreaId && dropAreaId.children.length > 0) {
    const child = dropAreaId.children[0]; // Assuming only one child element

    if (child.tagName === "IMG" && child.src) {
      const response = await fetch(child.src);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: blob.type });
      return { file: file, type: "image" };
    } else if (child.tagName === "VIDEO" && child.src) {
      const response = await fetch(child.src);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: blob.type });
      return { file: file, type: "video" };
    }
  }

  return null;
}

function convertKernelTableToArray() {
  var array = [];
  var table = document.getElementById("kernelTable");

  // Loop through each row in the tbody
  var rows = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var cells = row.getElementsByTagName("td");

    // Extract values based on condition
    var rowData = [];
    for (var j = 0; j < cells.length; j++) {
      rowData.push(parseFloat(cells[j].textContent));
    }
    // Add the row data to the array
    array.push(rowData);
  }
  return array;
}

function createColorDiv(color) {
  const colorDiv = document.createElement("div");
  colorDiv.className = "color";
  colorDiv.style.backgroundColor = color;

  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.className = "color-input";
  colorInput.style.opacity = "0";

  colorDiv.appendChild(colorInput);

  return colorDiv;
}

// Function to get the current color count
function getColorCount() {
  return document.querySelectorAll(".color").length;
}

// Function to generate a random color
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Function to update color events (click)
function updateColorEvents() {
  const colorElements = document.querySelectorAll(".color");
  colorElements.forEach((colorElement) => {
    colorElement.addEventListener("click", function () {
      showColorInput(colorElement);
    });
  });
}

// Show color input
function showColorInput(colorElement) {
  const colorInput = colorElement.querySelector(".color-input");

  colorInput.addEventListener("input", function () {
    colorElement.style.backgroundColor = colorInput.value;
  });

  colorInput.click(); // Simulate a click on the color input
}
