//Initialize**************************************************

dropContainerMosaic = document.getElementById("drop-container-mosaic");
dropAreaMosaic = document.getElementById("drop-area-mosaic");
fileInputMosaic = document.getElementById("file-input-mosaic");
imageStack = document.getElementById("image-stack");

let uploadedImages = [];
let currentIndex = 0;

const tileWidthRange = document.getElementById("tileWidthRange");
const tileHeightRange = document.getElementById("tileHeightRange");
const tile_width = document.getElementById("tile_width");
const tile_height = document.getElementById("tile_height");

//Functions**************************************************

function showPrevImage() {
  if (uploadedImages.length > 0) {
    currentIndex =
      (currentIndex - 1 + uploadedImages.length) % uploadedImages.length;
    viewImage(currentIndex);
  }
}

function addImage() {
  if (uploadedImages.length == 1000) {
    showErrorMessage("[Cannot Add More Images]");
    return;
  }

  if (!transforming) {
    fileInputMosaic.click();
  }
}

function deleteCurrentImage() {
  if (!transforming) {
    if (uploadedImages.length > 0) {
      if (!document.getElementById("customFilterWrapper")) {
        let file_name = JSON.parse(localStorage.getItem("mosaic_params"))[
          currentIndex
        ];
        uploaded_file_names[file_name] -= 1;
        if (uploaded_file_names[file_name] == 0) {
          delete uploaded_file_names[file_name];
          removeFile(file_name);
        }

        localStorage.setItem(
          "uploaded_file_names",
          JSON.stringify(uploaded_file_names)
        );
      }

      uploadedImages.splice(currentIndex, 1);

      const filenames = JSON.stringify(
        uploadedImages.map((imageObject) => imageObject.filename)
      );
      if (!document.getElementById("customFilterWrapper")) {
        localStorage.setItem("mosaic_params", filenames);
      } else {
        localStorage.setItem("custom_mosaic_params", filenames);
      }

      if (uploadedImages.length === 0) {
        currentIndex = 0;

        if (!document.getElementById("customFilterWrapper")) {
          localStorage.removeItem("mosaic_params");
        } else {
          localStorage.removeItem("custom_mosaic_params");
        }

        fileInputMosaic.value = "";
        imageStack.style.display = "none";

        dropAreaMosaic.classList.remove("media-present");
        dropAreaMosaic.innerHTML =
          "<p>Drag and drop mosaic image files here, or click to select files.</p>";
        document.getElementById("new-media-text-mosaic").innerHTML = "";

        if (
          document.getElementById("drop-area") &&
          !document
            .getElementById("drop-area")
            .classList.contains("media-present")
        ) {
          download_button.style.background = "";
        }
        transform_button.style.background = "";

        dropAreaMosaic.style.width = "40vw";
        dropAreaMosaic.style.height = "26vh";
        document.getElementById("add-filter-button").style.background = "";
      } else {
        currentIndex =
          (currentIndex - 1 + uploadedImages.length) % uploadedImages.length;
        viewImage(currentIndex);
      }
    }
  }
}

function showNextImage() {
  if (uploadedImages.length > 0) {
    currentIndex = (currentIndex + 1) % uploadedImages.length;
    viewImage(currentIndex);
  }
}

function viewImage(index) {
  const selectedImage = uploadedImages[index];

  // Create an image element
  currentIndex = index;

  // Check if dropAreaMosaic has child nodes
  if (document.getElementById("uploaded-media-mosaic")) {
    document.getElementById("uploaded-media-mosaic").src = selectedImage.src;
  } else {
    dropAreaMosaic.innerHTML = "";

    const imageView = document.createElement("img");
    imageView.src = selectedImage.src;

    imageView.controls = true;
    imageView.setAttribute("id", "uploaded-media-mosaic");

    dropAreaMosaic.appendChild(imageView);
    dropAreaMosaic.style.display = "block";
    dropAreaMosaic.classList.add("media-present");
    download_button.style.background = "#43A6C6";
  }

  if (!transforming) {
    if (
      document.getElementById("drop-area") &&
      document.getElementById("drop-area").classList.contains("media-present")
    ) {
      transform_button.style.background = "#43A6C6";
    }
  }

  // Update the text in the new-media-text-style element
  const newMediaTextMosaic = document.getElementById("new-media-text-mosaic");
  const totalImages = uploadedImages.length;
  const imageName = selectedImage.filename || `Image ${index + 1}`;
  newMediaTextMosaic.innerHTML = `<strong>Image ${
    index + 1
  } / ${totalImages}</strong>: ${imageName}`;
}

