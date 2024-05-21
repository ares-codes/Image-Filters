//Initialize**************************************************

const negate_opt = document.getElementById("negate_opt");
const bright_opt = document.getElementById("bright_opt");
const blur_opt = document.getElementById("blur_opt");
const sharp_opt = document.getElementById("sharp_opt");
const contrast_opt = document.getElementById("contrast_opt");
const pixel_opt = document.getElementById("pixel_opt");
const resize_opt = document.getElementById("resize_opt");
const crop_opt = document.getElementById("crop_opt");
const rotate_opt = document.getElementById("rotate_opt");
const fade_opt = document.getElementById("fade_opt");
const color_opt = document.getElementById("color_opt");
const scale_opt = document.getElementById("scale_opt");
const sat_opt = document.getElementById("sat_opt");
const sol_opt = document.getElementById("sol_opt");
const flip_opt = document.getElementById("flip_opt");
const kernel_opt = document.getElementById("kernel_opt");
const merge_opt = document.getElementById("merge_opt");

let resize_scale = 1;

let previousKernelValues = {
  "1,1": "0.5",
  "1,2": "0.5",
  "2,1": "0.5",
  "2,2": "0.5",
};

const miscmatrixTable = document.getElementById("kernelTable");
const miscrows = miscmatrixTable.rows;

dropContainerMerge = document.getElementById("drop-container-merge");
dropAreaMerge = document.getElementById("drop-area-merge");
newMediaButtonMerge = document.getElementById("new-media-button-merge");
fileInputMerge = document.getElementById("file-input-merge");

const brightRange = document.getElementById("brightRange");
const brightLabel = document.getElementById("bright_scale");
const brightSquare = document.getElementById("brightSquare");
brightSquare.style.filter = `brightness(${50}%)`;

const blurRange = document.getElementById("blurRange");
const blurLabel = document.getElementById("blur_scale");
const blurSquare = document.getElementById("blurSquare");

const sharpRange = document.getElementById("sharpenRange");
const sharpLabel = document.getElementById("sharpen_scale");
const sharpSquare = document.getElementById("sharpenSquare");
sharpSquare.style.filter = `url(#blurFilter) blur(${10}px)`;

const fadeRange = document.getElementById("fadeRange");
const fadeLabel = document.getElementById("fade_scale");
const fadeSquare = document.getElementById("fadeSquare");

const horizontal = document.querySelector("#horizontal");
const vertical = document.querySelector("#vertical");
const flip_img = document.querySelector("#flip_img");
const flip_div = document.querySelector("#flip_div");
flip_div.style.transform = "scaleX(-1)";

const rotateRange = document.getElementById("rotateRange");
const rotateLabel = document.getElementById("rotate_scale");
const rotateImg = document.getElementById("rotate_img");

const contrastSquare = document.getElementById("contrastSquare");
const contrastScale = document.getElementById("contrast_scale");
const contrastRange = document.getElementById("contrastRange");

const saturationSquare = document.getElementById("saturationSquare");
const saturationScale = document.getElementById("saturation_scale");
const saturationRange = document.getElementById("saturationRange");

const widthRange = document.getElementById("widthRange");
const widthLabel = document.getElementById("resize_width");

const heightRange = document.getElementById("heightRange");
const heightLabel = document.getElementById("resize_height");

const new_size = document.getElementById("new_size");
const blockRange = document.getElementById("blockRange");
const pixel_block = document.getElementById("pixel_block");
const new_size2 = document.getElementById("new_size2");

const colorRange = document.getElementById("colorRange");
const color_scale = document.getElementById("color_scale");
const color_canvas = document.getElementById("colorCanvas");
const color_ctx = color_canvas.getContext("2d");

const solRange = document.getElementById("solarizeRange");
const sol_scale = document.getElementById("solarize_scale");
const sol_canvas = document.getElementById("solarizeCanvas");
const sol_ctx = sol_canvas.getContext("2d");

const grad_canvas = document.getElementById("gradientCanvas");
const grad_ctx = grad_canvas.getContext("2d");
const low_grad = document.getElementById("lowColor");
const high_grad = document.getElementById("highColor");

const negate = document.querySelector("#negate");
const bright = document.querySelector("#bright");
const blurs = document.querySelector("#blur");
const sharp = document.querySelector("#sharp");
const contrast = document.querySelector("#contrast");
const pixel = document.querySelector("#pixel");
const resize = document.querySelector("#resize");
const crop = document.querySelector("#crop");
const rotate = document.querySelector("#rotate");
const fade = document.querySelector("#fade");
const color = document.querySelector("#color");
const saturate = document.querySelector("#saturate");
const solarize = document.querySelector("#solarize");
const flip = document.querySelector("#flip");
const kernel = document.querySelector("#kernel");
const merge = document.querySelector("#merge");
const scale = document.querySelector("#scale");

//Functions**************************************************

function updateSpecialFilters() {
  maxSize = 75;
  mediaElement = document.querySelector("#drop-area img, #drop-area video");
  if (mediaElement) {
    if (mediaElement.tagName === "IMG") {
      width = mediaElement.naturalWidth;
      height = mediaElement.naturalHeight;
    } else {
      width = mediaElement.videoWidth;
      height = mediaElement.videoHeight;
    }
    updateSpecialFiltersHelper(width, height, maxSize, mediaElement);
  }
}

function calculateScaledDimensions(originalWidth, originalHeight, maxSize) {
  // Calculate the aspect ratio
  const aspectRatio = originalWidth / originalHeight;

  // Determine whether width or height should be scaled down more
  if (originalWidth > originalHeight) {
    // Scale down the width to fit within maxSize
    const scaledWidth = maxSize;
    const scaledHeight = maxSize / aspectRatio;
    return { width: scaledWidth, height: scaledHeight };
  } else {
    // Scale down the height to fit within maxSize
    const scaledHeight = maxSize;
    const scaledWidth = maxSize * aspectRatio;
    return { width: scaledWidth, height: scaledHeight };
  }
}

