const fs = require("fs-extra");
const xml2js = require("xml2js");
const path = require("path");
require("dotenv").config();

const folderPath = process.env.MOBJECT_PATH;

let latestVersions = {};

async function parsePLCProjFiles(parser) {
  try {
    const files = await getAllFiles(folderPath);

    const plcprojFiles = files.filter((file) => file.endsWith(".plcproj"));
    for (let file of plcprojFiles) {
      const content = await fs.readFile(file, "utf-8");
      parser(content);
    }
  } catch (error) {
    console.error("Error reading files:", error);
  }
}

async function getAllFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = entries.map((entry) => {
    const res = path.resolve(dir, entry.name);
    return entry.isDirectory() ? getAllFiles(res) : res;
  });
  return Array.prototype.concat(...(await Promise.all(files)));
}

async function parseXMLVersions(xmlContent) {
  try {
    const parser = new xml2js.Parser();
    parser.parseString(xmlContent, (err, result) => {
      if (err) {
        throw err;
      }

      if (
        !result.Project ||
        !result.Project.PropertyGroup ||
        !result.Project.PropertyGroup[0].Title ||
        !result.Project.PropertyGroup[0].Title[0] ||
        !result.Project.PropertyGroup[0].ProjectVersion ||
        !result.Project.PropertyGroup[0].ProjectVersion[0]
      ) {
        return;
      }

      const title = result.Project.PropertyGroup[0].Title[0];
      const projectVersion = result.Project.PropertyGroup[0].ProjectVersion[0];
      latestVersions[title] = projectVersion;
    });
  } catch (error) {
    console.error("Error parsing XML:", error);
  }
}

async function parseXML(xmlContent) {
  try {
    const parser = new xml2js.Parser();
    parser.parseString(xmlContent, (err, result) => {
      if (err) {
        throw err;
      }

      if (
        !result.Project ||
        !result.Project.PropertyGroup ||
        !result.Project.PropertyGroup[0].Title ||
        !result.Project.PropertyGroup[0].Title[0] ||
        !result.Project.PropertyGroup[0].ProjectVersion ||
        !result.Project.PropertyGroup[0].ProjectVersion[0]
      ) {
        return;
      }

      const title = result.Project.PropertyGroup[0].Title[0];
      const projectVersion = result.Project.PropertyGroup[0].ProjectVersion[0];
      console.log("Project:", title, "Version:", projectVersion);

      const libraries = result.Project.ItemGroup.filter(
        (ig) => ig.LibraryReference
      ).flatMap((ig) =>
        ig.LibraryReference.map((lib) => ({
          name: lib.$.Include.split(",")[0],
          version: lib.$.Include.split(",")[1],
          namespace: lib.Namespace ? lib.Namespace[0] : undefined,
        }))
      );

      displayLibraries(libraries, "");
      console.log();
    });
  } catch (error) {
    console.error("Error parsing XML:", error);
  }
}

function displayLibraries(libraries, prefix) {
  libraries.forEach((lib, index) => {
    const isLast = index === libraries.length - 1;
    const latestVersion = latestVersions[lib.name];
    const versionOutdated = latestVersion && lib.version !== latestVersion;

    const displayLine = `${prefix}${isLast ? "└─" : "├─"} ${lib.name} (v${
      lib.version
    })${versionOutdated ? " - OUTDATED" : ""}`;

    if (versionOutdated) {
      console.log(`\x1b[31m${displayLine}\x1b[0m`);
    } else {
      console.log(displayLine);
    }
  });
}

async function run() {
  await parsePLCProjFiles(parseXMLVersions);
  await parsePLCProjFiles(parseXML);
}

run();
