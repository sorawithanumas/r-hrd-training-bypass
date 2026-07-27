function onYouTubeIframeAPIReady() {
    player = new YT.Player('videoFrame', {
        playerVars: {
            'rel': 0,
            'controls': 0,
            'showinfo': 0,
            'autoplay': 1,
            'disablekb': 1,
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
        }
    });

    document.getElementById('remaining-time').style.display = 'none';
}

function onPlayerReady(event) {
    console.log('player is ready');

    videoFrame = document.getElementById('videoFrame');
    contentFrame = document.getElementById("contentFrame");
    videoFrame.style.display = "none";
    contentFrame.style.display = "block";

    if (totalCount > 0) {
        moveNextItem(activeIndex);
    }

    updateRemainingTime();
    setInterval(heartBeat, 1200000);
    setPercentStatus();
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.ENDED) {
        console.log('video ended');
        onEnd();
    }

    if (event.data == YT.PlayerState.PLAYING) {
        console.log('video playing')
        onPlay();
    }

    if (event.data == YT.PlayerState.PLAYING || event.data == YT.PlayerState.PAUSED) {
        document.getElementById('remaining-time').style.display = 'block';
        updateRemainingTime();
    }
    else {
        document.getElementById('remaining-time').style.display = 'none';
    }

}

function onPlay() {
    if (playingItem != null) {
        if (playingItem.className != "dotFinish") {
            playingItem.className = "dotStart";

            let ids = playingItem.id;
            let itemId = ids.split('-')[3];
            let duration = player.getDuration();

            /* donot show these sensitive parameters for updateItemStatus */
            updateItemStatus(traineeId, itemId, token, 'B', duration,
                (data) => {
                    if (data.d == "INVALID_COURSE") {
                        showWrongCourseModal();
                    }
                });
        }
    }
}

function onEnd() {
    if (playingItem != null) {
        if (playingItem.className != "dotFinish") {
            let ids = playingItem.id;
            let itemId = ids.split('-')[3];

            /* donot show these sensitive parameters for updateItemStatus */
            updateItemStatus(traineeId, itemId, token, 'E', 0.00,
                (data) => {
                    if (data.d == "SUCCESS") {
                        playingItem.className = "dotFinish";

                        finishCount++;
                        setPercentStatus();
                        moveNextItem(index);
                    }

                    if (data.d == "INVALID_COURSE") {
                        showWrongCourseModal();
                    }

                    if (data.d == "WRONG_DURATION") {
                        showWrongDurationModal();
                    }
                });
        }
    }
}

function downloadItem(id, idx) {
    playingItem = document.getElementById('status-' + id);
    if (playingItem != null) {
        if (playingItem.className != "dotFinish") {
            playingItem.className = "dotStart";

            let ids = playingItem.id;
            let itemId = ids.split('-')[3];

            /* donot show these sensitive parameters for updateItemStatus */
            updateItemStatus(traineeId, itemId, token, 'B', 0.00,
                (data) => {
                    if (data.d == "INVALID_COURSE") {
                        showWrongCourseModal();
                    }
                });
        }
    }

    player.stopVideo();

    let url = "/e-learning/Enroll2/DownloadFile.aspx?ItemId=" + id + "&Index=" + idx;
    contentFrame.src = url;
    videoFrame.style.display = "none";
    contentFrame.style.display = "block";
}

function showQuestion(id, idx) {
    playingItem = document.getElementById('status-' + id);
    if (playingItem != null) {
        if (playingItem.className != "dotFinish") {
            playingItem.className = "dotStart";
        }
    }

    player.stopVideo();

    videoFrame.style.display = "none";
    contentFrame.style.display = "block";

    let url = "/e-learning/Enroll2/Test.aspx?ItemId=" + id + "&Index=" + idx + "&TraineeId=" + traineeId;
    contentFrame.src = url;
}

function playVideo(id, url, idx) {
    index = idx;
    playingItem = document.getElementById('status-' + id);
    videoFrame.style.display = "block";
    contentFrame.style.display = "none";

    player.loadVideoByUrl({ mediaContentUrl: url });   
}