function updateSpecialFiltersHelper(width, height, maxSize, mediaElement) {
  const scaledDimensions = calculateScaledDimensions(width, height, maxSize);
  resize_scale = width / scaledDimensions.width;

  // Clone the content of the source div
  const clonedContent = mediaElement.cloneNode(true); // Pass true to clone all children recursively

  // Adjust the styles of the cloned content
  clonedContent.style.width = "100%";
  clonedContent.style.height = "100%";
  clonedContent.style.margin = "0";

  if (mediaElement.tagName !== "IMG") {
    clonedContent.controls = false;
  }

  if (document.getElementById("resize_opt")) {
    document.getElementById("resize_no_media").style.display = "none";
    document.getElementById("resize_all_opts").style.display = "";
  }

  if (document.getElementById("pixel_opt")) {
    document.getElementById("pixel_no_media").style.display = "none";
    document.getElementById("pixel_all_opts").style.display = "";
  }

  if (document.getElementById("crop_opt")) {
    document.getElementById("crop_no_media").style.display = "none";
    document.getElementById("crop_all_opts").style.display = "";
    document.getElementById("original_size3").innerHTML = "";
    document.getElementById("original_size3").appendChild(clonedContent);
  }

  if (document.getElementById("flip_opt")) {
    document.getElementById("flip_img").style.display = "none";
    document.getElementById("flip_div").style.display = "";

    document.getElementById("flip_div").innerHTML = "";
    document
      .getElementById("flip_div")
      .appendChild(clonedContent.cloneNode(true));

    if (document.querySelector("#vertical").checked) {
      document.querySelector("#vertical").click();
    } else {
      document.querySelector("#horizontal").click();
    }
  }

  if (document.getElementById("mosiac_block_opts")) {
    document.getElementById("mosiac_block_opts").style.display = "";

    document.getElementById("original_size_mosaic").style.width = `${
      2 * scaledDimensions.width
    }px`;
    document.getElementById("original_size_mosaic").style.height = `${
      2 * scaledDimensions.height
    }px`;

    adjusted_block_size = parseInt(
      0.1 * 2 * Math.min(scaledDimensions.height, scaledDimensions.width)
    );
    document.getElementById(
      "new_size_mosaic"
    ).style.width = `${adjusted_block_size}px`;
    document.getElementById(
      "new_size_mosaic"
    ).style.height = `${adjusted_block_size}px`;

    document.getElementById("tileWidthRange").max = width;
    document.getElementById("tileWidthRange").value = parseInt(0.1 * width);
    document.getElementById("tile_width").textContent =
      "Tile Width:" + parseInt(0.1 * width);

    document.getElementById("tileHeightRange").max = height;
    document.getElementById("tileHeightRange").value = parseInt(0.1 * height);
    document.getElementById("tile_height").textContent =
      "Tile Height:" + parseInt(0.1 * height);
  } else {
    document.getElementById("rotate_img").innerHTML = "";

    document
      .getElementById("rotate_img")
      .appendChild(clonedContent.cloneNode(true));

    document.getElementById("rotate_img").style.border = "";
    document.getElementById("rotate_img").style.width =
      scaledDimensions.width + "px";
    document.getElementById("rotate_img").style.height =
      scaledDimensions.height + "px";

    document.getElementById("new_size3").style.top = "0";
    document.getElementById("new_size3").style.left = "0";

    document.getElementById("rotate_img").style.width =
      scaledDimensions.width + "px";
    document.getElementById("rotate_img").style.height =
      scaledDimensions.height + "px";

    document.getElementById("flip_div").style.width =
      scaledDimensions.width + "px";

    document.getElementById("flip_div").style.height =
      scaledDimensions.height + "px";

    document.getElementById("topXRange").max = width - 1;
    document.getElementById("topYRange").max = height - 1;
    document.getElementById("cropWidthRange").max = width;
    document.getElementById("cropHeightRange").max = height;

    document.getElementById("topXRange").value = 0;
    document.getElementById("topYRange").value = 0;
    document.getElementById("top_x").textContent = `X Pos: 0`;
    document.getElementById("top_y").textContent = `Y Pos: 0`;

    document.getElementById("cropWidthRange").value = 0.3 * width;
    document.getElementById("cropHeightRange").value = 0.3 * height;

    document.getElementById("crop_width").textContent =
      "Width: " + parseInt(0.3 * width);
    document.getElementById("crop_height").textContent =
      "Height: " + parseInt(0.3 * height);

    document.getElementById("new_size3").style.width = `${parseInt(
      0.3 * 2 * scaledDimensions.width
    )}px`;
    document.getElementById("new_size3").style.height = `${parseInt(
      0.3 * 2 * scaledDimensions.height
    )}px`;

    document.getElementById("original_size3").style.width = `${
      2 * scaledDimensions.width
    }px`;
    document.getElementById("original_size3").style.height = `${
      2 * scaledDimensions.height
    }px`;

    document.getElementById(
      "original_size"
    ).style.width = `${scaledDimensions.width}px`;
    document.getElementById(
      "original_size"
    ).style.height = `${scaledDimensions.height}px`;

    document.getElementById("original_size2").style.width = `${
      2 * scaledDimensions.width
    }px`;
    document.getElementById("original_size2").style.height = `${
      2 * scaledDimensions.height
    }px`;

    document.getElementById(
      "new_size"
    ).style.width = `${scaledDimensions.width}px`;
    document.getElementById(
      "new_size"
    ).style.height = `${scaledDimensions.height}px`;

    adjusted_block_size = parseInt(
      0.03 * 2 * Math.min(scaledDimensions.height, scaledDimensions.width)
    );
    document.getElementById(
      "new_size2"
    ).style.width = `${adjusted_block_size}px`;
    document.getElementById(
      "new_size2"
    ).style.height = `${adjusted_block_size}px`;

    document.getElementById("widthRange").max = 2 * width;
    document.getElementById("widthRange").min = 0.5 * width;
    document.getElementById("widthRange").value = width;
    document.getElementById("resize_width").textContent = "Width: " + width;

    document.getElementById("heightRange").max = 2 * height;
    document.getElementById("heightRange").min = 0.5 * height;
    document.getElementById("heightRange").value = height;
    document.getElementById("resize_height").textContent = "Height: " + height;

    block_size = Math.min(width, height);
    document.getElementById("blockRange").max = block_size;
    document.getElementById("blockRange").min = 1;
    document.getElementById("blockRange").value = 0.03 * block_size;
    document.getElementById("pixel_block").textContent =
      "Block Size:" + parseInt(0.03 * block_size);

    // top_x
    const topXRange = document.getElementById("topXRange");
    const top_x = document.getElementById("top_x");

    topXRange.addEventListener("input", function () {
      top_x.textContent = `X Pos: ${this.value}`;

      document.getElementById("crop_width").textContent =
        "Width: " +
        Math.min(
          document.getElementById("cropWidthRange").value,
          width - this.value
        );
      document.getElementById("cropWidthRange").max = width - this.value;

      document.getElementById("new_size3").style.width = `${parseInt(
        (document.getElementById("cropWidthRange").value / width) *
          2 *
          scaledDimensions.width
      )}px`;

      document.getElementById("new_size3").style.left = `${parseInt(
        parseInt((this.value / width) * 2 * scaledDimensions.width)
      )}px`;

      if (!document.getElementById("customFilterWrapper")) {
        let all_misc = JSON.parse(localStorage.getItem("misc_params")) || {};

        all_misc["Crop"] = [
          this.value,
          topYRange.value,
          cropWidthRange.value,
          cropHeightRange.value,
        ];

        localStorage.setItem("misc_params", JSON.stringify(all_misc));
      }
    });

    // top_y
    const topYRange = document.getElementById("topYRange");
    const top_y = document.getElementById("top_y");

    topYRange.addEventListener("input", function () {
      top_y.textContent = `Y Pos: ${this.value}`;

      document.getElementById("crop_height").textContent =
        "Height: " +
        Math.min(
          document.getElementById("cropHeightRange").value,
          height - this.value
        );
      document.getElementById("cropHeightRange").max = height - this.value;

      document.getElementById("new_size3").style.height = `${parseInt(
        (document.getElementById("cropHeightRange").value / height) *
          2 *
          scaledDimensions.height
      )}px`;

      document.getElementById("new_size3").style.top = `${parseInt(
        parseInt((this.value / height) * 2 * scaledDimensions.height)
      )}px`;

      if (!document.getElementById("customFilterWrapper")) {
        let all_misc = JSON.parse(localStorage.getItem("misc_params")) || {};

        all_misc["Crop"] = [
          topXRange.value,
          this.value,
          cropWidthRange.value,
          cropHeightRange.value,
        ];

        localStorage.setItem("misc_params", JSON.stringify(all_misc));
      }
    });

    // crop_width
    const cropWidthRange = document.getElementById("cropWidthRange");

    cropWidthRange.addEventListener("input", function () {
      document.getElementById("crop_width").textContent =
        "Width: " + cropWidthRange.value;

      document.getElementById("new_size3").style.width = `${parseInt(
        (cropWidthRange.value / width) * 2 * scaledDimensions.width
      )}px`;

      if (!document.getElementById("customFilterWrapper")) {
        let all_misc = JSON.parse(localStorage.getItem("misc_params")) || {};

        all_misc["Crop"] = [
          topXRange.value,
          topYRange.value,
          this.value,
          cropHeightRange.value,
        ];

        localStorage.setItem("misc_params", JSON.stringify(all_misc));
      }
    });

    // crop_height
    const cropHeightRange = document.getElementById("cropHeightRange");

    cropHeightRange.addEventListener("input", function () {
      document.getElementById("crop_height").textContent =
        "Height: " + cropHeightRange.value;

      document.getElementById("new_size3").style.height = `${parseInt(
        (cropHeightRange.value / height) * 2 * scaledDimensions.height
      )}px`;

      if (!document.getElementById("customFilterWrapper")) {
        let all_misc = JSON.parse(localStorage.getItem("misc_params")) || {};

        all_misc["Crop"] = [
          topXRange.value,
          topYRange.value,
          cropWidthRange.value,
          this.value,
        ];

        localStorage.setItem("misc_params", JSON.stringify(all_misc));
      }
    });
  }
}

