//Initialize**************************************************

const current_custom_opts = document.getElementById("current_custom_opts");
let edit_filter = false;
let customRowSelectIndex = localStorage.getItem("customRowSelectIndex");
let custom_params = localStorage.getItem("customParams");

download_button = document.getElementById("download-button");
transform_button = document.getElementById("transform-button");

const custom_opts = document.getElementById("custom_opts");
const custom_ascii = document.querySelector("#custom_ascii");
const custom_quant = document.querySelector("#custom_quant");
const custom_dither = document.querySelector("#custom_dither");
const custom_mosaic = document.querySelector("#custom_mosaic");
const custom_trace = document.querySelector("#custom_trace");
const custom_string = document.querySelector("#custom_string");
const custom_shapes = document.querySelector("#custom_shapes");
const custom_misc = document.querySelector("#custom_misc");
const custom_style = document.querySelector("#custom_style");

const custom_ascii_opts = document.getElementById("custom_ascii_opts");
const custom_quant_opts = document.getElementById("custom_quant_opts");
const custom_dither_opts = document.getElementById("custom_dither_opts");
const custom_mosaic_opts = document.getElementById("custom_mosaic_opts");
const custom_trace_opts = document.getElementById("custom_trace_opts");
const custom_string_opts = document.getElementById("custom_string_opts");
const custom_shapes_opts = document.getElementById("custom_shapes_opts");
const custom_misc_opts = document.getElementById("custom_misc_opts");
const custom_style_opts = document.getElementById("custom_style_opts");

//Functions**************************************************

// Function to encapsulate the logic and create closures
function createDivAndUpdateTable(param, index) {
  var newDiv = document.createElement("div");
  newDiv.textContent = updateTableText(param);
  newDiv.addEventListener("click", function () {
    custom_select(newDiv);
  });

  if (index === customRowSelectIndex) {
    newDiv.classList.add("filter-select");
  }

  document
    .getElementById("customFilterWrapper")
    .insertBefore(
      newDiv,
      document.getElementById("customFilterWrapper").children[index]
    );
}

function deleteFilter() {
  if (custom_params.length > 2) {
    if (!transforming) {
      document
        .getElementById("customFilterWrapper")
        .removeChild(
          document.getElementById("customFilterWrapper").children[
            customRowSelectIndex
          ]
        );

      AddFilterEditPrev();
      custom_params.splice(customRowSelectIndex, 1);
      localStorage.setItem("customParams", JSON.stringify(custom_params));

      localStorage.setItem(
        "uploaded_file_names",
        JSON.stringify(uploaded_file_names)
      );

      customRowSelectIndex = customRowSelectIndex % custom_params.length;
      localStorage.setItem("customRowSelectIndex", customRowSelectIndex);

      document
        .getElementById("customFilterWrapper")
        .children[customRowSelectIndex].classList.add("filter-select");

      document.getElementById(
        "filterCountTitle"
      ).textContent = `Filters (${custom_params.length})`;

      document.getElementById("addFilterButton").style.backgroundColor =
        "#28a745";

      if (custom_params.length == 2) {
        document.getElementById("deleteFilterButton").style.backgroundColor =
          "grey";
      }
    }
  } else {
    showErrorMessage("[Cannot Delete More Filters]");
  }
}

async function getPageParams() {
  if (custom_ascii.checked) {
    res = ["Ascii"].concat(getAsciiParams());
  } else if (custom_quant.checked) {
    res = ["Quant"].concat([getQuantParams()]);
  } else if (custom_dither.checked) {
    res = ["Dither"].concat(getDitherParams());
  } else if (custom_mosaic.checked) {
    res = [
      "Mosaic",
      JSON.parse(localStorage.getItem("custom_mosaic_params")),
    ].concat(getMosaicParams().slice(0, 3));
  } else if (custom_trace.checked) {
    res = ["Trace"].concat(getTraceParams());
  } else if (custom_string.checked) {
    res = ["String"].concat(getStringParams());
  } else if (custom_shapes.checked) {
    res = ["Shape"].concat(getShapeParams());
  } else if (custom_misc.checked) {
    res = ["Misc"].concat(getMiscParams());
  } else {
    // style
    res = ["Style", localStorage.getItem("custom_style_params")];
  }

  return res;
}

