define([], function(){

    var saveFile = {
        saveArray: function (array, filename) {
            var result = "";
            for (var i = 0; i < array.length; i++) {
                var item = array[i];
                if (typeof item == "string") {
                    result += item + "\n";
                } else {
                    result += JSON.stringify(item) + "\n";
                }
            }
            this.save(result, filename);
        },


        save: function (value, filename) {
            this.doSave(value, "text/latex", filename);
        },


        doSave: function (value, type, name) {
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
    }

    return saveFile;
})