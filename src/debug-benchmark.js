import OpenRouterClient from './openrouter.js';
import { config } from './config.js';
import chalk from 'chalk';
import ora from 'ora';

class DebugBenchmark {
  constructor() {
    this.client = new OpenRouterClient();
  }

  async runDebugBenchmark() {
    console.log(chalk.blue.bold('🔍 Debug Benchmark\n'));
    
    if (!config.openrouter.apiKey) {
      console.log(chalk.red('❌ OPENROUTER_API_KEY not found in environment variables'));
      return;
    }

    console.log(chalk.green('✓ API key found'));
    console.log(chalk.cyan(`Models configured: ${config.models.length}`));
    console.log(chalk.cyan(`Prompts configured: ${config.benchmarks.prompts.length}`));
    console.log(chalk.cyan(`Iterations: ${config.benchmarks.iterations}`));
    console.log(chalk.cyan(`Total API calls: ${config.models.length * config.benchmarks.prompts.length * config.benchmarks.iterations}\n`));

    try {
      for (let i = 0; i < config.models.length; i++) {
        const model = config.models[i];
        console.log(chalk.yellow(`\n--- Testing Model ${i + 1}/${config.models.length}: ${model.name} ---`));
        
        for (let j = 0; j < config.benchmarks.prompts.length; j++) {
          const prompt = config.benchmarks.prompts[j];
          console.log(chalk.gray(`  Prompt ${j + 1}/${config.benchmarks.prompts.length}: ${prompt.name}`));
          
          const spinner = ora('  Making API call...').start();
          
          try {
            const startTime = Date.now();
            const result = await this.client.generateText(model.id, prompt.content);
            const responseTime = Date.now() - startTime;
            
            spinner.stop();
            
            if (result.success) {
              console.log(chalk.green(`    ✓ Success (${responseTime}ms, ${result.usage?.total_tokens || 'N/A'} tokens)`));
            } else {
              console.log(chalk.red(`    ✗ Failed: ${result.error}`));
            }
          } catch (error) {
            spinner.stop();
            console.log(chalk.red(`    ✗ Exception: ${error.message}`));
          }
        }
      }
      
      console.log(chalk.green('\n✓ Debug benchmark completed!'));
      
    } catch (error) {
      console.log(chalk.red(`\n✗ Debug benchmark failed: ${error.message}`));
      console.log(chalk.red(`Stack trace: ${error.stack}`));
    }
  }
}

const debugBenchmark = new DebugBenchmark();
debugBenchmark.runDebugBenchmark().catch(console.error); 