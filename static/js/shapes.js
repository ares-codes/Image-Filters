//Initialize**************************************************
const shapeImage = document.querySelector("#shapeImage");
const add_button = document.getElementById("add_button");
const delete_button = document.getElementById("delete_button");

// Assuming your table has an id of "myTable"
var table = document.querySelector("#shape_tbody");

// Attach click event to each table row
var shape_rows = document.querySelectorAll("#pointTable tbody tr");

// Get the rotation range input element
const rotationRange = document.getElementById("rotationRange");
const angleLabel = document.getElementById("angleLabel");

const canvas = document.getElementById("customCanvas");
const ctx = canvas.getContext("2d");

const canvasWidth = 500;
const canvasHeight = 450;
let oldRotationValue = 0; // Initialize old rotation value
let points = [];

const circle = document.querySelector("#circle");
const diamond = document.querySelector("#diamond");
const apple = document.querySelector("#apple");
const heart = document.querySelector("#heart");
const star = document.querySelector("#star");
const hexagon = document.querySelector("#hexagon");
const triangle = document.querySelector("#triangle");
const customPopup = document.getElementById("customPopup");
const custom = document.getElementById("custom");
const table_buttons = document.getElementById("table_buttons");

//Functions**************************************************

// Function to validate input and set the content
function validateAndSetContent(cell, rowIndex, colIndex) {
  // Remove non-numeric characters
  let inputValue = cell.textContent.replace(/\D/g, "");

  // Ensure the value is not empty
  if (inputValue === "") {
    // Set default value to the previous value if empty
  } else {
    // Parse the input as an integer
    let intValue = parseInt(inputValue, 10);

    // Check if the value is a non-negative integer
    if (!isNaN(intValue) && intValue >= 0) {
      cell.textContent = intValue; // Set the validated value
      if (colIndex == 0) {
        points[rowIndex].x = intValue;
      } else {
        points[rowIndex].y = canvas.height - intValue;
      }
    } else {
      // If the input is invalid, revert to the previous content
      cell.textContent = cell.dataset.previousValue || "0";
    }
  }

  // Update the dataset with the current content
  cell.dataset.previousValue = cell.textContent;
}

// Function to handle row click
function handleRowClick(event) {
  // Remove the "selected" class from all rows
  rows.forEach(function (row) {
    row.classList.remove("selected");
  });
  // Add the "selected" class to the clicked row
  var selectedRow = event.target.parentElement;
  selectedRow.classList.add("selected");
}

// Function to update the table based on the points array
function updateTable(points) {
  const shape_tbody = document.querySelector("#shape_tbody");

  // Find the row with the "selected" class in the original table
  var selectedRow = shape_tbody.querySelector(".selected");
  var selectedIndex = Array.from(selectedRow.parentNode.children).indexOf(
    selectedRow
  );

  shape_tbody.innerHTML = ""; // Clear the existing table rows

  // Loop through the points array and add rows to the table
  points.forEach((point, index) => {
    const newRow = document.createElement("tr");

    // Create cells for X and Y coordinates
    const xCell = document.createElement("td");
    xCell.textContent = Math.round(point.x);
    xCell.setAttribute("contenteditable", "true");

    const yCell = document.createElement("td");
    yCell.textContent = Math.round(canvas.height - point.y);
    yCell.setAttribute("contenteditable", "true");

    // Append cells to the new row
    newRow.appendChild(xCell);
    newRow.appendChild(yCell);

    if (index == selectedIndex) {
      newRow.classList.add("selected");
    }

    // Append the new row to the tbody
    shape_tbody.appendChild(newRow);
  });

  var shape_rows = shape_tbody.getElementsByTagName("tr");

  for (var i = 0; i < shape_rows.length; i++) {
    if (!shape_rows[i].classList.contains("selected")) {
      shape_rows[i].addEventListener("click", function () {
        // Remove highlight from all rows
        for (var j = 0; j < shape_rows.length; j++) {
          shape_rows[j].classList.remove("selected");
        }

        // Add highlight to the clicked row
        this.classList.add("selected");
        drawRotatedPoints(0);
      });
    }
  }
}