async function updateDropArea() {
  file_name = localStorage.getItem("drop_filename");
  if (file_name) {
    file = await createFileFromPath("static/uploaded_images/" + file_name);
    if (file) {
      handleFiles([file]);

      //uploaded_file_names[file_name] -= 1;

      localStorage.setItem(
        "uploaded_file_names",
        JSON.stringify(uploaded_file_names)
      );

      updateSpecialFilters();
    } else {
      delete uploaded_file_names[file_name];

      localStorage.setItem(
        "uploaded_file_names",
        JSON.stringify(uploaded_file_names)
      );
    }
  }
}

function validateInput(row, col, input) {
  // Remove non-numeric characters
  const table = document.getElementById("kernelTable");
  let val = input.textContent;

  const miscrows = table
    .getElementsByTagName("tbody")[0]
    .getElementsByTagName("tr");

  const value = parseFloat(val, 10);
  if (isNaN(value)) {
    // If not a valid value, revert to the previous value
    input.textContent = previousKernelValues[[row, col]] || "0";
  } else {
    // Save the valid value as the previous value
    previousKernelValues[[row, col]] = value;
    input.textContent = previousKernelValues[[row, col]];
  }
}

function addRow() {
  const table = document.getElementById("kernelTable");
  const newRow = table.insertRow();
  const columns = table.rows[1].cells.length;
  const miscrows = table.rows.length;

  if (miscrows - 2 < 100) {
    for (let i = 0; i < columns; i++) {
      const cell = newRow.insertCell(i);
      cell.contentEditable = true;
      cell.textContent = "0";
      cell.addEventListener("input", function () {
        validateInput(miscrows - 1, i + 1, cell);
      });

      previousKernelValues[[miscrows - 1, i + 1]] = "0";
    }
  } else {
    showErrorMessage("[Cannot Add More Rows]");
  }
}

function addCol() {
  const table = document.getElementById("kernelTable");
  const miscrows = table.rows.length;
  let header = table.getElementsByTagName("th")[0];
  const total_columns = table.rows[1].cells.length;

  if (total_columns < 100) {
    for (let i = 1; i < miscrows; i++) {
      const cell = table.rows[i].insertCell();
      cell.contentEditable = true;
      cell.textContent = "0";
      cell.addEventListener("input", function () {
        validateInput(i, total_columns + 1, cell);
      });

      previousKernelValues[[i, total_columns + 1]] = "0";
    }

    const currentColspan = parseInt(header.getAttribute("colspan"), 10);
    header.setAttribute("colspan", currentColspan + 1);
  } else {
    showErrorMessage("[Cannot Add More Cols]");
  }
}

function deleteRow() {
  const table = document.getElementById("kernelTable");
  const total_columns = table.rows[1].cells.length;

  if (table.rows.length - 1 > 1) {
    table.deleteRow(-1);
    for (let col = 1; col <= total_columns; col++) {
      delete previousKernelValues[[table.rows.length, col]];
    }
  } else {
    showErrorMessage("[Cannot Delete More Rows]");
  }
}

function deleteCol() {
  const table = document.getElementById("kernelTable");
  const columns = table.rows[1].cells.length;

  if (columns > 1) {
    for (let i = 1; i < table.rows.length; i++) {
      table.rows[i].deleteCell(-1);
      delete previousKernelValues[[i, columns]];
    }

    let header = table.getElementsByTagName("th")[0];
    const currentColspan = parseInt(header.getAttribute("colspan"), 10);
    header.setAttribute("colspan", currentColspan - 1);
  } else {
    showErrorMessage("[Cannot Delete More Cols]");
  }
}

function removeAllOpts() {
  negate_opt.style.display = "none";
  bright_opt.style.display = "none";
  blur_opt.style.display = "none";
  sharp_opt.style.display = "none";
  contrast_opt.style.display = "none";
  pixel_opt.style.display = "none";

  resize_opt.style.display = "none";
  scale_opt.style.display = "none";

  crop_opt.style.display = "none";
  rotate_opt.style.display = "none";
  fade_opt.style.display = "none";
  color_opt.style.display = "none";
  sat_opt.style.display = "none";
  sol_opt.style.display = "none";
  flip_opt.style.display = "none";
  kernel_opt.style.display = "none";
  merge_opt.style.display = "none";

  if (document.getElementById("add-filter-button")) {
    document.getElementById("add-filter-button").style.background =
      "lightgreen";
  }

  if (!document.getElementById("customFilterWrapper")) {
    let current_misc_val = localStorage.getItem("current_misc");
    if (current_misc_val != "Negate" && current_misc_val != "Merge") {
      let all_misc = JSON.parse(localStorage.getItem("misc_params")) || {};
      if (
        current_misc_val != "Pixelate" &&
        current_misc_val != "Resize" &&
        current_misc_val != "Crop"
      ) {
        all_misc[current_misc_val] = getMiscValParams(current_misc_val);
      }

      localStorage.setItem("misc_params", JSON.stringify(all_misc));
    }
  }
}

function updateContrast() {
  const contrastValue = contrastRange.value;
  const normalizedContrast = contrastValue / 100 + 1; // Normalize to 0 to 2
  contrastScale.textContent = `Intensity: ${contrastValue}`;

  contrastSquare.style.filter = `contrast(${100 * normalizedContrast}%)`;
}

function updateSaturation() {
  const saturationValue = saturationRange.value;
  const normalizedSaturation = saturationValue / 100 + 1; // Normalize to 0 to 2
  saturationScale.textContent = `Intensity: ${saturationValue}`;

  // Set the background to the rainbow gradient
  saturationSquare.style.background =
    "linear-gradient(to right, violet, indigo, blue, green, yellow, orange, red)";

  // Apply the saturation filter
  saturationSquare.style.filter = `saturate(${100 * normalizedSaturation}%)`;
}

function updateColorCanvas() {
  var gradient = color_ctx.createLinearGradient(
    0,
    0,
    color_canvas.width,
    color_canvas.height
  );
  gradient.addColorStop(0, "violet");
  gradient.addColorStop(1 / 6, "indigo");
  gradient.addColorStop(2 / 6, "blue");
  gradient.addColorStop(3 / 6, "green");
  gradient.addColorStop(4 / 6, "yellow");
  gradient.addColorStop(5 / 6, "orange");
  gradient.addColorStop(1, "red");

  // Fill the canvas with the gradient
  color_ctx.fillStyle = gradient;
  color_ctx.fillRect(0, 0, color_canvas.width, color_canvas.height);

  const imageData = color_ctx.getImageData(
    0,
    0,
    sol_canvas.width,
    sol_canvas.height
  );
  let data = imageData.data;

  // Iterate through each pixel (4 values per pixel: red, green, blue, alpha)
  let scales = [1, 1, 1];
  let scale = colorRange.value / 100.0;

  // Extract RGB values from the color string
  var rgbValues = hex2rgb(document.getElementById("color_color").value);

  scales[0] += (rgbValues[0] / 255) * scale;
  scales[1] += (rgbValues[1] / 255) * scale;
  scales[2] += (rgbValues[2] / 255) * scale;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = parseInt(data[i] * scales[0]);
    data[i + 1] = parseInt(data[i + 1] * scales[1]);
    data[i + 2] = parseInt(data[i + 2] * scales[2]);
  }

  // Put the manipulated image data back onto the canvas
  color_ctx.putImageData(imageData, 0, 0);
}

function resetGradient() {
  var gradient = grad_ctx.createLinearGradient(
    0,
    0,
    grad_canvas.width,
    grad_canvas.height
  );
  gradient.addColorStop(0, low_grad.value);
  gradient.addColorStop(1, high_grad.value);

  // Fill the canvas with the gradient
  grad_ctx.fillStyle = gradient;
  grad_ctx.fillRect(0, 0, grad_canvas.width, grad_canvas.height);
}

