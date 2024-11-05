import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class arabictextApi implements ICredentialType {
	name = 'arabictextApi';
	displayName = 'Arabictext Node API';
	// eslint-disable-next-line n8n-nodes-base/cred-class-field-documentation-url-not-http-url
	documentationUrl = '';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
	];

}