// show the options for the currentSelectIndex (after click)
function select_toggle() {
  option = custom_params[customRowSelectIndex][0];
  if (option == "Trace") {
    custom_trace.click();
  } else if (option == "Misc") {
    custom_misc.click();
  } else if (option == "Quant") {
    custom_quant.click();
  } else if (option == "Mosaic") {
    custom_mosaic.click();
  } else if (option == "Shape") {
    custom_shapes.click();
  } else if (option == "Dither") {
    custom_dither.click();
  } else if (option == "String") {
    custom_string.click();
  } else if (option == "Style") {
    custom_style.click();
  } else {
    // Ascii
    custom_ascii.click();
  }
}

function showFilters() {
  if (edit_filter || custom_params.length < 10) {
    if (!transforming) {
      document.getElementById("customFilterWrapper").style.display = "none";
      document.getElementById("filterCountTitle").style.display = "none";

      document.getElementById("add-filter-button").style.display = "";
      document.getElementById("back-filter-button").style.display = "";

      document
        .getElementById("add-filter-button")
        .addEventListener("click", AddFilter);

      document
        .getElementById("back-filter-button")
        .addEventListener("click", BackTable);

      download_button.style.display = "none";
      transform_button.style.display = "none";

      document.getElementById("filter_toggle").style.display = "flex";
      current_custom_opts.style.display = "";
      if (!edit_filter) {
        document.getElementById("add-filter-button").textContent = "Add Filter";
      }
      select_toggle();
    }
  } else {
    showErrorMessage("[Cannot Add More Filters]");
  }
}

function AddBackFilterHelper() {
  document.getElementById("add-filter-button").textContent = "Add Filter";

  if (
    !document.getElementById("drop-area").classList.contains("media-present") &&
    custom_misc.checked &&
    (document.querySelector("#pixel").checked ||
      document.querySelector("#resize").checked ||
      document.querySelector("#crop").checked)
  ) {
    var element = document.getElementById("progress-text");
    element.style.opacity = 1;
    // Set a timeout to hide the element after 2 seconds
    setTimeout(function () {
      element.style.opacity = 0;
    }, 2000);

    return false;
  }

  if (
    custom_mosaic.checked &&
    (!document
      .getElementById("drop-area-mosaic")
      .classList.contains("media-present") ||
      !document.getElementById("drop-area").classList.contains("media-present"))
  ) {
    var element = document.getElementById("progress-text");

    if (
      !document
        .getElementById("drop-area-mosaic")
        .classList.contains("media-present")
    ) {
      element.textContent = "[Upload Mosaic Media]";
    }
    element.style.opacity = 1;

    // Set a timeout to hide the element after 2 seconds
    setTimeout(function () {
      element.style.opacity = 0;
      element.textContent = "[Upload Media]";
    }, 2000);

    return false;
  }

  if (
    custom_style.checked &&
    !document
      .getElementById("drop-area-style")
      .classList.contains("media-present")
  ) {
    showErrorMessage("[Upload Style Media]");
    return false;
  }

  if (
    custom_misc.checked &&
    document.querySelector("#merge").checked &&
    !document
      .getElementById("drop-area-merge")
      .classList.contains("media-present")
  ) {
    showErrorMessage("[Upload Merge Media]");
    return false;
  }

  document.getElementById("add-filter-button").style.display = "none";
  document.getElementById("back-filter-button").style.display = "none";

  download_button.style.display = "";
  transform_button.style.display = "";

  document.getElementById("customFilterWrapper").style.display = "";
  document.getElementById("filterCountTitle").style.display = "";

  document.getElementById("filter_toggle").style.display = "none";
  current_custom_opts.style.display = "none";

  if (
    document.getElementById("drop-area").classList.contains("media-present")
  ) {
    download_button.style.background = "#43A6C6";
    transform_button.style.background = "#43A6C6";
  } else {
    download_button.style.background = "";
    transform_button.style.background = "";
  }

  return true;
}

function BackTable() {
  document.getElementById("add-filter-button").style.display = "none";
  document.getElementById("back-filter-button").style.display = "none";

  download_button.style.display = "";
  transform_button.style.display = "";

  document.getElementById("customFilterWrapper").style.display = "";
  document.getElementById("filterCountTitle").style.display = "";

  document.getElementById("filter_toggle").style.display = "none";
  current_custom_opts.style.display = "none";

  if (
    document.getElementById("drop-area").classList.contains("media-present")
  ) {
    download_button.style.background = "#43A6C6";
    transform_button.style.background = "#43A6C6";
  } else {
    download_button.style.background = "";
    transform_button.style.background = "";
  }

  edit_filter = false;
}

