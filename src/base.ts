import Command, { flags } from '@oclif/command';

export default abstract class extends Command {
  static flags = {
    jahiaAdminUrl: flags.string({
      required: true,
      env: 'JAHIA_ADMIN_URL',
      default: 'http://localhost:8080',
      description: 'Jahia Administrator interface URL',
    }),
    jahiaAdminUsername: flags.string({
      required: true,
      env: 'JAHIA_ADMIN_USERNAME',
      default: 'root',
      description: 'Jahia Administrator interface Username',
    }),
    jahiaAdminPassword: flags.string({
      required: true,
      env: 'JAHIA_ADMIN_PASSWORD',
      default: 'root',
      description: 'Jahia Administrator interface Password',
    }),
    jahiaToolsUsername: flags.string({
      required: true,
      env: 'JAHIA_TOOLS_USERNAME',
      default: 'jahia',
      description: 'Jahia Tools (modules/tools) Username',
    }),
    jahiaToolsPassword: flags.string({
      required: true,
      env: 'JAHIA_TOOLS_PASSWORD',
      default: 'password',
      description: 'Jahia Tools Password',
    }),
    dockerRegistryUsername: flags.string({
      required: true,
      env: 'DOCKER_REGISTRY_USERNAME',
      default: 'username',
      description: 'Docker registry (i.e. docker hub) username',
    }),
    dockerRegistryPassword: flags.string({
      required: true,
      env: 'DOCKER_REGISTRY_PASSWORD',
      default: 'password',
      description: 'Docker registry (i.e. docker hub) password',
    }),
    debug: flags.boolean({
      char: 'd',
      description: 'Enable debug mode (display chrome browser)',
    }),
  };
}
