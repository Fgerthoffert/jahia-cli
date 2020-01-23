import getModule from './get-module';

const isInstalled = async (
  page: any,
  moduleId: string,
  moduleVersion?: string | undefined,
) => {
  const moduleData = await getModule(page, moduleId);
  if (moduleVersion !== undefined) {
    if (
      moduleData.module === moduleId &&
      moduleData.version === moduleVersion
    ) {
      return true;
    }
    return false;
  }
  if (moduleData.module === moduleId) {
    return true;
  }
  return false;
};

export default isInstalled;
