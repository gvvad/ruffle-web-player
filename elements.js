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

class ItemList extends HTMLDivElement {
    constructor() {
        super();
        this.classList.add("list-group");
        this.data = [];
        this.activeIndex = NaN;
        this.onActiveEvent = new Event("onActive");
    }

    get activeItem() {
        return this.data[this.activeIndex];
    }

    setData(dataList, mapper) {
        if (!(dataList.length > 0)) return;
        this.data = dataList;
        this.activeIndex = NaN;
        
        //Render
        this.innerHTML = "";
        let clickDispatcher = (e) => {
            let index = Array.prototype.indexOf.call(e.target.parentNode.childNodes, e.target);
            this.setActive(index);
        };
        for (let item of this.data) {
            let listRow = document.createElement("button");
            listRow.innerHTML = `${mapper(item)}`;
            listRow.classList.add("list-group-item");
            listRow.classList.add("list-group-item-action");
            listRow.classList.add("list-group-item-auto");
            
            listRow.onclick = clickDispatcher;
            this.appendChild(listRow);
        }
    }

    setActive(index) {
        if (0 <= index && index < this.data.length) {
            if (!isNaN(this.activeIndex)) {
                try {
                    this.childNodes[this.activeIndex].classList.remove("active");
                    for (let node of this.childNodes[this.activeIndex].childNodes) {
                        if (!Text.prototype.isPrototypeOf(node)) {
                            node.remove();
                        }
                    }
                } catch(e) {
                    console.warn(e)
                }
            }
            this.activeIndex = index;

            let i = 0;
            for (const node of this.childNodes) {
                if (this.activeIndex == i++) {
                    node.classList.add("active");
                    let i = document.createElement("i");
                    i.className = "bi bi-play";
                    node.insertBefore(i, node.childNodes[0]);
                    break;
                }
            }
            this.dispatchEvent(this.onActiveEvent);
        }
    }
}
customElements.define("item-list", ItemList, {extends: "div"});
