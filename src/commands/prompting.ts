import { Command } from 'commander';
import { promptingGuide } from './prompting-guide.js';

export function createPromptingCommand(): Command {
	return new Command('prompting')
		.aliases(['prompt', 'guide', 'tips'])
		.description('Tips for better output')
		.action(() => {
			console.log(promptingGuide.trim());
		});
}
