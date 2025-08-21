import OpenRouterClient from './openrouter.js';
import { config } from './config.js';
import chalk from 'chalk';
import ora from 'ora';

class QuickBenchmark {
  constructor() {
    this.client = new OpenRouterClient();
  }

  async runQuickTest() {
    console.log(chalk.blue.bold('🚀 Quick Benchmark Test\n'));
    
    if (!config.openrouter.apiKey) {
      console.log(chalk.red('❌ OPENROUTER_API_KEY not found in environment variables'));
      console.log(chalk.yellow('Please set your OpenRouter API key in the .env file'));
      return;
    }

    console.log(chalk.cyan('Testing with simplified configuration:'));
    console.log(chalk.gray(`  Models: ${config.models.length}`));
    console.log(chalk.gray(`  Prompts: ${config.benchmarks.prompts.length}`));
    console.log(chalk.gray(`  Iterations: ${config.benchmarks.iterations}`));
    console.log(chalk.gray(`  Total API calls: ${config.models.length * config.benchmarks.prompts.length * config.benchmarks.iterations}\n`));

    const spinner = ora('Starting quick test...').start();

    try {
      const model = config.models[0];
      const prompt = config.benchmarks.prompts[0];
      
      spinner.text = `Testing ${model.name} with "${prompt.name}"...`;
      
      const startTime = Date.now();
      const result = await this.client.generateText(model.id, prompt.content);
      const responseTime = Date.now() - startTime;
      
      spinner.stop();

      if (result.success) {
        console.log(chalk.green('✓ Quick test successful!'));
        console.log(chalk.gray(`Model: ${model.name}`));
        console.log(chalk.gray(`Response time: ${responseTime}ms`));
        console.log(chalk.gray(`Tokens used: ${result.usage?.total_tokens || 'N/A'}`));
        console.log(chalk.gray(`Response preview: ${result.content.substring(0, 100)}...`));
        
        console.log(chalk.yellow('\nThe API is working correctly. The full benchmark might be taking a long time due to:'));
        console.log(chalk.gray('  - Multiple API calls (24 total)'));
        console.log(chalk.gray('  - Rate limiting'));
        console.log(chalk.gray('  - Slow model responses'));
        console.log(chalk.gray('  - Network delays'));
        
        console.log(chalk.cyan('\nTry running the full benchmark with:'));
        console.log(chalk.gray('  npm run benchmark'));
        console.log(chalk.gray('  (This may take several minutes to complete)'));
        
      } else {
        console.log(chalk.red('✗ Quick test failed'));
        console.log(chalk.red(`Error: ${result.error}`));
        if (result.status) {
          console.log(chalk.red(`Status: ${result.status}`));
        }
      }
      
    } catch (error) {
      spinner.stop();
      console.log(chalk.red('✗ Quick test failed with exception'));
      console.log(chalk.red(`Error: ${error.message}`));
    }
  }
}

const quickBenchmark = new QuickBenchmark();
quickBenchmark.runQuickTest().catch(console.error); 