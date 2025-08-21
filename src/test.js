import OpenRouterClient from './openrouter.js';
import { config } from './config.js';
import chalk from 'chalk';
import ora from 'ora';

class ModelTester {
  constructor() {
    this.client = new OpenRouterClient();
  }

  async testModel(modelId, prompt) {
    console.log(chalk.blue.bold('🧪 Model Test\n'));
    
    if (!config.openrouter.apiKey) {
      console.log(chalk.red('❌ OPENROUTER_API_KEY not found in environment variables'));
      console.log(chalk.yellow('Please set your OpenRouter API key in the .env file'));
      return;
    }

    const model = config.models.find(m => m.id === modelId);
    if (!model) {
      console.log(chalk.red(`❌ Model ${modelId} not found in configuration`));
      console.log(chalk.yellow('Available models:'));
      config.models.forEach(m => console.log(chalk.gray(`  - ${m.id}`)));
      return;
    }

    console.log(chalk.cyan(`Model: ${model.name} (${model.provider})`));
    console.log(chalk.cyan(`Prompt: "${prompt}"\n`));

    const spinner = ora('Generating response...').start();
    const startTime = Date.now();
    
    const result = await this.client.generateText(modelId, prompt);
    const responseTime = Date.now() - startTime;
    
    spinner.stop();

    if (result.success) {
      console.log(chalk.green('✓ Success!\n'));
      console.log(chalk.yellow('Response:'));
      console.log(chalk.white(result.content));
      console.log(chalk.gray(`\nResponse time: ${responseTime}ms`));
      console.log(chalk.gray(`Tokens used: ${result.usage?.total_tokens || 'N/A'}`));
      console.log(chalk.gray(`Prompt tokens: ${result.usage?.prompt_tokens || 'N/A'}`));
      console.log(chalk.gray(`Completion tokens: ${result.usage?.completion_tokens || 'N/A'}`));
    } else {
      console.log(chalk.red('✗ Failed'));
      console.log(chalk.red(`Error: ${result.error}`));
      if (result.status) {
        console.log(chalk.red(`Status: ${result.status}`));
      }
    }
  }

  async interactiveTest() {
    console.log(chalk.blue.bold('🧪 Interactive Model Test\n'));
    
    if (!config.openrouter.apiKey) {
      console.log(chalk.red('❌ OPENROUTER_API_KEY not found in environment variables'));
      console.log(chalk.yellow('Please set your OpenRouter API key in the .env file'));
      return;
    }

    console.log(chalk.cyan('Available models:'));
    config.models.forEach((model, index) => {
      console.log(chalk.gray(`  ${index + 1}. ${model.name} (${model.provider}) - ${model.id}`));
    });

    const testPrompts = [
      'Explain quantum computing in simple terms.',
      'Write a Python function to sort a list.',
      'What are the benefits of renewable energy?',
      'Create a short story about time travel.',
    ];

    console.log(chalk.cyan('\nTest prompts:'));
    testPrompts.forEach((prompt, index) => {
      console.log(chalk.gray(`  ${index + 1}. "${prompt}"`));
    });

    for (const model of config.models) {
      console.log(chalk.blue.bold(`\n--- Testing ${model.name} ---`));
      
      for (const prompt of testPrompts) {
        console.log(chalk.yellow(`\nPrompt: "${prompt}"`));
        
        const spinner = ora('Generating...').start();
        const startTime = Date.now();
        
        const result = await this.client.generateText(model.id, prompt);
        const responseTime = Date.now() - startTime;
        
        spinner.stop();

        if (result.success) {
          console.log(chalk.green('✓ Success'));
          console.log(chalk.gray(`Time: ${responseTime}ms | Tokens: ${result.usage?.total_tokens || 'N/A'}`));
          console.log(chalk.white(result.content.substring(0, 200) + '...'));
        } else {
          console.log(chalk.red('✗ Failed'));
          console.log(chalk.red(`Error: ${result.error}`));
        }
      }
    }
  }
}

const args = process.argv.slice(2);
const tester = new ModelTester();

if (args.length >= 2) {
  const [modelId, ...promptParts] = args;
  const prompt = promptParts.join(' ');
  tester.testModel(modelId, prompt);
} else {
  tester.interactiveTest();
} 