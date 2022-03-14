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
const code = document.querySelector("code");
let lineSelected = false;
let start = -1;
let end = -1;
let selectedInfo = [];
const tbody = document.querySelector("tbody");

function isString(inputText) {
  if (typeof inputText === "string" || inputText instanceof String) return true;
  else return false;
}

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

code.addEventListener("mouseup", selectText, false);

function splitText(textNode, text, start, same = false) {
  const fullText = textNode.nodeValue;
  // console.log(fullText);
  // console.log(text);
  const span1 = document.createElement("span");
  const span2 = document.createElement("span");
  let span3;
  const index = fullText.indexOf(text);
  let between = false;
  if (same) {
    if (fullText === text) {
      span1.innerText = text;
      textNode.before(span1);
      textNode.remove();
      return span1;
    }
    if (index === 0) {
      span1.innerText = text;
      span2.innerText = fullText.substring(text.length, fullText.length);
    } else if (index === fullText.length - text.length) {
      span1.innerText = fullText.substring(0, index);
      span2.innerText = text;
    } else {
      span3 = document.createElement("span");
      span1.innerText = fullText.substring(0, index);
      span2.innerText = text;
      span3.innerText = fullText.substring(
        index + text.length,
        fullText.length
      );
      between = !between;
    }
  } else {
    if (start) {
      span1.innerText = fullText.substring(0, index);
      span2.innerText = text;
    } else {
      span1.innerText = text;
      span2.innerText = fullText.substring(text.length, fullText.length);
    }
  }

  textNode.before(span1);
  textNode.before(span2);
  if (between) {
    textNode.before(span3);
    textNode.remove();
    console.log(span1, span2, span3);
    return span2;
  }
  textNode.remove();
  return start ? span2 : span1;
}

function splitSpan(span, text, start, same = false) {
  console.log(span);
  const fullText = span.innerText;
  const span2 = span.cloneNode(false);
  let span3;
  const index = fullText.indexOf(text);
  let between = false;
  if (same) {
    if (fullText === text) {
      return span;
    }
    span.after(span2);
    if (index === 0) {
      span.innerText = text;
      span2.innerText = fullText.substring(text.length, fullText.length);
    } else if (index === fullText.length - text.length) {
      span.innerText = fullText.substring(0, index);
      span2.innerText = text;
    } else {
      span3 = span.cloneNode(false);
      span.innerText = fullText.substring(0, index);
      span2.innerText = text;
      span3.innerText = fullText.substring(
        index + text.length,
        fullText.length
      );
      between = !between;
      span2.after(span3);
      return span2;
    }
  } else {
    span.after(span2);
    if (start) {
      //const span2 = spane.cloneNode("span");
      span.innerText = fullText.substring(0, index);
      span2.innerText = text;
      console.log(span.innerText);
      console.log(span2.innerText);
    } else {
      span.innerText = text;
      span2.innerText = fullText.substring(text.length, fullText.length);
    }
  }

  console.log("span >", span);
  console.log("span2 >", span2);
  return start ? span2 : span;
}

function ellipsisSpan(startNode, endNode) {
  const ellipsisButton = document.createElement("span");
  ellipsisButton.innerText = "...";
  ellipsisButton.addEventListener("click", () => {
    newSpan.classList.remove("hidden");
    ellipsisButton.remove();
  });

  const newSpan = document.createElement("span");
  newSpan.classList.add("hidden");

  const key = startNode.id;
  let node = startNode;
  let nextNode = startNode.nextSibling;

  startNode.before(newSpan);
  newSpan.appendChild(node);
  if (endNode) {
    while (1) {
      node = nextNode;
      console.log(node);
      if (node.nodeType === 1 && node.id === key) {
        newSpan.appendChild(node);

        break;
      }
      nextNode = node.nextSibling;
      //console.log(i, node, node.id, node.nodeType);
      newSpan.appendChild(node);
    }
  }

  newSpan.before(ellipsisButton);
}

function randomId() {
  return Math.random().toString(12).substring(2, 11);
}

function selectText() {
  var selectionText;
  if (document.getSelection) {
    selectionText = document.getSelection();
    if (selectionText.toString() === "") {
      return;
    }
    console.log(selectionText.toString());
    const selectedString = selectionText.toString();

    const selectedFirst = selectionText.anchorNode;
    const selectedLast = selectionText.focusNode;
    console.log("selectedFirst >", selectedFirst);
    if (
      !isString(selectedFirst.nodeValue) ||
      !isString(selectedLast.nodeValue)
    ) {
      console.log("NOT STRING!!");
      return;
    }
    const firstOverlappedString = findOverlap(
      selectedFirst.nodeValue,
      selectedString,
      selectedString,
      false
    );
    console.log("selectedLast >", selectedLast);
    const lastOverlappedString = findOverlap(
      selectedString,
      selectedLast.nodeValue,
      selectedLast.nodeValue,
      false
    );
    console.log("firstOverlappedString >", firstOverlappedString);
    console.log("lastOverlappedString >", lastOverlappedString);
    let startNode, endNode;
    const key = randomId();
    const anchorTagType = selectionText.anchorNode.parentElement.tagName;
    const focusTagType = selectionText.focusNode.parentElement.tagName;
    if (selectedFirst === selectedLast) {
      console.log("SAME!");
      if (anchorTagType === "TD") {
        startNode = splitText(selectedFirst, firstOverlappedString, true, true);
      } else {
        startNode = splitSpan(
          selectedFirst.parentElement,
          firstOverlappedString,
          true,
          true
        );
      }
      ellipsisSpan(startNode, null, true);
    } else {
      if (anchorTagType === "TD") {
        startNode = splitText(selectedFirst, firstOverlappedString, true);
        console.log("startNode >", startNode);
      } else if (anchorTagType === "SPAN") {
        startNode = splitSpan(
          selectedFirst.parentElement,
          firstOverlappedString,
          true
        );
        console.log("startNode >>", startNode);
      }

      if (focusTagType === "TD") {
        // text
        if (selectedFirst !== selectedLast) {
          endNode = splitText(selectedLast, lastOverlappedString, false);
        }
        console.log("endNode >", endNode);
      } else if (focusTagType === "SPAN") {
        endNode = splitSpan(
          selectedLast.parentElement,
          lastOverlappedString,
          false
        );
        console.log("endNode >>", endNode);
      }

      startNode.id = key;
      endNode.id = key;
      ellipsisSpan(startNode, endNode, false);
    }
  } else if (document.selection) {
    console.log("2");
    selectionText = document.selection.createRange().text;
  }
  selectionText.removeAllRanges();
}

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
