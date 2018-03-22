function read(filename, callback) {
    liteAjax(filename, function(d) {
        if (callback) {
            callback.call(this, d);
        }
    });
}

function readFiles(filenames, callback) {
    var result = "";

    readFilesInner(0);

    function readFilesInner(index) {
        if (index >= filenames.length) {
            if (callback) {
                callback.call(this, result);
                return;
            }
        }

        var filename = filenames[index];
        read(filename, function(d) {
            result += d + "\n";

            readFilesInner(index + 1);
        });
    }
}

var input;
var importFileCallback;
function importFile(callback) {
    importFileCallback = callback;

    input = document.createElement("input");
    input.setAttribute("type", "file");
    input.style.display = "none";
    input.setAttribute("onchange", "importFileInner();");

    input.click();
}


function importFileInner() {
    var selectedFile = input.files[0];
    var name = selectedFile.name;
    var size = selectedFile.size;
    console.log("文件名:" + name + " 大小：" + size);

    var reader = new FileReader();
    reader.readAsText(selectedFile);

    reader.onload = function() {
        if (importFileCallback) {
            var result = {};
            result.name = selectedFile.name;
            result.size = selectedFile.size;
            result.data = this.result;
            importFileCallback.call(this, result);
        }
    };
}


function saveArray(array, filename) {
    var result = "";
    for (var i = 0; i < array.length; i++) {
        var item = array[i];
        if (typeof item == "string") {
            result += item + "\n";
        } else {
            result += JSON.stringify(item) + "\n";
        }
    }
    save(result, filename);
}

function save(value, filename) {
    doSave(value, "text/latex", filename);
}

function doSave(value, type, name) {
    var blob;
    if (typeof window.Blob == "function") {
        blob = new Blob([value], {type: type});
    } else {
        var BlobBuilder = window.BlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder;
        var bb = new BlobBuilder();
        bb.append(value);
        blob = bb.getBlob(type);
    }
    var URL = window.URL || window.webkitURL;
    var bloburl = URL.createObjectURL(blob);
    var anchor = document.createElement("a");
    if ('download' in anchor) {
        anchor.style.visibility = "hidden";
        anchor.href = bloburl;
        anchor.download = name;
        document.body.appendChild(anchor);
        var evt = document.createEvent("MouseEvents");
        evt.initEvent("click", true, true);
        anchor.dispatchEvent(evt);
        document.body.removeChild(anchor);
    } else if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, name);
    } else {
        location.href = bloburl;
    }
}


