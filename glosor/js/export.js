class ExportController {
    constructor() {
        this.persistenceManager = new PersistenceManager();
        this.loadPracticeList();
        this.exportLinkButton = document.getElementById("exportLink");
        this.exportDataDiv = document.getElementById("exportData");
        this.exportLinkButton.addEventListener("click", this.exportRehearsalList.bind(this));
    }

    loadPracticeList() {
        const urlParams = new URLSearchParams(window.location.search);
        const practiceListName = urlParams.get("localList");
        if (practiceListName) {
            this.practiceList = this.persistenceManager.getPracticeListByName(practiceListName);
        }
    }

    exportRehearsalList() {
        if (this.practiceList) {
            const exporter = new Exporter();

            const compressedData = Exporter.urlcompress(this.practiceList);
            console.log("URL-friendly data:", compressedData);
            this.exportDataDiv.textContent = compressedData;
        } else {
            console.error("No practice list loaded.");
        }
    }
}

const controller = new ExportController();