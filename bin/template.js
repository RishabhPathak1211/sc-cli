const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
const { extractZip } = require("./zipUtils");
const { fetchTemplate } = require("./networkUtils");
const { fetchConsumerKey } = require("./auth");
const { installPackage } = require("./packageManager");
const { addDependency, add, addSdkDependency } = require("./yamlUtils");

const preInstallationMapping = {
    EB2B: ["order", "banner", "baskets", "catalogue"],
    SFA: ["order", "recommendations", "attendance"],
    Digivyapar: ["catalogue", "consumer_flow"],
    ONDC: [],
};

const createTemplate = async (path, template, appType) => {
    const consumerKey = fetchConsumerKey();

    if (!consumerKey) {
        console.log("Login Required");
        return;
    }

    try {
        await exec(
            `flutter create ${
                template === "package" ? "--template=package" : ""
            } ${path}`
        );
        const salescodeSdkBuffer = await fetchTemplate("sdk");
        extractZip(salescodeSdkBuffer, path);
        await exec(
            `cd ${path} && rm -rf __MACOSX && mkdir modules && cd salescode_sdk && flutter pub get`
        );
        addSdkDependency(path);
        const salescodeDependenciesJSON = {
            dependencies: [],
        };
        fs.writeFileSync(
            `${path}${path.endsWith('/') ? '' : '/'}salescode.json`,
            JSON.stringify(salescodeDependenciesJSON, null, '\t')
        );
        await exec(`cd ${path} && flutter pub get`);
    } catch (error) {
        console.log(error);
    }
};

module.exports = { createTemplate };
