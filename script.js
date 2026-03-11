let resumeUrl = "";

// ---- Activity log ----
function log(message){
    const logContainer = document.getElementById("activityLog");
    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.innerText = message;
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

// ---- Stage highlighting ----
function setStage(stage){
    for(let i = 1; i <= 4; i++){
        const el = document.getElementById("stage"+i);
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
function updateStatus(message, file){
    document.getElementById("statusText").innerText = message;
    document.getElementById("fileName").innerText = file;
    log(message);
}

// ---- Continue workflow ----
function continueWorkflow(){
    if(!resumeUrl){
        alert("No workflow awaiting approval");
        return;
    }

    fetch(resumeUrl)
        .then(() => log("User approved workflow"))
        .catch(err => console.error(err));
}

// ---- Abort workflow ----
function abortWorkflow(){
    log("Workflow aborted");
    alert("Workflow aborted");
}

// ---- Initial portal state ----
updateStatus("Waiting for workflow...", "No active folder");
setStage(0);

// ---- Poll n8n Portal Status API ----
async function checkWorkflow(){
    try {
        const response = await fetch("https://hailesiq.app.n8n.cloud/webhook-test/workflow-status");
        const data = await response.json();

        updateStatus(data.message, data.file);
        setStage(data.stage);

        // Store resume URL for Continue button
        resumeUrl = data.resumeUrl;

    } catch (err) {
        console.log("Cannot reach n8n:", err);
    }
}

// Poll every 3 seconds
setInterval(checkWorkflow, 3000);
