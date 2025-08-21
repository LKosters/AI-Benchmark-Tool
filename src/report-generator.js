import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

class ReportGenerator {
  constructor() {
    this.reportsDir = 'reports';
  }

  async generateReport(results) {
    await this.ensureReportsDirectory();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const htmlFile = path.join(this.reportsDir, `benchmark-${timestamp}.html`);
    const jsonFile = path.join(this.reportsDir, `benchmark-${timestamp}.json`);
    
    await Promise.all([
      this.generateHTMLReport(results, htmlFile),
      this.generateJSONReport(results, jsonFile)
    ]);

    console.log(chalk.green(`\n📊 Reports generated:`));
    console.log(chalk.cyan(`  HTML: ${htmlFile}`));
    console.log(chalk.cyan(`  JSON: ${jsonFile}`));
  }

  async ensureReportsDirectory() {
    try {
      await fs.access(this.reportsDir);
    } catch {
      await fs.mkdir(this.reportsDir);
    }
  }

  async generateHTMLReport(results, filePath) {
    const html = this.createHTMLContent(results);
    await fs.writeFile(filePath, html, 'utf8');
  }

  async generateJSONReport(results, filePath) {
    const jsonData = {
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(results),
      detailedResults: results,
      metadata: {
        totalModels: results.length,
        totalTests: results.reduce((sum, r) => sum + r.tests.length, 0),
        averageResponseTime: results.reduce((sum, r) => sum + r.averageResponseTime, 0) / results.length,
        totalCost: results.reduce((sum, r) => sum + r.totalCost, 0),
      }
    };
    
    await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
  }

  createHTMLContent(results) {
    const chartData = this.prepareChartData(results);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Model Benchmark Results</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .summary-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #667eea;
        }
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }
        .stat-label {
            color: #666;
            margin-top: 5px;
        }
        .chart-container {
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .chart-title {
            font-size: 1.5em;
            margin-bottom: 20px;
            color: #333;
        }
        .results-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .results-table th {
            background: #667eea;
            color: white;
            padding: 15px;
            text-align: left;
        }
        .results-table td {
            padding: 15px;
            border-bottom: 1px solid #eee;
        }
        .results-table tr:hover {
            background: #f8f9fa;
        }
        .success-rate {
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
        }
        .success-high { background: #d4edda; color: #155724; }
        .success-medium { background: #fff3cd; color: #856404; }
        .success-low { background: #f8d7da; color: #721c24; }
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            border-top: 1px solid #eee;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 AI Model Benchmark Results</h1>
            <p>Performance comparison across multiple AI models</p>
        </div>
        
        <div class="content">
            <div class="summary-stats">
                <div class="stat-card">
                    <div class="stat-value">${results.length}</div>
                    <div class="stat-label">Models Tested</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${(results.reduce((sum, r) => sum + r.averageResponseTime, 0) / results.length).toFixed(0)}ms</div>
                    <div class="stat-label">Avg Response Time</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${(results.reduce((sum, r) => sum + r.totalCost, 0)).toFixed(4)}</div>
                    <div class="stat-label">Total Cost ($)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${(results.reduce((sum, r) => sum + r.successRate, 0) / results.length).toFixed(1)}%</div>
                    <div class="stat-label">Avg Success Rate</div>
                </div>
            </div>

            <div class="chart-container">
                <div class="chart-title">Response Time Comparison</div>
                <canvas id="responseTimeChart" width="400" height="200"></canvas>
            </div>

            <div class="chart-container">
                <div class="chart-title">Token Usage Comparison</div>
                <canvas id="tokenUsageChart" width="400" height="200"></canvas>
            </div>

            <div class="chart-container">
                <div class="chart-title">Success Rate Comparison</div>
                <canvas id="successRateChart" width="400" height="200"></canvas>
            </div>

            <div class="chart-container">
                <div class="chart-title">Cost Analysis</div>
                <canvas id="costChart" width="400" height="200"></canvas>
            </div>

            <table class="results-table">
                <thead>
                    <tr>
                        <th>Model</th>
                        <th>Provider</th>
                        <th>Avg Time (ms)</th>
                        <th>Avg Tokens</th>
                        <th>Success Rate</th>
                        <th>Total Cost ($)</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map(result => `
                        <tr>
                            <td><strong>${result.model}</strong></td>
                            <td>${result.provider}</td>
                            <td>${result.averageResponseTime.toFixed(0)}</td>
                            <td>${result.averageTokens.toFixed(0)}</td>
                            <td><span class="success-rate ${this.getSuccessRateClass(result.successRate)}">${result.successRate.toFixed(1)}%</span></td>
                            <td>${result.totalCost.toFixed(4)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="footer">
            <p>Generated on ${new Date().toLocaleString()} | AI Model Benchmark Tool</p>
        </div>
    </div>

    <script>
        const chartData = ${JSON.stringify(chartData)};
        
        // Response Time Chart
        new Chart(document.getElementById('responseTimeChart'), {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Average Response Time (ms)',
                    data: chartData.responseTimes,
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Response Time (ms)'
                        }
                    }
                }
            }
        });

        // Token Usage Chart
        new Chart(document.getElementById('tokenUsageChart'), {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Average Tokens Used',
                    data: chartData.tokenUsage,
                    backgroundColor: 'rgba(118, 75, 162, 0.8)',
                    borderColor: 'rgba(118, 75, 162, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Tokens'
                        }
                    }
                }
            }
        });

        // Success Rate Chart
        new Chart(document.getElementById('successRateChart'), {
            type: 'doughnut',
            data: {
                labels: chartData.labels,
                datasets: [{
                    data: chartData.successRates,
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.8)',
                        'rgba(118, 75, 162, 0.8)',
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(255, 205, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(54, 162, 235, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        // Cost Chart
        new Chart(document.getElementById('costChart'), {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Total Cost ($)',
                    data: chartData.costs,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Cost ($)'
                        }
                    }
                }
            }
        });
    </script>
</body>
</html>`;
  }

  prepareChartData(results) {
    const labels = results.map(r => r.model);
    const responseTimes = results.map(r => r.averageResponseTime);
    const tokenUsage = results.map(r => r.averageTokens);
    const successRates = results.map(r => r.successRate);
    const costs = results.map(r => r.totalCost);

    return {
      labels,
      responseTimes,
      tokenUsage,
      successRates,
      costs
    };
  }

  generateSummary(results) {
    return {
      totalModels: results.length,
      fastestModel: results.reduce((min, r) => r.averageResponseTime < min.averageResponseTime ? r : min),
      mostEfficientModel: results.reduce((min, r) => r.averageTokens < min.averageTokens ? r : min),
      mostReliableModel: results.reduce((max, r) => r.successRate > max.successRate ? r : max),
      totalCost: results.reduce((sum, r) => sum + r.totalCost, 0),
      averageResponseTime: results.reduce((sum, r) => sum + r.averageResponseTime, 0) / results.length,
      averageSuccessRate: results.reduce((sum, r) => sum + r.successRate, 0) / results.length
    };
  }

  getSuccessRateClass(rate) {
    if (rate >= 95) return 'success-high';
    if (rate >= 80) return 'success-medium';
    return 'success-low';
  }
}

export default ReportGenerator; 