function handleFilesMosaic(files) {
  if (uploadedImages.length == 1000) {
    showErrorMessage("[Cannot Add More Images]");
    return;
  }

  for (const file of files) {
    if (
      file.type.startsWith("image/png") ||
      file.type.startsWith("image/jpeg")
    ) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        showErrorMessage(`[${file.name} size exceeds the maximum limit (5MB)]`);
        return;
      } else {
        // Check if the file is already included
        const existingIndex = uploadedImages.findIndex(
          (image) => image.filename === file.name
        );

        if (existingIndex === -1) {
          // Create an object representing the image
          const imageObject = {
            src: URL.createObjectURL(file),
            file: new Blob([file], { type: file.type }),
            filename: file.name,
          };

          if (
            document
              .getElementById("drop-area")
              .classList.contains("media-present")
          ) {
            document.getElementById("add-filter-button").style.background =
              "lightgreen";
          }

          if (uploadedImages.length === 0) {
            // If uploadedImages is empty, simply push the new image
            uploadedImages.push(imageObject);
            // Update the UI
            viewImage(0);
            imageStack.style.display = "";
          } else {
            // Insert the image object immediately after currentIndex
            uploadedImages.splice(currentIndex + 1, 0, imageObject);
            // Update the UI
            viewImage(currentIndex + 1);
          }

          if (!document.getElementById("customFilterWrapper")) {
            if (!(file.name in uploaded_file_names)) {
              uploaded_file_names[file.name] = 0;
              saveFile(file);
            }

            uploaded_file_names[file.name] += 1;
            localStorage.setItem(
              "uploaded_file_names",
              JSON.stringify(uploaded_file_names)
            );
          }

          const filenames = JSON.stringify(
            uploadedImages.map((imageObject) => imageObject.filename)
          );
          if (!document.getElementById("customFilterWrapper")) {
            localStorage.setItem("mosaic_params", filenames);
          } else {
            localStorage.setItem("custom_mosaic_params", filenames);
          }
        } else {
          showErrorMessage(`[${file.name} is already included]`);
          viewImage(existingIndex);
        }
      }
    } else {
      showErrorMessage(`[${file.name} is not an image]`);
    }

    if (uploadedImages.length == 1000) {
      showErrorMessage("[Cannot Add More Images]");
      return;
    }
  }
}

function handleTileWidthChange(event) {
  const newValue = calculateNewValue(event.target.value);
  updateTileWidthUI(newValue);
  updateMosaicExtraParams(newValue, "mosaic_extra_params", 0);
}

function handleTileHeightChange(event) {
  const newValue = calculateNewValue(event.target.value);
  updateTileHeightUI(newValue);
  updateMosaicExtraParams(newValue, "mosaic_extra_params", 1);
}

function calculateNewValue(value) {
  return 2 * parseInt(value / resize_scale);
}

function updateTileWidthUI(value) {
  tile_width.textContent = `Tile Width: ${parseInt(tileWidthRange.value)}`;
  new_size_mosaic.style.width = `${value}px`;
}

function updateTileHeightUI(value) {
  tile_height.textContent = `Tile Height: ${parseInt(tileHeightRange.value)}`;
  new_size_mosaic.style.height = `${value}px`;
}

function updateMosaicExtraParams(value, key, index) {
  if (!document.getElementById("customFilterWrapper")) {
    let extra_mosaic = JSON.parse(localStorage.getItem(key));

    if (extra_mosaic) {
      extra_mosaic[index] = value;
      localStorage.setItem(key, JSON.stringify(extra_mosaic));
    }
  }
}

