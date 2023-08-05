let activeTab = "text-url-tab";

function toggleUI(tabId) {
  const dragDropDiv = document.getElementById("dragDropUI");
  const readFromTextAreaDiv = document.getElementById("readFromTextArea");
  const dragDropInput = document.getElementById("dragDropInput");

  // If clicking on the same tab, do nothing
  if (activeTab === tabId) {
    return;
  }

  // Remove the "bg-gray-800" class from the previous active tab
  const previousActiveTab = document.getElementById(activeTab);
  previousActiveTab.classList.remove("bg-gray-800");

  // Add the "bg-gray-800" class to the clicked tab (PDF tab)
  const clickedTab = document.getElementById(tabId);
  clickedTab.classList.add("bg-gray-800");

  // Update the activeTab variable
  activeTab = tabId;

  // Reset the styles when the "PDF" tab is clicked
  if (tabId === "pdf-tab") {
    // Show & Enable the dragDropDiv div
    dragDropDiv.style.display = "block";
    dragDropInput.removeAttribute("disabled");
    // Disable readFromTextAreaDiv
    readFromTextAreaDiv.setAttribute("disabled", "");
    readFromTextAreaDiv.style.display = "none";
  } else {
    // Hide & Disable the dragDropUI div
    dragDropDiv.style.display = "none";
    dragDropInput.setAttribute("disabled", "");
    // Enable read from text area
    readFromTextAreaDiv.removeAttribute("disabled");
    readFromTextAreaDiv.style.display = "block";
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
    const result_body = document.querySelector("#result-body");
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

// Function to clear the content of the result-body div
function clearResultBody() {
  const result_body = document.querySelector("#result-body");
  const result_card = document.querySelector("#result-card");
  result_card.style.display = "none";
  result_body.innerHTML = ""; // Clear the content
}

// Function to fetch the user prompt from the server
async function fetchUserPrompt() {
  const formElement = document.getElementById("myForm");
  const data = new FormData(formElement);
  try {
    const response = await fetch("/", {
      method: "POST",
      body: data,
    });
    const user_prompt = await response.text();
    return user_prompt;
  } catch (error) {
    console.error("Error fetching user prompt:", error);
    return ""; // Return an empty string on error
  }
}

function showLoadingBar() {
  // Replace 'loading-bar' with the ID or class of your loading bar element
  const loadingBar = document.getElementById('progress');
  const submitBtn = document.getElementById("submitBtn");
  const loadingProgress = document.getElementById('progress-bar');
  const elapsedTimeDiv = document.getElementById('elapsed-time-div');
  const timeTakenDiv = document.getElementById('time-taken-div');
  const elapsedTakenSeconds = document.getElementById('elapsed-taken-seconds');
  const percentageCount = document.getElementById('percentage-count');
  percentageCount.innerHTML = '0%';
  elapsedTakenSeconds.innerHTML = '0s';
  timeTakenDiv.style.display = 'none';
  loadingProgress.style.width = '0%';
  submitBtn.style.display = "none";
  loadingBar.style.display = 'block';
  elapsedTimeDiv.style.display = 'flex';
}

function hideLoadingBar() {
  const loadingBar = document.getElementById('progress');
  const timeTakenDiv = document.getElementById('time-taken-div');
  const submitBtn = document.getElementById("submitBtn");
  const loadingProgress = document.getElementById('progress-bar');
  const elapsedTimeDiv = document.getElementById('elapsed-time-div');
  const percentageCount = document.getElementById('percentage-count');
  percentageCount.innerHTML = '100%';
  loadingProgress.style.width = '100%';
  loadingBar.style.display = 'none';  
  elapsedTimeDiv.style.display = 'none';
  submitBtn.style.display = "block";
  timeTakenDiv.style.display = 'flex';
}

// Function to update the loading bar progress
function updateLoadingProgress(percentage) {
  const loadingProgress = document.getElementById('progress-bar');
  loadingProgress.style.width = '0%';
  loadingProgress.style.width = `${percentage}%`;
}



// Function to generate the response using OpenAI API
async function generateResponse(user_prompt) {
  const result_card = document.querySelector("#result-card");
  const result_body = document.querySelector("#result-body");
  const word_count_value = document.getElementById("word_count").value;
  const model = document.getElementById("model").value;

  const API_URL = "https://api.openai.com/v1/chat/completions";
  const API_KEY = document.getElementById("openAIKey").value;
  const system_prompt =
    "You are a Cyber Threat Intelligence Analyst and need to summarise a report for upper management. The report must be nicely formatted with three sections: one Executive Summary section and one 'TTPs and IoCs' section and one Mitigation Recommendation. The second section shall list all IP addresses (C2), domains, URLs, tools and hashes (sha-1, sha256, md5, etc.) which can be found in the report. If IoCs are not explicitly mentioned in the report, please do not create any IoCs. However, if TTPs are found, list them all. Nicely format the report as markdown. Use newlines between markdown headings.";
  let resultText = "";

  const timeTakenSeconds = document.getElementById('time-taken-seconds');
  const elapsedTakenSeconds = document.getElementById('elapsed-taken-seconds');
  const percentageCount = document.getElementById('percentage-count');
  


  try {
    if (!isValidApiKeyFormat(API_KEY)) {
      toast('Error', 'Invalid API key format', toastStyles.error, 4000);
      return;
    }

    const isValidApiKey = await validateApiKey(API_KEY);
    if (!isValidApiKey) {
      // console.error("Invalid API key format.");
      toast('Error', 'Invalid API key format', toastStyles.error, 4000);
      return;
    }

    let receivedChunks = 0; // Counter for received chunks
    let totalChunks = parseInt(word_count_value)
    // console.log("Word count value: " + word_count_value)
    
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: system_prompt },
          { role: "user", content: user_prompt },
        ],
        max_tokens: parseInt(word_count_value),
        top_p: 0.95,
        n: 1,
        stream: true, // For streaming responses
      }),
    });

    // Read the response as a stream of data
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    // Start timer
    const startTime = Date.now();
    const timerInterval = setInterval(() => {
      const currentTime = Date.now();
      const elapsedTimeInSeconds = Math.floor((currentTime - startTime) / 1000);
      timeTakenSeconds.innerHTML = `${elapsedTimeInSeconds} seconds`;
      elapsedTakenSeconds.innerHTML = `${elapsedTimeInSeconds}s`;
    }, 1000);


    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      receivedChunks++;
      let progress = parseFloat(((receivedChunks / totalChunks) * 100).toFixed(0));
      percentageCount.innerHTML = `${progress}%`;  
      updateLoadingProgress(progress);


      // Massage and parse the chunk of data
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");
      const parsedLines = lines
        .map((line) => line.replace(/^data: /, "").trim()) // Remove the "data: " prefix
        .filter((line) => line !== "" && line !== "[DONE]") // Remove empty lines and "[DONE]"
        .map((line) => JSON.parse(line)); // Parse the JSON string

      for (const parsedLine of parsedLines) {
        const { choices } = parsedLine;
        const { delta } = choices[0];
        const { content } = delta;
        // Update the UI with the new content
        if (content) {
          // result_card.style.display = "block";
          resultText += content;
          // result_body.innerHTML += content;
          
        }
      }
    }

    clearInterval(timerInterval);
    const endTime = Date.now();
    const elapsedTimeInSeconds = Math.floor((endTime - startTime) / 1000);
    timeTakenSeconds.innerHTML = `${elapsedTimeInSeconds} seconds`;


    hideLoadingBar();
    toast('Success', 'Summary generated!', toastStyles.success, 4000);
    result_card.style.display = "block";
    result_body.innerHTML = marked.parse(resultText);
  } catch (error) {
    console.error("Error:", error);
    toast('Error', error, toastStyles.error, 4000);
    hideLoadingBar();
  }
}

function submitForm() {
  showLoadingBar();
  clearResultBody();
  // Fetch the user prompt and generate the response
  fetchUserPrompt()
    .then((user_prompt) => {
      if (user_prompt) {
        generateResponse(user_prompt);
      } else {
        console.error("User prompt is empty.");
      }
    })
    .catch((error) => {
      console.error("Error fetching user prompt:", error);
      toast('Error', error, toastStyles.error, 4000);
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

// Word count slider
window.onload = function () {
    const wordCountSlider = document.getElementById("word_count");
    const wordCountValue = document.getElementById("word_count_value");
    const selectElement = document.getElementById("model");

    // Get the selected value
    const selectedValue = selectElement.value;
    selectElement.onchange = function () {
        const selectedValue = selectElement.value;
    }
    
    wordCountSlider.oninput = function () {
        wordCountValue.innerHTML = this.value;
        console.log(this.value)
    };
}   



