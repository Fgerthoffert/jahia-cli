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
    debug: flags.boolean({
      char: 'd',
      description: 'Enable debug mode (display chrome browser)',
    }),
  };
}
