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
        document.execCommand("copy");
        // javascript alert the copied text
        alert("Copied to clipboard");
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
            const files = createFileList([...this.files], [...e.target.files]);
            this.files = files;
            this.form.formData.files = [...files];
        }
    };
}

function submitForm() {
    var formElement = document.getElementById("myForm");
    var data = new FormData(formElement);
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