// Create a linear gradient
function resetCanvas() {
  var gradient = sol_ctx.createLinearGradient(
    0,
    0,
    sol_canvas.width,
    sol_canvas.height
  );
  gradient.addColorStop(0, "black");
  gradient.addColorStop(1, "white");

  // Fill the canvas with the gradient
  sol_ctx.fillStyle = gradient;
  sol_ctx.fillRect(0, 0, sol_canvas.width, sol_canvas.height);
}

// Function to manipulate pixels based on brightness threshold
function manipulatePixels(threshold) {
  resetCanvas();
  const imageData = sol_ctx.getImageData(
    0,
    0,
    sol_canvas.width,
    sol_canvas.height
  );
  const data = imageData.data;

  // Iterate through each pixel (4 values per pixel: red, green, blue, alpha)
  for (let i = 0; i < data.length; i += 4) {
    const brightness = calculateBrightness(data[i], data[i + 1], data[i + 2]);

    // Invert the color if brightness exceeds the threshold
    if (brightness > threshold) {
      // Invert entire RGB values
      data[i] = 255 - data[i]; // Red
      data[i + 1] = 255 - data[i + 1]; // Green
      data[i + 2] = 255 - data[i + 2]; // Blue
    }
  }

  // Put the manipulated image data back onto the canvas
  sol_ctx.putImageData(imageData, 0, 0);
}

// Calculate brightness of a pixel
function calculateBrightness(red, green, blue) {
  return 0.299 * red + 0.587 * green + 0.114 * blue;
}

function getCurrentMisc() {
  if (document.querySelector("#negate").checked) {
    return "Negate";
  } else if (document.querySelector("#bright").checked) {
    return "Brighten";
  } else if (document.querySelector("#blur").checked) {
    return "Blur";
  } else if (document.querySelector("#sharp").checked) {
    return "Sharp";
  } else if (document.querySelector("#fade").checked) {
    return "Fade";
  } else if (document.querySelector("#contrast").checked) {
    return "Contrast";
  } else if (document.querySelector("#saturate").checked) {
    return "Saturate";
  } else if (document.querySelector("#solarize").checked) {
    return "Solarize";
  } else if (document.querySelector("#color").checked) {
    return "Color";
  } else if (document.querySelector("#scale").checked) {
    return "Gradient";
  } else if (document.querySelector("#pixel").checked) {
    return "Pixelate";
  } else if (document.querySelector("#resize").checked) {
    return "Resize";
  } else if (document.querySelector("#crop").checked) {
    return "Crop";
  } else if (document.querySelector("#flip").checked) {
    return "Flip";
  } else if (document.querySelector("#rotate").checked) {
    return "Rotate";
  } else if (document.querySelector("#kernel").checked) {
    return "Kernel";
  } else {
    return "Merge";
  }
}

function getMiscValParams(misc_val) {
  if (misc_val == "Brighten") {
    return [1 + document.getElementById("brightRange").value / 100];
  } else if (misc_val == "Blur") {
    return [document.getElementById("blurRange").value];
  } else if (misc_val == "Sharp") {
    return [document.getElementById("sharpenRange").value];
  } else if (misc_val == "Fade") {
    return [255 - document.getElementById("fadeRange").value];
  } else if (misc_val == "Contrast") {
    return [1 + document.getElementById("contrastRange").value / 100];
  } else if (misc_val == "Saturate") {
    return [1 + document.getElementById("saturationRange").value / 100];
  } else if (misc_val == "Solarize") {
    return [document.getElementById("solarizeRange").value];
  } else if (misc_val == "Color") {
    color_factor = document.getElementById("colorRange").value / 100;
    rgb = hex2rgb(document.querySelector("#color_color").value);
    return [color_factor, rgb];
  } else if (misc_val == "Gradient") {
    low = hex2rgb(document.querySelector("#lowColor").value);
    high = hex2rgb(document.querySelector("#highColor").value);
    return [low, high];
  } else if (misc_val == "Pixelate") {
    return [document.getElementById("blockRange").value];
  } else if (misc_val == "Resize") {
    new_width = parseInt(document.getElementById("widthRange").value);
    new_height = parseInt(document.getElementById("heightRange").value);
    return [new_width, new_height];
  } else if (misc_val == "Crop") {
    top_x = parseInt(document.getElementById("topXRange").value);
    top_y = parseInt(document.getElementById("topYRange").value);
    bottom_x =
      top_x + parseInt(document.getElementById("cropWidthRange").value);
    bottom_y =
      top_y + parseInt(document.getElementById("cropHeightRange").value);
    return [top_x, top_y, bottom_x, bottom_y];
  } else if (misc_val == "Flip") {
    if (document.querySelector("#horizontal").checked) {
      val = 0;
    } else {
      val = 1;
    }
    return [val];
  } else if (misc_val == "Rotate") {
    return [document.getElementById("rotateRange").value];
  } else if (misc_val == "Kernel") {
    //Kernel

    return [convertKernelTableToArray()];
  }
}

function getMiscParams() {
  //Custom Stuff to append to Form
  if (document.querySelector("#negate").checked) {
    misc = ["Negate"];
  } else if (document.querySelector("#bright").checked) {
    val = parseInt(1 + document.getElementById("brightRange").value / 100);
    misc = ["Brighten", val];
  } else if (document.querySelector("#blur").checked) {
    misc = ["Blur", parseInt(document.getElementById("blurRange").value)];
  } else if (document.querySelector("#sharp").checked) {
    misc = ["Sharp", parseInt(document.getElementById("sharpenRange").value)];
  } else if (document.querySelector("#fade").checked) {
    misc = ["Fade", parseInt(255 - document.getElementById("fadeRange").value)];
  } else if (document.querySelector("#contrast").checked) {
    val = 1 + document.getElementById("contrastRange").value / 100;
    misc = ["Contrast", parseInt(val)];
  } else if (document.querySelector("#saturate").checked) {
    val = 1 + document.getElementById("saturationRange").value / 100;
    misc = ["Saturate", parseInt(val)];
  } else if (document.querySelector("#solarize").checked) {
    misc = [
      "Solarize",
      parseInt(document.getElementById("solarizeRange").value),
    ];
  } else if (document.querySelector("#color").checked) {
    color_factor = parseInt(document.getElementById("colorRange").value / 100);
    rgb = hex2rgb(document.querySelector("#color_color").value);
    misc = ["Color", color_factor, rgb];
  } else if (document.querySelector("#scale").checked) {
    low = hex2rgb(document.querySelector("#lowColor").value);
    high = hex2rgb(document.querySelector("#highColor").value);
    misc = ["Gradient", low, high];
  } else if (document.querySelector("#pixel").checked) {
    misc = ["Pixelate", parseInt(document.getElementById("blockRange").value)];
  } else if (document.querySelector("#resize").checked) {
    new_width = parseInt(document.getElementById("widthRange").value);
    new_height = parseInt(document.getElementById("heightRange").value);
    misc = ["Resize", new_width, new_height];
  } else if (document.querySelector("#crop").checked) {
    top_x = parseInt(document.getElementById("topXRange").value);
    top_y = parseInt(document.getElementById("topYRange").value);
    bottom_x = parseInt(document.getElementById("cropWidthRange").value);
    bottom_y = parseInt(document.getElementById("cropHeightRange").value);
    misc = ["Crop", top_x, top_y, bottom_x, bottom_y];
  } else if (document.querySelector("#flip").checked) {
    if (document.querySelector("#horizontal").checked) {
      val = 0;
    } else {
      val = 1;
    }
    misc = ["Flip", val];
  } else if (document.querySelector("#rotate").checked) {
    misc = ["Rotate", parseInt(document.getElementById("rotateRange").value)];
  } else if (document.querySelector("#kernel").checked) {
    kernel_matrix = convertKernelTableToArray();
    misc = ["Kernel", kernel_matrix];
  } else {
    misc = ["Merge", localStorage.getItem("custom_merge_params")];
  }

  return misc;
}

