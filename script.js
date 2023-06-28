let videoElement = document.querySelector("video");
let recordButton = document.querySelector(".inner-record");
let captureButton = document.querySelector(".inner-capture");
let filters = document.querySelectorAll(".filter");
let filterSelected = "none";

let zoomIn = document.querySelector(".zoomIn");
let zoomOut = document.querySelector(".zoomOut");
let galleryBtn = document.querySelector(".gallery-btn");
let minZoom = 1;
let maxZoom = 3.1;
let currentZoom = 1;

galleryBtn.addEventListener("click",()=>{
    window.location.assign("gallery.html");
})

let mediaRecorder;
let recordingState = false;

// (IIFE) Immediately Invoked Function Expression
// (function add(){
//     console.log(1);
// })();

(async function (){
    let constraint = {video: true};

    let mediaStream = await navigator.mediaDevices.getUserMedia(constraint);
    videoElement.srcObject = mediaStream;

    mediaRecorder = new MediaRecorder(mediaStream);

    mediaRecorder.onstart = function(){
        console.log("On start");
    };

    mediaRecorder.ondataavailable = function(e){
        // console.log(e.data);

        let videoObject = new Blob([e.data],{type: "video/mp4"});
        addMedia(videoObject,"video");
        /* For downloading */
        // let videoURL = URL.createObjectURL(videoObject);
        // let aTag = document.createElement("a");
        // aTag.download = `Video${Date.now()}.mp4`;
        // aTag.href = videoURL;
        // aTag.click();
        
    };

    mediaRecorder.onstop = function(){
        console.log("On stop");
    }

    recordButton.addEventListener("click",recordMediaFun);
    captureButton.addEventListener("click",capturePhotoFun);
})();

for(let i = 0;i<filters.length;i++){

    filters[i].addEventListener("click",function(e){
        let currentFilterSelected = e.target.style.backgroundColor;
        if(currentFilterSelected == ""){
            if(document.querySelector(".filter-div")){
                document.querySelector(".filter-div").remove();
                filterSelected = "none";
                return;
            }
        }  

        if(filterSelected == currentFilterSelected){
            return;
        }
        
        let filterDiv = document.createElement("div");
        filterDiv.classList.add("filter-div");
        filterDiv.style.backgroundColor = currentFilterSelected;

        if(filterSelected=="none"){
            document.body.append(filterDiv);
        }else{
            document.querySelector(".filter-div").remove();
            document.body.append(filterDiv);
        }

        filterSelected = currentFilterSelected;
    });
}

zoomIn.addEventListener("click",()=>{
    if(currentZoom + 0.1 > maxZoom){
        return;
    }

    currentZoom = currentZoom + 0.1;
    videoElement.style.transform = `scale(${currentZoom})`;
})

zoomOut.addEventListener("click",()=>{
    if(currentZoom - 0.1 < minZoom){
        return;
    }

    currentZoom = currentZoom - 0.1;
    videoElement.style.transform = `scale(${currentZoom})`;
})

function addMedia(mediaURL,mediaType){
    let txnObject = db.transaction("Media","readwrite");
    let mediaTable = txnObject.objectStore("Media");

    mediaTable.add({mid: Date.now(), type: mediaType, url: mediaURL});


    txnObject.onerror = function(e){
        console.log("transaction Failed");
    };
}

function capturePhotoFun () {
    captureButton.classList.add("animate-capture");

    setTimeout(()=>{
        captureButton.classList.remove
    },1000)

    const canvas = document.createElement("canvas");
    canvas.height = videoElement.videoHeight;
    canvas.width = videoElement.videoWidth;

    const ctx = canvas.getContext("2d");

    if(currentZoom != 1){
        ctx.translate(canvas.width/2,canvas.height/2);
        ctx.scale(currentZoom,currentZoom);
        ctx.translate(-canvas.width/2,-canvas.height/2);
    }

    ctx.drawImage(videoElement,0,0);

    if(filterSelected != "none"){
        ctx.fillStyle = filterSelected;
        ctx.fillRect(0,0,canvas.width,canvas.height);
    }

    /* For downloading */
    // let aTag = document.createElement("a");
    // aTag.download = `Image${Date.now()}.jpg`;
    // aTag.href = canvas.toDataURL("image/jpg");
    // aTag.click();

    let canvasURL = canvas.toDataURL("image/jpg");
    addMedia(canvasURL,"photo");
}

function recordMediaFun () {
    if(recordingState){
        mediaRecorder.stop();
        recordingState = false;
        recordButton.classList.remove("animate-record");
    }else{
        mediaRecorder.start();
        recordingState = true;
        recordButton.classList.add("animate-record");
    }
}


