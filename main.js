if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
};

class App extends EventTarget {
    constructor() {
        super();
        this.isPlay = false;
        this.onFileLoadEvent = new Event("onFileLoad");
        this.controllToolbar = document.querySelector("#control-toolbar");

        screen.orientation.addEventListener('change', (function (e) {
            let scrOrientation = e.target;
            this.fullscreen(!(scrOrientation.type.indexOf("portrait") != -1));
        }).bind(this));

        window.addEventListener("visibilitychange", (function (e) {
            if (!document.hidden) {
                this.wakeLocking();
            }
        }).bind(this));

        // document.addEventListener('fullscreenchange', (function (event) {
        //     if (document.fullscreenElement) {
        //         if (screen.orientation.type.indexOf("landscape") == 0) {
        //             this.controllToolbar.classList.remove("visually-hidden");
        //             this.player.classList.add("display-contents");
        //         }
        //     } else {
        //         this.controllToolbar.classList.add("visually-hidden");
        //         this.player.classList.remove("display-contents");
        //     }
        //     this.wakeLocking(true);
        // }).bind(this));

    }

    setPlayer(playerObj) {
        this.player = playerObj;
    }

    async wakeLocking(argIsLock) {
        if (argIsLock != undefined) {
            this.isLock = Boolean(false || argIsLock);
        }
        if (this.isLock) {
            if (this.wakeLock == undefined) {
                this.wakeLock = await navigator.wakeLock.request('screen');
                this.wakeLock.addEventListener("release", () => {
                    this.wakeLock = undefined;
                });
            }
        } else {
            if (this.wakeLock) {
                this.wakeLock.release();
                this.wakeLock = undefined;
            }
        }
    }

    async loadFile(file) {
        let buf = await new Response(file).arrayBuffer();
        this.player.load({ data: buf });
        this.file = file
        this.wakeLocking(true);
        this.isPlay = true;
        this.dispatchEvent(this.onFileLoadEvent);
    }

    async reload() {
        if (this.file) await this.loadFile(this.file);
    }

    fullscreen(isFullscreen) {
        let cond = (isFullscreen == undefined) ? !this.player.isFullscreen : isFullscreen;
        if (this.player.metadata != null) {
            if (cond) {
                this.player.enterFullscreen();
            } else {
                this.player.exitFullscreen();
            }
            this.wakeLocking();
        }
    }

    play() {
        if (this.player.metadata) {
            this.player.play();
            this.isPlay = true;
            this.wakeLocking(true);
        }
    }

    pause() {
        if (this.player.metadata) {
            this.player.pause();
            this.isPlay = false;
            this.wakeLocking(false);
        }
    }
}

window.app = new App();

window.addEventListener("load", function (e) {
    const ruffle = window.RufflePlayer.newest();
    window.player = ruffle.createPlayer();
    window.player.className = "bg-dark bg-gradient";
    document.getElementById("main-container").appendChild(player);
    window.app.setPlayer(window.player);

    window.player.addEventListener("loadedmetadata", function (e) {
        let w = e.target.metadata.width;
        let h = e.target.metadata.height;
        let res = Math.round((100 - ((w - h) / w * 100)) * 10) / 10;
        player.style.height = `${res}vmin`;
    });
});

window.app.addEventListener("onFileLoad", (e) => {
    document.querySelector("#caption").innerHTML = e.target.file.name;
});

window.fileTable = document.querySelector("#t-file");
window.fileTable.addEventListener("onActive", function (e) {
    let index = e.target.activeIndex;
    if (index >= 0) {
        window.app.loadFile(e.target.files[index]);
    }
});
