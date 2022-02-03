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
                tr.innerHTML = `
                <td>
                    <button class="btn btn-sm btn-secondary w-100"><i class="bi bi-play"></i></button>
                </td>
                <td>${this.files[i].name}</td>`;

                tr.querySelector("button").addEventListener("click", (e) => {
                    this.setActive(e.currentTarget.parentElement.parentElement.fileIndex);
                });
            }

            this.setActive(0);
        }
    }
}

customElements.define("file-table", FileTable, {extends: "table"});