// Function to update the list of points
function updatePoints() {
  points = [];
  shape_rows.forEach(function (row) {
    var x = parseFloat(row.cells[0].textContent, 10);
    var y = parseFloat(row.cells[1].textContent, 10);
    points.push({ x: x, y: canvas.height - y });
  });
}

function rotatePoints(points, angleInDegrees, centerX, centerY) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;

  return points.map(({ x, y }) => {
    const rotatedX =
      Math.cos(angleInRadians) * (x - centerX) -
      Math.sin(angleInRadians) * (y - centerY) +
      centerX;
    const rotatedY =
      Math.sin(angleInRadians) * (x - centerX) +
      Math.cos(angleInRadians) * (y - centerY) +
      centerY;
    return {
      x: parseFloat(rotatedX.toFixed(3)),
      y: parseFloat(rotatedY.toFixed(3)),
    };
  });
}

function polarCoordinates(points, centerX, centerY) {
  return points.map((point) => {
    const deltaX = point.x - centerX;
    const deltaY = point.y - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX); // Angle in radians

    return {
      x: point.x,
      y: point.y,
      distance: distance,
      angle: angle,
    };
  });
}

function findFarthestPoint(points) {
  let farthestDistance = 0;
  let farthestPoint = null;

  for (const point of points) {
    if (point.distance > farthestDistance) {
      farthestDistance = point.distance;
      farthestPoint = { distance: point.distance, angle: point.angle };
    }
  }

  return farthestPoint;
}

function scalePoints(points, scale, centerX, centerY) {
  return points.map((point) => ({
    x: (centerX + scale * point.distance * Math.cos(point.angle)).toFixed(3),
    y: (centerY + scale * point.distance * Math.sin(point.angle)).toFixed(3),
  }));
}

// Calculate the center point
function calculateCenterPoint(points) {
  if (points.length === 0) {
    return { x: 0, y: 0 };
  }

  var totalX = 0;
  var totalY = 0;

  // Sum up all x and y coordinates
  points.forEach(function (point) {
    totalX += point.x;
    totalY += point.y;
  });

  // Calculate the average
  var centerX = totalX / points.length;
  var centerY = totalY / points.length;

  return { x: centerX, y: centerY };
}

function centerpoints() {
  const dot_size = 5;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  const midPoint = calculateCenterPoint(points);
  const midX = midPoint.x;
  const midY = midPoint.y;

  const polarPoints = polarCoordinates(points, midX, midY);
  const farthestPointInfo = findFarthestPoint(polarPoints);

  const scale = Math.min(
    (centerX - dot_size) / farthestPointInfo.distance,
    (centerY - dot_size) / farthestPointInfo.distance
  );

  points = scalePoints(polarPoints, scale, midX, midY);

  // shift all of the points
  let diffx = midX - centerX;
  let diffy = midY - centerY;
  for (const point of points) {
    point.x -= diffx;
    point.y -= diffy;
  }

  drawRotatedPoints(0);
}

function drawRotatedPoints(rotationValue) {
  // Save the current state of the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  dot_size = 5;

  let rotatedPoints = rotatePoints(
    points,
    360 - rotationValue,
    centerX,
    centerY
  );

  // Save the current state of the canvas
  ctx.save();

  // Draw lines between consecutive points
  ctx.beginPath();
  ctx.moveTo(rotatedPoints[0].x, rotatedPoints[0].y);
  for (let i = 1; i < rotatedPoints.length; i++) {
    ctx.lineTo(rotatedPoints[i].x, rotatedPoints[i].y);
  }
  ctx.closePath();
  ctx.strokeStyle = "black";
  ctx.stroke();

  let shape_tbody = document.querySelector("#shape_tbody");

  // Find the row with the "selected" class in the original table
  var selectedRow = shape_tbody.querySelector(".selected");
  var selectedIndex = Array.from(selectedRow.parentNode.children).indexOf(
    selectedRow
  );

  for (let i = 0; i < rotatedPoints.length; i++) {
    r_point = rotatedPoints[i];

    // Draw a circle
    ctx.beginPath();
    ctx.arc(r_point.x, r_point.y, dot_size, 0, 2 * Math.PI); // (x, y, radius, startAngle, endAngle)
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }

  // Draw a circle
  ctx.beginPath();
  ctx.arc(
    rotatedPoints[selectedIndex].x,
    rotatedPoints[selectedIndex].y,
    dot_size,
    0,
    2 * Math.PI
  ); // (x, y, radius, startAngle, endAngle)
  ctx.fillStyle = "blue";
  ctx.fill();
  ctx.stroke();
  ctx.closePath();

  // Restore the canvas state to undo the transformations
  ctx.restore();
  // change points for each
  points = rotatedPoints;
  updateTable(points);
}

