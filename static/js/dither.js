//Initialize**************************************************

let previousOrderedValues = {
  "1,1": 0,
  "1,2": 2,
  "2,1": 3,
  "2,2": 1,
};

let previousErrorValues = {
  "1,1": "-",
  "1,2": "*",
  "1,3": "0.4375",
  "2,1": "0.1875",
  "2,2": "0.3125",
  "2,3": "0.0625",
};

const orderedTable = document.getElementById("OrderedTable");
const orderedRows = orderedTable.rows;

const errorTable = document.getElementById("ErrorTable");
const errorRows = errorTable.rows;

const errorToggle = document.querySelector("#Error");
const orderedToggle = document.querySelector("#Ordered");

const colorPickerWrapperDith = document.getElementById(
  "colorPickerWrapperDith"
);
const addColorButtonDith = document.getElementById("addColorButtonDith");
const deleteColorButtonDith = document.getElementById("deleteColorButtonDith");
const finalRowDith = document.getElementById("final-row-dith");
const colorCountTitleDith = document.getElementById("colorCountTitleDith");

//Functions**************************************************

function validateInputDith(row, col, input) {
  // Remove non-numeric characters
  const currentTable =
    document.querySelector('input[name="matrixToggle"]:checked').id + "Table";
  if (currentTable == "OrderedTable") {
    input.textContent = input.textContent.replace(/[^0-9]/g, "");

    // Ensure the input is a non-negative integer
    const value = parseInt(input.textContent, 10);
    if (isNaN(value) || value < 0) {
      // If not a valid value, revert to the previous value
      input.textContent = previousOrderedValues[[row, col]] || "0";
    } else {
      // Save the valid value as the previous value
      previousOrderedValues[[row, col]] = value;
    }
  } else {
    let val = input.textContent;
    if (val.includes("*")) {
      val = "*";
    }
    const table = document.getElementById(currentTable);
    const rows = table
      .getElementsByTagName("tbody")[0]
      .getElementsByTagName("tr");
    // rules only the first row can have star
    if (val == "*") {
      // when star gets added all cells to the left in the row turn into - and - to the right are 0
      if (row == 1) {
        var row = rows[0];
        var cells = row.getElementsByTagName("td");
        for (var c = 0; c < cells.length; c++) {
          //change table and map
          if (c + 1 < col) {
            cells[c].textContent = "-";
          } else if (c + 1 > col) {
            if (cells[c].textContent == "*" || cells[c].textContent == "-") {
              cells[c].textContent = "0";
            } else {
              cells[c].textContent = previousErrorValues[[1, c + 1]] || "0";
            }
          } else {
            cells[c].textContent = "*";
          }
          previousErrorValues[[1, c + 1]] = cells[c].textContent;
        }
      } else {
        value = input.textContent.replace(/\*/g, "");
        previousErrorValues[[row, col]] = value;
        input.textContent = previousErrorValues[[row, col]];
      }
    } else if (previousErrorValues[[row, col]] != "-") {
      // cant turn - into any number
      // all other values are non negative floats
      const value = parseFloat(val.replace(/-/g, ""), 10);
      if (isNaN(value) || value < 0) {
        // If not a valid value, revert to the previous value
        input.textContent = previousErrorValues[[row, col]] || "0";
      } else {
        // Save the valid value as the previous value
        previousErrorValues[[row, col]] = value;
        input.textContent = previousErrorValues[[row, col]];
      }
    } else {
      input.textContent = "-";
    }
  }
}

function addRowDith() {
  const currentTable =
    document.querySelector('input[name="matrixToggle"]:checked').id + "Table";
  const table = document.getElementById(currentTable);

  const newRow = table.insertRow();
  const columns = table.rows[1].cells.length;
  const rows = table.rows.length;

  if (rows - 2 < 100) {
    for (let i = 0; i < columns; i++) {
      const cell = newRow.insertCell(i);
      cell.contentEditable = true;
      cell.textContent = "0";
      cell.addEventListener("input", function () {
        validateInputDith(rows - 1, i + 1, cell);
      });

      if (currentTable == "OrderedTable") {
        previousOrderedValues[[rows - 1, i + 1]] = "0";
      } else {
        previousErrorValues[[rows - 1, i + 1]] = "0";
      }
    }
  } else {
    showErrorMessage("[Cannot Add More Rows]");
  }
}

function addColDith() {
  const currentTable =
    document.querySelector('input[name="matrixToggle"]:checked').id + "Table";
  const table = document.getElementById(currentTable);

  const rows = table.rows.length;
  let header = table.getElementsByTagName("th")[0];
  const total_columns = table.rows[1].cells.length;

  if (total_columns < 100) {
    for (let i = 1; i < rows; i++) {
      const cell = table.rows[i].insertCell();
      cell.contentEditable = true;
      cell.textContent = "0";
      cell.addEventListener("input", function () {
        validateInputDith(i, total_columns + 1, cell);
      });
      if (currentTable == "OrderedTable") {
        previousOrderedValues[[i, total_columns + 1]] = "0";
      } else {
        previousErrorValues[[i, total_columns + 1]] = "0";
      }
    }

    const currentColspan = parseInt(header.getAttribute("colspan"), 10);
    header.setAttribute("colspan", currentColspan + 1);
  } else {
    showErrorMessage("[Cannot Add More Cols]");
  }
}