function updateTableText(result) {
  option = result[0];
  if (option == "Trace") {
    if (result[1]) {
      return "Trace (One Line)";
    }
    return "Trace (Multi Lines)";
  } else if (option == "Misc") {
    let misc_type = result[1];

    if (misc_type == "Negate") {
      return "Misc (Invert)";
    } else if (misc_type == "Brighten") {
      return " Misc (Bright)";
    } else if (misc_type == "Blur") {
      return "Misc (Blur)";
    } else if (misc_type == "Sharp") {
      return "Misc (Sharp)";
    } else if (misc_type == "Fade") {
      return "Misc (Fade)";
    } else if (misc_type == "Contrast") {
      return "Misc (Contrast)";
    } else if (misc_type == "Saturate") {
      return "Misc (Saturate)";
    } else if (misc_type == "Solarize") {
      return "Misc (Solarize)";
    } else if (misc_type == "Color") {
      return "Misc (Colorize)";
    } else if (misc_type == "Gradient") {
      return "Misc (Gradient)";
    } else if (misc_type == "Pixelate") {
      return "Misc (Pixelate)";
    } else if (misc_type == "Resize") {
      return "Misc (Resize)";
    } else if (misc_type == "Crop") {
      return "Misc (Crop)";
    } else if (misc_type == "Flip") {
      if (result[2] == 1) {
        return "Misc (Flip - Vertically)";
      } else {
        return "Misc (Flip - Horizontally)";
      }
    } else if (misc_type == "Rotate") {
      return "Misc (Rotate)";
    } else if (misc_type == "Kernel") {
      return "Misc (Kernel)";
    } else {
      return `Misc (Merge - ${result[2]})`;
    }
  } else if (option == "Quant") {
    let quant_cnt = Math.floor(result[1].length / 3);
    return `Quant (${quant_cnt} Colors)`;
  } else if (option == "Mosaic") {
    return `Mosaic (${result[1].length} Images)`;
  } else if (option == "Shape") {
    let shape_type = result[1][0];

    if (shape_type == 0) {
      return "Shapes (Circle)";
    } else if (shape_type == 1) {
      return "Shapes (Star)";
    } else if (shape_type == 2) {
      return "Shapes (Heart)";
    } else if (shape_type == -1) {
      return "Shapes (Apple)";
    } else if (shape_type == 3) {
      return "Shapes (Triangle)";
    } else if (shape_type == 4) {
      return "Shapes (Diamond)";
    } else if (shape_type == 6) {
      return "Shapes (Hexagon)";
    } else {
      return "Shapes (Custom)";
    }
  } else if (option == "Dither") {
    let dith_cnt = result[1].length;
    let dith_type_text = result[2] ? "Error" : "Ordered";
    return `Dither (${dith_cnt} Colors, ${dith_type_text})`;
  } else if (option == "String") {
    let string_type_text = result[4] ? "Rectangle" : "Circle";
    return `String (${string_type_text})`;
  } else if (option == "Style") {
    return `Style (${result[1]})`;
  } else {
    let char_len_text = result[1].length;
    return `Ascii (${char_len_text} Characters)`;
  }
}

function custom_select(element) {
  newIndex = Array.prototype.indexOf.call(
    document.getElementById("customFilterWrapper").children,
    element
  );

  if (newIndex == customRowSelectIndex) {
    // change the text to
    if (!transforming) {
      document.getElementById("add-filter-button").textContent =
        "Update Filter";

      edit_filter = true;
      showFilters();
    }
  } else {
    document
      .getElementById("customFilterWrapper")
      .children[customRowSelectIndex].classList.remove("filter-select");

    // Add the class to this one
    element.classList.add("filter-select");

    // update index
    customRowSelectIndex = newIndex;
    localStorage.setItem("customRowSelectIndex", customRowSelectIndex);
  }
}

async function AddFilterAdding(result) {
  if (result[0] == "Style") {
    if (!(result[1] in uploaded_file_names)) {
      const mediaFile = await getMediaFileFromDropArea(
        dropAreaStyle,
        result[1]
      );
      saveFile(mediaFile.file);
      uploaded_file_names[result[1]] = 0;
    }
    uploaded_file_names[result[1]] += 1;
  } else if (result[0] == "Mosaic") {
    for (let index = 0; index < uploadedImages.length; index++) {
      file_name = result[1][index];
      if (!(file_name in uploaded_file_names)) {
        viewImage(index);
        const mediaFile = await getMediaFileFromDropArea(
          dropAreaMosaic,
          file_name
        );
        saveFile(mediaFile.file);
        uploaded_file_names[file_name] = 0;
      }
      uploaded_file_names[file_name] += 1;
    }
  } else if (result[0] == "Misc" && result[1] == "Merge") {
    if (!(result[2] in uploaded_file_names)) {
      const mediaFile = await getMediaFileFromDropArea(
        dropAreaMerge,
        result[2]
      );
      saveFile(mediaFile.file);
      uploaded_file_names[result[2]] = 0;
    }
    uploaded_file_names[result[2]] += 1;
  }
}

