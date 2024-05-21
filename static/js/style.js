//Initialize**************************************************

dropContainerStyle = document.getElementById("drop-container-style");
dropAreaStyle = document.getElementById("drop-area-style");
newMediaButtonStyle = document.getElementById("new-media-button-style");
fileInputStyle = document.getElementById("file-input-style");

//Functions**************************************************

function updateStylePage(params) {
  createFileFromPath("static/uploaded_images/" + params[0]).then((file) => {
    if (file) {
      // Now you can use this file as needed, e.g., pass it to handleFilesStyle function
      handleFilesSpecial(
        [file],
        "drop-area-style",
        "style_params",
        "uploaded-media-style",
        newMediaButtonStyle
      );

      if (!document.getElementById("customFilterWrapper")) {
        uploaded_file_names[file.name] -= 1;
      }

      localStorage.setItem(
        "uploaded_file_names",
        JSON.stringify(uploaded_file_names)
      );
    } else {
      delete uploaded_file_names[params[0]];

      localStorage.setItem(
        "uploaded_file_names",
        JSON.stringify(uploaded_file_names)
      );

      localStorage.removeItem("style_params");
    }
  });
}

//Event Listeners**************************************************

// Use dragover event to detect when media is over the drop area
dropContainerStyle.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.stopPropagation(); // Prevent the dragover event from propagating
  if (!dropAreaStyle.classList.contains("media-present")) {
    dropAreaStyle.classList.add("active");
  }
});

// Use dragleave event to detect when media leaves the drop area
dropContainerStyle.addEventListener("dragleave", () => {
  dropAreaStyle.classList.remove("active");
});

dropContainerStyle.addEventListener("drop", (e) => {
  if (!transforming) {
    e.preventDefault();
    dropAreaStyle.classList.remove("active");

    const files = e.dataTransfer.files;

    if (files.length > 0) {
      handleFilesSpecial(
        files,
        "drop-area-style",
        "style_params",
        "uploaded-media-style",
        newMediaButtonStyle
      );
    }
  }
});

dropAreaStyle.addEventListener("click", () => {
  if (!transforming) {
    fileInputStyle.click();
  }
});

fileInputStyle.addEventListener("change", () => {
  if (!transforming) {
    const files = fileInputStyle.files;
    handleFilesSpecial(
      files,
      "drop-area-style",
      "style_params",
      "uploaded-media-style",
      newMediaButtonStyle
    );
  }
});

// Click event for the "Upload New Media" button
newMediaButtonStyle.addEventListener("click", () => {
  if (!transforming) {
    fileInputStyle.value = "";
    // Hide the "Upload New Media" button
    newMediaButtonStyle.style.display = "none";
    // Reset the drop area text

    // check mosaic + custom +
    let file_name = localStorage.getItem("style_params");

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
      localStorage.removeItem("style_params");
    } else {
      localStorage.removeItem("custom_style_params");
    }

    document.getElementById("add-filter-button").style.background = "";

    dropAreaStyle.classList.remove("media-present");
    dropAreaStyle.innerHTML =
      "<p>Drag and drop style image file here, or click to select file.</p>";

    if (
      document.getElementById("drop-area") &&
      !document.getElementById("drop-area").classList.contains("media-present")
    ) {
      download_button.style.background = "";
    }
    transform_button.style.background = "";

    dropAreaStyle.style.width = "40vw";
    dropAreaStyle.style.height = "26vh";
  }
});

//Main Code**************************************************

if (
  localStorage.getItem("style_params") &&
  !document.getElementById("customFilterWrapper")
) {
  updateStylePage([localStorage.getItem("style_params")]);
}
