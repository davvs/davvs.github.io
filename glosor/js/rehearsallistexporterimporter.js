class RehearsalListExporterImporter {
    constructor() {
        this.version = "00001";
        this.prefix = "gli";
        this.urlBase = "http://davvs.github.io/glos/import?data="; // Add your URL base here
    }

    exportRehearsalListQRCode(rehearsalList) {
        if (!rehearsalList) {
            throw new Error("Invalid argument. 'rehearsalList' must be provided.");
        }

        const serializedData = this.serializeRehearsalList(rehearsalList);
        const compressedData = this.getCompressedData(serializedData);
        const base64EncodedData = this.encodeBase64(compressedData);
        const prefixedData = this.prefix + this.version + base64EncodedData;
        const qrCodeData = this.urlBase + prefixedData;
        return qrCodeData;
    }

    importRehearsalListQRCode(data) {
        if (typeof data !== "string" || !data.startsWith(this.urlBase)) {
            throw new Error(
                "Invalid argument. 'data' must be a string and start with the correct URL base."
            );
        }

        const unprefixedData = data.slice(this.urlBase.length); // Remove URL base
        const version = unprefixedData.slice(0, 5); // Extract version from data
        const decodedData = this.decodeBase64(unprefixedData.slice(5)); // Remove version
        const decompressedData = this.getDecompressedData(decodedData);
        const rehearsalList = this.deserializeRehearsalList(decompressedData);
        return rehearsalList;
    }

    exportRehearsalListBase64(rehearsalList) {
        if (!rehearsalList) {
            throw new Error("Invalid argument. 'rehearsalList' must be provided.");
        }

        const serializedData = this.serializeRehearsalList(rehearsalList);
        const compressedData = this.getCompressedData(serializedData);
        const base64EncodedData = this.encodeBase64(compressedData);
        const prefixedData = this.prefix + this.version + base64EncodedData;
        return prefixedData;
    }

    importRehearsalListBase64(data) {
        if (typeof data !== "string" || data.length < 10 || !data.startsWith(this.prefix)) {
            throw new Error(
                "Invalid argument. 'data' must be a string with a minimum length of 10 and start with the correct prefix."
            );
        }

        const version = data.slice(3, 8); // Extract version from data
        const unprefixedData = data.slice(8); // Remove prefix and version
        const decodedData = this.decodeBase64(unprefixedData);
        const decompressedData = this.getDecompressedData(decodedData);
        const rehearsalList = this.deserializeRehearsalList(decompressedData);
        return rehearsalList;
    }

    getCompressedData(serializedData) {
        if (typeof serializedData !== "string") {
            throw new Error("Invalid argument. 'serializedData' must be a string.");
        }

        return LZString.compressToUTF16(serializedData);
    }

    getDecompressedData(decodedData) {
        if (typeof decodedData !== "string") {
            throw new Error("Invalid argument. 'decodedData' must be a string.");
        }

        return LZString.decompressFromUTF16(decodedData);
    }

    serializeRehearsalList(rehearsalList) {
        return JSON.stringify(rehearsalList);
    }

    deserializeRehearsalList(data) {
        if (typeof data !== "string") {
            throw new Error("Invalid argument. 'data' must be a string.");
        }

        return JSON.parse(data);
    }

    encodeBase64(data) {
        if (typeof data !== "string") {
            throw new Error("Invalid argument. 'data' must be a string.");
        }

        return btoa(data);
    }

    decodeBase64(data) {
        if (typeof data !== "string") {
            throw new Error("Invalid argument. 'data' must be a string.");
        }

        return atob(data);
    }
}