function AddFilterEditPrev() {
  if (custom_params[customRowSelectIndex][0] == "Style") {
    file_name = custom_params[customRowSelectIndex][1];
    uploaded_file_names[file_name] -= 1;
    if (uploaded_file_names[file_name] == 0) {
      removeFile(file_name);
      delete uploaded_file_names[file_name];
    }
  } else if (custom_params[customRowSelectIndex][0] == "Mosaic") {
    for (
      let index = 0;
      index < custom_params[customRowSelectIndex][1].length;
      index++
    ) {
      file_name = custom_params[customRowSelectIndex][1][index];
      uploaded_file_names[file_name] -= 1;
      if (uploaded_file_names[file_name] == 0) {
        removeFile(file_name);
        delete uploaded_file_names[file_name];
      }
    }
  } else if (custom_params[customRowSelectIndex][0] == "Misc") {
    if (custom_params[customRowSelectIndex][1] == "Merge") {
      file_name = custom_params[customRowSelectIndex][2];
      uploaded_file_names[file_name] -= 1;
      if (uploaded_file_names[file_name] == 0) {
        removeFile(file_name);
        delete uploaded_file_names[file_name];
      }
    }
  }
}

async function AddFilter() {
  if (await AddBackFilterHelper()) {
    const result = await getPageParams();
    await AddFilterAdding(result);

    if (edit_filter) {
      AddFilterEditPrev();
      custom_params[customRowSelectIndex] = result;
      //update Text Content
      document.getElementById("customFilterWrapper").children[
        customRowSelectIndex
      ].textContent = updateTableText(result);
      edit_filter = false;
    } else {
      custom_params.splice(customRowSelectIndex + 1, 0, result);

      // add Div  customFilterWrapper
      var newDiv = document.createElement("div");
      newDiv.textContent = updateTableText(result);
      newDiv.addEventListener("click", function () {
        custom_select(newDiv);
      });

      //remove class at that index
      document
        .getElementById("customFilterWrapper")
        .children[customRowSelectIndex].classList.remove("filter-select");

      newDiv.classList.add("filter-select");

      customRowSelectIndex += 1;
      localStorage.setItem("customRowSelectIndex", customRowSelectIndex);

      document
        .getElementById("customFilterWrapper")
        .insertBefore(
          newDiv,
          document.getElementById("customFilterWrapper").children[
            customRowSelectIndex
          ]
        );

      document.getElementById(
        "filterCountTitle"
      ).textContent = `Filters (${custom_params.length})`;

      document.getElementById("deleteFilterButton").style.backgroundColor =
        "#dc3545";

      if (custom_params.length == 10) {
        document.getElementById("addFilterButton").style.backgroundColor =
          "grey";
      }
    }

    localStorage.setItem("customParams", JSON.stringify(custom_params));
    localStorage.setItem(
      "uploaded_file_names",
      JSON.stringify(uploaded_file_names)
    );
  }
}