function updateMiscPage(params) {
  let all_misc_param = JSON.parse(localStorage.getItem("misc_params"));
  if (all_misc_param) {
    for (misc_val in all_misc_param) {
      if (misc_val == "Brighten") {
        brightRange.value = (all_misc_param[misc_val][0] - 1) * 100;

        brightLabel.textContent = `Intensity: ${brightRange.value}`;

        brightSquare.style.filter = `brightness(${
          (brightRange.value + 100) / 2
        }%)`;
      } else if (misc_val == "Blur") {
        blurRange.value = all_misc_param[misc_val][0];

        blurLabel.textContent = `Intensity: ${blurRange.value}`;

        blurSquare.style.filter = `url(#blurFilter) blur(${blurRange.value}px)`;
      } else if (misc_val == "Sharp") {
        sharpRange.value = all_misc_param[misc_val][0];

        sharpLabel.textContent = `Intensity: ${sharpRange.value}`;
        sharpSquare.style.filter = `url(#blurFilter) blur(${
          10 - sharpRange.value
        }px)`;
      } else if (misc_val == "Fade") {
        fadeRange.value = 255 - all_misc_param[misc_val][0];
        fadeLabel.textContent = `Intensity: ${fadeRange.value}`;
        fadeSquare.style.opacity = (255 - fadeRange.value) / 255;
      } else if (misc_val == "Contrast") {
        contrastRange.value = (all_misc_param[misc_val][0] - 1) * 100;

        contrastScale.textContent = `Intensity: ${contrastRange.value}`;
        contrastSquare.style.filter = `contrast(${
          100 * all_misc_param[misc_val][0]
        }%)`;
      } else if (misc_val == "Saturate") {
        saturationRange.value = (all_misc_param[misc_val][0] - 1) * 100;
        saturationScale.textContent = `Intensity: ${saturationRange.value}`;

        saturationSquare.style.background =
          "linear-gradient(to right, violet, indigo, blue, green, yellow, orange, red)";

        saturationSquare.style.filter = `saturate(${
          100 * all_misc_param[misc_val][0]
        }%)`;
      } else if (misc_val == "Solarize") {
        solRange.value = all_misc_param[misc_val][0];

        sol_scale.textContent = `Threshold: ${solRange.value}`;
        manipulatePixels(solRange.value);
      } else if (misc_val == "Color") {
        colorRange.value = 100 * all_misc_param[misc_val][0];

        document.querySelector("#color_color").value = rgbToHex(
          all_misc_param[misc_val][1][0],
          all_misc_param[misc_val][1][1],
          all_misc_param[misc_val][1][2]
        );

        color_scale.textContent = `Intensity: ${parseInt(colorRange.value)}`;
        updateColorCanvas();
      } else if (misc_val == "Gradient") {
        low_grad.value = rgbToHex(
          all_misc_param[misc_val][0][0],
          all_misc_param[misc_val][0][1],
          all_misc_param[misc_val][0][2]
        );

        high_grad.value = rgbToHex(
          all_misc_param[misc_val][1][0],
          all_misc_param[misc_val][1][1],
          all_misc_param[misc_val][1][2]
        );

        resetGradient();
      } else if (misc_val == "Pixelate") {
        document.getElementById("blockRange").value = Math.min(
          all_misc_param[misc_val],
          document.getElementById("blockRange").max
        );

        newValue =
          2 *
          parseInt(document.getElementById("blockRange").value / resize_scale);

        pixel_block.textContent = `Block Size: ${parseInt(
          document.getElementById("blockRange").value
        )}`;
        new_size2.style.width = `${newValue}px`;
        new_size2.style.height = `${newValue}px`;
      } else if (misc_val == "Resize") {
        document.getElementById("widthRange").value = Math.min(
          parseInt(all_misc_param[misc_val][0]),
          document.getElementById("widthRange").max
        );

        widthLabel.textContent = `Width: ${parseInt(
          document.getElementById("widthRange").value
        )}`;
        newWidthVal = parseInt(
          document.getElementById("widthRange").value / resize_scale
        );
        new_size.style.width = `${newWidthVal}px`;

        document.getElementById("heightRange").value = Math.min(
          parseInt(all_misc_param[misc_val][1]),
          document.getElementById("heightRange").max
        );

        heightLabel.textContent = `Height: ${parseInt(
          document.getElementById("heightRange").value
        )}`;
        newHeightVal = parseInt(
          document.getElementById("heightRange").value / resize_scale
        );
        new_size.style.height = `${newHeightVal}px`;
      } else if (misc_val == "Crop") {
        width = parseInt(
          document.getElementById("resize_width").textContent.split(":")[1]
        );
        height = parseInt(
          document.getElementById("resize_height").textContent.split(":")[1]
        );

        width = parseInt(document.getElementById("widthRange").max / 2);
        height = parseInt(document.getElementById("heightRange").max / 2);

        scaledDimensions = {
          width: parseInt(document.getElementById("flip_div").style.width),
          height: parseInt(document.getElementById("flip_div").style.height),
        };

        document.getElementById("topXRange").max = width - 1;
        document.getElementById("topYRange").max = height - 1;

        // Top XRange
        document.getElementById("topXRange").value = Math.max(
          0,
          Math.min(
            parseInt(all_misc_param[misc_val][0]),
            document.getElementById("topXRange").max
          )
        );

        document.getElementById("top_x").textContent = `X Pos: ${
          document.getElementById("topXRange").value
        }`;

        document.getElementById("crop_width").textContent =
          "Width: " +
          Math.min(
            document.getElementById("cropWidthRange").value,
            width - document.getElementById("topXRange").value
          );

        document.getElementById("new_size3").style.width = `${parseInt(
          (document.getElementById("cropWidthRange").value / width) *
            2 *
            scaledDimensions.width
        )}px`;

        document.getElementById("new_size3").style.left = `${parseInt(
          parseInt(
            (document.getElementById("topXRange").value / width) *
              2 *
              scaledDimensions.width
          )
        )}px`;

        //Top Y Range

        document.getElementById("topYRange").value = Math.max(
          0,
          Math.min(
            parseInt(all_misc_param[misc_val][1]),
            document.getElementById("topYRange").max
          )
        );

        document.getElementById("top_y").textContent = `Y Pos: ${
          document.getElementById("topYRange").value
        }`;

        document.getElementById("crop_height").textContent =
          "Height: " +
          Math.min(
            document.getElementById("cropHeightRange").value,
            height - document.getElementById("topYRange").value
          );

        document.getElementById("new_size3").style.height = `${parseInt(
          (document.getElementById("cropHeightRange").value / height) *
            2 *
            scaledDimensions.height
        )}px`;

        document.getElementById("new_size3").style.top = `${parseInt(
          parseInt(
            (document.getElementById("topYRange").value / height) *
              2 *
              scaledDimensions.height
          )
        )}px`;

        // crop_width

        document.getElementById("cropWidthRange").max =
          width - document.getElementById("topXRange").value;

        document.getElementById("cropWidthRange").value = Math.max(
          0,
          Math.min(
            parseInt(all_misc_param[misc_val][2]),
            document.getElementById("cropWidthRange").max
          )
        );

        document.getElementById("crop_width").textContent =
          "Width: " + document.getElementById("cropWidthRange").value;

        document.getElementById("new_size3").style.width = `${parseInt(
          (document.getElementById("cropWidthRange").value / width) *
            2 *
            scaledDimensions.width
        )}px`;

        // crop_height
        document.getElementById("cropHeightRange").max =
          height - document.getElementById("topYRange").value;

        document.getElementById("cropHeightRange").value = Math.max(
          0,
          Math.min(
            parseInt(all_misc_param[misc_val][3]),
            document.getElementById("cropHeightRange").max
          )
        );

        document.getElementById("crop_height").textContent =
          "Height: " + document.getElementById("cropHeightRange").value;

        document.getElementById("new_size3").style.height = `${parseInt(
          (document.getElementById("cropHeightRange").value / height) *
            2 *
            scaledDimensions.height
        )}px`;
      } else if (misc_val == "Flip") {
        if (all_misc_param[misc_val][0] == 0) {
          document.querySelector("#horizontal").checked = true;
          document.querySelector("#vertical").checked = false;
        } else {
          document.querySelector("#horizontal").checked = false;
          document.querySelector("#vertical").checked = true;
        }
      } else if (misc_val == "Rotate") {
        document.getElementById("rotateRange").value =
          all_misc_param[misc_val][0];

        rotateLabel.textContent = `Rotation: ${all_misc_param[misc_val][0]}°`;
        rotateImg.style.transform = `rotate(${
          360 - all_misc_param[misc_val][0]
        }deg)`;
      } else if (misc_val == "Kernel") {
        // kernel
        updateKernelTable(all_misc_param[misc_val][0]);
      }
    }
  }

  if (localStorage.getItem("merge_params")) {
    updateMergePage(localStorage.getItem("merge_params"));
  }

  // current_misc
  let current_misc = localStorage.getItem("current_misc");
  if (current_misc) {
    //click the right tab
    if (current_misc == "Negate") {
      negate.click();
    } else if (current_misc == "Brighten") {
      bright.click();
    } else if (current_misc == "Blur") {
      blurs.click();
    } else if (current_misc == "Sharp") {
      sharp.click();
    } else if (current_misc == "Fade") {
      fade.click();
    } else if (current_misc == "Contrast") {
      contrast.click();
    } else if (current_misc == "Saturate") {
      saturate.click();
    } else if (current_misc == "Solarize") {
      solarize.click();
    } else if (current_misc == "Color") {
      color.click();
    } else if (current_misc == "Gradient") {
      scale.click();
    } else if (current_misc == "Pixelate") {
      pixel.click();
    } else if (current_misc == "Resize") {
      resize.click();
    } else if (current_misc == "Crop") {
      document.querySelector("#crop").click();
    } else if (current_misc == "Flip") {
      flip.click();
    } else if (current_misc == "Rotate") {
      rotate.click();
    } else if (current_misc == "Merge") {
      merge.click();
    } else {
      // kernel
      kernel.click();
    }
  }

  if (params) {
    if (params[0] == "Negate") {
      negate.click();
    } else if (params[0] == "Brighten") {
      brightRange.value = (params[1] - 1) * 100;

      brightLabel.textContent = `Intensity: ${brightRange.value}`;

      brightSquare.style.filter = `brightness(${
        (brightRange.value + 100) / 2
      }%)`;

      bright.click();
    } else if (params[0] == "Blur") {
      blurRange.value = params[1];

      blurLabel.textContent = `Intensity: ${blurRange.value}`;

      blurSquare.style.filter = `url(#blurFilter) blur(${blurRange.value}px)`;

      blurs.click();
    } else if (params[0] == "Gradient") {
      low_grad.value = rgbToHex(params[1][0], params[1][1], params[1][2]);

      high_grad.value = rgbToHex(params[2][0], params[2][1], params[2][2]);

      resetGradient();
      scale.click();
    } else if (params[0] == "Flip") {
      if (params[1] == 0) {
        document.querySelector("#horizontal").checked = true;
        document.querySelector("#vertical").checked = false;
      } else {
        document.querySelector("#horizontal").checked = false;
        document.querySelector("#vertical").checked = true;
      }
      flip.click();
    } else if (params[0] == "Sharp") {
      sharpRange.value = params[1];

      sharpLabel.textContent = `Intensity: ${sharpRange.value}`;
      sharpSquare.style.filter = `url(#blurFilter) blur(${
        10 - sharpRange.value
      }px)`;

      sharp.click();
    } else if (params[0] == "Fade") {
      fadeRange.value = 255 - params[1];
      fadeLabel.textContent = `Intensity: ${fadeRange.value}`;
      fadeSquare.style.opacity = (255 - fadeRange.value) / 255;
      fade.click();
    } else if (params[0] == "Contrast") {
      contrastRange.value = (params[1] - 1) * 100;
      contrastScale.textContent = `Intensity: ${contrastRange.value}`;
      contrastSquare.style.filter = `contrast(${100 * params[1]}%)`;
      contrast.click();
    } else if (params[0] == "Saturate") {
      saturationRange.value = (params[1] - 1) * 100;
      saturationScale.textContent = `Intensity: ${saturationRange.value}`;

      saturationSquare.style.background =
        "linear-gradient(to right, violet, indigo, blue, green, yellow, orange, red)";

      saturationSquare.style.filter = `saturate(${100 * params[1]}%)`;

      saturate.click();
    } else if (params[0] == "Solarize") {
      solRange.value = params[1];
      sol_scale.textContent = `Threshold: ${solRange.value}`;
      manipulatePixels(solRange.value);

      solarize.click();
    } else if (params[0] == "Color") {
      colorRange.value = 100 * params[1];

      document.querySelector("#color_color").value = rgbToHex(
        params[2][0],
        params[2][1],
        params[2][2]
      );

      color_scale.textContent = `Intensity: ${parseInt(colorRange.value)}`;

      updateColorCanvas();
      color.click();
    } else if (params[0] == "Kernel") {
      updateKernelTable(params[1]);
      kernel.click();
    } else if (params[0] == "Rotate") {
      document.getElementById("rotateRange").value = params[1];
      rotateLabel.textContent = `Rotation: ${params[1]}°`;
      rotateImg.style.transform = `rotate(${360 - params[1]}deg)`;
      rotate.click();
    } else if (params[0] == "Pixelate") {
      document.getElementById("blockRange").value = Math.min(
        params[1],
        document.getElementById("blockRange").max
      );

      newValue =
        2 *
        parseInt(document.getElementById("blockRange").value / resize_scale);

      pixel_block.textContent = `Block Size: ${parseInt(
        document.getElementById("blockRange").value
      )}`;

      new_size2.style.width = `${newValue}px`;
      new_size2.style.height = `${newValue}px`;

      pixel.click();
    } else if (params[0] == "Merge") {
      merge.click();
    } else if (params[0] == "Resize") {
      document.getElementById("widthRange").value = Math.min(
        parseInt(params[1]),
        document.getElementById("widthRange").max
      );

      widthLabel.textContent = `Width: ${parseInt(
        document.getElementById("widthRange").value
      )}`;
      newWidthVal = parseInt(
        document.getElementById("widthRange").value / resize_scale
      );
      new_size.style.width = `${newWidthVal}px`;

      document.getElementById("heightRange").value = Math.min(
        parseInt(params[2]),
        document.getElementById("heightRange").max
      );

      heightLabel.textContent = `Height: ${parseInt(
        document.getElementById("heightRange").value
      )}`;
      newHeightVal = parseInt(
        document.getElementById("heightRange").value / resize_scale
      );
      new_size.style.height = `${newHeightVal}px`;
      resize.click();
    } else if (params[0] == "Crop") {
      width = parseInt(document.getElementById("widthRange").max / 2);
      height = parseInt(document.getElementById("heightRange").max / 2);
      scaledDimensions = {
        width: parseInt(document.getElementById("flip_div").style.width),
        height: parseInt(document.getElementById("flip_div").style.height),
      };

      document.getElementById("topXRange").max = width - 1;
      document.getElementById("topYRange").max = height - 1;

      // Top XRange
      document.getElementById("topXRange").value = Math.max(
        0,
        Math.min(parseInt(params[1]), document.getElementById("topXRange").max)
      );

      document.getElementById("top_x").textContent = `X Pos: ${
        document.getElementById("topXRange").value
      }`;

      document.getElementById("crop_width").textContent =
        "Width: " +
        Math.min(
          document.getElementById("cropWidthRange").value,
          width - document.getElementById("topXRange").value
        );

      document.getElementById("new_size3").style.width = `${parseInt(
        (document.getElementById("cropWidthRange").value / width) *
          2 *
          scaledDimensions.width
      )}px`;

      document.getElementById("new_size3").style.left = `${parseInt(
        parseInt(
          (document.getElementById("topXRange").value / width) *
            2 *
            scaledDimensions.width
        )
      )}px`;

      //Top Y Range
      document.getElementById("topYRange").value = Math.max(
        0,
        Math.min(parseInt(params[2]), document.getElementById("topYRange").max)
      );

      document.getElementById("top_y").textContent = `Y Pos: ${
        document.getElementById("topYRange").value
      }`;

      document.getElementById("crop_height").textContent =
        "Height: " +
        Math.min(
          document.getElementById("cropHeightRange").value,
          height - document.getElementById("topYRange").value
        );

      document.getElementById("new_size3").style.height = `${parseInt(
        (document.getElementById("cropHeightRange").value / height) *
          2 *
          scaledDimensions.height
      )}px`;

      document.getElementById("new_size3").style.top = `${parseInt(
        parseInt(
          (document.getElementById("topYRange").value / height) *
            2 *
            scaledDimensions.height
        )
      )}px`;

      // crop_width

      document.getElementById("cropWidthRange").max =
        width - document.getElementById("topXRange").value;

      document.getElementById("cropWidthRange").value = Math.max(
        0,
        Math.min(
          parseInt(params[3]),
          document.getElementById("cropWidthRange").max
        )
      );

      document.getElementById("crop_width").textContent =
        "Width: " + document.getElementById("cropWidthRange").value;

      document.getElementById("new_size3").style.width = `${parseInt(
        (document.getElementById("cropWidthRange").value / width) *
          2 *
          scaledDimensions.width
      )}px`;

      // crop_height
      document.getElementById("cropHeightRange").max =
        height - document.getElementById("topYRange").value;

      document.getElementById("cropHeightRange").value = Math.max(
        0,
        Math.min(
          parseInt(params[4]),
          document.getElementById("cropHeightRange").max
        )
      );

      document.getElementById("crop_height").textContent =
        "Height: " + document.getElementById("cropHeightRange").value;

      document.getElementById("new_size3").style.height = `${parseInt(
        (document.getElementById("cropHeightRange").value / height) *
          2 *
          scaledDimensions.height
      )}px`;
      crop.click();
    }
  }
}

