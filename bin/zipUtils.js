const AdmZip = require("adm-zip");

const extractZip = (base64EncodedZip, path) => {
    if (!path.endsWith("/")) {
        path += "/";
    }

    const zipBuffer = Buffer.from(base64EncodedZip, "base64");
    const zip = new AdmZip(zipBuffer);

    zip.extractAllTo(path, true);
};

const createZip = (path) => {
    const zip = new AdmZip();
    zip.addLocalFolder(path);
    zip.deleteFile("modules/");
    zip.deleteFile("salescode_sdk/");
    zip.deleteFile("salescode.json");
    return zip.toBuffer();
};

module.exports = { extractZip, createZip };