function resetCurrentOpts(element) {
  // Remove all existing children from the parent element
  if (element) {
    while (current_custom_opts.firstChild) {
      current_custom_opts.removeChild(current_custom_opts.firstChild);
    }
    current_custom_opts.appendChild(element);
  }

  let option = custom_params[customRowSelectIndex][0];
  // Basically check each toggle
  if (custom_ascii.checked) {
    if (option == "Ascii") {
      updateAsciiPage(custom_params[customRowSelectIndex].slice(1));
    } else if (localStorage.getItem("ascii_params")) {
      updateAsciiPage(JSON.parse(localStorage.getItem("ascii_params")));
    }
  } else if (custom_quant.checked) {
    if (option == "Quant") {
      updateQuantPage(custom_params[customRowSelectIndex].slice(1)[0]);
    } else if (localStorage.getItem("quant_params")) {
      updateQuantPage(JSON.parse(localStorage.getItem("quant_params")));
    }
  } else if (custom_dither.checked) {
    if (option == "Dither") {
      updateDitherPage(custom_params[customRowSelectIndex].slice(1));
    } else if (localStorage.getItem("dither_params")) {
      updateDitherPage(JSON.parse(localStorage.getItem("dither_params")));
    }
  } else if (custom_mosaic.checked) {
    if (option == "Mosaic") {
      updateMosaicPage(custom_params[customRowSelectIndex].slice(1));
    } else if (localStorage.getItem("mosaic_params")) {
      updateMosaicPage([JSON.parse(localStorage.getItem("mosaic_params"))]);
    }
  } else if (custom_trace.checked) {
    if (option == "Trace") {
      updateTracePage(custom_params[customRowSelectIndex].slice(1));
    } else if (localStorage.getItem("trace_params")) {
      updateTracePage(JSON.parse(localStorage.getItem("trace_params")));
    }
  } else if (custom_string.checked) {
    if (option == "String") {
      updateStringPage(custom_params[customRowSelectIndex].slice(1));
    } else if (localStorage.getItem("string_params")) {
      updateStringPage(JSON.parse(localStorage.getItem("string_params")));
    }
  } else if (custom_shapes.checked) {
    if (option == "Shape") {
      updateShapePage(custom_params[customRowSelectIndex].slice(1));
    } else if (localStorage.getItem("shape_params")) {
      updateShapePage(JSON.parse(localStorage.getItem("shape_params")));
    }
  } else if (custom_misc.checked) {
    //newMediaButton.click();
    updateSpecialFilters();
    if (option == "Misc") {
      updateMiscPage(custom_params[customRowSelectIndex].slice(1));
    } else if (localStorage.getItem("misc_params")) {
      updateMiscPage([]);
    }
  } else {
    if (option == "Style") {
      updateStylePage(custom_params[customRowSelectIndex].slice(1));
    } else if (localStorage.getItem("style_params")) {
      updateStylePage([localStorage.getItem("style_params")]);
    }
  }
}

//Event Listeners**************************************************

custom_ascii.addEventListener("click", function () {
  resetCurrentOpts(custom_ascii_opts);
  document.getElementById("add-filter-button").style.background = "lightgreen";
});

custom_quant.addEventListener("click", function () {
  resetCurrentOpts(custom_quant_opts);
  document.getElementById("add-filter-button").style.background = "lightgreen";
});

custom_dither.addEventListener("click", function () {
  resetCurrentOpts(custom_dither_opts);
  document.getElementById("add-filter-button").style.background = "lightgreen";
});

custom_mosaic.addEventListener("click", function () {
  resetCurrentOpts(custom_mosaic_opts);
  if (
    document.getElementById("drop-area").classList.contains("media-present")
  ) {
    updateSpecialFilters();
  } else {
    document.getElementById("mosiac_block_opts").style.display = "none";
  }

  if (custom_params[customRowSelectIndex][0] == "Mosaic") {
    let [, , param3, param4] = custom_params[customRowSelectIndex];
    updateMosaicPage([[], param3, param4, resize_scale]);
  }

  if (
    document
      .getElementById("drop-area-mosaic")
      .classList.contains("media-present") &&
    document.getElementById("drop-area").classList.contains("media-present")
  ) {
    document.getElementById("add-filter-button").style.background =
      "lightgreen";
  } else {
    document.getElementById("add-filter-button").style.background = "";
  }
});

custom_trace.addEventListener("click", function () {
  resetCurrentOpts(custom_trace_opts);
  document.getElementById("add-filter-button").style.background = "lightgreen";
});

custom_string.addEventListener("click", function () {
  resetCurrentOpts(custom_string_opts);
  document.getElementById("add-filter-button").style.background = "lightgreen";
});

custom_shapes.addEventListener("click", function () {
  resetCurrentOpts(custom_shapes_opts);
  document.getElementById("add-filter-button").style.background = "lightgreen";
});

custom_misc.addEventListener("click", function () {
  resetCurrentOpts(custom_misc_opts);

  if (
    document.getElementById("drop-area").classList.contains("media-present")
  ) {
    //updateSpecialFilters();
  } else {
    document.getElementById("resize_no_media").style.display = "";
    document.getElementById("resize_all_opts").style.display = "none";

    document.getElementById("pixel_no_media").style.display = "";
    document.getElementById("pixel_all_opts").style.display = "none";

    document.getElementById("crop_no_media").style.display = "";
    document.getElementById("crop_all_opts").style.display = "none";

    document.getElementById("flip_img").style.display = "";
    document.getElementById("flip_div").style.display = "none";

    document.getElementById("rotate_img").style.border = "1px solid #000";
    document.getElementById("rotate_img").style.width = "75px";
    document.getElementById("rotate_img").style.height = "75px";

    if (
      document.querySelector("#pixel").checked ||
      document.querySelector("#resize").checked ||
      document.querySelector("#crop").checked
    ) {
      document.getElementById("add-filter-button").style.background = "";
    } else {
      document.getElementById("add-filter-button").style.background =
        "lightgreen";
    }
  }
});

