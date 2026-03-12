let resumeUrl = "";
let lastMessage = "";

// ---- Activity log ----
function log(message){
    const logContainer = document.getElementById("activityLog");
    if(!logContainer) return;

    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.innerText = `[${new Date().toLocaleTimeString()}] ${message}`;
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

// ---- Stage highlighting ----
function setStage(stage){
    for(let i = 1; i <= 4; i++){
        const el = document.getElementById("stage"+i);
        if(!el) continue;

        el.classList.remove("active");
        el.classList.remove("complete");

        if(i < stage){
            el.classList.add("complete");
        } else if(i === stage){
            el.classList.add("active");
        }
    }
}

// ---- Update portal status ----
function updateStatus(message, file, newResumeUrl){
    const statusText = document.getElementById("statusText");
    const fileName = document.getElementById("fileName");
    const continueBtn = document.getElementById("continueBtn");

    if(statusText) statusText.innerText = message || "No status";
    if(fileName) fileName.innerText = file || "No active folder";

    // Only log new messages
    if(message && message !== lastMessage){
        log(message);
        lastMessage = message;
    }

    // Update resumeUrl and button link
    resumeUrl = newResumeUrl || "";
    if(continueBtn){
        if(resumeUrl){
            continueBtn.disabled = false;
        } else {
            continueBtn.disabled = true;
        }
    }
}

// ---- Continue workflow ----
function continueWorkflow(){
    if(!resumeUrl){
        alert("No workflow awaiting approval");
        return;
    }

    // Open the resume URL in a new tab
    window.open(resumeUrl, "_blank");
    log("Opened workflow resume page");
}

// ---- Abort workflow ----
function abortWorkflow(){
    log("Workflow aborted by user");
    alert("Workflow aborted");
}

// ---- Initial portal state ----
updateStatus("Waiting for workflow...", "No active folder", "");
setStage(0);

// ---- Poll n8n Portal GET Workflow ----
async function checkWorkflow(){
    try {
        const response = await fetch("https://hailesiq.app.n8n.cloud/webhook/portal-status");
        if(!response.ok) throw new Error("HTTP error " + response.status);

        const data = await response.json();

        if(data){
            updateStatus(data.message, data.file, data.resumeUrl);
            setStage(data.stage || 0);
        }

    } catch (err) {
        console.error("Cannot reach n8n or invalid JSON:", err);
        log("Cannot reach n8n or invalid JSON");
    }
}

// Poll every 3 seconds
setInterval(checkWorkflow, 3000);
// Initial fetch immediately
checkWorkflow();
