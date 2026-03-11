let resumeUrl = "";

// ---- Activity log ----
function log(message){
    const logContainer = document.getElementById("activityLog");
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
function updateStatus(message, file){
    const statusText = document.getElementById("statusText");
    const fileName = document.getElementById("fileName");

    if(statusText) statusText.innerText = message || "No status";
    if(fileName) fileName.innerText = file || "No active folder";

    log(message);
}

// ---- Continue workflow ----
function continueWorkflow(){
    if(!resumeUrl){
        alert("No workflow awaiting approval");
        return;
    }

    fetch(resumeUrl, { method: "POST" })
        .then(res => {
            if(res.ok){
                log("User approved workflow");
            } else {
                log("Error approving workflow: " + res.status);
            }
        })
        .catch(err => console.error(err));
}

// ---- Abort workflow ----
function abortWorkflow(){
    log("Workflow aborted by user");
    alert("Workflow aborted");
}

// ---- Initial portal state ----
updateStatus("Waiting for workflow...", "No active folder");
setStage(0);

// ---- Poll n8n Portal Status API ----
async function checkWorkflow(){
    try {
        const response = await fetch("https://hailesiq.app.n8n.cloud/webhook/portal-status"); // GET workflow URL
        if(!response.ok) throw new Error("HTTP error " + response.status);

        const data = await response.json();

        // Update portal UI
        updateStatus(data.message, data.file);
        setStage(data.stage || 0);

        // Store resume URL for Continue button
        resumeUrl = data.resumeUrl || "";

    } catch (err) {
        console.log("Cannot reach n8n:", err);
        log("Cannot reach n8n: " + err.message);
    }
}

// Poll every 3 seconds
setInterval(checkWorkflow, 3000);

// Initial fetch
checkWorkflow();
