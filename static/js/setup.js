//Initialize**************************************************
const links = document.querySelectorAll("a");
const dropContainer = document.getElementById("drop-container");
const fileInput = document.getElementById("file-input");
const newMediaButton = document.getElementById("new-media-button");
const options_container = document.querySelector(".options-container");
const bottom = document.getElementById("bottom");
const download_button = document.getElementById("download-button");
const transform_button = document.getElementById("transform-button");
const bar_overlay = document.getElementById("bar-overlay");

var transforming = false;
var download_text = "";
let uploaded_media = null;

const socket = io();

//add event listener on mediaEleent
const resize_ob = new ResizeObserver(function (entries) {
  // since we are observing only a single element, so we access the first element in entries array
  let rect = entries[entries.length - 1].contentRect;

  // current width & height
  let height = rect.height;

  let new_height_offset =
    Math.round(
      Math.max(0, document.getElementById("drop-area").offsetHeight - height)
    ) + "px";

  //move the two other divs up by that much
  options_container.style.bottom = new_height_offset;
  bottom.style.bottom = new_height_offset;
});

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
  } else if (document.getElementById("rotate_img")) {
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

async function updateParamStorage() {
  if (!document.getElementById("customFilterWrapper")) {
    if (document.getElementById("uniqueChars")) {
      //ascii
      localStorage.setItem("ascii_params", JSON.stringify(getAsciiParams()));

      let ascii_extra_params = {};

      // if multicolor
      if (document.querySelector("#multiColor").checked) {
        ascii_extra_params["color"] = hex2rgb(
          document.getElementById("textColor").value
        );
      }

      // if reccemended chars per row
      if (document.querySelector("#recommendedChars").checked) {
        ascii_extra_params["chars"] = parseInt(
          document.querySelector("#charsPerRowInput").value,
          10
        );
      }

      localStorage.setItem(
        "ascii_extra_params",
        JSON.stringify(ascii_extra_params)
      );
    } else if (document.getElementById("colorCountTitleDith")) {
      //dither

      if (document.querySelector("#Error").checked) {
        localStorage.setItem(
          "dith_extra_params",
          JSON.stringify(previousOrderedValues)
        );
      } else {
        localStorage.setItem(
          "dith_extra_params",
          JSON.stringify(previousErrorValues)
        );
      }

      localStorage.setItem("dither_params", JSON.stringify(getDitherParams()));
    } else if (document.getElementById("misc_table_buttons")) {
      localStorage.setItem("current_misc", getCurrentMisc());

      if (!document.getElementById("customFilterWrapper")) {
        let current_misc_val = localStorage.getItem("current_misc");
        if (
          current_misc_val &&
          current_misc_val != "Negate" &&
          current_misc_val != "Merge"
        ) {
          updateDropArea();
          let all_misc = JSON.parse(localStorage.getItem("misc_params")) || {};

          if (
            current_misc_val != "Pixelate" &&
            current_misc_val != "Resize" &&
            current_misc_val != "Crop"
          ) {
            all_misc[current_misc_val] = getMiscValParams(current_misc_val);
          }
          localStorage.setItem("misc_params", JSON.stringify(all_misc));
          updateMiscPage([]);
          return;
        }
      }
    } else if (document.getElementById("drop-container-mosaic")) {
      let mosaic_extra_params = [];

      if (
        document.getElementById("drop-area").classList.contains("media-present")
      ) {
        mosaic_extra_params.push(
          parseInt(document.getElementById("tileWidthRange").value)
        );
        mosaic_extra_params.push(
          parseInt(document.getElementById("tileHeightRange").value)
        );

        mosaic_extra_params.push(resize_scale);

        localStorage.setItem(
          "mosaic_extra_params",
          JSON.stringify(mosaic_extra_params)
        );
      }
    } else if (document.getElementById("colorPickerWrapper")) {
      // quant
      localStorage.setItem("quant_params", JSON.stringify(getQuantParams()));
    } else if (document.getElementById("shapeImage")) {
      // shapes
      let shape_extra_params = points.map((point) => [
        parseFloat(canvas.width - point.x),
        parseFloat(canvas.height - point.y),
      ]);

      localStorage.setItem(
        "shape_extra_params",
        JSON.stringify(shape_extra_params)
      );

      localStorage.setItem("shape_params", JSON.stringify(getShapeParams()));
    } else if (document.getElementById("nailCountLabel")) {
      //string
      localStorage.setItem("string_params", JSON.stringify(getStringParams()));
    } else if (document.getElementById("lineImage")) {
      // trace
      localStorage.setItem("trace_params", JSON.stringify(getTraceParams()));
    }
  }
}

// Function to handle link clicks
function handleLinkClick(event) {
  // Check the condition (disableLinks variable)
  if (transforming) {
    // Prevent the default behavior (following the link)
    event.preventDefault();
  } else {
    updateParamStorage();
    updateDropArea();
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

function handleFiles(files) {
  download_text = "";
  for (const file of files) {
    if (
      file.type.startsWith("image/png") ||
      file.type.startsWith("image/jpeg") ||
      file.type.startsWith("video/")
    ) {
      if (file.type.startsWith("image/") && file.size > 5 * 1024 * 1024) {
        // 5MB limit

        showErrorMessage("[Image file size exceeds the maximum limit (5MB)]");
        return;
      }

      if (file.type.startsWith("video/") && file.size > 1024 * 1024 * 1024) {
        // 1GB limit
        showErrorMessage("[Video file size exceeds the maximum limit (1GB)]");
        return;
      }

      delete uploaded_file_names[localStorage.getItem("drop_filename")];
      removeFile(localStorage.getItem("drop_filename"));

      localStorage.setItem("drop_filename", file.name);

      if (!(file.name in uploaded_file_names)) {
        saveFile(file);
        uploaded_file_names[file.name] = 0;
      }

      uploaded_file_names[file.name] += 1;
      localStorage.setItem(
        "uploaded_file_names",
        JSON.stringify(uploaded_file_names)
      );

      const mediaElement = file.type.startsWith("image/")
        ? document.createElement("img")
        : document.createElement("video");

      mediaElement.src = URL.createObjectURL(file);
      mediaElement.controls = true;
      mediaElement.setAttribute("id", "uploaded-media");

      resize_ob.observe(mediaElement);

      // Clear existing content and append the new media element to the drop area
      document.getElementById("drop-area").innerHTML = ""; // Clear existing content
      document.getElementById("drop-area").appendChild(mediaElement);
      document.getElementById("drop-area").style.display = "block";
      document.getElementById("drop-area").classList.add("media-present");

      newMediaButton.style.display = "block";
      let styleContainer = document.getElementById("drop-area-style");
      let mergeContainer = document.getElementById("drop-area-merge");
      download_button.style.background = "#43A6C6";
      let mergeToggle = document.querySelector("#merge");
      let mosaicContainer = document.getElementById("drop-area-mosaic");

      if (document.getElementById("customFilterWrapper")) {
        let option = custom_params[customRowSelectIndex][0];
      }

      if (
        (!styleContainer && !mergeContainer && !mosaicContainer) ||
        (mergeToggle && !mergeToggle.checked) ||
        (styleContainer &&
          styleContainer.classList.contains("media-present")) ||
        (mergeContainer &&
          mergeContainer.classList.contains("media-present")) ||
        (mosaicContainer && mosaicContainer.classList.contains("media-present"))
      ) {
        if (!transforming) {
          transform_button.style.background = "#43A6C6";
        }
      } // if not style then do this
      uploaded_media = document.getElementById("uploaded-media");

      //show transform changing color under these circumstances
      // 1) no styleContainer
      // 2) no merge
      // 3) styleContiner and media present
      // 4) merge and media present

      //Change Resize Stuff
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
      }

      if (document.getElementById("flip_opt")) {
        document.getElementById("flip_img").style.display = "none";
        document.getElementById("flip_div").style.display = "";

        if (document.querySelector("#vertical").checked) {
          document.querySelector("#vertical").click();
        } else {
          document.querySelector("#horizontal").click();
        }
      }

      if (document.getElementById("mosiac_block_opts")) {
        document.getElementById("mosiac_block_opts").style.display = "";
        if (
          document
            .getElementById("drop-area-mosaic")
            .classList.contains("media-present")
        ) {
          document.getElementById("add-filter-button").style.background =
            "lightgreen";
        }
      }

      // Clone the content of the source div
      const clonedContent = mediaElement.cloneNode(true); // Pass true to clone all children recursively

      // Adjust the styles of the cloned content
      clonedContent.style.width = "100%";
      clonedContent.style.height = "100%";
      clonedContent.style.margin = "0";

      if (mediaElement.tagName !== "IMG") {
        clonedContent.controls = false;
      }

      // Append the cloned content to the target div
      if (document.getElementById("resize_opt")) {
        if (
          document.querySelector("#pixel").checked ||
          document.querySelector("#resize").checked ||
          document.querySelector("#crop").checked
        ) {
          document.getElementById("add-filter-button").style.background =
            "lightgreen";
        }

        document.getElementById("original_size3").innerHTML = "";
        document.getElementById("original_size3").appendChild(clonedContent);

        document.getElementById("rotate_img").innerHTML = "";
        document
          .getElementById("rotate_img")
          .appendChild(clonedContent.cloneNode(true));

        document.getElementById("flip_div").innerHTML = "";
        document
          .getElementById("flip_div")
          .appendChild(clonedContent.cloneNode(true));

        document.getElementById("rotate_img").style.border = "";
      }

      const maxSize = 75;
      let width, height;
      if (mediaElement.tagName === "IMG") {
        mediaElement.onload = function () {
          width = mediaElement.naturalWidth;
          height = mediaElement.naturalHeight;

          const scaledDimensions = calculateScaledDimensions(
            width,
            height,
            maxSize
          );

          resize_scale = width / scaledDimensions.width;

          if (!transforming && document.getElementById("mosiac_block_opts")) {
            document.getElementById("original_size_mosaic").style.width = `${
              2 * scaledDimensions.width
            }px`;
            document.getElementById("original_size_mosaic").style.height = `${
              2 * scaledDimensions.height
            }px`;

            adjusted_block_size = parseInt(
              0.1 *
                2 *
                Math.min(scaledDimensions.height, scaledDimensions.width)
            );
            document.getElementById(
              "new_size_mosaic"
            ).style.width = `${adjusted_block_size}px`;
            document.getElementById(
              "new_size_mosaic"
            ).style.height = `${adjusted_block_size}px`;

            document.getElementById("tileWidthRange").max = width;
            document.getElementById("tileWidthRange").value = parseInt(
              0.1 * width
            );
            document.getElementById("tile_width").textContent =
              "Tile Width:" + parseInt(0.1 * width);

            document.getElementById("tileHeightRange").max = height;
            document.getElementById("tileHeightRange").value = parseInt(
              0.1 * height
            );
            document.getElementById("tile_height").textContent =
              "Tile Height:" + parseInt(0.1 * height);
          } else if (document.getElementById("resize_opt")) {
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

            if (document.getElementById("resize_opt")) {
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
                0.03 *
                  2 *
                  Math.min(scaledDimensions.height, scaledDimensions.width)
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
              document.getElementById("resize_width").textContent =
                "Width: " + width;

              document.getElementById("heightRange").max = 2 * height;
              document.getElementById("heightRange").min = 0.5 * height;
              document.getElementById("heightRange").value = height;
              document.getElementById("resize_height").textContent =
                "Height: " + height;

              block_size = Math.min(width, height);
              document.getElementById("blockRange").max = block_size;
              document.getElementById("blockRange").min = 1;
              document.getElementById("blockRange").value = 0.03 * block_size;
              document.getElementById("pixel_block").textContent =
                "Block Size:" + parseInt(0.03 * block_size);
            }

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
              document.getElementById("cropWidthRange").max =
                width - this.value;

              document.getElementById("new_size3").style.width = `${parseInt(
                (document.getElementById("cropWidthRange").value / width) *
                  2 *
                  scaledDimensions.width
              )}px`;

              document.getElementById("new_size3").style.left = `${parseInt(
                parseInt((this.value / width) * 2 * scaledDimensions.width)
              )}px`;

              if (!document.getElementById("customFilterWrapper")) {
                let all_misc =
                  JSON.parse(localStorage.getItem("misc_params")) || {};

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
              document.getElementById("cropHeightRange").max =
                height - this.value;

              document.getElementById("new_size3").style.height = `${parseInt(
                (document.getElementById("cropHeightRange").value / height) *
                  2 *
                  scaledDimensions.height
              )}px`;

              document.getElementById("new_size3").style.top = `${parseInt(
                parseInt((this.value / height) * 2 * scaledDimensions.height)
              )}px`;

              if (!document.getElementById("customFilterWrapper")) {
                let all_misc =
                  JSON.parse(localStorage.getItem("misc_params")) || {};

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
                let all_misc =
                  JSON.parse(localStorage.getItem("misc_params")) || {};

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
                let all_misc =
                  JSON.parse(localStorage.getItem("misc_params")) || {};

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

          // if Misc
          if (document.getElementById("resize_opt")) {
            if (document.getElementById("customFilterWrapper")) {
              let param_index = parseInt(
                localStorage.getItem("customRowSelectIndex")
              );
              if (
                edit_filter &&
                JSON.parse(localStorage.getItem("customParams"))[param_index] ==
                  "Misc"
              ) {
                updateMiscPage(
                  JSON.parse(localStorage.getItem("customParams"))[
                    param_index
                  ].slice(1)
                );
              }
            } else {
              updateMiscPage([[]]);
            }
          }

          // if Mosaic
          if (document.getElementById("drop-container-mosaic")) {
            let extra_mosiac = [100, 100, resize_scale];
            if (localStorage.getItem("mosaic_extra_params")) {
              extra_mosiac = JSON.parse(
                localStorage.getItem("mosaic_extra_params")
              );

              extra_mosiac[2] = resize_scale;
            } else {
              extra_mosiac = [
                parseInt(document.getElementById("tileWidthRange").value),
                parseInt(document.getElementById("tileHeightRange").value),
                resize_scale,
              ];
            }

            localStorage.setItem(
              "mosaic_extra_params",
              JSON.stringify(extra_mosiac)
            );

            if (document.getElementById("customFilterWrapper")) {
              let param_index = parseInt(
                localStorage.getItem("customRowSelectIndex")
              );

              if (
                edit_filter &&
                JSON.parse(localStorage.getItem("customParams"))[param_index] ==
                  "Mosaic"
              ) {
                updateMosaicPage(
                  JSON.parse(localStorage.getItem("customParams"))[
                    param_index
                  ].slice(1)
                );
              } else {
                updateMosaicPage([
                  JSON.parse(localStorage.getItem("mosaic_params")),
                ]);
              }
            } else {
              updateMosaicPage([[]]);
            }
          }
        };
      } else {
        mediaElement.addEventListener("loadedmetadata", function () {
          width = mediaElement.videoWidth;
          height = mediaElement.videoHeight;

          const scaledDimensions = calculateScaledDimensions(
            width,
            height,
            maxSize
          );

          resize_scale = width / scaledDimensions.width;

          if (!transforming && document.getElementById("mosiac_block_opts")) {
            document.getElementById("original_size_mosaic").style.width = `${
              2 * scaledDimensions.width
            }px`;
            document.getElementById("original_size_mosaic").style.height = `${
              2 * scaledDimensions.height
            }px`;

            adjusted_block_size = parseInt(
              0.1 *
                2 *
                Math.min(scaledDimensions.height, scaledDimensions.width)
            );
            document.getElementById(
              "new_size_mosaic"
            ).style.width = `${adjusted_block_size}px`;
            document.getElementById(
              "new_size_mosaic"
            ).style.height = `${adjusted_block_size}px`;

            tile_size = Math.min(width, height);

            document.getElementById("tileWidthRange").max = width;
            document.getElementById("tileWidthRange").value = parseInt(
              0.1 * width
            );
            document.getElementById("tile_width").textContent =
              "Tile Width:" + parseInt(0.1 * width);

            document.getElementById("tileHeightRange").max = height;
            document.getElementById("tileHeightRange").value = parseInt(
              0.1 * height
            );
            document.getElementById("tile_height").textContent =
              "Tile Height:" + parseInt(0.1 * height);
          } else if (document.getElementById("resize_opt")) {
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

            if (document.getElementById("resize_opt")) {
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
                0.03 *
                  2 *
                  Math.min(scaledDimensions.height, scaledDimensions.width)
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
              document.getElementById("resize_width").textContent =
                "Width: " + width;

              document.getElementById("heightRange").max = 2 * height;
              document.getElementById("heightRange").min = 0.5 * height;
              document.getElementById("heightRange").value = height;
              document.getElementById("resize_height").textContent =
                "Height: " + height;

              block_size = Math.min(width, height);
              document.getElementById("blockRange").max = block_size;
              document.getElementById("blockRange").min = 1;
              document.getElementById("blockRange").value = 0.03 * block_size;
              document.getElementById("pixel_block").textContent =
                "Block Size:" + parseInt(0.03 * block_size);
            }

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
              document.getElementById("cropWidthRange").max =
                width - this.value;

              document.getElementById("new_size3").style.width = `${parseInt(
                (document.getElementById("cropWidthRange").value / width) *
                  2 *
                  scaledDimensions.width
              )}px`;

              document.getElementById("new_size3").style.left = `${parseInt(
                parseInt((this.value / width) * 2 * scaledDimensions.width)
              )}px`;

              if (!document.getElementById("customFilterWrapper")) {
                let all_misc =
                  JSON.parse(localStorage.getItem("misc_params")) || {};

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
              document.getElementById("cropHeightRange").max =
                height - this.value;

              document.getElementById("new_size3").style.height = `${parseInt(
                (document.getElementById("cropHeightRange").value / height) *
                  2 *
                  scaledDimensions.height
              )}px`;

              document.getElementById("new_size3").style.top = `${parseInt(
                parseInt((this.value / height) * 2 * scaledDimensions.height)
              )}px`;

              if (!document.getElementById("customFilterWrapper")) {
                let all_misc =
                  JSON.parse(localStorage.getItem("misc_params")) || {};

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
                let all_misc =
                  JSON.parse(localStorage.getItem("misc_params")) || {};

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
                let all_misc =
                  JSON.parse(localStorage.getItem("misc_params")) || {};

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

          // if Misc
          if (document.getElementById("resize_opt")) {
            if (document.getElementById("customFilterWrapper")) {
              let param_index = parseInt(
                localStorage.getItem("customRowSelectIndex")
              );
              if (
                edit_filter &&
                JSON.parse(localStorage.getItem("customParams"))[
                  param_index
                ][0] == "Misc"
              ) {
                updateMiscPage(
                  JSON.parse(localStorage.getItem("customParams"))[
                    param_index
                  ].slice(1)
                );
              } else {
                updateMosaicPage([[]]);
              }
            } else {
              updateMiscPage([[]]);
            }
          }

          // if Mosaic
          if (document.getElementById("drop-container-mosaic")) {
            let extra_mosiac = [100, 100, resize_scale];
            if (localStorage.getItem("mosaic_extra_params")) {
              extra_mosiac = JSON.parse(
                localStorage.getItem("mosaic_extra_params")
              );

              extra_mosiac[2] = resize_scale;
            } else {
              extra_mosiac = [
                parseInt(document.getElementById("tileWidthRange").value),
                parseInt(document.getElementById("tileHeightRange").value),
                resize_scale,
              ];
            }

            localStorage.setItem(
              "mosaic_extra_params",
              JSON.stringify(extra_mosiac)
            );

            if (document.getElementById("customFilterWrapper")) {
              let param_index = parseInt(
                localStorage.getItem("customRowSelectIndex")
              );

              if (
                edit_filter &&
                JSON.parse(localStorage.getItem("customParams"))[param_index] ==
                  "Mosaic"
              ) {
                updateMosaicPage(
                  JSON.parse(localStorage.getItem("customParams"))[
                    param_index
                  ].slice(1)
                );
              } else {
                updateMosaicPage([
                  JSON.parse(localStorage.getItem("mosaic_params")),
                ]);
              }
            } else {
              updateMosaicPage([[]]);
            }
          }
        });
      }
    } else {
      showErrorMessage("[Image and Video Files Only]");
    }
  }
}

function download(elementId) {
  if (
    !document.getElementById("drop-area").classList.contains("media-present")
  ) {
    var element = document.getElementById(elementId);
    element.style.opacity = 1;

    // Set a timeout to hide the element after 2 seconds
    setTimeout(function () {
      element.style.opacity = 0;
    }, 2000);
  } else if (!transforming) {
    var mediaElement = document.querySelector(
      "#drop-area img, #drop-area video"
    );

    if (mediaElement) {
      var mediaSource =
        mediaElement.src || mediaElement.querySelector("source").src;
      var fileName = "downloaded_media";

      // Create an anchor element to trigger the download
      var downloadLink = document.createElement("a");
      downloadLink.href = mediaSource;
      downloadLink.download = fileName;

      // Append the link to the body and trigger the click event
      document.body.appendChild(downloadLink);
      downloadLink.click();

      // Remove the link from the DOM
      document.body.removeChild(downloadLink);
    }
  }
}

function toggleVisibility(elementId) {
  if (
    !document.getElementById("drop-area").classList.contains("media-present")
  ) {
    var element = document.getElementById(elementId);
    element.style.opacity = 1;

    // Set a timeout to hide the element after 2 seconds
    setTimeout(function () {
      element.style.opacity = 0;
    }, 2000);
  }
}

async function updateMedia(url, mediaType) {
  // Check if media_url exists in the data object
  if (url) {
    // Assuming you want to set the src attribute of an <img> element with the id "drop-area"
    if (mediaType == "image") {
      // Create a random query parameter
      var imgElement = document
        .getElementById("drop-area")
        .querySelector("img");

      // Decode the Base64-encoded image data and create a Blob
      var blob = new Blob(
        [Uint8Array.from(atob(url), (c) => c.charCodeAt(0))],
        { type: "image/png" }
      );

      // Create a data URL from the Blob
      var dataUrl = URL.createObjectURL(blob);

      imgElement.src = dataUrl;
    }

    if (mediaType == "video") {
      var vidElement = document
        .getElementById("drop-area")
        .querySelector("video");

      // Decode the Base64-encoded image data and create a Blob
      var blob = new Blob(
        [Uint8Array.from(atob(url), (c) => c.charCodeAt(0))],
        { type: "video/mp4" }
      );

      // Create a data URL from the Blob
      var dataUrl = URL.createObjectURL(blob);
      vidElement.src = dataUrl;
    }
  }

  function progress_bar_text_change() {
    setTimeout(function () {
      bar_overlay.style.width = "0%";
      bar_overlay.display = "none";
      download_button.style.background = "#43A6C6";
      transform_button.style.background = "#43A6C6";
      download_button.style.border = "";
      transform_button.style.border = "";

      download_button.style.color = "";
      transform_button.style.color = "";

      document.getElementById("progress-text").style.opacity = 0;
      document.getElementById("progress-text").textContent = "Upload Media";
      transforming = false;
    }, 0);
  }

  uploaded_media.style.visibility = "";
  progress_bar_text_change();
}

function transform(formData, transform_name, mediaType) {
  download_button.style.background = "";
  transform_button.style.background = "";

  download_button.style.border = "none";
  transform_button.style.border = "none";

  download_button.style.color = "transparent";
  transform_button.style.color = "transparent";

  transforming = true;
  download_text = "";
  //updateParamStorage();

  if (mediaType == "video") {
    var up_img = document.createElement("img");
    up_img.setAttribute("id", "uploaded-media2");
    let src_video = document.getElementById("drop-area").querySelector("video");

    uploaded_media.style.visibility = "hidden";

    src_video.controls = false;
    resize_ob.observe(up_img);

    // Create a canvas element
    var canvas = document.createElement("canvas");
    canvas.width = src_video.videoWidth;
    canvas.height = src_video.videoHeight;

    // Draw the first frame onto the canvas
    canvas
      .getContext("2d")
      .drawImage(src_video, 0, 0, canvas.width, canvas.height);

    // Set the data URL of the canvas as the source of the img element
    up_img.src = canvas.toDataURL("image/png");
    document.getElementById("drop-area").appendChild(up_img);
  }

  // Send a POST request to your Flask backend
  fetch(transform_name, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then(async (data) => {
      // Call the function to update the progress bar with the obtained task ID

      //add an img element?
      if (mediaType == "video") {
        document
          .getElementById("drop-area")
          .removeChild(document.getElementById("uploaded-media2"));
        let src_video = document
          .getElementById("drop-area")
          .querySelector("video");

        src_video.controls = true;
        new_file_name = "drop_area_download_media.mp4";
      } else {
        new_file_name = "drop_area_download_media.png";
      }
      download_text = data.media_url[1] ?? "";
      updateMedia(data.media_url[0], mediaType);

      if (transform_name == "/misc_media") {
        // change the crop, rotate, and flip

        let newElement = document.getElementById("drop-area").children[0];
        const clonedContent = newElement.cloneNode(true); // Pass true to clone all children recursively

        // Adjust the styles of the cloned content
        clonedContent.style.width = "100%";
        clonedContent.style.height = "100%";
        clonedContent.style.margin = "0";

        if (newElement.tagName !== "IMG") {
          clonedContent.controls = false;
        }

        document.getElementById("original_size3").innerHTML = "";
        document.getElementById("original_size3").appendChild(clonedContent);

        document.getElementById("rotate_img").innerHTML = "";
        document
          .getElementById("rotate_img")
          .appendChild(clonedContent.cloneNode(true));

        document.getElementById("flip_div").innerHTML = "";
        document
          .getElementById("flip_div")
          .appendChild(clonedContent.cloneNode(true));
      }

      old_file_name = localStorage.getItem("drop_filename");
      file = await getMediaFileFromDropArea(
        document.getElementById("drop-area"),
        new_file_name
      );
      localStorage.setItem("drop_filename", new_file_name);
      uploaded_file_names[old_file_name] -= 1;

      if (uploaded_file_names[old_file_name] == 0) {
        delete uploaded_file_names[old_file_name];
        removeFile(old_file_name);
      }

      if (!(new_file_name in uploaded_file_names)) {
        uploaded_file_names[new_file_name] = 0;
        saveFile(file.file);
      }

      uploaded_file_names[new_file_name] += 1;

      localStorage.setItem(
        "uploaded_file_names",
        JSON.stringify(uploaded_file_names)
      );
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

//Event Listeners**************************************************

// Attach click event listener to all links with class 'disableable-link'
links.forEach((link) => {
  link.addEventListener("click", handleLinkClick);
});

socket.on("progress_update", function (data) {
  if (transforming) {
    const text = data.text;
    const progress = data.progress;
    const url = data.frame;
    // Decode the Base64-encoded image data and create a Blob
    if (url) {
      var blob = new Blob(
        [Uint8Array.from(atob(url), (c) => c.charCodeAt(0))],
        {
          type: "image/png",
        }
      );

      // Create a data URL from the Blob
      var dataUrl = URL.createObjectURL(blob);

      const previousBlobUrl = document
        .getElementById("drop-area")
        .querySelector("img").src;
      document.getElementById("drop-area").querySelector("img").src = dataUrl;
      URL.revokeObjectURL(previousBlobUrl);
    }

    document.getElementById("progress-text").style.opacity = 1;
    document.getElementById("progress-text").textContent = text;
    bar_overlay.style.width = progress * 0.7 + "%";
  }
});

// Use dragover event to detect when media is over the drop area
dropContainer.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.stopPropagation(); // Prevent the dragover event from propagating
  if (
    !document.getElementById("drop-area").classList.contains("media-present")
  ) {
    document.getElementById("drop-area").classList.add("active");
  }
});

// Use dragleave event to detect when media leaves the drop area
dropContainer.addEventListener("dragleave", () => {
  document.getElementById("drop-area").classList.remove("active");
});

dropContainer.addEventListener("drop", (e) => {
  if (!transforming) {
    e.preventDefault();
    document.getElementById("drop-area").classList.remove("active");

    const files = e.dataTransfer.files;

    if (files.length > 0) {
      handleFiles(files);
    }
  }
});

document.getElementById("drop-area").addEventListener("click", () => {
  if (!transforming) {
    fileInput.click();
  }
});

fileInput.addEventListener("change", () => {
  if (!transforming) {
    const files = fileInput.files;
    handleFiles(files);
  }
});
// Click event for the "Upload New Media" button
newMediaButton.addEventListener("click", () => {
  if (!transforming) {
    // Reset the input file element to allow selecting a new media file
    resize_ob.unobserve(document.querySelector("#uploaded-media"));
    fileInput.value = "";
    // Hide the "Upload New Media" button
    newMediaButton.style.display = "none";
    // Reset the drop area text

    file_name = localStorage.getItem("drop_filename");
    uploaded_file_names[file_name] -= 1;
    if (uploaded_file_names[file_name] == 0) {
      removeFile(file_name);
      delete uploaded_file_names[file_name];
    }

    localStorage.setItem(
      "uploaded_file_names",
      JSON.stringify(uploaded_file_names)
    );

    // Remove all child elements using a loop
    let resize_opts = document.getElementById("resize_opt");
    updateParamStorage();
    updateDropArea();

    if (resize_opts) {
      if (
        document.querySelector("#pixel").checked ||
        document.querySelector("#resize").checked ||
        document.querySelector("#crop").checked
      ) {
        document.getElementById("add-filter-button").style.background = "";
      }
      document.getElementById("resize_no_media").style.display = "";
      document.getElementById("resize_all_opts").style.display = "none";

      document.getElementById("pixel_no_media").style.display = "";
      document.getElementById("pixel_all_opts").style.display = "none";

      document.getElementById("crop_no_media").style.display = "";
      document.getElementById("crop_all_opts").style.display = "none";

      document.getElementById("flip_img").style.display = "";
      document.getElementById("flip_div").style.display = "none";

      while (document.getElementById("original_size3").firstChild) {
        document
          .getElementById("original_size3")
          .removeChild(document.getElementById("original_size3").firstChild);
      }

      while (document.getElementById("rotate_img").firstChild) {
        document
          .getElementById("rotate_img")
          .removeChild(document.getElementById("rotate_img").firstChild);
      }

      while (document.getElementById("flip_div").firstChild) {
        document
          .getElementById("flip_div")
          .removeChild(document.getElementById("flip_div").firstChild);
      }

      document.getElementById("rotate_img").style.border = "1px solid #000";
      document.getElementById("rotate_img").style.width = "75px";
      document.getElementById("rotate_img").style.height = "75px";
    }

    if (document.getElementById("mosiac_block_opts")) {
      document.getElementById("mosiac_block_opts").style.display = "none";
      document.getElementById("add-filter-button").style.background = "";
    }

    document.getElementById("drop-area").classList.remove("media-present");
    document.getElementById("drop-area").innerHTML =
      "<p>Drag and drop media files here, or click to select files.</p>";

    let styleContainer = document.getElementById("drop-area-style");
    let mergeContainer = document.getElementById("drop-area-merge");
    let mosaicContainer = document.getElementById("drop-area-mosaic");

    if (
      (!styleContainer && !mergeContainer && !mosaicContainer) ||
      (styleContainer && !styleContainer.classList.contains("media-present")) ||
      (mergeContainer && !mergeContainer.classList.contains("media-present")) ||
      (mosaicContainer &&
        !mosaicContainer.classList.contains("media-present")) ||
      document.getElementById("current_custom_opts")
    ) {
      download_button.style.background = "";
    }

    transform_button.style.background = "";

    document.getElementById("drop-area").style.width = "70vw";
    document.getElementById("drop-area").style.height = "47vh";
    options_container.style.bottom = "0px";
    bottom.style.bottom = "0px";
    download_text = "";
    uploaded_media = null;
  }
});

transform_button.addEventListener("click", async function () {
  if (
    document.getElementById("drop-area").classList.contains("media-present") &&
    !transforming
  ) {
    let formData = new FormData();
    media = await getMediaFileFromDropArea(
      document.getElementById("drop-area")
    );

    mediaFile = media.file;
    mediaType = media.type;
    formData.append("media", mediaFile);

    // Create a FormData object and append the file and its type
    formData.append("media_type", mediaType);

    if (document.getElementById("customFilterWrapper")) {
      //custom
      //Custom Stuff to append to Form
      for (let i = 0; i < custom_params.length; i++) {
        let filter_type = custom_params[i][0];
        switch (filter_type) {
          case "Style":
            formData.append("style" + (i + 1), custom_params[i][1]);
            break;

          case "Misc":
            if (custom_params[i][1] == "Merge") {
              formData.append("merge" + (i + 1), custom_params[i][2]);
            }
            break;

          case "Mosaic":
            for (let j = 0; j < custom_params[i][1].length; j++) {
              let file = await createFileFromPath(
                "static/uploaded_images/" + custom_params[i][1][j]
              );

              if (file) {
                formData.append("mosaic" + (i + 1) + "_" + j, file);
              }
            }
            break;

          default:
            break;
        }
      }
      params = custom_params;
      transform_function = "/custom_media";
    } else if (document.getElementById("uniqueChars")) {
      //ascii
      params = getAsciiParams();
      transform_function = "/ascii_media";
    } else if (document.getElementById("colorCountTitleDith")) {
      //dither
      params = getDitherParams();
      transform_function = "/dither_media";
    } else if (document.getElementById("misc_table_buttons")) {
      //misc
      params = getMiscParams();

      if (document.querySelector("#merge").checked) {
        mergeMediaFile = await getMediaFileFromDropArea(
          document.getElementById("drop-area")
        );
        formData.append("merge0", mergeMediaFile.file);
      }

      transform_function = "/misc_media";
    } else if (document.getElementById("drop-container-mosaic")) {
      //mosaic
      uploadedImages.forEach((image, index) => {
        formData.append(`mosaic0_${index}`, image.file);
      });

      params = getMosaicParams().slice(0, -1);
      params.splice(-2, 1);

      transform_function = "/mosaic_media";
    } else if (document.getElementById("colorPickerWrapper")) {
      //quant
      params = [getQuantParams()];
      transform_function = "/quant_media";
    } else if (document.getElementById("shapeImage")) {
      //shape
      params = getShapeParams();
      transform_function = "/shape_media";
    } else if (document.getElementById("nailCountLabel")) {
      //string
      params = getStringParams();
      transform_function = "/string_media";
    } else if (document.getElementById("lineImage")) {
      //trace
      params = getTraceParams();
      transform_function = "/trace_media";
    } else if (document.getElementById("drop-area-style")) {
      if (!dropAreaStyle.classList.contains("media-present")) {
        showErrorMessage("[Upload Style Media]");
      } else {
        params = [localStorage.getItem("style_params")];
        transform_function = "/style_media";
      }
    } else {
      // error
      return;
    }
    formData.append("params", JSON.stringify(params));
    updateParamStorage();
    transform(formData, transform_function, mediaType);
  }
});

download_button.addEventListener("click", function () {
  const downloadMedia = (containerId, fileName) => {
    const container = document.getElementById(containerId);
    if (
      !container ||
      !container.classList.contains("media-present") ||
      transforming
    )
      return;

    const mediaElement = container.querySelector("img");
    const mediaSource = mediaElement
      ? mediaElement.src || mediaElement.querySelector("source").src
      : null;
    if (!mediaSource) return;

    const downloadLink = document.createElement("a");
    downloadLink.href = mediaSource;
    downloadLink.download = fileName;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  downloadMedia("drop-area-merge", "merge_media");
  downloadMedia("drop-area-mosaic", "mosaic_media");
  downloadMedia("drop-area-style", "style_media");

  if (
    document.getElementById("drop-area").classList.contains("media-present") &&
    !transforming &&
    download_text.length > 0
  ) {
    let fileName;
    if (document.getElementById("uniqueChars")) fileName = "ascii.txt";
    else if (document.getElementById("lineImage")) fileName = "trace.txt";
    else if (document.getElementById("nailCountLabel")) fileName = "string.txt";
    else return;

    const blob = new Blob([download_text], { type: "text/plain" });
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(blobUrl);
  }
});

//Main Code**************************************************
updateParamStorage();
updateDropArea();
