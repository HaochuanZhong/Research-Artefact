function getUserCode() {
    /* return htmlEditor.getValue() + "\n" + "<style>" + "\n" + cssEditor.getValue() + "\n" + "</style>" + "\n" +  "<script>" + "\n" + jsEditor.getValue() + "\n" + "</script>"; */
    return htmlEditor.getValue()
}
function update() {
    //this is the content of iframe
    var code = document.getElementById('iframe').contentWindow.document;
    code.open();
    //getting value from editor and puts in the iframe
    code.write(getUserCode());
    code.close();
}
function loadHTMLEditor() {
    defaultHTMLValue = "<!DOCTYPE html>\n\n<html>\n\n    <!-- Your HTML code goes right here -->\n\n</html>"
    //tells ace editor to use editor element , window.editor makes it global in the javascript file
    window.htmlEditor = ace.edit("htmlEditor");
    //mode mode
    htmlEditor.setTheme("ace/theme/dracula");
    //html mode
    htmlEditor.getSession().setMode("ace/mode/html");
    //sample text
    htmlEditor.setValue(defaultHTMLValue, 1); //1 = moves cursor to end
    // when something changed in editor update is called
    htmlEditor.getSession().on('change', function () {
        update();
    });
    // puts cursor in the editor
    htmlEditor.focus();

    //htmlEditor.setOption('showLineNumbers', true);
    htmlEditor.setOptions({
        fontSize: "12.5pt",
        showLineNumbers: true,
        vScrollBarAlwaysVisible: false,
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: false
    });

    htmlEditor.setShowPrintMargin(false);
    //htmlEditor.setBehavioursEnabled(false);
}
/* function loadCSSEditor() {
    defaultCSSValue = ""
    //tells ace editor to use editor element , window.editor makes it global in the javascript file
    window.cssEditor = ace.edit("cssEditor");
    cssEditor.resize();
    cssEditor.renderer.updateFull();
    //mode mode
    cssEditor.setTheme("ace/theme/dracula");
    //html mode
    cssEditor.getSession().setMode("ace/mode/css");
    //sample text
    cssEditor.setValue(defaultCSSValue,1); //1 = moves cursor to end
    // when something changed in editor update is called
    cssEditor.getSession().on('change', function() {
        update();
    });
    // puts cursor in the editor
    cssEditor.focus();

    //htmlEditor.setOption('showLineNumbers', true);
    cssEditor.setOptions({
        fontSize: "12.5pt",
        showLineNumbers: true,
        vScrollBarAlwaysVisible:true,
        // enableBasicAutocompletion: true,
        // enableSnippets: true,
        // enableLiveAutocompletion: false
    });

    cssEditor.setShowPrintMargin(false);
    //cssEditor.setBehavioursEnabled(false);
} */

/* function loadJSEditor() {
    defaultJSValue = ""
    //tells ace editor to use editor element , window.editor makes it global in the javascript file
    window.jsEditor = ace.edit("jsEditor");
    //mode mode
    jsEditor.setTheme("ace/theme/dracula");
    //html mode
    jsEditor.getSession().setMode("ace/mode/javascript");
    //sample text
    jsEditor.setValue(defaultJSValue,1); //1 = moves cursor to end
    // when something changed in editor update is called
    jsEditor.getSession().on('change', function() {
        update();
    });
    // puts cursor in the editor
    jsEditor.focus();
    
    //htmlEditor.setOption('showLineNumbers', true);
    jsEditor.setOptions({
        fontSize: "12.5pt",
        showLineNumbers: true,
        vScrollBarAlwaysVisible:true,
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: false
    });

    jsEditor.setShowPrintMargin(false);
    //htmlEditor.setBehavioursEnabled(false);
} */

function setupEditor() {
    loadHTMLEditor();
    /* loadCSSEditor();
    loadJSEditor(); */
}
function ready() {
    setupEditor();
}

//Download Code File
function downloadCode() {
    //1.Create a blob
    const userCode = getUserCode();
    const blob = new Blob([userCode], { type: "text/html" });
    downloadFile(blob, "index.html");
}
//2.function that accepts blob and file name
function downloadFile(blob, fileName) {
    //3.create url for blob
    const url = window.URL.createObjectURL(blob);
    //4.anchor tag to download
    const a = document.createElement('a');
    //Before click we need to add some properties to our anchorTag
    a.href = url;
    a.download = fileName;
    //click event
    a.click();
    //remove anchor tag
    a.remove();

    document.addEventListener("focus", w => { window.URL.revokeObjectURL(url) })
}

