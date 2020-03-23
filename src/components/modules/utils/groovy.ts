export const enableModule = `
	import org.jahia.services.content.JCRCallback
	import org.jahia.services.content.JCRSessionWrapper
	import org.jahia.services.content.JCRTemplate
	import org.jahia.services.templates.JahiaTemplateManagerService;

	import javax.jcr.RepositoryException

	JCRCallback<Object> callback = new JCRCallback<Object>() {
		@Override
		Object doInJCR(JCRSessionWrapper session) throws RepositoryException {
			JahiaTemplateManagerService jahiaTemplateManagerService = (JahiaTemplateManagerService) SpringContextSingleton.getBean("JahiaTemplateManagerService");
			
			jahiaTemplateManagerService.installModule(jahiaTemplateManagerService.getAnyDeployedTemplatePackage('MODULEID'), '/sites/SITEID/', session);
			session.save()
		}
	}
	JCRTemplate.instance.doExecuteWithSystemSession(callback);	
`;

export const disableModule = `
	import org.jahia.services.content.JCRCallback
	import org.jahia.services.content.JCRSessionWrapper
	import org.jahia.services.content.JCRTemplate
	import org.jahia.services.templates.JahiaTemplateManagerService;

	import javax.jcr.RepositoryException

	JCRCallback<Object> callback = new JCRCallback<Object>() {
		@Override
		Object doInJCR(JCRSessionWrapper session) throws RepositoryException {
			JahiaTemplateManagerService jahiaTemplateManagerService = (JahiaTemplateManagerService) SpringContextSingleton.getBean("JahiaTemplateManagerService");
			
			jahiaTemplateManagerService.uninstallModule(jahiaTemplateManagerService.getAnyDeployedTemplatePackage('MODULEID'), '/sites/SITEID/', session);
			session.save()
		}
	}
	JCRTemplate.instance.doExecuteWithSystemSession(callback);	
`;
