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
const tbody = document.querySelector("tbody");

function compare(a, b) {
  const num1 = parseInt(a.querySelector(".lineNumber span").innerText);
  const num2 = parseInt(b.querySelector(".lineNumber span").innerText);
  return num1 - num2;
}

// const td = document.querySelectorAll(".lineNumber");
// console.log(td);
// Array.from(td).map((td1) => {
//   td1.addEventListener("click", (event) => {
//     console.log("...");
//     const number = parseInt(td1.firstElementChild.innerText);
//     console.log(number);
//     const numbers = document.querySelectorAll(".lineNumber");
//     if (!lineSelected) {
//       start = number;
//       Array.from(numbers).map((number) => {
//         number.classList.add("selecting");
//       });
//     } else {
//       end = number;
//       const numberLinesSelected = Math.abs(start - end) + 1;
//       const lines = [];
//       let line = td1.parentElement; // == <tr>
//       let ellipsisLine = line.cloneNode(true);
//       console.log(ellipsisLine.firstChild);
//       ellipsisLine.querySelector(".lineNumber").classList.remove("selecting");
//       ellipsisLine.querySelector(".lineNumber span").innerText = "..."; // <span1>
//       ellipsisLine.querySelector(".code span").innerText = ""; // <span2>

//       if (end > start) {
//         line.after(ellipsisLine); // 3line 뒤에 추가
//         for (let i = 0; i < numberLinesSelected; i++) {
//           line.classList.add("hidden"); // display none
//           lines.push(line); // display none한 라인을 lines에 넣어준다
//           line = line.previousSibling; // line 2를 가리킨다.
//         }
//         lines.sort(compare);
//       } else {
//         line.before(ellipsisLine);
//         for (let i = 0; i < numberLinesSelected; i++) {
//           line.classList.add("hidden");
//           lines.push(line);
//           line = line.nextSibling;
//         }
//       }
//       ellipsisLine.addEventListener("click", () => {
//         lines.map((line) => {
//           // lines = [4,3,2,1]
//           line.classList.remove("hidden");
//           tbody.insertBefore(line, ellipsisLine); // ellipsisLine앞에에line을 삽입한다. '...' 앞에 라인 123을 삽입한다.
//         });
//         ellipsisLine.remove(); // '...'을 지운다
//       });
//       Array.from(numbers).map((number) => {
//         number.classList.remove("selecting");
//       });
//     }
//     lineSelected = !lineSelected;
//   });
// });

codeLines.map((item, index) => {
  const tr = document.createElement("tr");
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
    console.log(number);
    const numbers = document.querySelectorAll(".lineNumber");
    if (!lineSelected) {
      start = number;
      Array.from(numbers).map((number) => {
        number.classList.add("selecting");
      });
    } else {
      end = number;
      let numberLinesSelected = Math.abs(start - end) + 1;
      const lines = [];
      let line = td1.parentElement; // == <tr>
      let ellipsisLine = line.cloneNode(true);
      ellipsisLine.firstChild.classList.remove("selecting");
      ellipsisLine.querySelector(".lineNumber span").innerText = "..."; // <span1>
      ellipsisLine.querySelector(".code span").innerText = ""; // <span2>

      if (end > start) {
        line.after(ellipsisLine); // 3line 뒤에 추가
        for (let i = 0; i < numberLinesSelected; i++) {
          line.classList.add("hidden"); // display none
          if (line.querySelector(".lineNumber span").innerText === "...") {
            expand();
            numberLinesSelected += lines.length;
          }
          lines.unshift(line); // display none한 라인을 lines에 넣어준다

          line = line.previousSibling; // line 2를 가리킨다.
        }
        lines.sort(compare);
      } else {
        line.before(ellipsisLine);
        for (let i = 0; i < numberLinesSelected; i++) {
          line.classList.add("hidden");
          lines.push(line);
          line = line.nextSibling;
        }
      }
      if (
        lines.find(
          (line) => line.querySelector(".lineNumber span").innerText == "..."
        )
      )
        expand();
      function expand() {
        lines.map((line) => {
          // lines = [4,3,2,1]
          line.classList.remove("hidden");
          tbody.insertBefore(line, ellipsisLine); // ellipsisLine앞에에line을 삽입한다. '...' 앞에 라인 123을 삽입한다.
        });
        ellipsisLine.remove(); // '...'을 지운다
      }
      ellipsisLine.addEventListener("click", expand);
      Array.from(numbers).map((number) => {
        number.classList.remove("selecting");
      });
    }
    lineSelected = !lineSelected;
  });
});

// function selectText() {
//   var selectionText = "";
//   if (document.getSelection) {
//     selectionText = document.getSelection();
//   } else if (document.selection) {
//     selectionText = document.selection.createRange().text;
//   }
//   return selectionText;
// }

// window.addEventListener(
//   "mouseup",
//   (event) => {
//     console.log(event.toElement.parentElement.innerText);
//     const selectedString = selectText().toString();
//     const selectedLines = selectedString.split("\n");
//     console.log(selectedLines);
//     // console.log();
//   },
//   false
// );
