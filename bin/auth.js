const readLine = require("readline");
const axios = require("axios");
const os = require("os");
const fs = require("fs");
const path = require("path");
const { BASE_URL } = require("./config");


const login = async () => {
    try {
        const rl = readLine.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        
        function takeInput(query) {
            return new Promise((resolve) => rl.question(query, resolve));
        }

        const username = await takeInput("Username: ");
        const password = await takeInput("Password: ");
        rl.close();

        const response = await axios({
            method: "POST",
            url: `${BASE_URL}/user/login`,
            data: {
                username,
                password,
            },
        });

        if (response.data.token) {
            const userResponse = await axios({
                method: "GET",
                url: `${BASE_URL}/user`,
                headers: {
                    Authorization: "Bearer " + response.data.token,
                },
            });

            const { consumerKey } = userResponse.data;

            const homeDir = os.homedir();
            const filePath = path.join(homeDir, ".salescode");

            fs.writeFileSync(
                filePath,
                `USERNAME: ${username}` + "\n" + `CONSUMER_KEY: ${consumerKey}`,
                { encoding: "utf8", flag: "w" }
            );

            console.log("Login Successful!!");
        }
    } catch (e) {
        console.log(e);
    }
};

const fetchConsumerKey = () => {
    const homeDir = os.homedir();
    const filePath = path.join(homeDir, ".salescode");

    if (fs.existsSync(filePath)) {
        const userDataString = fs.readFileSync(filePath, {
            encoding: "utf-8",
        });

        const userDataArray = userDataString.split('\n');

        const user = {};

        for (let userData of userDataArray) {
            const fieldArray = userData.split(': ');
            user[fieldArray[0]] = fieldArray[1];
        }

        return user.CONSUMER_KEY;
    }

    return null;
};

module.exports = { login, fetchConsumerKey };
