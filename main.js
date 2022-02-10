if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
};

class App extends EventTarget {
    constructor(rufflePlayer, container) {
        super();
        this.rufflePlayer = rufflePlayer;
        this.container = container;

        this.isPlay = false;
        this.onFileLoadEvent = new Event("onFileLoad");
        this.controllToolbar = document.querySelector("#control-toolbar");

        this.playerResizeObserver = new ResizeObserver(function (entries) {
            for (let entry of entries) {
                entry.target.resizeArea();
            }
        });

        this.initPlayer();

        screen.orientation.addEventListener('change', (function (e) {
            let scrOrientation = e.target;
            this.fullscreen(!(scrOrientation.type.indexOf("portrait") != -1));
        }).bind(this));

        window.addEventListener("visibilitychange", (function (e) {
            if (!document.hidden) {
                this.wakeLocking();
            }
        }).bind(this));
    }

    async wakeLocking(argIsLock) {
        if (navigator.wakeLock == undefined) return;
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

    async initPlayer() {
        if (this.player == undefined) {
            this.player = this.rufflePlayer.newest().createPlayer();
            this.player.resizeArea = function() {
                if (this.metadata) {
                    let w = this.metadata.width;
                    let h = this.metadata.height;
                    let coef = h/w;
                    this.style.height = `${Math.round(this.clientWidth*coef)}px`;
                }
            }
            this.player.className = "bg-dark bg-gradient";

            this.player.addEventListener("loadedmetadata", function (e) {
                e.target.resizeArea();
            });

            this.playerResizeObserver.observe(this.player);

            this.container.appendChild(this.player);
        }
    }

    async loadFile(file) {
        let buf = await new Response(file).arrayBuffer();

        await this.initPlayer();
        this.player.load({ data: buf });
        this.file = file
        this.wakeLocking(true);
        this.isPlay = true;
        this.dispatchEvent(this.onFileLoadEvent);
    }

    async reload() {
        if (this.file) {
            if (this.player) {
                this.player.remove();
                this.player = undefined;
            }
            await this.initPlayer();
            await this.loadFile(this.file);
        }
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

window.app = new App(window.RufflePlayer, document.getElementById("main-container"));

window.app.addEventListener("onFileLoad", (e) => {
    document.querySelector("#caption").innerHTML = e.target.file.name;
});

window.itemList = document.querySelector("#i-list");
window.itemList.addEventListener("onActive", function (e) {
    app.loadFile(e.target.activeItem);
});

document.querySelector("#i-local-file").addEventListener("change", function(event) {
    if (event.target.files.length > 0) {
        itemList.setData(event.target.files, item => {return item.name;});
        itemList.setActive(0);
    }
});