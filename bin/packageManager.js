const fs = require("fs");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const { extractZip, createZip } = require("./zipUtils");
const { fetchZip, uploadZip } = require("./networkUtils");
const { mergeAndDeduplicate } = require("./arrayUtils");
const { updateDependencyPaths } = require("./yamlUtils");

const installPackage = async (packageName, path) => {
    const pathList = [];
    const packageBufferData = await fetchZip(packageName);
    for (let packageBuffer of packageBufferData) {
        const packagePath = `${path ? path : "."}/modules/${
            packageBuffer.packageName
        }`;
        extractZip(packageBuffer.buffer, packagePath);
        updateDependencyPaths(`${packagePath}/pubspec.yaml`);
        pathList.push(packagePath);
    }
    
    for (let packagePath of pathList) {
        await exec(`cd ${packagePath} && flutter pub get`);
    }

    updateDependencyList(
        packageBufferData.map((packageBuffer) => packageBuffer.packageName)
    );
};

const publishPackage = async (packageName) => {
    const zipBuffer = createZip(".");
    const dependencies = fetchDependencyList(".");
    await uploadZip(zipBuffer, packageName, dependencies);
};

const updateDependencyList = (newDependencyList) => {
    const existingDependencies = fetchDependencyList();

    const dependencyData = fs.readFileSync("./salescode.json");
    const projectInfo = JSON.parse(dependencyData);

    projectInfo.dependencies = mergeAndDeduplicate(
        existingDependencies,
        newDependencyList
    );
    fs.writeFileSync(
        "./salescode.json",
        JSON.stringify(projectInfo, null, "\t")
    );
};

const fetchDependencyList = () => {
    const dependencyData = fs.readFileSync("./salescode.json");
    const projectInfo = JSON.parse(dependencyData);

    return projectInfo.dependencies;
};

module.exports = { installPackage, publishPackage };