function getShapeParams() {
  rotation = parseInt(rotationRange.value);
  border_color = hex2rgb(document.querySelector("#borderColor").value);
  background = hex2rgb(document.querySelector("#bgColor").value);

  if (circle.checked) {
    shape = [0];
  } else if (star.checked) {
    shape = [1];
  } else if (heart.checked) {
    shape = [2];
  } else if (apple.checked) {
    shape = [-1];
  } else if (triangle.checked) {
    shape = [3];
  } else if (diamond.checked) {
    shape = [4];
  } else if (hexagon.checked) {
    shape = [6];
  } else {
    shape = points.map((point) => [
      parseFloat(canvas.width - point.x),
      parseFloat(canvas.height - point.y),
    ]);
  }

  return [shape, border_color, background, rotation];
}

function updateShapePage(params) {
  let shape_extra = JSON.parse(localStorage.getItem("shape_extra_params"));
  if (shape_extra) {
    points = shape_extra.map((point) => ({
      x: canvas.width - parseFloat(point[0]),
      y: canvas.height - parseFloat(point[1]),
    }));

    centerpoints();
  }

  // shape
  let shape = params[0][0];
  if (shape == 0) {
    circle.click();
  } else if (shape == 1) {
    star.click();
  } else if (shape == 2) {
    heart.click();
  } else if (shape == -1) {
    apple.click();
  } else if (shape == 3) {
    triangle.click();
  } else if (shape == 4) {
    diamond.click();
  } else if (shape == 6) {
    hexagon.click();
  } else {
    document.querySelector("#custom").click();
    // update these points
    points = params[0].map((point) => ({
      x: canvas.width - parseFloat(point[0]),
      y: canvas.height - parseFloat(point[1]),
    }));

    centerpoints();
  }

  // border_color
  document.querySelector("#borderColor").value = rgbToHex(
    params[1][0],
    params[1][1],
    params[1][2]
  );

  // background
  document.querySelector("#bgColor").value = rgbToHex(
    params[2][0],
    params[2][1],
    params[2][2]
  );

  // rotation
  shapeImage.style.transform = `rotate(${360 - params[3]}deg)`;
  angleLabel.textContent = `Rotation: ${params[3]}°`;
  rotationRange.value = params[3];
}

//Event Listeners**************************************************

add_button.addEventListener("click", () => {
  const shape_tbody = document.querySelector("#shape_tbody");
  var shape_rows = shape_tbody.getElementsByTagName("tr");

  if (shape_rows.length < 100) {
    // Find the row with the "selected" class in the original table
    var selectedRow = shape_tbody.querySelector(".selected");
    var selectedIndex = Array.from(selectedRow.parentNode.children).indexOf(
      selectedRow
    );

    x = Math.floor(Math.random() * (canvas.width + 1));
    y = Math.floor(Math.random() * (canvas.height + 1));

    points.splice(selectedIndex + 1, 0, { x: x, y: y });

    updateTable(points);
    shape_rows[(selectedIndex + 1) % shape_rows.length].click();

    delete_button.style.backgroundColor = "lightcoral";
    drawRotatedPoints(0);

    if (shape_rows.length == 100) {
      add_button.style.backgroundColor = "grey";
    }
  } else {
    showErrorMessage("[Cannot Add More Points]");
  }
});