function deleteRowDith() {
  const currentTable =
    document.querySelector('input[name="matrixToggle"]:checked').id + "Table";
  const table = document.getElementById(currentTable);

  const total_columns = table.rows[1].cells.length;

  if (table.rows.length - 1 > 1) {
    table.deleteRow(-1);
    for (let col = 1; col <= total_columns; col++) {
      if (currentTable == "OrderedTable") {
        delete previousOrderedValues[[table.rows.length, col]];
      } else {
        delete previousErrorValues[[table.rows.length, col]];
      }
    }
  } else {
    showErrorMessage("[Cannot Delete More Rows]");
  }
}

function deleteColDith() {
  const currentTable =
    document.querySelector('input[name="matrixToggle"]:checked').id + "Table";
  const table = document.getElementById(currentTable);
  const columns = table.rows[1].cells.length;

  if (columns > 2 || (columns > 1 && currentTable == "OrderedTable")) {
    for (let i = 1; i < table.rows.length; i++) {
      table.rows[i].deleteCell(-1);
      if (currentTable == "OrderedTable") {
        delete previousOrderedValues[[i, columns]];
      } else {
        if (previousErrorValues[[i, columns]] == "*") {
          previousErrorValues[[i, columns - 1]] = "*";
          table.rows[i].cells[columns - 2].textContent = "*";
        }
        delete previousErrorValues[[i, columns]];
      }
    }

    let header = table.getElementsByTagName("th")[0];
    const currentColspan = parseInt(header.getAttribute("colspan"), 10);
    header.setAttribute("colspan", currentColspan - 1);
  } else {
    showErrorMessage("[Cannot Delete More Cols]");
  }
}

// Function to add a new color row
function addColor() {
  const colorCount = getColorCount();
  if (colorCount < 254) {
    const newColor = getRandomColor();
    const colorDiv = createColorDiv(newColor);
    colorPickerWrapperDith.insertBefore(colorDiv, finalRowDith);
    updateColorEvents(); // Update events after adding a new color
    updateColorCount();

    if (getColorCount() == 254) {
      addColorButtonDith.style.backgroundColor = "grey";
    }
  } else {
    showErrorMessage("[Cannot Add More Colors]");
  }

  deleteColorButtonDith.style.backgroundColor = "#dc3545";
}

// Function to delete the last added color
function deleteColor() {
  const colorCount = getColorCount();
  if (colorCount > 2) {
    const colorElements = document.querySelectorAll(".color");
    const lastColorElement = colorElements[colorElements.length - 1];
    if (lastColorElement) {
      colorPickerWrapperDith.removeChild(lastColorElement);
      updateColorCount();
    }
    if (getColorCount() == 2) {
      deleteColorButtonDith.style.backgroundColor = "grey";
    }
  } else {
    showErrorMessage("[Cannot Delete More Colors]");
  }

  addColorButtonDith.style.backgroundColor = "#28a745";
}

// Function to update color count in the title
function updateColorCount() {
  const colorCount = getColorCount();
  colorCountTitleDith.textContent = `New Colors (${colorCount})`;
}

function convertTableToArray(dith_type) {
  if (dith_type == 0) {
    var table = orderedTable;
  } else {
    var table = errorTable;
  }

  var array = [];
  // Loop through each row in the tbody
  var rows = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var cells = row.getElementsByTagName("td");

    // Extract values based on condition
    var rowData = [];
    for (var j = 0; j < cells.length; j++) {
      if (cells[j].textContent == "*") {
        rowData.push(-1);
      } else if (cells[j].textContent == "-") {
        rowData.push(0);
      } else {
        if (dith_type == 0) {
          var value = parseInt(cells[j].textContent);
        } else {
          var value = parseFloat(cells[j].textContent);
        }
        rowData.push(value);
      }
    }
    // Add the row data to the array
    array.push(rowData);
  }

  return array;
}

function getDitherParams() {
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
    palette.push(rgbArray);
  });

  dither_type = errorToggle.checked;
  matrix = convertTableToArray(dither_type);

  return [palette, dither_type, matrix];
}

function updateDithPageHelper(newColor) {
  const colorDiv = createColorDiv(newColor);
  colorPickerWrapperDith.insertBefore(colorDiv, finalRowDith);
}

function convertMatrixToDict(matrix) {
  const dict = {};
  matrix.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      // Increment row and column indices by 1 as index starts at 1
      const key = `${rowIndex + 1},${colIndex + 1}`;
      dict[key] = value.toString();
    });
  });
  return dict;
}