function updateMosaicPage(params) {
  const mosaicExtra = JSON.parse(localStorage.getItem("mosaic_extra_params"));

  if (
    document.getElementById("customFilterWrapper") &&
    document.getElementById("drop-area").classList.contains("media-present")
  ) {
    updateTileWidth(params);
    updateTileHeight(params, mosaicExtra);
    updateMosaicSize(params, mosaicExtra);
    handleUploadedImages(params);
  }
}

function updateTileWidth(params, mosaicExtra) {
  const tileWidth = Math.min(parseInt(params[1]), tileWidthRange.max);
  tileWidthRange.value = tileWidth;
  updateTileWidthUI(calculateNewValue(tileWidth));
  updateMosaicExtraParams(tileWidth, "mosaic_extra_params", 0);
}

function updateTileHeight(params, mosaicExtra) {
  const tileHeight = Math.min(parseInt(params[2]), tileHeightRange.max);
  tileHeightRange.value = tileHeight;
  updateTileHeightUI(calculateNewValue(tileHeight));
  updateMosaicExtraParams(tileHeight, "mosaic_extra_params", 1);
}

function updateMosaicSize(params, mosaicExtra) {
  const newWidth = calculateNewValue(tileWidthRange.value);
  const newHeight = calculateNewValue(tileHeightRange.value);

  new_size_mosaic.style.width = `${newWidth}px`;
  new_size_mosaic.style.height = `${newHeight}px`;
}

function handleUploadedImages(params) {
  if (params[0].length > 0) {
    while (uploadedImages.length > 0) {
      deleteCurrentImage();
    }

    params[0].forEach((file_name, index) => {
      createFileFromPath("static/uploaded_images/" + file_name).then((file) => {
        if (file) {
          handleFilesMosaic([file]);

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
          params[0].splice(index, 1);

          if (params[0].length == 0) {
            localStorage.removeItem("mosaic_params");
          } else {
            localStorage.setItem("mosaic_params", params[0]);
          }
        }
      });
    });
  }
}

function getMosaicParams() {
  //Custom Stuff to append to Form
  mosaic_tile_width = parseInt(tileWidthRange.value);
  mosaic_tile_length = parseInt(tileHeightRange.value);

  return [
    mosaic_tile_width,
    mosaic_tile_length,
    resize_scale,
    uploadedImages.length,
    currentIndex,
  ];
}

//Event Listeners**************************************************

// Use dragover event to detect when media is over the drop area
dropContainerMosaic.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.stopPropagation(); // Prevent the dragover event from propagating
  if (!dropAreaMosaic.classList.contains("media-present")) {
    dropAreaMosaic.classList.add("active");
  }
});

// Use dragleave event to detect when media leaves the drop area
dropContainerMosaic.addEventListener("dragleave", () => {
  dropAreaMosaic.classList.remove("active");
});

dropContainerMosaic.addEventListener("drop", (e) => {
  if (!transforming) {
    e.preventDefault();
    dropAreaMosaic.classList.remove("active");

    const files = e.dataTransfer.files;

    if (files.length > 0) {
      handleFilesMosaic(files);
    }
  }
});

dropAreaMosaic.addEventListener("click", () => {
  if (!transforming) {
    fileInputMosaic.click();
  }
});

fileInputMosaic.addEventListener("change", () => {
  if (!transforming) {
    const files = fileInputMosaic.files;
    handleFilesMosaic(files);
  }
});

// Adding event listeners
tileWidthRange.addEventListener("input", handleTileWidthChange);
tileHeightRange.addEventListener("input", handleTileHeightChange);

//Main Code**************************************************

if (
  localStorage.getItem("mosaic_params") &&
  !document.getElementById("customFilterWrapper")
) {
  updateMosaicPage([JSON.parse(localStorage.getItem("mosaic_params"))]);
}