function updateMergePage(file_name) {
  createFileFromPath("static/uploaded_images/" + file_name).then((file) => {
    if (file) {
      // Now you can use this file as needed, e.g., pass it to handleFilesStyle function
      handleFilesSpecial(
        [file],
        "drop-area-merge",
        "merge_params",
        "uploaded-media-merge",
        newMediaButtonMerge
      );

      if (!document.getElementById("customFilterWrapper")) {
        uploaded_file_names[file.name] -= 1;
      }

      localStorage.setItem(
        "uploaded_file_names",
        JSON.stringify(uploaded_file_names)
      );
    } else {
      delete uploaded_file_names[file_name];

      localStorage.setItem(
        "uploaded_file_names",
        JSON.stringify(uploaded_file_names)
      );

      localStorage.removeItem("merge_params");
    }
  });
}

function updateKernelTable(matrix) {
  const table = document.getElementById("kernelTable");

  const tbody = table.querySelector("tbody");

  // Clear the table
  tbody.innerHTML = "";

  // Update the colspan
  const th = table.querySelector(".title-cell");
  if (matrix.length == 0) {
    th.colSpan = 0;
  } else {
    th.colSpan = matrix[0].length;
  }

  th.textContent = "Kernel Matrix";
  for (let row = 0; row < matrix.length; row++) {
    newRow = tbody.insertRow();

    for (let col = 0; col < matrix[row].length; col++) {
      cell = newRow.insertCell(col);
      cell.contentEditable = true;
      cell.textContent = matrix[row][col];

      cell.addEventListener("input", function () {
        validateInput(row + 1, col + 1, cell);
      });

      previousKernelValues[[row + 1, col + 1]] = matrix[row][col];
    }
  }
}

