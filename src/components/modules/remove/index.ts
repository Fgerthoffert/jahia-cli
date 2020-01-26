import getModule from '../utils/get-module';

const removeModule = async (page: any, moduleId: string) => {
  // Only remove if the module exists
  const moduleExists = await getModule(page, moduleId);
  console.log(moduleExists);
  if (moduleExists === undefined) {
    console.log('Module: ' + moduleId + ' is not installed, cannot be removed');
  } else {
    console.log('TODO: Add remove feature');
    console.log('TODO: Add remove feature');
    console.log('TODO: Add remove feature');
    console.log('TODO: Add remove feature');
    console.log('TODO: Add remove feature');
    console.log('TODO: Add remove feature');
    console.log('TODO: Add remove feature');
  }
};

export default removeModule;