function finishDownload(id, idx) {
    playingItem = document.getElementById('status-' + id);
    if (playingItem != null) {
        if (playingItem.className != "dotFinish") {
            let ids = playingItem.id;
            let itemId = ids.split('-')[3];

            /* donot show these sensitive parameters for updateItemStatus */
            updateItemStatus(traineeId, itemId, token, 'E', 0.00,
                (data) => {
                    if (data.d == "SUCCESS") {
                        playingItem.className = "dotFinish";

                        finishCount++;
                        setPercentStatus();
                        moveNextItem(idx);
                    }
                });
        }
    }
}

function finishQuestion(id, idx) {
    playingItem = document.getElementById('status-' + id);
    if (playingItem != null) {
        playingItem.className = "dotFinish";

        finishCount++;
        setPercentStatus();
        moveNextItem(idx);
    }
}

function moveNextItem(idx) {
    let indexName = '#index-' + (parseInt(idx) + 1);
    let indexItem = $(indexName);
    if (indexItem != null) {
        indexItem.removeClass('disabled');
    }

    if (finishCount === totalCount) {
        var finishItem = document.getElementById("item-finish");
        if (finishItem != null) { finishItem.className = 'active'; }
    }
}

function setPercentStatus() {
    if (finishCount > 0 && totalCount > 0) {
        let percentStatus = document.getElementById('percentStatus');

        if (percentStatus != null) {
            let width = parseInt(finishCount * 100 / totalCount) + '%';
            percentStatus.style.width = width;
            percentStatus.textContent = width;
        }
    }
}

function askCertificate() {
    document.getElementById("status-certificate").className = "dotFinish";
    videoFrame.style.display = "none";
    contentFrame.style.display = "block";

    let sidebar = window.document.getElementById('sidebar');
    sidebar.classList.add('disabled');
    document.getElementById("modal-example").style.display = 'block';
}

function formatDuration2(durationInSeconds) {
    // Calculate minutes and seconds
    var minutes = Math.floor(durationInSeconds / 60);
    var seconds = Math.floor(durationInSeconds % 60);

    // Format to 2 digits (e.g., 05:09)
    var formattedMinutes = String(minutes).padStart(2, '0');
    var formattedSeconds = String(seconds).padStart(2, '0');

    // Return formatted time
    return `${formattedMinutes}:${formattedSeconds}`;
}

function updateRemainingTime() {

    // Calculate the remaining time
    let currentTime = player.getCurrentTime();
    let duration = player.getDuration();

    // Calculate the remaining time
    let remainingTime = duration - currentTime;

    // Format the remaining time as minutes and seconds
    let minutes = Math.floor(remainingTime / 60);
    let seconds = Math.floor(remainingTime % 60);
    let formattedTime = formatDuration2(remainingTime);

    // Display the remaining time
    document.getElementById('remaining-time').innerText = "[ " + formattedTime + " ]";

    // Update the remaining time every second
    if (player.getPlayerState() == YT.PlayerState.PLAYING) {
        setTimeout(updateRemainingTime, 1000);
    }
}
function heartBeat() {
    let url = '/e-learning/Enroll2/itemStatus.asmx/ExtendSession';
    let postData = '';
    $.ajax({
        type: "POST",
        url: url,
        contentType: "application/json; charset=utf-8",
        data: postData,
        dataType: "json",
        success: function () { console.log("extend session on " + (new Date())) },
        error: function (xmlHttpRequest, textStatus, errorThrown) {
            console.log(xmlHttpRequest.responseText);
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}
function updateItemStatus(traineeId, itemId, token, status, duration, successCallback, retryCount = 0) {
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    let url = '/e-learning/Enroll2/itemStatus.asmx/UpdateStatusWithToken';
    let postData = { traineeId: traineeId, itemId: itemId, token: token, status:status, duration:duration };

    $.ajax({
        type: "POST",
        url: url,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(postData),
        dataType: "json",
        timeout: 10000, // 10 second timeout
        success: function (data) {
            if (successCallback) {
                successCallback(data);
            }
        },
        error: function (xmlHttpRequest, textStatus, errorThrown) {
            console.error('Status update failed:', textStatus, errorThrown);

            // Retry logic
            if (retryCount < maxRetries) {
                console.log(`Retrying status update (${retryCount + 1}/${maxRetries})...`);
                setTimeout(function () {
                    updateItemStatus(traineeId, itemId, token, status, duration, successCallback, retryCount + 1);
                }, retryDelay);
            } else {
                console.error('Max retries reached. Status update failed permanently.');
                alert('ไม่สามารถบันทึกสถานะได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
            }
        }
    });
}
