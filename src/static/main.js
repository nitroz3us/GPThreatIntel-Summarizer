// call TypeWriter.js from another js
function toggleUI() {
    const dragDropDiv = document.getElementById("dragDropUI");
    const readFromTextAreaDiv = document.getElementById("readFromTextArea");
    const dragDropInput = document.getElementById("dragDropInput");
    const toggleBtn = document.querySelector(".toggleBtn");

    if (dragDropDiv.style.display === "none") {
      // Show & Enable the dragDropDiv div
      dragDropDiv.style.display = "block";
      dragDropInput.removeAttribute("disabled");
      // Disable readFromTextAreaDiv
      readFromTextAreaDiv.setAttribute("disabled", "");
      //
      readFromTextAreaDiv.style.display = "none";
      toggleBtn.textContent = "Read from Text/URL";
      // disable read from text area
    } else {
      // Hide & Disable the dragDropUI div
      dragDropDiv.style.display = "none";
      dragDropInput.setAttribute("disabled", "");
      // enable read from text area
      readFromTextAreaDiv.removeAttribute("disabled");
      readFromTextAreaDiv.style.display = "block";
      toggleBtn.textContent = "Read from PDF";
    }
  }

document.addEventListener("DOMContentLoaded", (event) => {
    document
      .getElementById("myForm")
      .addEventListener("submit", function (e) {
        e.preventDefault(); // Cancel the default action
        submitForm();
      });
  });

// Copy to clipboard
function copyClipboard() {
    toastInit();
    const result_body = document.querySelector("#responseBody");
    const range = document.createRange();
    range.selectNode(result_body);
    // get the value of the result_body
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    // if selection is "NO SUMMARY YET", do not copy
    if (selection.toString() === "NO SUMMARY YET") {
        return;
    } else {
        // document.execCommand("copy");
        navigator.clipboard.writeText(selection.toString());
        toast('Info', 'Copied to clipboard', toastStyles.info, 4000);

    }
}


function dataFileDnD() {
    return {
        files: [],
        fileDragging: null,
        fileDropping: null,
        humanFileSize(size) {
            const i = Math.floor(Math.log(size) / Math.log(1024));
            return (
                (size / Math.pow(1024, i)).toFixed(2) * 1 +
                " " +
                ["B", "kB", "MB", "GB", "TB"][i]
            );
        },
        remove(index) {
            let files = [...this.files];
            files.splice(index, 1);

            this.files = createFileList(files);
        },
        drop(e) {
            let removed, add;
            let files = [...this.files];

            removed = files.splice(this.fileDragging, 1);
            files.splice(this.fileDropping, 0, ...removed);

            this.files = createFileList(files);

            this.fileDropping = null;
            this.fileDragging = null;
        },
        dragenter(e) {
            let targetElem = e.target.closest("[draggable]");

            this.fileDropping = targetElem.getAttribute("data-index");
        },
        dragstart(e) {
            this.fileDragging = e.target
                .closest("[draggable]")
                .getAttribute("data-index");
            e.dataTransfer.effectAllowed = "move";
        },
        loadFile(file) {
            const preview = document.querySelectorAll(".preview");
            const blobUrl = URL.createObjectURL(file);

            preview.forEach(elem => {
                elem.onload = () => {
                    URL.revokeObjectURL(elem.src); // free memory
                };
            });

            return blobUrl;
        },
        addFiles(e) {
            const files = [...e.target.files].filter((file) => file.type === "application/pdf");
            if (files.length > 0) {
                this.files = createFileList([], [files[0]]);
                this.formData = new FormData();
                this.formData.append("file", files[0]);
            }
        },
          
    };
}

// Submit form
function submitForm() {
    var formElement = document.getElementById("myForm");
    var data = new FormData(formElement);
    var apiKey = data.get("openAIKey");

    fetch("/", {
      method: "POST",
      body: data,
    })
      .then((response) => response.text())
      .then((data) => {
        // print data onto responseBody div
        document.getElementById("responseBody").innerHTML = data;
        console.log(document.getElementById("responseBody"));
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function submitForm() {
    var formElement = document.getElementById("myForm");

    var data = new FormData(formElement);
  
    // Get the API key from the form data
    var apiKey = data.get("openAIKey");
    console.log(apiKey);
  
    if (!isValidApiKeyFormat(apiKey)) {
    //   alert("Invalid API key format.");
        toast('Error', 'Invalid API key format', toastStyles.error, 4000);
        return;
    }
  
    // Call the API key validation endpoint
    validateApiKey(apiKey)
      .then((isValid) => {
        if (isValid) {
          // API key is valid, submit the form
          fetch("/", {
            method: "POST",
            body: data,
          })
            .then((response) => response.text())
            .then((data) => {
              // Print data onto responseBody div
              document.getElementById("responseBody").innerHTML = data;
              document.getElementById("result-body").style.display = "block";

              console.log(document.getElementById("responseBody"));
            })
            .catch((error) => {
              console.error(error);
            });
        } else {
        //   alert("Unauthorized API key.");
          toast('Error', 'Unauthorized API key', toastStyles.error, 4000);
        }
      })
      .catch((error) => {
        console.error(error);
        alert("An error occurred while checking the API key.");
      });
  }
  
  function isValidApiKeyFormat(apiKey) {
    // Implement the validation logic for the API key format
    // Return true if the API key is valid, false otherwise
    // Example validation logic:
    return /^sk-[a-zA-Z0-9]{32,}$/.test(apiKey);
  }
  
  async function validateApiKey(apiKey) {
    const headers = {
      Authorization: `Bearer ${apiKey}`,
    };
  
    try {
      const response = await fetch("https://api.openai.com/v1/engines", { headers });
      return response.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  
  
// function showResponseBody() {
//     const result_body = document.getElementById("result-body");
//     const content = result_body.textContent.trim();
//     console.log(content);
//     // if result_body is "NO SUMMARY YET", do not show
//     // console.log(result_body.textContent);
//     if (content === "NO SUMMARY YET") {
//         // hide the result_body
//         // console.log("hide");
//         result_body.style.display = "none";
//     }

// }
// Word count slider
window.onload = function () {
    const wordCountSlider = document.getElementById("word_count");
    const wordCountValue = document.getElementById("word_count_value");
    wordCountSlider.oninput = function () {
        wordCountValue.innerHTML = this.value;
        console.log(this.value)
    };
}   



