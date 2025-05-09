class ExportController {
    constructor() {
        this.persistenceManager = new PersistenceManager();
        this.loadPracticeList();
        this.exportDataDiv = document.getElementById("exportData");
        this.exportRehearsalList();
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
            const compressedData = Exporter.urlcompress(this.practiceList);
            console.log("URL-friendly data:", compressedData);

            // Create the <a> tag
            const importLink = document.createElement("a");
            const link=`import.html?i=${compressedData}`;

            const fullLink = "https://davvs.github.io/glosor/" + link;
            importLink.href = link;
            importLink.textContent = "Import Link";
            // Create the span for character count
            const characterCountSpan = document.createElement("span");
            characterCountSpan.textContent = `Antal tecken: ${compressedData.length}`;

            // Create the copy button
            const copyButton = document.createElement("button");
            copyButton.textContent = "Kopiera länk";
            copyButton.addEventListener("click", () => {
                navigator.clipboard.writeText(fullLink)
                    .then(() => {
                        console.log("Link copied to clipboard:", fullLink);
                    })
                    .catch((error) => {
                        console.error("Failed to copy destination to clipboard:", error);
                    });
            });

            // Create the div for compressed data
            const compressedDataDiv = document.createElement("div");
            compressedDataDiv.textContent = compressedData;

            // Clear the existing content in the exportDataDiv container
            this.exportDataDiv.innerHTML = "";

            // Append the elements to the exportDataDiv
            this.exportDataDiv.appendChild(importLink);
            this.exportDataDiv.appendChild(characterCountSpan);
            this.exportDataDiv.appendChild(copyButton);


            const qrH2 = document.createElement("h2")
            qrH2.innerText = "QR kod som innehåller hela listan";
            this.exportDataDiv.appendChild(qrH2);

            const qrInstructions = document.createElement("div");
            qrInstructions.innerText = "Klicka på QR koden för att expandera";
            this.exportDataDiv.appendChild(qrInstructions);

            const qrDiv = document.createElement("div");
            qrDiv.id = "qrDiv";
            this.exportDataDiv.appendChild(qrDiv);


            var qrCode = new QRCode(qrDiv, {
                text: fullLink,
                width: 1500,
                height: 1500,
                colorDark: "#000033",
                colorLight: "#ffffee",
                // QRCode.CorrectLevel.L | QRCode.CorrectLevel.M | QRCode.CorrectLevel.H
                correctLevel : QRCode.CorrectLevel.H
            });

            // Show the QR code image in current tab when clicked
            qrDiv.addEventListener("click", () => {
                window.open(qrCode._oDrawing._elImage.src, "_blank");
            });

            const compressedDataH2 = document.createElement("h2")
            compressedDataH2.innerText = "Komprimerad gloslista";
            this.exportDataDiv.appendChild(compressedDataH2);
            this.exportDataDiv.appendChild(compressedDataDiv);

            // Create the div for JSON data
            const jsonDataDiv = document.createElement("div");
            jsonDataDiv.classList.add("json-data");
            jsonDataDiv.textContent = JSON.stringify(this.practiceList);

            const jsonH2 = document.createElement("h2");
            jsonH2.innerText = "Data i JSON-format";
            this.exportDataDiv.appendChild(jsonH2);
            this.exportDataDiv.appendChild(jsonDataDiv);


        } else {
            console.error("No practice list loaded.");
        }
    }
}

const controller = new ExportController();