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

        const el = document.getElementById("stage" + i);
        if(!el) continue;

        el.classList.remove("active");
        el.classList.remove("complete");

        if(i < stage){
            el.classList.add("complete");
        }

        if(i === stage){
            el.classList.add("active");
        }
    }
}

// ---- Update portal status ----
function updateStatus(message, file){

    const statusText = document.getElementById("statusText");
    const fileName = document.getElementById("fileName");

    if(statusText){
        statusText.innerText = message || "No status";
    }

    if(fileName){
        fileName.innerText = file || "No active folder";
    }

    if(message && message !== lastMessage){
        log(message);
        lastMessage = message;
    }
}

// ---- Receive workflow update from n8n ----
function receiveWorkflowUpdate(data){

    if(!data) return;

    updateStatus(data.message, data.file);
    setStage(data.stage || 0);

    resumeUrl = data.resumeUrl || "";
}

// ---- Continue workflow ----
function continueWorkflow(){

    if(!resumeUrl){
        alert("No workflow awaiting approval");
        return;
    }

    fetch(resumeUrl,{
        method:"POST"
    })
    .then(res => {

        if(res.ok){
            log("User approved workflow");
        } else {
            log("Error approving workflow: " + res.status);
        }

    })
    .catch(err => {
        console.error(err);
        log("Error contacting workflow");
    });
}

// ---- Abort workflow ----
function abortWorkflow(){

    if(!resumeUrl){
        log("No workflow to abort");
        return;
    }

    fetch(resumeUrl,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            action:"abort"
        })
    })
    .then(() => {
        log("Workflow aborted by user");
    })
    .catch(err => {
        console.error(err);
    });
}

// ---- Initial portal state ----
updateStatus("Waiting for workflow...", "No active folder");
setStage(0);
