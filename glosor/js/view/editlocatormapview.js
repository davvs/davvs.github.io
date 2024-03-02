class EditLocatorMapView {
    constructor() {
        this.persistenceManager = new PersistenceManager();
        this.loadPracticeList();
        this.setupImageLoadButton();
        this.setupGoBackButton();
        this.setupNewRegionButton();
        this.renderRegionsText();

    }

    renderRegionsText() {
        const regionsDiv = document.querySelector("#regions");
        regionsDiv.innerHTML = ""; // Clear the regions div

        const regions = this.practiceList.locatorMaps[this.locatorMapId].regions;

        for (let i = 0; i < regions.length; i++) {
            const region = regions[i];
            const regionElement = document.createElement("div");

            // Create and append the region's name element
            const regionNameElement = document.createElement("span");
            regionNameElement.textContent = `Region ${i}`;
            regionElement.appendChild(regionNameElement);

            // Create and append the remove button
            const removeButton = document.createElement("button");
            removeButton.textContent = "Remove";
            removeButton.addEventListener("click", () => this.removeRegion(i));
            regionElement.appendChild(removeButton);

            // Create and append the select button
            const selectButton = document.createElement("button");
            selectButton.textContent = "Select";
            selectButton.addEventListener("click", () => this.selectRegion(i));
            regionElement.appendChild(selectButton);

            regionsDiv.appendChild(regionElement);
        }
    }

    removeRegion(index) {
        const regions = this.practiceList.locatorMaps[this.locatorMapId].regions;
        regions.splice(index, 1);
        this.savePracticeList();
        this.renderRegionsText();
    }

    selectRegion(index) {
        const canvas = document.querySelector("#imageContainer canvas");
        const context = canvas.getContext("2d");
        const region = this.practiceList.locatorMaps[this.locatorMapId].regions[index];

        // Draw the region with yellow color
        const iconSize = 3;
        context.fillStyle = "yellow";
        context.fillRect(region.x * canvas.width - iconSize / 2, region.y * canvas.height - iconSize / 2, iconSize, iconSize);

        this.savePracticeList();
        this.renderRegionsText();
    }


    setupNewRegionButton() {
        const newRegionButton = document.querySelector("#newRegionButton");
        const imageContainer = document.querySelector("#imageContainer");
        newRegionButton.addEventListener("click", () => {
            const canvas = imageContainer.querySelector("canvas");
            if (canvas) {
                canvas.addEventListener("mouseup", this.handleImageMouseUp.bind(this));
            }
        });
    }

    handleImageMouseUp(event) {
        const regionRect = event.target.getBoundingClientRect();
        const x = (event.clientX - regionRect.left) / regionRect.width;
        const y = (event.clientY - regionRect.top) / regionRect.height;
        const coordinates = document.querySelector("#status");
        coordinates.textContent = `Region coordinates: x=${x.toFixed(2)}, y=${y.toFixed(2)}`;

        const canvas = event.target;
        const context = canvas.getContext("2d");
        const iconSize = 3;
        const threshold = 8*8;

        let clickedVertex = false;

        // Check if any coordinate is close to the clicked position
        this.practiceList.locatorMaps[this.locatorMapId].regions.forEach((region, regionIndex) => {
            region.coordinates.forEach((coordinate, coordinateIndex) => {
                const vertexX = coordinate.x * canvas.width;
                const vertexY = coordinate.y * canvas.height;
                const distance = Math.sqrt((vertexX - event.clientX) ** 2 + (vertexY - event.clientY) ** 2);
                console.log(`distance for ${coordinateIndex} in region ${regionIndex} is ${distance}`);
                if (distance <= threshold) {
                    console.log("Hit vertex!");
                    // Change the color of the clicked vertex to yellow
                    context.fillStyle = "yellow";
                    context.fillRect(vertexX - iconSize / 2, vertexY - iconSize / 2, iconSize, iconSize);

                    // Update the status and mark the vertex as clicked
                    coordinates.textContent = `Clicked vertex ID: Region ${regionIndex}, Coordinate ${coordinateIndex}`;
                    clickedVertex = true;
                }
            });
        });

        if (!clickedVertex) {
            // Create a new red vertex at the clicked position
            const coord = new Coordinate(x, y);
            if (this.currentRegion !== null) {
                console.log("Missed vertex! creating new coordinate in the current Region");
                coordinates.textContent = `New Coordinate for current region x=${x.toFixed(2)}, y=${y.toFixed(2)}`;
                this.practiceList.locatorMaps[this.locatorMapId].regions[this.currentRegionIndex].coordinates.push(coord);
            } else {
                console.log("New region!");
                const region = new Region(["Test-name"], [coord], "#aabbcc");
                this.currentRegion = region;
                this.currentRegionIndex = this.practiceList.locatorMaps[this.locatorMapId].regions.length;
                this.practiceList.locatorMaps[this.locatorMapId].regions.push(region);
                    // Update the status with the new region coordinates
                coordinates.textContent = `No current region, creating a new one with coordinate: x=${x.toFixed(2)}, y=${y.toFixed(2)}`;
            }

            context.fillStyle = "red";
            context.fillRect(x * canvas.width - iconSize / 2, y * canvas.height - iconSize / 2, iconSize, iconSize);

        }

        //this.savePracticeList();
    }


    loadPracticeList() {
        const urlParams = new URLSearchParams(window.location.search);
        const practiceListName = urlParams.get("localList");
        if (practiceListName) {
            this.practiceList = this.persistenceManager.getPracticeListByName(practiceListName);
            this.locatorMapId = urlParams.get("locatorMapId");
            this.currentRegion = null;

            const locatorMap = this.practiceList.locatorMaps[this.locatorMapId];
            document.querySelector("#locatorMapHeader").textContent = `Gloslista ${this.practiceList.name} Locator Map: ${locatorMap.name}`;
            document.querySelector("#imageUrlInput").value = locatorMap.imageUrl;
            this.loadAndSaveImage();
        }
    }

    setupImageLoadButton() {
        const loadImageButton = document.querySelector("#loadImageButton");
        loadImageButton.addEventListener("click", this.loadAndSaveImage.bind(this));
    }

    loadAndSaveImage() {
        const imageUrl = document.querySelector("#imageUrlInput").value;
        const imageContainer = document.querySelector("#imageContainer");
        imageContainer.classList.remove("error");
        imageContainer.innerHTML = "Loading...";

        if (imageUrl) {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            const backgroundImage = new Image();

            backgroundImage.onload = () => {
                canvas.width = backgroundImage.width;
                canvas.height = backgroundImage.height;
                context.drawImage(backgroundImage, 0, 0);

                imageContainer.innerHTML = "";
                imageContainer.appendChild(canvas);

                this.practiceList.locatorMaps[this.locatorMapId].imageUrl = imageUrl;
                this.savePracticeList();

                canvas.addEventListener("click", this.handleImageMouseUp.bind(this));
            };

            backgroundImage.onerror = () => {
                imageContainer.innerHTML = "Failed to load image.";
                imageContainer.classList.add("error");
            };

            backgroundImage.src = imageUrl;
        } else {
            this.practiceList.locatorMaps[this.locatorMapId].imageUrl = "";
            this.savePracticeList();
            imageContainer.innerHTML = "No image URL provided.";
        }
    }


    savePracticeList() {
        if (this.practiceList) {
            this.persistenceManager.savePracticeList(this.practiceList);
        }
    }

    setupGoBackButton() {
        const goBackButton = document.querySelector("#rehearsalButton");
        goBackButton.addEventListener("click", () => {
            window.location.href = `editlist.html?localList=${this.practiceList.name}`;
        });
    }
}

const controller = new EditLocatorMapView();

