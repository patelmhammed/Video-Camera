let db;

let dbOpenRequest = indexedDB.open("Gallery",1);

dbOpenRequest.onupgradeneeded = function(e){
    db = e.target.result;
    db.createObjectStore("Media",{keyPath: "mid"}); 
}

dbOpenRequest.onsuccess = function(e){
    db = e.target.result;
    fetchMedia();
}

dbOpenRequest.onerror = function(e){
    alert("Inside on error");
}

function fetchMedia(){
    let txnObject = db.transaction("Media","readonly");
    let mediaTable = txnObject.objectStore("Media");

    let cursorObject = mediaTable.openCursor();

    cursorObject.onsuccess = function(e){
        let cursor = cursorObject.result;
        if(cursor){
            let mediaObj = cursor.value;
            if(mediaObj.type == "photo"){
                appendPhoto(mediaObj);
            }else{
                appendVideo(mediaObj);
            }
            cursor.continue();
        }
    };
}

function appendPhoto(mediaObj){
    let mediaDiv = document.createElement("div");
    mediaDiv.classList.add("media-div");
    mediaDiv.innerHTML = `
        <img class="media-img" src=${mediaObj.url} alt="">
        <div class="media-buttons">
            <div class="download-media">Download</div>
            <div class="delete-media">Delete</div>
        </div>
    `
    mediaDiv.querySelector(".download-media").addEventListener("click",()=>{
        downloadMedia(mediaObj);
    })

    mediaDiv.querySelector(".delete-media").addEventListener("click",()=>{
        deleteMedia(mediaObj,mediaDiv);
    })

    document.querySelector(".gallery").append(mediaDiv);
}

function appendVideo(mediaObj){
    let mediaDiv = document.createElement("div");
    mediaDiv.classList.add("media-div");
    mediaDiv.innerHTML = `
        <video class="media-video" src=${URL.createObjectURL(mediaObj.url)} controls autoplay loop></video>
        <div class="media-buttons">
            <div class="download-media">Download</div>
            <div class="delete-media">Delete</div>
        </div>
    `
    mediaDiv.querySelector(".download-media").addEventListener("click",()=>{
        downloadMedia(mediaObj);
    })

    mediaDiv.querySelector(".delete-media").addEventListener("click",()=>{
        deleteMedia(mediaObj,mediaDiv);
    })

    document.querySelector(".gallery").append(mediaDiv);
}

function downloadMedia(mediaObj){
    let aTag = document.createElement("a");
    if(mediaObj.type == "photo"){
        aTag.download = `Image${Date.now()}.jpg`;
        aTag.href = mediaObj.url;
    }else{
        aTag.download = `Video${Date.now()}.mp4`;
        aTag.href = URL.createObjectURL(mediaObj.url);
    }
    aTag.click();
}

function deleteMedia(mediaObj,mediaDiv){
    let mid = mediaObj.mid;
    let txnObject = db.transaction("Media","readwrite");
    let mediaTable = txnObject.objectStore("Media");
    mediaTable.delete(mid);
    mediaDiv.remove();
}