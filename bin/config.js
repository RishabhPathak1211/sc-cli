const fs = require("fs");

const configFile = fs.readFileSync(__dirname + "/config.json");
const configData = JSON.parse(configFile);

const BASE_URL = configData.baseUrl;

module.exports = { BASE_URL };