custom_style.addEventListener("click", function () {
  resetCurrentOpts(custom_style_opts);

  if (
    document
      .getElementById("drop-area-style")
      .classList.contains("media-present")
  ) {
    document.getElementById("add-filter-button").style.background =
      "lightgreen";
  } else {
    document.getElementById("add-filter-button").style.background = "";
  }
});

//Main Code**************************************************

if (customRowSelectIndex) {
  customRowSelectIndex = parseInt(customRowSelectIndex);
} else {
  customRowSelectIndex = 0;
  localStorage.setItem("customRowSelectIndex", customRowSelectIndex);
}

if (custom_params) {
  custom_params = JSON.parse(custom_params);

  // Create an array to hold all the promises
  let promises = [];

  custom_params.forEach((param, i) => {
    if (param[0] === "Style") {
      // Get the image
      promises.push(
        createFileFromPath("static/uploaded_images/" + param[1]).then(
          (file) => {
            if (file == null) {
              custom_params.splice(i, 1);
              localStorage.setItem(
                "customParams",
                JSON.stringify(custom_params)
              );

              delete uploaded_file_names[param[1]];
              localStorage.setItem(
                "uploaded_file_names",
                JSON.stringify(uploaded_file_names)
              );
            }
          }
        )
      );
    } else if (param[1] === "Merge") {
      // No action needed for Merge
      promises.push(
        createFileFromPath("static/uploaded_images/" + param[2]).then(
          (file) => {
            if (file == null) {
              custom_params.splice(i, 1);
              localStorage.setItem(
                "customParams",
                JSON.stringify(custom_params)
              );

              delete uploaded_file_names[param[1]];
              localStorage.setItem(
                "uploaded_file_names",
                JSON.stringify(uploaded_file_names)
              );
            }
          }
        )
      );
    } else if (param[0] === "Mosaic") {
      param[1].forEach((file, j) => {
        promises.push(
          createFileFromPath("static/uploaded_images/" + file).then((file) => {
            if (file == null) {
              param[1].splice(j, 1);

              if (param[1].length == 0) {
                custom_params.splice(i, 1);
              } else {
                custom_params[i][1] = param[1];
              }

              localStorage.setItem(
                "customParams",
                JSON.stringify(custom_params)
              );

              delete uploaded_file_names[file];
              localStorage.setItem(
                "uploaded_file_names",
                JSON.stringify(uploaded_file_names)
              );
            }
          })
        );
      });
    }
  });

  // Wait for all promises to resolve
  Promise.all(promises).then(() => {
    customRowSelectIndex = customRowSelectIndex % custom_params.length;
    localStorage.setItem("customRowSelectIndex", customRowSelectIndex);

    // Proceed with the rest of your code here
    // Loop through custom_params and call the function
    for (let i = 0; i < custom_params.length; i++) {
      createDivAndUpdateTable(custom_params[i], i);
    }

    document.getElementById(
      "filterCountTitle"
    ).textContent = `Filters (${custom_params.length})`;
  });

  if (custom_params.length == 2) {
    document.getElementById("deleteFilterButton").style.backgroundColor =
      "grey";
  }
} else {
  custom_params = [
    ["Shape", [0], [0, 0, 0], [0, 0, 0], 0],
    ["Trace", 0, [0, 255, 255], [255, 255, 0]],
    ["Misc", "Flip", 1],
  ];
  localStorage.setItem("customParams", JSON.stringify(custom_params));
  // Loop through custom_params and call the function
  for (let i = 0; i < custom_params.length; i++) {
    createDivAndUpdateTable(custom_params[i], i);
  }

  document.getElementById(
    "filterCountTitle"
  ).textContent = `Filters (${custom_params.length})`;
}

if (custom_params.length == 0) {
  document.getElementById("deleteFilterButton").style.backgroundColor = "grey";
}

while (current_custom_opts.firstChild) {
  current_custom_opts.removeChild(current_custom_opts.firstChild);
}