//Event Listeners**************************************************

// Use dragover event to detect when media is over the drop area
dropContainerMerge.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.stopPropagation(); // Prevent the dragover event from propagating
  if (!dropAreaMerge.classList.contains("media-present")) {
    dropAreaMerge.classList.add("active");
  }
});

// Use dragleave event to detect when media leaves the drop area
dropContainerMerge.addEventListener("dragleave", () => {
  dropAreaMerge.classList.remove("active");
});

dropContainerMerge.addEventListener("drop", (e) => {
  if (!transforming) {
    e.preventDefault();
    dropAreaMerge.classList.remove("active");

    const files = e.dataTransfer.files;

    if (files.length > 0) {
      handleFilesSpecial(
        files,
        "drop-area-merge",
        "merge_params",
        "uploaded-media-merge",
        newMediaButtonMerge
      );
    }
  }
});

dropAreaMerge.addEventListener("click", () => {
  if (!transforming) {
    fileInputMerge.click();
  }
});

fileInputMerge.addEventListener("change", () => {
  if (!transforming) {
    const files = fileInputMerge.files;
    handleFilesSpecial(
      files,
      "drop-area-merge",
      "merge_params",
      "uploaded-media-merge",
      newMediaButtonMerge
    );
  }
});

// Click event for the "Upload New Media" button
newMediaButtonMerge.addEventListener("click", () => {
  if (!transforming) {
    fileInputMerge.value = "";
    // Hide the "Upload New Media" button
    newMediaButtonMerge.style.display = "none";
    // Reset the drop area text

    let file_name = localStorage.getItem("merge_params");

    if (!document.getElementById("customFilterWrapper")) {
      uploaded_file_names[file_name] -= 1;
      if (uploaded_file_names[file_name] == 0) {
        removeFile(file_name);
        delete uploaded_file_names[file_name];
      }

      localStorage.setItem(
        "uploaded_file_names",
        JSON.stringify(uploaded_file_names)
      );
    }

    if (!document.getElementById("customFilterWrapper")) {
      localStorage.removeItem("merge_params");
    } else {
      localStorage.removeItem("custom_merge_params");
    }

    dropAreaMerge.classList.remove("media-present");
    dropAreaMerge.innerHTML =
      "<p>Drag and drop merge image file here, or click to select file.</p>";

    if (document.getElementById("customFilterWrapper")) {
      document.getElementById("add-filter-button").style.background = "";
    }

    // if drop area also does not have an image then do this
    let drop = document.getElementById("drop-area");
    if (drop && !drop.classList.contains("media-present")) {
      download_button.style.background = "";
    }

    transform_button.style.background = "";

    dropAreaMerge.style.width = "40vw";
    dropAreaMerge.style.height = "26vh";
  }
});

brightRange.addEventListener("input", function () {
  const newValue = parseInt(this.value);
  brightLabel.textContent = `Intensity: ${newValue}`;
  brightSquare.style.filter = `brightness(${(newValue + 100) / 2}%)`;
});

blurRange.addEventListener("input", function () {
  const newValue = parseInt(this.value);
  blurLabel.textContent = `Intensity: ${newValue}`;
  blurSquare.style.filter = `url(#blurFilter) blur(${newValue}px)`;
});

sharpRange.addEventListener("input", function () {
  const newValue = parseInt(this.value);
  sharpLabel.textContent = `Intensity: ${newValue}`;
  sharpSquare.style.filter = `url(#blurFilter) blur(${10 - newValue}px)`;
});

fadeRange.addEventListener("input", function () {
  const newValue = parseInt(this.value);
  fadeLabel.textContent = `Intensity: ${newValue}`;
  opacity = (255 - newValue) / 255;
  fadeSquare.style.opacity = opacity;
});

horizontal.addEventListener("click", function () {
  flip_img.src = "static/option_images/misc/horizontal.png";
  flip_div.style.transform = "scaleX(-1)";
});

vertical.addEventListener("click", function () {
  flip_img.src = "static/option_images/misc/vertical.png";
  flip_div.style.transform = "scaleY(-1)";
});

rotateRange.addEventListener("input", function () {
  const newValue = parseInt(this.value);
  rotateLabel.textContent = `Rotation: ${newValue}°`;
  rotateImg.style.transform = `rotate(${360 - newValue}deg)`;
});

