class FileTable extends HTMLTableElement {
    constructor() {
        super();
        this.className = "table";
        this.files = [];
    }

    clearFileList() {
        this.files = [];
        while (this.rows.length != 0) {
            this.deleteRow(-1);
        }
    }

    _btnClickCallback = (e) => {
        let new_e = new CustomEvent("onPlayClick", {detail: e.currentTarget.fileIndex});
        this.dispatchEvent(new_e);
    }

    setActive(index) {
        for (const row of this.rows) {
            if (index != row.fileIndex) {
                row.classList.remove("table-active");
            } else {
                row.classList.add("table-active");
            }
        }
    }

    setFileList(fList) {
        this.clearFileList();

        this.files = fList || [];

        for (let i=0; i < this.files.length; i++) {
            let tr = this.insertRow();
            tr.fileIndex = i;

            let btn = document.createElement("button");
            btn.className = "btn btn-sm btn-secondary w-100";
            btn.innerHTML = `<i class="bi bi-play"></i>`;
            btn.fileIndex = i;
            btn.addEventListener("click", this._btnClickCallback);

            let td_a = document.createElement("td");
            td_a.appendChild(btn);
            let td_b = document.createElement("td");
            td_b.innerHTML = this.files[i].name;

            tr.appendChild(td_a);
            tr.appendChild(td_b);
        }
    }
}

customElements.define("file-table", FileTable, {extends: "table"});
