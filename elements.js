class FileTable extends HTMLTableElement {
    constructor() {
        super();
        this.className = "table";
        this.files = [];
        this.activeIndex = -1;
        this.onActiveEvent = new Event("onActive");
    }

    clearFileList() {
        this.files = [];
        this.activeIndex = -1;
        this.dispatchEvent(this.onActiveEvent);
        while (this.rows.length != 0) {
            this.deleteRow(-1);
        }
    }

    setActive(index) {
        if (0 <= index && index < this.files.length) {
            for (const row of this.rows) {
                if (index != row.fileIndex) {
                    row.classList.remove("table-active");
                } else {
                    row.classList.add("table-active");
                    this.activeIndex = index;
                    this.dispatchEvent(this.onActiveEvent);
                }
            }
        }
    }

    setFileList(fList) {
        this.clearFileList();

        if (fList.length > 0) {
            this.files = fList;

            for (let i=0; i < this.files.length; i++) {
                let tr = this.insertRow();
                tr.fileIndex = i;

                let btn = document.createElement("button");
                btn.className = "btn btn-sm btn-secondary w-100";
                btn.innerHTML = `<i class="bi bi-play"></i>`;
                btn.fileIndex = i;
                btn.addEventListener("click", (e) => {
                    this.setActive(e.currentTarget.fileIndex);
                });

                let td_a = document.createElement("td");
                td_a.appendChild(btn);
                let td_b = document.createElement("td");
                td_b.innerHTML = this.files[i].name;

                tr.appendChild(td_a);
                tr.appendChild(td_b);
            }

            this.setActive(0);
        }
    }
}

customElements.define("file-table", FileTable, {extends: "table"});
