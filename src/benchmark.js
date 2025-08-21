import OpenRouterClient from './openrouter.js';
import { config } from './config.js';
import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import ReportGenerator from './report-generator.js';

class BenchmarkEngine {
  constructor() {
    this.client = new OpenRouterClient();
    this.reportGenerator = new ReportGenerator();
    this.results = [];
  }

  async runBenchmark() {
    console.log(chalk.blue.bold('🤖 AI Model Benchmark Tool\n'));
    
    if (!config.openrouter.apiKey) {
      console.log(chalk.red('❌ OPENROUTER_API_KEY not found in environment variables'));
      console.log(chalk.yellow('Please set your OpenRouter API key in the .env file'));
      return;
    }

    console.log('✓ API key found');
    const totalTests = config.models.length * config.benchmarks.prompts.length * config.benchmarks.iterations;
    console.log(chalk.cyan(`Running benchmark with ${totalTests} total API calls...\n`));

    const spinner = ora('Starting benchmark...').start();

    try {
      for (let i = 0; i < config.models.length; i++) {
        const model = config.models[i];
        console.log(`Testing model ${i + 1}: ${model.name}`);
        spinner.text = `Testing ${model.name} (${i + 1}/${config.models.length})...`;
        
        const modelResults = await this.benchmarkModel(model);
        this.results.push(modelResults);
        console.log(`Completed model ${i + 1}: ${model.name}`);
      }

      spinner.succeed('Benchmark completed!');
      console.log('Displaying results...');
      this.displayResults();
      
      console.log('Generating reports...');
      await this.generateReports();
      console.log('Benchmark finished successfully!');
      
    } catch (error) {
      spinner.fail('Benchmark failed');
      console.log(chalk.red(`Error: ${error.message}`));
      console.log(chalk.red(`Stack: ${error.stack}`));
    }
  }

  async benchmarkModel(model) {
    const modelResult = {
      model: model.name,
      provider: model.provider,
      id: model.id,
      tests: [],
      averageResponseTime: 0,
      averageTokens: 0,
      successRate: 0,
      totalCost: 0,
    };

    let totalResponseTime = 0;
    let totalTokens = 0;
    let successfulTests = 0;
    let totalTests = 0;

    for (const prompt of config.benchmarks.prompts) {
      for (let i = 0; i < config.benchmarks.iterations; i++) {
        totalTests++;
        
        const testResult = await this.runSingleTest(model.id, prompt);
        modelResult.tests.push(testResult);

        if (testResult.success) {
          successfulTests++;
          totalResponseTime += testResult.responseTime;
          totalTokens += testResult.tokensUsed;
          modelResult.totalCost += testResult.cost || 0;
        }
      }
    }

    modelResult.averageResponseTime = totalResponseTime / successfulTests || 0;
    modelResult.averageTokens = totalTokens / successfulTests || 0;
    modelResult.successRate = (successfulTests / totalTests) * 100;

    return modelResult;
  }

  async runSingleTest(modelId, prompt) {
    const startTime = Date.now();
    
    try {
      const result = await Promise.race([
        this.client.generateText(modelId, prompt.content),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), config.benchmarks.timeout)
        ),
      ]);

      const responseTime = Date.now() - startTime;

      if (result.success) {
        return {
          prompt: prompt.name,
          success: true,
          responseTime,
          tokensUsed: result.usage?.total_tokens || 0,
          cost: this.calculateCost(result.usage),
          content: result.content.substring(0, 100) + '...',
        };
      } else {
        return {
          prompt: prompt.name,
          success: false,
          responseTime,
          error: result.error,
        };
      }
    } catch (error) {
      return {
        prompt: prompt.name,
        success: false,
        responseTime: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  calculateCost(usage) {
    if (!usage) return 0;
    
    const inputCost = (usage.prompt_tokens / 1000) * 0.001;
    const outputCost = (usage.completion_tokens / 1000) * 0.002;
    
    return inputCost + outputCost;
  }

  displayResults() {
    console.log(chalk.green.bold('\n📊 Benchmark Results\n'));

    const table = new Table({
      head: [
        chalk.cyan('Model'),
        chalk.cyan('Provider'),
        chalk.cyan('Avg Time (ms)'),
        chalk.cyan('Avg Tokens'),
        chalk.cyan('Success Rate'),
        chalk.cyan('Total Cost ($)'),
      ],
      colWidths: [20, 15, 15, 15, 15, 15],
    });

    this.results
      .sort((a, b) => a.averageResponseTime - b.averageResponseTime)
      .forEach(result => {
        table.push([
          result.model,
          result.provider,
          result.averageResponseTime.toFixed(0),
          result.averageTokens.toFixed(0),
          `${result.successRate.toFixed(1)}%`,
          result.totalCost.toFixed(4),
        ]);
      });

    console.log(table.toString());

    this.displayDetailedResults();
  }

  displayDetailedResults() {
    console.log(chalk.yellow.bold('\n📋 Detailed Results\n'));

    this.results.forEach(result => {
      console.log(chalk.blue.bold(`\n${result.model} (${result.provider})`));
      
      const testTable = new Table({
        head: [
          chalk.cyan('Prompt'),
          chalk.cyan('Success'),
          chalk.cyan('Time (ms)'),
          chalk.cyan('Tokens'),
          chalk.cyan('Cost ($)'),
        ],
        colWidths: [20, 10, 12, 12, 12],
      });

      result.tests.forEach(test => {
        testTable.push([
          test.prompt,
          test.success ? chalk.green('✓') : chalk.red('✗'),
          test.responseTime.toFixed(0),
          test.tokensUsed || '-',
          (test.cost || 0).toFixed(4),
        ]);
      });

      console.log(testTable.toString());
    });
  }

  async generateReports() {
    try {
      await this.reportGenerator.generateReport(this.results);
    } catch (error) {
      console.log(chalk.red('❌ Failed to generate reports:'), error.message);
    }
  }
}

export default BenchmarkEngine;

const benchmarkEngine = new BenchmarkEngine();
benchmarkEngine.runBenchmark().catch(console.error); 