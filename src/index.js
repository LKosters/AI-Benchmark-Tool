import BenchmarkEngine from './benchmark.js';
import OpenRouterClient from './openrouter.js';
import { config } from './config.js';
import chalk from 'chalk';
import ora from 'ora';

class BenchmarkCLI {
  constructor() {
    this.benchmarkEngine = new BenchmarkEngine();
    this.client = new OpenRouterClient();
  }

  async start() {
    console.log(chalk.blue.bold('🚀 AI Model Benchmark Tool\n'));

    if (!config.openrouter.apiKey) {
      console.log(chalk.red('❌ OPENROUTER_API_KEY not found in environment variables'));
      console.log(chalk.yellow('Please create a .env file with your OpenRouter API key:'));
      console.log(chalk.gray('OPENROUTER_API_KEY=your_api_key_here\n'));
      console.log(chalk.cyan('Get your API key from: https://openrouter.ai/keys'));
      return;
    }

    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      await this.showMenu();
    } else {
      await this.handleCommand(args);
    }
  }

  async showMenu() {
    console.log(chalk.cyan('Available commands:'));
    console.log(chalk.gray('  npm run benchmark  - Run full benchmark on all models'));
    console.log(chalk.gray('  npm start          - Show this menu'));
    console.log(chalk.gray('  npm test           - Test single model'));
    console.log('');
    
    console.log(chalk.yellow('Or run directly:'));
    console.log(chalk.gray('  node src/benchmark.js  - Run benchmark'));
    console.log(chalk.gray('  node src/test.js       - Test single model'));
  }

  async handleCommand(args) {
    const command = args[0];

    switch (command) {
      case 'benchmark':
        await this.benchmarkEngine.runBenchmark();
        break;
      case 'test':
        await this.testSingleModel();
        break;
      case 'models':
        await this.listModels();
        break;
      default:
        console.log(chalk.red(`Unknown command: ${command}`));
        await this.showMenu();
    }
  }

  async testSingleModel() {
    console.log(chalk.blue.bold('🧪 Single Model Test\n'));
    
    console.log(chalk.cyan('Available models:'));
    config.models.forEach((model, index) => {
      console.log(chalk.gray(`  ${index + 1}. ${model.name} (${model.provider})`));
    });

    const testPrompt = 'Write a haiku about artificial intelligence.';
    console.log(chalk.yellow(`\nTest prompt: "${testPrompt}"`));

    for (const model of config.models) {
      console.log(chalk.blue.bold(`\nTesting ${model.name}...`));
      
      const spinner = ora('Generating response...').start();
      const result = await this.client.generateText(model.id, testPrompt);
      spinner.stop();

      if (result.success) {
        console.log(chalk.green('✓ Success!'));
        console.log(chalk.gray(`Response: ${result.content}`));
        console.log(chalk.gray(`Tokens used: ${result.usage?.total_tokens || 'N/A'}`));
      } else {
        console.log(chalk.red('✗ Failed'));
        console.log(chalk.red(`Error: ${result.error}`));
      }
    }
  }

  async listModels() {
    console.log(chalk.blue.bold('📋 Available Models\n'));
    
    const spinner = ora('Fetching models from OpenRouter...').start();
    const result = await this.client.getModels();
    spinner.stop();

    if (result.success) {
      console.log(chalk.green(`Found ${result.models.length} models:\n`));
      
      result.models.forEach(model => {
        console.log(chalk.cyan(`${model.id}`));
        console.log(chalk.gray(`  Name: ${model.name || 'N/A'}`));
        console.log(chalk.gray(`  Provider: ${model.provider || 'N/A'}`));
        console.log(chalk.gray(`  Context Length: ${model.context_length || 'N/A'}\n`));
      });
    } else {
      console.log(chalk.red('Failed to fetch models:'));
      console.log(chalk.red(result.error));
    }
  }
}

const cli = new BenchmarkCLI();
cli.start().catch(console.error); 