delete_button.addEventListener("click", () => {
  let shape_tbody = document.querySelector("#shape_tbody");
  var shape_rows = shape_tbody.getElementsByTagName("tr");

  if (shape_rows.length > 3) {
    // Find the row with the "selected" class in the original table
    var selectedRow = shape_tbody.querySelector(".selected");
    var selectedIndex = Array.from(selectedRow.parentNode.children).indexOf(
      selectedRow
    );

    points.splice(selectedIndex, 1);
    updateTable(points);
    shape_rows[selectedIndex % shape_rows.length].click();

    add_button.style.backgroundColor = "lightgreen";

    if (shape_rows.length == 3) {
      delete_button.style.backgroundColor = "grey";
    }

    drawRotatedPoints(0);
  } else {
    showErrorMessage("[Cannot Delete More Points]");
  }
});

// Add input event listener to the table to handle changes in real-time
table.addEventListener("input", function (event) {
  var target = event.target;

  // Check if the event target is a contenteditable cell
  if (target && target.hasAttribute("contenteditable")) {
    var rowIndex = target.closest("tr").rowIndex - 1; // Adjust for the header row
    var colIndex = target.cellIndex;

    // Call the validateAndSetContent function with row and column indices
    validateAndSetContent(target, rowIndex, colIndex);
  }
});

shape_rows.forEach(function (row) {
  if (!row.classList.contains("selected")) {
    row.addEventListener("click", handleRowClick);
  }
});

// Update the rotation of shapeImage based on user input
rotationRange.addEventListener("input", function () {
  const newRotationValue = parseInt(this.value);
  const rotationDifference = newRotationValue - oldRotationValue;

  shapeImage.style.transform = `rotate(${360 - newRotationValue}deg)`;
  angleLabel.textContent = `Rotation: ${newRotationValue}°`;

  // Update points based on the rotation difference
  drawRotatedPoints(rotationDifference);

  // Update the old rotation value
  oldRotationValue = newRotationValue;
});

custom.addEventListener("click", function () {
  shapeImage.style.display = "none";
  customPopup.style.display = "flex";
  table_buttons.style.display = "flex";
});

circle.addEventListener("click", function () {
  shapeImage.src = "static/option_images/shape/circle.png";
  shapeImage.style.display = "";
  customPopup.style.display = "none";
  table_buttons.style.display = "none";
});

diamond.addEventListener("click", function () {
  shapeImage.src = "static/option_images/shape/diamond.png";
  shapeImage.style.display = "";
  customPopup.style.display = "none";
  table_buttons.style.display = "none";
});

apple.addEventListener("click", function () {
  shapeImage.style.display = "";
  shapeImage.src = "static/option_images/shape/apple.png";
  customPopup.style.display = "none";
  table_buttons.style.display = "none";
});

heart.addEventListener("click", function () {
  shapeImage.style.display = "";
  shapeImage.src = "static/option_images/shape/heart.png";
  customPopup.style.display = "none";
  table_buttons.style.display = "none";
});

star.addEventListener("click", function () {
  shapeImage.style.display = "";
  shapeImage.src = "static/option_images/shape/star.png";
  customPopup.style.display = "none";
  table_buttons.style.display = "none";
});

hexagon.addEventListener("click", function () {
  shapeImage.style.display = "";
  shapeImage.src = "static/option_images/shape/hexagon.png";
  customPopup.style.display = "none";
  table_buttons.style.display = "none";
});

triangle.addEventListener("click", function () {
  shapeImage.style.display = "";
  shapeImage.src = "static/option_images/shape/triangle.png";
  customPopup.style.display = "none";
  table_buttons.style.display = "none";
});

//Main Code**************************************************

updatePoints();
centerpoints();

if (localStorage.getItem("shape_params")) {
  updateShapePage(JSON.parse(localStorage.getItem("shape_params")));
}