function updateErrorMatrix(dict) {
  let updatedDict = {};
  let found_star = false;

  for (const key in dict) {
    if (dict.hasOwnProperty(key)) {
      if (!found_star) {
        if (dict[key] == -1) {
          found_star = true;
          updatedDict[key] = "*";
        } else {
          updatedDict[key] = "-";
        }
      } else {
        updatedDict[key] = dict[key].toString();
      }
    }
  }

  return updatedDict;
}

function updateKernelTable(matrix) {
  const table = document.getElementById("kernelTable");
  const tbody = table.querySelector("tbody");

  // Clear the table
  tbody.innerHTML = "";

  // Update the colspan
  const th = table.querySelector(".title-cell");
  th.colSpan = matrix.length;

  for (let row = 0; row < matrix.length; row++) {
    newRow = tbody.insertRow();

    for (let col = 0; col < matrix[row].length; col++) {
      cell = newRow.insertCell(col);
      cell.contentEditable = true;
      cell.textContent = matrix[row][col];

      // Create a closure by wrapping the event listener function
      (function (row, col, cell) {
        cell.addEventListener("input", function () {
          validateInput(row + 1, col + 1, cell);
        });
      })(row, col, cell); // Pass row, col, and cell as arguments to the wrapping function

      previousKernelValues[[row + 1, col + 1]] = matrix[row][col];
    }
  }
}

function updateTable(tableId, dict, headerText) {
  const table = document.getElementById(tableId);
  const tbody = table.querySelector("tbody");

  // Clear the table
  tbody.innerHTML = "";

  // Find the maximum column index
  let maxCol = 0;
  Object.keys(dict).forEach((key) => {
    const colIndex = parseInt(key.split(",")[1]);
    if (colIndex > maxCol) {
      maxCol = colIndex;
    }
  });

  // Update the colspan
  const th = table.querySelector(".title-cell");
  th.colSpan = maxCol;

  // Set the header text content
  th.textContent = headerText;

  // Populate the table with values from the updated dictionary
  Object.entries(dict).forEach(([key, value]) => {
    const [rowIndex, colIndex] = key.split(",").map(Number);
    const tr = tbody.rows[rowIndex - 1] || tbody.insertRow(rowIndex - 1);
    const td = tr.insertCell(colIndex - 1);
    td.contentEditable = true;
    td.textContent = value;
    td.addEventListener("input", function () {
      validateInputDith(rowIndex, colIndex, td);
    });
  });
}

function updateDitherPage(params) {
  let dith_extra = JSON.parse(localStorage.getItem("dith_extra_params"));

  if (params[1]) {
    errorToggle.click();
    previousErrorValues = convertMatrixToDict(params[2]);
    previousErrorValues = updateErrorMatrix(previousErrorValues);

    if (dith_extra) {
      previousOrderedValues = dith_extra;
    }
  } else {
    orderedToggle.click();
    previousOrderedValues = convertMatrixToDict(params[2]);

    if (dith_extra) {
      previousErrorValues = dith_extra;
    }
  }

  // Update ErrorTable with previousErrorValues
  updateTable("ErrorTable", previousErrorValues, "Error Matrix");

  // Update OrderedTable with previousOrderedValues
  updateTable("OrderedTable", previousOrderedValues, "Ordered Matrix");

  const colorElements = colorPickerWrapperDith.querySelectorAll(".color");
  colorElements.forEach((colorElement) => {
    // Remove each color element from the target div
    colorPickerWrapperDith.removeChild(colorElement);
  });

  params[0].forEach((color) => {
    updateDithPageHelper(rgbToHex(color[0], color[1], color[2]));
  });

  updateColorEvents();
  updateColorCount();
}

//Event Listeners**************************************************

errorToggle.addEventListener("click", function () {
  errorTable.style.display = "";
  orderedTable.style.display = "none";
});

orderedToggle.addEventListener("click", function () {
  errorTable.style.display = "none";
  orderedTable.style.display = "";
});

//Main Code**************************************************

for (let i = 0; i < orderedRows.length; i++) {
  const cells = orderedRows[i].querySelectorAll('td[contenteditable="true"]');
  for (let j = 0; j < cells.length; j++) {
    const cell = cells[j];
    cell.addEventListener("input", function () {
      validateInputDith(i, j + 1, cell);
    });
  }
}

for (let i = 0; i < errorRows.length; i++) {
  const cells = errorRows[i].querySelectorAll('td[contenteditable="true"]');
  for (let j = 0; j < cells.length; j++) {
    const cell = cells[j];
    cell.addEventListener("input", function () {
      validateInputDith(i, j + 1, cell);
    });
  }
}

colorPickerWrapperDith.insertBefore(createColorDiv("black"), finalRowDith);
colorPickerWrapperDith.insertBefore(createColorDiv("white"), finalRowDith);

// Add event listeners for the buttons
addColorButtonDith.addEventListener("click", addColor);
deleteColorButtonDith.addEventListener("click", deleteColor);

if (localStorage.getItem("dither_params")) {
  updateDitherPage(JSON.parse(localStorage.getItem("dither_params")));
}
