import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ReportGenerator from './report-generator.js';

class ReportCLI {
  constructor() {
    this.reportGenerator = new ReportGenerator();
  }

  async start() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      await this.showHelp();
      return;
    }

    const command = args[0];

    switch (command) {
      case 'from-json':
        if (args.length < 2) {
          console.log(chalk.red('❌ Please provide a JSON file path'));
          console.log(chalk.yellow('Usage: node src/generate-report.js from-json <path-to-json>'));
          return;
        }
        await this.generateFromJSON(args[1]);
        break;
      case 'list':
        await this.listReports();
        break;
      default:
        console.log(chalk.red(`Unknown command: ${command}`));
        await this.showHelp();
    }
  }

  async showHelp() {
    console.log(chalk.blue.bold('📊 Report Generator CLI\n'));
    console.log(chalk.cyan('Available commands:'));
    console.log(chalk.gray('  from-json <file>  - Generate HTML report from JSON file'));
    console.log(chalk.gray('  list              - List available JSON reports'));
    console.log('');
    console.log(chalk.yellow('Examples:'));
    console.log(chalk.gray('  node src/generate-report.js from-json reports/benchmark-2024-01-01.json'));
    console.log(chalk.gray('  node src/generate-report.js list'));
  }

  async generateFromJSON(jsonPath) {
    try {
      console.log(chalk.blue(`📖 Reading JSON file: ${jsonPath}`));
      
      const jsonContent = await fs.readFile(jsonPath, 'utf8');
      const data = JSON.parse(jsonContent);
      
      if (!data.detailedResults) {
        console.log(chalk.red('❌ Invalid JSON format. Expected "detailedResults" field.'));
        return;
      }

      console.log(chalk.green(`✓ Found ${data.detailedResults.length} model results`));
      
      await this.reportGenerator.generateReport(data.detailedResults);
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(chalk.red(`❌ File not found: ${jsonPath}`));
      } else if (error instanceof SyntaxError) {
        console.log(chalk.red('❌ Invalid JSON format'));
      } else {
        console.log(chalk.red('❌ Error generating report:'), error.message);
      }
    }
  }

  async listReports() {
    try {
      const reportsDir = 'reports';
      const files = await fs.readdir(reportsDir);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      if (jsonFiles.length === 0) {
        console.log(chalk.yellow('No JSON reports found in reports/ directory'));
        return;
      }

      console.log(chalk.blue.bold('📋 Available JSON Reports:\n'));
      
      for (const file of jsonFiles) {
        const filePath = path.join(reportsDir, file);
        const stats = await fs.stat(filePath);
        
        console.log(chalk.cyan(`📄 ${file}`));
        console.log(chalk.gray(`   Size: ${(stats.size / 1024).toFixed(1)} KB`));
        console.log(chalk.gray(`   Modified: ${stats.mtime.toLocaleString()}`));
        console.log('');
      }

      console.log(chalk.yellow('To generate HTML report from a JSON file:'));
      console.log(chalk.gray(`  node src/generate-report.js from-json reports/<filename>.json`));
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(chalk.yellow('No reports directory found. Run a benchmark first.'));
      } else {
        console.log(chalk.red('❌ Error listing reports:'), error.message);
      }
    }
  }
}

const cli = new ReportCLI();
cli.start().catch(console.error); 