const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");

const addDependency = (packageName, package) => {
    const doc = yaml.load(
        fs.readFileSync(`${package ? package : "."}/pubspec.yaml`, "utf8")
    );
    doc.dependencies[packageName] = {
        path: `./modules/${packageName}`,
    };
    fs.writeFileSync(`${package ? package : "."}/pubspec.yaml`, yaml.dump(doc));
};

const addSdkDependency = (path) => {
    const pubspecPath = `${path}${path.endsWith("/") ? "" : "/"}pubspec.yaml`;
    const doc = yaml.load(fs.readFileSync(pubspecPath, "utf-8"));
    doc.dependencies["salescode_sdk"] = {
        path: "./salescode_sdk",
    };
    doc.publish_to = "none";
    fs.writeFileSync(pubspecPath, yaml.dump(doc));
};

const updateDependencyPaths = (pubspecPath) => {
    const doc = yaml.load(fs.readFileSync(pubspecPath, "utf8"));
    for (let key in doc.dependencies) {
        if (doc.dependencies[key].hasOwnProperty("path")) {
            const salescodeModule = getSalescodeModule(
                doc.dependencies[key]["path"]
            );
            if (salescodeModule) {
                doc.dependencies[key]["path"] = `../${salescodeModule}`;
            }
        }
    }
    doc.dependencies['salescode_sdk']['path'] = '../../salescode_sdk';
    fs.writeFileSync(pubspecPath, yaml.dump(doc));
};

const getSalescodeModule = (dependencyPath) => {
    const pathParts = dependencyPath.split("/");
    if (pathParts.indexOf("modules") != -1) {
        return pathParts[pathParts.length - 1];
    }
    return null;
};

module.exports = { addDependency, updateDependencyPaths, addSdkDependency };
