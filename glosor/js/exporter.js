// Define the Protocol Buffers schema using protobuf.js
const schema = `
syntax = "proto3";

message Glos {
  repeated string words = 1;
  repeated string translations = 2;
  repeated string clues = 3;
  repeated string translationClues = 4;
}

message PracticeList {
  string name = 1;
  repeated Glos gloses = 2;
  string wordsDomain = 3;
  string translationDomain = 4;
}
`;

// Convert the schema into a JSON object
const schemaObject = protobuf.parse(schema).root.toJSON();

// Create a Protocol Buffers root instance
const root = protobuf.Root.fromJSON(schemaObject);

// Get the PracticeList message type
const ProtoPracticeList = root.lookupType("PracticeList");

// Define the Exporter class
class Exporter {
    static urlcompress(practiceList) {
        // Validate and encode the PracticeList message
        const errorMessage = ProtoPracticeList.verify(practiceList);
        if (errorMessage) {
            throw new Error(`PracticeList verification failed: ${errorMessage}`);
        }
        const message = ProtoPracticeList.create(practiceList);
        const buffer = ProtoPracticeList.encode(message).finish();
        const base64 = Exporter.encodeBase64(buffer);

        const bufferSize = buffer.byteLength;
        console.log(`Buffer size: ${bufferSize} bytes`);

        // Print the size of the PracticeList data as JSON
        const jsonDataSize = JSON.stringify(practiceList).length;
        console.log(`PracticeList data size as JSON: ${jsonDataSize} bytes`);

        // Compress the base64-encoded data
        const compressedData = LZString.compressToEncodedURIComponent(base64);

        // Print the size of the compressed data
        const compressedDataSize = compressedData.length;
        console.log(`Compressed data size: ${compressedDataSize} bytes`);

        // Return the compressed data
        return compressedData;
    }


    static encodeBase64(buffer) {
        const encoder = new TextEncoder();
        const data = encoder.encode(buffer);
        const base64 = btoa(String.fromCharCode.apply(null, data));
        return base64;
    }

    static decodeBase64(base64) {
        const decodedData = atob(base64);
        const decoder = new TextDecoder();
        const buffer = decoder.decode(decodedData);
        return buffer;
    }

    static urldecompress(compressedData) {
        // Decompress the data
        const base64 = LZString.decompressFromEncodedURIComponent(compressedData);

        // Decode the base64-encoded data
        const buffer = Exporter.decodeBase64(base64);

        // Decode the PracticeList message
        const decodedMessage = ProtoPracticeList.decode(buffer);
        const practiceList = ProtoPracticeList.toObject(decodedMessage, {
            longs: String,
            enums: String,
            bytes: String,
            defaults: true,
            arrays: true,
            objects: true,
            oneofs: true,
        });

        // Return the decoded PracticeList
        return practiceList;
    }
}