contrastRange.addEventListener("input", updateContrast);

saturationRange.addEventListener("input", updateSaturation);

widthRange.addEventListener("input", function () {
  const newValue = parseInt(this.value / resize_scale);
  // scale it down
  widthLabel.textContent = `Width: ${parseInt(this.value)}`;
  new_size.style.width = `${newValue}px`;

  if (!document.getElementById("customFilterWrapper")) {
    let all_misc = JSON.parse(localStorage.getItem("misc_params")) || {};

    all_misc["Resize"] = [this.value, heightRange.value];

    localStorage.setItem("misc_params", JSON.stringify(all_misc));
  }
});

heightRange.addEventListener("input", function () {
  const newValue = parseInt(this.value / resize_scale);
  //scale it down
  heightLabel.textContent = `Height: ${parseInt(this.value)}`;
  new_size.style.height = `${newValue}px`;

  if (!document.getElementById("customFilterWrapper")) {
    let all_misc = JSON.parse(localStorage.getItem("misc_params")) || {};

    all_misc["Resize"] = [widthRange.value, this.value];

    localStorage.setItem("misc_params", JSON.stringify(all_misc));
  }
});

blockRange.addEventListener("input", function () {
  const newValue = 2 * parseInt(this.value / resize_scale);
  // scale it down
  pixel_block.textContent = `Block Size: ${parseInt(this.value)}`;
  new_size2.style.width = `${newValue}px`;
  new_size2.style.height = `${newValue}px`;

  if (!document.getElementById("customFilterWrapper")) {
    let all_misc = JSON.parse(localStorage.getItem("misc_params")) || {};

    all_misc["Pixelate"] = [this.value];

    localStorage.setItem("misc_params", JSON.stringify(all_misc));
  }
});

document.getElementById("color_color").addEventListener("input", function () {
  updateColorCanvas();
});

colorRange.addEventListener("input", function () {
  color_scale.textContent = `Intensity: ${parseInt(this.value)}`;
  updateColorCanvas();
});

high_grad.addEventListener("input", function () {
  resetGradient();
});

low_grad.addEventListener("input", function () {
  resetGradient();
});

solRange.addEventListener("input", function () {
  const solValue = solRange.value;
  sol_scale.textContent = `Threshold: ${solValue}`;
  manipulatePixels(solValue);
});

scale.addEventListener("click", function () {
  removeAllOpts();
  scale_opt.style.display = "";
  if (!document.getElementById("customFilterWrapper")) {
    localStorage.setItem("current_misc", "Gradient");
  }
});

negate.addEventListener("click", function () {
  removeAllOpts();
  negate_opt.style.display = "";
  if (!document.getElementById("customFilterWrapper")) {
    localStorage.setItem("current_misc", "Negate");
  }
});

bright.addEventListener("click", function () {
  removeAllOpts();
  bright_opt.style.display = "";
  if (!document.getElementById("customFilterWrapper")) {
    localStorage.setItem("current_misc", "Brighten");
  }
});

blurs.addEventListener("click", function () {
  removeAllOpts();
  blur_opt.style.display = "";
  if (!document.getElementById("customFilterWrapper")) {
    localStorage.setItem("current_misc", "Blur");
  }
});

sharp.addEventListener("click", function () {
  removeAllOpts();
  sharp_opt.style.display = "";
  if (!document.getElementById("customFilterWrapper")) {
    localStorage.setItem("current_misc", "Sharp");
  }
});

contrast.addEventListener("click", function () {
  removeAllOpts();
  contrast_opt.style.display = "";
  if (!document.getElementById("customFilterWrapper")) {
    localStorage.setItem("current_misc", "Contrast");
  }
});

pixel.addEventListener("click", function () {
  removeAllOpts();
  pixel_opt.style.display = "";
  if (
    !document.getElementById("drop-area").classList.contains("media-present")
  ) {
    if (
      document.getElementById("customFilterWrapper") &&
      document.getElementById("add-filter-button")
    ) {
      document.getElementById("add-filter-button").style.background = "";
    }
  }

  if (!document.getElementById("customFilterWrapper")) {
    localStorage.setItem("current_misc", "Pixelate");
  }
});

resize.addEventListener("click", function () {
  removeAllOpts();
  resize_opt.style.display = "";
  if (
    !document.getElementById("drop-area").classList.contains("media-present")
  ) {
    if (
      document.getElementById("customFilterWrapper") &&
      document.getElementById("add-filter-button")
    ) {
      document.getElementById("add-filter-button").style.background = "";
    }
  }

  if (!document.getElementById("customFilterWrapper")) {
    localStorage.setItem("current_misc", "Resize");
  }
});

crop.addEventListener("click", function () {
  removeAllOpts();
  crop_opt.style.display = "";
  if (
    !document.getElementById("drop-area").classList.contains("media-present")
  ) {
    if (
      document.getElementById("customFilterWrapper") &&
      document.getElementById("add-filter-button")
    ) {
      document.getElementById("add-filter-button").style.background = "";
    }
  }
  if (!document.getElementById("customFilterWrapper")) {
    localStorage.setItem("current_misc", "Crop");
  }
});

rotate.addEventListener("click", function () {
  removeAllOpts();
  rotate_opt.style.display = "flex";
  if (!document.getElementById("customFilterWrapper")) {
    localStorage.setItem("current_misc", "Rotate");
  }
});

fade.addEventListener("click", function () {
  removeAllOpts();
  fade_opt.style.display = "";
  if (!document.getElementById("customFilterWrapper")) {
    localStorage.setItem("current_misc", "Fade");
  }
});

color.addEventListener("click", function () {
  removeAllOpts();
  color_opt.style.display = "";
  if (!document.getElementById("customFilterWrapper")) {
    localStorage.setItem("current_misc", "Color");
  }
});

saturate.addEventListener("click", function () {
  removeAllOpts();
  sat_opt.style.display = "";
  if (!document.getElementById("customFilterWrapper")) {
    localStorage.setItem("current_misc", "Saturate");
  }
});

solarize.addEventListener("click", function () {
  removeAllOpts();
  sol_opt.style.display = "";
  if (!document.getElementById("customFilterWrapper")) {
    localStorage.setItem("current_misc", "Solarize");
  }
});

flip.addEventListener("click", function () {
  removeAllOpts();
  flip_opt.style.display = "flex";
  if (!document.getElementById("customFilterWrapper")) {
    localStorage.setItem("current_misc", "Flip");
  }
});

kernel.addEventListener("click", function () {
  removeAllOpts();
  kernel_opt.style.display = "";
  if (!document.getElementById("customFilterWrapper")) {
    localStorage.setItem("current_misc", "Kernel");
  }
});

merge.addEventListener("click", function () {
  removeAllOpts();
  merge_opt.style.display = "";
  if (!document.getElementById("customFilterWrapper")) {
    localStorage.setItem("current_misc", "Merge");
  }

  if (
    !document
      .getElementById("drop-area-merge")
      .classList.contains("media-present")
  ) {
    if (
      document.getElementById("customFilterWrapper") &&
      document.getElementById("add-filter-button")
    ) {
      document.getElementById("add-filter-button").style.background = "";
    }
  }
});

//Main Code**************************************************

for (let i = 0; i < miscrows.length; i++) {
  const cells = miscrows[i].querySelectorAll('td[contenteditable="true"]');
  for (let j = 0; j < cells.length; j++) {
    const cell = cells[j];
    cell.addEventListener("input", function () {
      validateInput(i + 1, j + 1, cell);
    });
  }
}

//Set initial gradient background
manipulatePixels(0);
resetGradient();

if (localStorage.getItem("misc_params")) {
  let curr_misc = localStorage.getItem("current_misc");
  if (curr_misc == "Pixelate") {
    pixel.checked = true;
  } else if (curr_misc == "Resize") {
    resize.checked = true;
  } else if (curr_misc == "") {
    crop.checked = true;
  } else {
    updateMiscPage([]);
  }
}
