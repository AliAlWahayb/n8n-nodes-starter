/* eslint-disable n8n-nodes-base/node-class-description-outputs-wrong */
/* eslint-disable n8n-nodes-base/node-class-description-inputs-wrong-regular-node */
import { parse as pathParse } from 'path';
import { createCanvas, loadImage } from 'canvas';
import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeProperties,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType  } from 'n8n-workflow';
import getSystemFonts from 'get-system-fonts';

// Remove the gm import as we're using canvas instead

const nodeOperations: INodePropertyOptions[] = [
	{
		name: 'Text',
		value: 'text',
		description: 'Adds text to image',
		action: 'Apply Text to Image',
	}
];

const nodeOperationOptions: INodeProperties[] = [
	// ----------------------------------
	//         text
	// ----------------------------------
	{
		displayName: 'Text',
		name: 'text',
		typeOptions: {
			rows: 5,
		},
		type: 'string',
		default: '',
		placeholder: 'Text to render',
		displayOptions: {
			show: {
				operation: ['text'],
			},
		},
		description: 'Text to write on the image',
	},
	{
		displayName: 'Font Size',
		name: 'fontSize',
		type: 'number',
		default: 18,
		displayOptions: {
			show: {
				operation: ['text'],
			},
		},
		description: 'Size of the text',
	},
	{
		displayName: 'Font Color',
		name: 'fontColor',
		type: 'color',
		default: '#000000',
		displayOptions: {
			show: {
				operation: ['text'],
			},
		},
		description: 'Color of the text',
	},
	{
		displayName: 'Position X',
		name: 'positionX',
		type: 'number',
		default: 50,
		displayOptions: {
			show: {
				operation: ['text'],
			},
		},
		description: 'X (horizontal) position of the text',
	},
	{
		displayName: 'Position Y',
		name: 'positionY',
		type: 'number',
		default: 50,
		displayOptions: {
			show: {
				operation: ['text'],
			},
		},
		description: 'Y (vertical) position of the text',
	},
	{
		displayName: 'Max Line Length',
		name: 'lineLength',
		type: 'number',
		typeOptions: {
			minValue: 1,
		},
		default: 80,
		displayOptions: {
			show: {
				operation: ['text'],
			},
		},
		description: 'Max amount of characters in a line before a line-break should get added',
	},
];

export class arabictext implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'arabictext',
		name: 'arabictext',
		icon: 'file:Arabictext.svg',
		group: ['transform'],
		version: 1,
		description: 'Edits an image like blur, resize or adding border and text',
		defaults: {
			name: 'arabictext',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Multi Step',
						value: 'multiStep',
						description: 'Perform multiple operations',
					},
					...nodeOperations,
				].sort((a, b) => {
					if (a.name.toLowerCase() < b.name.toLowerCase()) {
						return -1;
					}
					if (a.name.toLowerCase() > b.name.toLowerCase()) {
						return 1;
					}
					return 0;
				}),
				default: '',
			},
			{
				displayName: 'Property Name',
				name: 'dataPropertyName',
				type: 'string',
				default: 'data',
				description: 'Name of the binary property in which the image data can be found',
			},

			// ----------------------------------
			//         multiStep
			// ----------------------------------
			{
				displayName: 'Operations',
				name: 'operations',
				placeholder: 'Add Operation',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				displayOptions: {
					show: {
						operation: ['multiStep'],
					},
				},
				description: 'The operations to perform',
				default: {},
				options: [
					{
						name: 'operations',
						displayName: 'Operations',
						values: [
							{
								displayName: 'Operation',
								name: 'operation',
								type: 'options',
								noDataExpression: true,
								options: nodeOperations,
								default: '',
							},
							...nodeOperationOptions,
							{
								displayName: 'Font Name or ID',
								name: 'font',
								type: 'options',
								displayOptions: {
									show: {
										operation: ['text'],
									},
								},
								typeOptions: {
									loadOptionsMethod: 'getFonts',
								},
								default: '',
								description: 'The font to use. Defaults to Arial. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
							},
						],
					},
				],
			},

			...nodeOperationOptions,
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add option',
				default: {},
				displayOptions: {
					hide: {
						operation: ['information'],
					},
				},
				options: [
					{
						displayName: 'Font Name or ID',
						name: 'font',
						type: 'options',
						displayOptions: {
							show: {
								'/operation': ['text'],
							},
						},
						typeOptions: {
							loadOptionsMethod: 'getFonts',
						},
						default: '',
						description: 'The font to use. Defaults to Arial. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code-examples/expressions/">expression</a>.',
					},
				],
			},
		],
	};

	methods = {
		loadOptions: {
			async getFonts(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const files = await getSystemFonts();
				const returnData: INodePropertyOptions[] = [];

				files.forEach((entry: string) => {
					const pathParts = pathParse(entry);
					if (!pathParts.ext) {
						return;
					}

					returnData.push({
						name: pathParts.name,
						value: entry,
					});
				});

				returnData.sort((a, b) => {
					if (a.name < b.name) {
						return -1;
					}
					if (a.name > b.name) {
						return 1;
					}
					return 0;
				});

				return returnData;
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const length = items.length;


		for (let itemIndex = 0; itemIndex < length; itemIndex++) {
			try {
				const item = items[itemIndex];
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				const dataPropertyName = this.getNodeParameter('dataPropertyName', itemIndex) as string;
				const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;

				const operationsData = this.getNodeParameter('operations', itemIndex, {
					operations: [],
				}) as IDataObject;
				const operations = operation === 'multiStep' ? operationsData.operations as IDataObject[] : [{
					operation,
					...(options as IDataObject),
				}];

				const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(itemIndex, dataPropertyName);
				const image = await loadImage(binaryDataBuffer);
				const canvas = createCanvas(image.width, image.height);
				const ctx = canvas.getContext('2d');
				ctx.drawImage(image, 0, 0);

				for (const operationData of operations) {
					if (operationData.operation === 'text') {
						const text = operationData.text as string || '';
						const lines: string[] = [];
						let currentLine = '';

						// Split the text only if it is defined and not an empty string
						text.split('\n').forEach((textLine: string) => {
							textLine.split(' ').forEach((textPart: string) => {
								if (currentLine.length + textPart.length + 1 > (operationData.lineLength as number)) {
									lines.push(currentLine.trim());
									currentLine = `${textPart} `;
								} else {
									currentLine += `${textPart} `;
								}
							});
							lines.push(currentLine.trim());
							currentLine = '';
						});

						const renderText = lines.join('\n');
						ctx.fillStyle = (operationData.fontColor || '#000').toString();
						ctx.font = `${operationData.fontSize || 18}px ${operationData.font || 'Arial'}`;
						ctx.textAlign = 'right';
						ctx.fillText(renderText, operationData.positionX as number || 50, operationData.positionY as number || 50);
					}

				}

				const buffer = canvas.toBuffer();
				const binaryData = await this.helpers.prepareBinaryData(buffer);
				const newItem: INodeExecutionData = {
					json: item.json,
					binary: {
						[dataPropertyName]: binaryData,
					},
					pairedItem: {
						item: itemIndex,
					},
				};

				returnData.push(newItem);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
						pairedItem: {
							item: itemIndex,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
