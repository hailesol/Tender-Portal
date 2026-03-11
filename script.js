let resumeUrl = "";

function log(message){

const log = document.getElementById("activityLog");

const entry = document.createElement("div");

entry.className = "log-entry";
entry.innerText = message;

log.appendChild(entry);
log.scrollTop = log.scrollHeight;

}


function setStage(stage){

for(let i=1;i<=4;i++){

const el = document.getElementById("stage"+i);

el.classList.remove("active");
el.classList.remove("complete");

if(i < stage){

el.classList.add("complete");

}else if(i === stage){

el.classList.add("active");

}

}

}


function updateStatus(message,file){

document.getElementById("statusText").innerText = message;
document.getElementById("fileName").innerText = file;

log(message);

}


function continueWorkflow(){

if(!resumeUrl){

alert("No workflow awaiting approval");
return;

}

fetch(resumeUrl);

log("User approved workflow");

}


function abortWorkflow(){

log("Workflow aborted");

alert("Workflow aborted");

}


/* Initial portal state */

updateStatus("Waiting for workflow...","No active folder");
setStage(0);