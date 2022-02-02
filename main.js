if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
};

window.addEventListener("load", function (event) {
    const ruffle = window.RufflePlayer.newest();
    window.player = ruffle.createPlayer();
    let container = document.getElementById("main-container");
    container.appendChild(player);

    window.player.addEventListener("loadedmetadata", function (e) {
        let w = e.target.metadata.width;
        let h = e.target.metadata.height;
        let res = Math.round((100 - ((w - h) / w * 100)) * 10) / 10;
        player.style.height = `${res}vmin`;
    });
});

async function wakeLocking(pIsLock) {
    window.isLock = false || pIsLock;
    if (window.isLock) {
        if (window.wakeLock == undefined) {
            window.wakeLock = await navigator.wakeLock.request('screen');
            window.wakeLock.addEventListener("release", function () {
                window.wakeLock = undefined;
            });
        }
    } else {
        if (window.wakeLock) {
            window.wakeLock.release();
            window.wakeLock = undefined;
        }
    }
}

async function loadFile(file) {
    let buf = await new Response(file).arrayBuffer();
    player.load({ data: buf });
    document.querySelector("#caption").innerHTML = file.name;
    wakeLocking(true);
    window.isPlay = true;
}

function loadFileByIndex(index) {
    if (0 <= index && index < fileTable.files.length) {
        window.currentFileIndex = index;
        fileTable.setActive(window.currentFileIndex);
        loadFile(fileTable.files[window.currentFileIndex]);
    }
}

// =============
document.querySelector("#b-open-file").addEventListener("click", function () {
    document.querySelector("#i-local-file").click();
});
window.fileTable = document.querySelector("#t-file");
document.querySelector("#i-local-file").addEventListener("change", function (event) {
    fileTable.setFileList(event.target.files);
    loadFileByIndex(0);
});

fileTable.addEventListener("onPlayClick", function (e) {
    loadFileByIndex(e.detail);
});
// ==========

screen.orientation.addEventListener('change', function (e) {
    if (player.metadata != null) {
        let scrOrientation = e.target;
        if (scrOrientation.type.indexOf("portrait") != -1) {
            player.exitFullscreen();
            wakeLocking(true);
        } else {
            player.enterFullscreen();
            wakeLocking(true);
        }
    }
});

document.querySelector("#b-reload").addEventListener("click", function () {
    loadFileByIndex(window.currentFileIndex);
});

document.querySelector("#b-full-screen").addEventListener("click", function () {
    if (player.metadata != null) {
        if (!player.isFullscreen) {
            player.enterFullscreen();
            wakeLocking(true);
        } else {
            player.exitFullscreen();
            wakeLocking(true);
        }
    }
});

document.querySelector("#b-pause-play").addEventListener("click", function (e) {
    if (player.metadata != null) {
        if (window.isPlay) {
            player.pause();
            window.isPlay = false;
            wakeLocking(false);
        } else {
            player.play();
            window.isPlay = true;
            wakeLocking(true);
        }
    }
});

document.querySelector("#b-next").addEventListener("click", function () {
    loadFileByIndex(window.currentFileIndex + 1);
});

document.querySelector("#b-prev").addEventListener("click", function () {
    loadFileByIndex(window.currentFileIndex - 1);
});