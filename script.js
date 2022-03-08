function readTextFile(file) {
  var rawFile = new XMLHttpRequest();
  rawFile.open("GET", file, false);
  var allText;
  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4) {
      if (rawFile.status === 200 || rawFile.status == 0) {
        allText = rawFile.responseText;
      }
    }
  };
  rawFile.send(null);
  return allText;
}

const codeText = readTextFile("./example.js");
const codeLines = codeText.split("\n");
const code = document.querySelector("#code");
let lineSelected = false;
let start = -1;
let end = -1;
let selectedInfo = [];
const tbody = document.querySelector("tbody");

function compare(a, b) {
  const num1 = parseInt(a.querySelector(".lineNumber span").innerText);
  const num2 = parseInt(b.querySelector(".lineNumber span").innerText);
  return num1 - num2;
}

function expand(lineId, number) {
  let firstLine = document.querySelector(`.hidden#${lineId}`);
  firstLine.previousSibling.remove();
  for (let i = 0; i < number; i++) {
    firstLine.classList.remove("hidden");
    firstLine = firstLine.nextSibling;
  }
}

function createEllipsisNode(line) {
  let ellipsisLine = line.cloneNode(true);
  ellipsisLine.firstChild.classList.remove("selecting");
  ellipsisLine.querySelector(".lineNumber span").innerText = "..."; // <span1>
  ellipsisLine.querySelector(".code span").innerText = ""; // <span2>
  ellipsisLine.addEventListener("click", () => {
    const info = selectedInfo.find(
      (item) => `L${item.start}` === ellipsisLine.id
    );
    const lineId = `L${info.start}`;
    const number = info.number;
    expand(lineId, number);
    const lineNumber = parseInt(lineId.replace(/[^0-9]/g, ""));
    selectedInfo = selectedInfo.filter((item) => {
      return lineNumber !== item.start;
    });
  });
  line.before(ellipsisLine);
  return ellipsisLine;
}

codeLines.map((item, index) => {
  const tr = document.createElement("tr");
  tr.id = "L" + String(index + 1);
  const td1 = document.createElement("td");
  td1.className = "lineNumber";
  const span = document.createElement("span");
  span.innerText = String(index + 1);
  const td2 = document.createElement("td");
  const span2 = document.createElement("span");
  span2.innerText = item;
  td1.appendChild(span);
  td2.appendChild(span2);
  td2.className = "code";
  tr.appendChild(td1);
  tr.appendChild(td2);
  code.appendChild(tr);
  td1.addEventListener("click", (event) => {
    const number = parseInt(td1.firstElementChild.innerText);
    const numbers = document.querySelectorAll(".lineNumber");
    if (!lineSelected) {
      start = number;
      Array.from(numbers).map((number) => {
        number.classList.add("selecting");
      });
    } else {
      end = number;
      let numberLinesSelected = Math.abs(start - end) + 1;
      start = Math.min(start, end);
      selectedInfo = selectedInfo.filter((item) => {
        const contained =
          start < item.start && start + numberLinesSelected - 1 > item.start;
        if (contained) {
          expand(`L${String(item.start)}`, item.number);
        }
        return !contained;
      });
      console.log(selectedInfo);
      selectedInfo.push({ start: start, number: numberLinesSelected });
      let line = document.querySelector(`#L${start}`);
      createEllipsisNode(line);

      for (let i = 0; i < numberLinesSelected; i++) {
        line.classList.add("hidden");
        line = line.nextElementSibling;
      }
      Array.from(numbers).map((number) => {
        number.classList.remove("selecting");
      });
    }
    lineSelected = !lineSelected;
  });
});
