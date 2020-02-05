import { exit } from '@oclif/errors';
import * as fs from 'fs';
import * as path from 'path';

import * as simpleGit from 'simple-git/promise';
import * as mvn from 'maven';
import * as xmljs from 'xml2js';

// https://gist.github.com/qwtel/fd82ab097cbe1db50ded9505f183ccb8
const getFiles = async (dir: string, searchStr: string) => {
  let allEntries: Array<string> = [];
  const dirContent = await fs.readdirSync(dir, { withFileTypes: true });
  for (const dirEntry of dirContent) {
    const filepath = path.resolve(dir, dirEntry.name);
    if (dirEntry.isDirectory()) {
      // eslint-disable-next-line no-await-in-loop
      const newScan: Array<string> = await getFiles(filepath, searchStr);
      allEntries = [...allEntries, ...newScan];
    } else if (filepath.includes(searchStr)) {
      allEntries.push(filepath);
    }
  }
  return allEntries;
};

/* eslint max-params: ["error", 5] */
const buildModule = async (
  directory: string,
  id: string,
  branch: string,
  repository: string,
) => {
  const dstDir = path.join(directory, id);

  if (fs.existsSync(dstDir)) {
    console.log('WARNING: Repository directory already exists: ' + dstDir);
  } else {
    console.log('Cloning git repository to: ' + dstDir);
    await simpleGit()
      .silent(true)
      .clone(repository, dstDir);
  }

  const git = simpleGit(dstDir);

  // Check if the directory is a git repository, if not, status is going to raise an exception
  let status = {};
  try {
    console.log('Displaying Git Status');
    status = await git.status();
    console.log(status);
  } catch (error) {
    console.log(
      'ERROR: Unable to identify git repsitory in the provided folder',
    );
    console.log(error);
    exit();
  }

  console.log('Git checkout branch and pull');
  // Checkout branch and pull
  await git.checkout(branch);
  await git.pull();

  console.log('Displaying Git Status');
  status = await git.status();
  console.log(status);

  const pomXml = path.join(dstDir, 'pom.xml');
  if (!fs.existsSync(pomXml)) {
    console.log('ERROR: Unable to locate pom.xml');
    exit();
  }

  // Read file content
  const pomStr = fs.readFileSync(pomXml);
  const pomObj = await xmljs.parseStringPromise(pomStr);

  // Some modules reference a set of submodules being built and that need to be imported into Jahia as well.
  console.log(pomObj);
  let profiles = [];
  if (
    pomObj.project.profiles !== undefined &&
    pomObj.project.profiles[0] !== undefined &&
    pomObj.project.profiles[0].profile
  ) {
    const defaultProfile = pomObj.project.profiles[0].profile.find((p: any) =>
      p.id.includes('default'),
    );
    if (
      defaultProfile !== undefined &&
      defaultProfile.modules[0] !== undefined &&
      defaultProfile.modules[0].module !== undefined
    ) {
      profiles = defaultProfile.modules[0].module;
    }
  }

  let moduleVersion = null;
  if (
    pomObj.project === undefined ||
    pomObj.project.version === undefined ||
    pomObj.project.version[0] === undefined
  ) {
    console.log('ERROR: Unable to detect module version from the pom.xml file');
    exit();
  } else {
    moduleVersion = pomObj.project.version[0];
  }

  // eslint-disable-next-line noImplicitAnyForClassMembers
  const mvnProject = mvn.create({ cwd: dstDir });
  //  console.log(mvnProject);
  console.log('Starting build');
  await mvnProject.execute(['clean', 'install'], {
    skipTests: true,
    quiet: true,
  });
  console.log('Build done');

  // We blindly look for generated jar files
  const jarFiles = await getFiles(dstDir, moduleVersion + '.jar');

  console.log(jarFiles);
  return jarFiles;
};

export default buildModule;
