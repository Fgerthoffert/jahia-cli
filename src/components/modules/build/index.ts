import { exit } from '@oclif/errors';
import * as fs from 'fs';
import * as path from 'path';

import * as simpleGit from 'simple-git/promise';
import * as mvn from 'maven';
import * as xmljs from 'xml2js';

/* eslint max-params: ["error", 5] */
const buildModule = async (
  directory: string,
  id: string,
  branch: string,
  repository: string,
  filpath: string,
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

  let artifactId = null;
  if (
    pomObj.project === undefined ||
    pomObj.project.artifactId === undefined ||
    pomObj.project.artifactId[0] === undefined
  ) {
    console.log(
      'ERROR: Unable to detect module artifact id from the pom.xml file',
    );
    exit();
  } else {
    artifactId = pomObj.project.artifactId[0];
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

  const artifactSrc = path.join(
    dstDir,
    'target/',
    artifactId + '-' + moduleVersion + '.jar',
  );

  if (!fs.existsSync(artifactSrc)) {
    console.log(
      'ERROR: Unable to detect the built artifact in the filesystem: ' +
        artifactSrc,
    );
    exit();
  }

  const artifactDst = path.join(filpath);
  console.log(
    'Copying artifact file from: ' + artifactSrc + ' to ' + artifactDst,
  );
  fs.copyFileSync(artifactSrc, artifactDst);
};

export default buildModule;
