#! /usr/bin/env node

const yargs = require("yargs");
const { createTemplate } = require("./template");
const { installPackage, publishPackage } = require("./packageManager");
const { addDependency, updateDependencyPaths } = require("./yamlUtils");
const { login } = require("./auth");
const { BASE_URL } = require("./config");

const usage = "\nsalescode-cli <command> [arguments]";

const argv = yargs
    .usage(usage)
    .command({
        command: "login",
        describe: "Login to your Salescode account",
    })
    .command({
        command: "create [path]",
        describe: "Create a new project or package",
        builder: {
            template: {
                alias: "t",
                describe: "Template type (project or package)",
                demandOption: true,
                choices: ["project", "package"],
            },
            appType: {
                alias: "at",
                describe: "The type of project you want to build (EB2B, SFA, ONDC or Digivyapar)",
                choices: ["EB2B", "SFA", "ONDC", "Digivyapar"]
            }
        },
    })
    .command({
        command: "install [package]",
        describe: "Install a package",
    })
    .command({
        command: "uninstall [package]",
        describe: "Uninstall a package",
    })
    .command({
        command: "publish",
        describe:
            "Publish the project or package in the current root directory",
        builder: {
            packageName: {
                alias: "p",
                describe: "Package Name (must be unique)",
                demandCommand: true,
            }
        }
    })
    .demandCommand(1, "You need to specify at least one command")
    .help().argv;

const main = async (argv) => {
    const command = argv._[0];
    switch (command) {
        case "login": {
            await login();
            break;
        }
        case "create": {
            let path = ".";
            if (argv.path) {
                path = argv.path;
            }
            console.log("Creating template...");
            await createTemplate(path, argv.template, argv.appType);
            break;
        }
        case "install": {
            if (!argv.package) {
                console.error("Provide package name!");
                return;
            }
            console.log("Installation in progress...");
            await installPackage(argv.package);
            addDependency(argv.package);
            break;
        }
        case "publish": {
            if (!argv.packageName) {
                console.log("Package name is required");
                return;
            }
            console.log("Uploading package")
            await publishPackage(argv.packageName);
            break;
        }
    }
};

main(argv);
