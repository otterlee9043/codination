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
  console.log(ellipsisLine);
  ellipsisLine.firstChild.classList.remove("selecting");
  ellipsisLine
    .querySelector(".hljs-ln-numbers div")
    .setAttribute("data-line-number", "..."); // <span1>
  ellipsisLine.querySelector(".hljs-ln-code").innerText = ""; // <span2>
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

window.addEventListener("load", function () {
  const numbers = document.querySelectorAll(".hljs-ln-numbers");
  Array.from(numbers).map((item, index) => {
    const number = parseInt(item.getAttribute("data-line-number"));
    item.parentElement.id = `L${number}`;
    item.addEventListener("click", (event) => {
      console.log(number);
      if (!lineSelected) {
        start = number;
        // Array.from(numbers).map((number) => {
        //   number.classList.add("selecting");
        // });
        item.classList.add("selecting");
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

        selectedInfo.push({ start: start, number: numberLinesSelected });
        console.log(selectedInfo);
        let line = document.querySelector(`#L${start}`);
        console.log(line);
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
});

function splitText(textNode, text, start) {
  const fullText = textNode.nodeValue;
  console.log(fullText);
  const span1 = document.createElement("span");
  const span2 = document.createElement("span");
  const index = fullText.indexOf(text);
  if (start) {
    span1.innerText = fullText.substring(0, index);
    span2.innerText = text;
    // console.log(fullText.substring(0, index));
    // console.log(text);
  } else {
    span1.innerText = text;
    span2.innerText = fullText.substring(index, fullText.length - 1);
    // console.log(text);
    // console.log(fullText.substring(index, fullText.length - 1));
  }
  textNode.before(span1);
  textNode.before(span2);
  textNode.remove();
}

function splitSpan(spanNode, text, start) {}

function selectText() {
  var selectionText;
  if (document.getSelection) {
    selectionText = document.getSelection();
    console.log(selectionText);
    const selectedString = selectionText.toString();
    const start = selectionText.anchorNode.parentElement;
    const end = selectionText.focusNode.parentElement;
    const startNode = selectionText.anchorNode;
    const endNode = selectionText.focusNode;

    const overlappedString = findOverlap(
      startNode.nodeValue,
      selectedString,
      selectedString,
      false
    );
    //console.log(overlappedString);
    //console.log(selectionText.anchorNode.parentElement.tagName);
    if (selectionText.anchorNode.parentElement.tagName === "TD") {
      // text
      if (startNode !== endNode) splitText(startNode, overlappedString, true);
    }

    // console.log(startNode.nodeValue, ;

    console.log(startNode);
    //console.log(span);
    //startNode.before(span);
    // startNode.remove();

    // console.log(end);
    console.log(endNode);
    // const words = selectionText.toString().split(/=\(\) /);
    // console.log(words);
  } else if (document.selection) {
    selectionText = document.selection.createRange().text;
  }
  return selectionText;
}

window.addEventListener(
  "mouseup",
  (event) => {
    //console.log(event.toElement.parentElement.innerText);
    const selectedString = selectText().toString();
    const selectedLines = selectedString.split("\n");
    //console.log(selectedLines);
    // console.log();
  },
  false
);

function findOverlap(a, b, originalB, reverse) {
  if (!originalB) {
    originalB = b;
  }
  if (b.length === 0 && !reverse) {
    return findOverlap(a, originalB, originalB, true);
  }
  if (a.endsWith(b)) {
    return b;
  }
  if (a.indexOf(b) >= 0) {
    return b;
  }
  if (!reverse) {
    return findOverlap(a, b.substring(0, b.length - 1), originalB, false);
  } else {
    return findOverlap(a, b.substring(1, b.length), originalB, true);
  }
}
