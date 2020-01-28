import * as loadYamlFile from 'load-yaml-file';
import * as hash from 'object-hash';
import * as fs from 'fs';

const getId = async (manifest: string) => {
  const filepathname = manifest;
  if (fs.existsSync(filepathname) === true) {
    const manifestContent = await loadYamlFile(manifest);
    const manifestHash = hash(manifestContent);
    console.log('Manifest Hash is: ' + manifestHash);
    return manifestHash;
  }
  console.log('ERROR: Could not fine manifest file: ' + filepathname);
  return undefined;
};

export default getId;
