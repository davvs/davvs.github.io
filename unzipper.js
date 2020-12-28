var Unzipper = (function () {

    // function successullyDecompressed(result) {
    //     console.log("Success!");
    //     console.log(result);
    // }
    // function failedToDecompress(error) {
    //     console.log("Failed!");
    //     console.log(error);
    // }

    function getAndUnzip(UriZipResource, successCallback, errorCallback) {
        console.log("Getting " + UriZipResource);
        $.ajax({
        url: UriZipResource,
        type: "GET",
        dataType: "binary",
        processData: false,
        error: () => {
            errorCallback();
        },
        success: function(binaryData){
            let new_zip = new JSZip();
            new_zip.loadAsync(binaryData)
                .then(function(zip) {
                    // you now have every files contained in the loaded zip
                    if (Object.keys(new_zip.files).length > 1) {
                        throw new "Invalid amount of files in zip file " + UriZipResource;
                    }
                    let fileNameInZip = Object.keys(new_zip.files);
                    console.log("Getting file from within zip " + fileNameInZip);
                    let promise = new_zip.file(fileNameInZip).async("string");
                    promise.then(successCallback, () => {
                        console.log("promise failed");
                        errorCallback();
                    });
                });
        }
        });
    }

    return {
        getAndUnzip: getAndUnzip,
    };
    
})();

