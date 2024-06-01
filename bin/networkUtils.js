const axios = require("axios");
const { fetchConsumerKey } = require("./auth");
const { BASE_URL } = require("./config");

const fetchZip = async (packageName) => {
    const consumerKey = fetchConsumerKey();

    if (!consumerKey) {
        console.log("Login Required");
        return;
    }

    const response = await axios({
        method: "GET",
        url: `${BASE_URL}/package/${packageName}`,
        headers: {
            consumerKey,
        },
    });

    return response.data.packageBuffer;
};

const uploadZip = async (zipBuffer, packageName, dependencyList = []) => {
    const consumerKey = fetchConsumerKey();

    if (!consumerKey) {
        console.log("Login Required");
        return;
    }

    const currentDirectory = process.cwd();
    const currentDirectoryArr = currentDirectory.split("/");
    const rootName = currentDirectoryArr[currentDirectoryArr.length - 1];

    const formData = new FormData();
    formData.append("file", new Blob([zipBuffer]), rootName + ".zip");
    formData.append("packageName", packageName);
    
    for (let dependency of dependencyList) {
        formData.append("dependencyList[]", dependency);
    }
    
    const response = await axios({
        method: "POST",
        url: `${BASE_URL}/package/upload`,
        data: formData,
        headers: {
            "Content-Type": "multipart/form-data",
            consumerKey,
        },
    });

    return response;
};

const fetchTemplate = async (templateType) => {
    const consumerKey = fetchConsumerKey();

    if (!consumerKey) {
        console.log("Login Required");
        return;
    }

    const response = await axios({
        method: "GET",
        url: `${BASE_URL}/template/${templateType}`,
        headers: {
            consumerKey,
        },
    });

    return response.data.templateBuffer;
};

module.exports = { fetchZip, uploadZip, fetchTemplate };