//submit to chatGPT
document.getElementById('prompt-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    // Get the form data
    const formData = new FormData(event.target);
    let prompt = `Combine everything in a html. Give me code only, no other text, comment and explain the code. Here is the task: `;
    //let prompt = `Tell me what is in this image`;
    formData.forEach((value, key) => {
        if (value && key && key != "imgExample") {
            prompt += `${key}: ${value}\n`;
        }
    });
    let finalPrompt = prompt;
    console.log(finalPrompt);

    const fileUploader = document.getElementById('imgExample').files[0];

    // Get the values from the form
    /*  const context = document.getElementById('context').value;
        const description = document.getElementById('description').value;
        const codeExample = document.getElementById('codeExample').value;
        const exampleUrl = document.getElementById('exampleUrl').value;
        const dataUrl = document.getElementById('dataUrl').value;
        const dataMethod = document.getElementById('dataDropdown').value;
        const others = document.getElementById('others').value; */
    /*  if (context) {
         prompt += `${context}\n`;
     }
     if (description) {
         prompt += `${description}\n`;
     }
     if (codeExample) {
        prompt += `${codeExample}\n`;
    }
     if (exampleUrl) {
         prompt += `${exampleUrl}\n`;
     }
     if (dataUrl) {
         prompt += `${dataUrl}\n`;
     }
     if (dataMethod) {
         prompt += `${dataMethod}\n`;
     }
     if (others) {
         prompt += `${others}\n`;
     } */
    setFormState(true); // Disable the form
    setLoading(true); // Show the loading sign

    if (fileUploader) {
        getBase64(fileUploader, (base64Image) => {
            fetch('http://localhost:3000', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: finalPrompt,
                    file: base64Image
                })
            })
                .then(res => res.json())
                .then(data => {
                    const code = data.completion.content
                    console.log(code)
                    htmlEditor.setValue(code, 1);
                    // Load history after receiving data
                    loadHistory(finalPrompt, code);
                    setFormState(false); // Enable the form
                    setLoading(false); // Hide the loading sign
                })
        })
    } else {
        fetch('http://localhost:3000', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: finalPrompt,
            })
        })
            .then(res => res.json())
            .then(data => {
                const code = data.completion.content
                console.log(code)
                htmlEditor.setValue(code, 1);
                // Load history after receiving data
                loadHistory(finalPrompt, code);
                setFormState(false); // Enable the form
                setLoading(false); // Hide the loading sign
            })
    }
});


// history
let counting = 0;
let historyData = [];

function loadHistory(finalPrompt, finalCode) {

    counting++

    // Find the history-log div
    const historyLogDiv = document.getElementById('history-log');

    // Create divs for promptHistory and codeHistory
    const logCounting = document.createElement('div')
    logCounting.classList.add('history-text-blue');
    logCounting.textContent = `Log: ${counting}`;
    const promptDiv = document.createElement('div');
    promptDiv.classList.add('history-text-orange')
    promptDiv.textContent = finalPrompt;
    const promptTitle = document.createElement('div');
    promptTitle.classList.add('history-text-orange');
    promptTitle.textContent = "Your prompt"
    const codeDiv = document.createElement('div');
    codeDiv.classList.add('history-text')
    codeDiv.textContent = finalCode;
    const codeTitle = document.createElement('div');
    codeTitle.classList.add('history-text');
    codeTitle.textContent = "Generated code"
    const spacing = document.createElement('div');
    spacing.classList.add('spacing')

    // Append the divs to history-log
    historyLogDiv.appendChild(logCounting);
    historyLogDiv.appendChild(promptTitle);
    historyLogDiv.appendChild(promptDiv);
    historyLogDiv.appendChild(codeTitle);
    historyLogDiv.appendChild(codeDiv);
    historyLogDiv.appendChild(spacing);

    // Add to historyData
    historyData.push({
        count: counting,
        prompt: finalPrompt,
        code: finalCode
    });
}

// Function to convert image to base64
function getBase64(file, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => callback(reader.result);
    reader.onerror = (error) => console.log('Error: ', error);
}

function downloadHistory() {
    let historyText = historyData.map(entry => {
        return `Log: ${entry.count}\nYour prompt: ${entry.prompt}\nGenerated code: ${entry.code}\n\n`;
    }).join('');

    const blob = new Blob([historyText], { type: "text/plain" });
    downloadFile(blob, "history.txt");
}

// Function to enable or disable the form elements
function setFormState(isDisabled) {
    const formElements = document.querySelectorAll('#prompt-form input, #prompt-form textarea, #prompt-form button');
    formElements.forEach(element => {
        element.disabled = isDisabled;
    });
}

// Function to show or hide the loading sign
function setLoading(isLoading) {
    const loadingElement = document.getElementById('loading');
    if (isLoading) {
        loadingElement.style.display = 'inline';
    } else {
        loadingElement.style.display = 'none';
    }
}