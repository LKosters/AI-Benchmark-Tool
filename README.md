# AI Model Benchmark Tool

A Node.js tool for benchmarking AI models using OpenRouter API. Compare performance, response times, and costs across different AI models.

## Features

- 🚀 Benchmark multiple AI models simultaneously
- 📊 Detailed performance metrics (response time, tokens, cost)
- 🎯 Multiple test prompts and iterations
- 💰 Cost calculation and tracking
- 🎨 Beautiful CLI output with tables and colors
- 🔧 Easy configuration and customization

## Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Get your OpenRouter API key:**
   - Visit [OpenRouter](https://openrouter.ai/keys)
   - Create an account and get your API key

3. **Create environment file:**
   ```bash
   cp env.example .env
   ```

4. **Add your API key to `.env`:**
   ```
   OPENROUTER_API_KEY=your_api_key_here
   ```

## Usage

### Run Full Benchmark
```bash
npm run benchmark
```

### Test Single Model
```bash
npm test
```

### Interactive Testing
```bash
node src/test.js
```

### Test Specific Model with Custom Prompt
```bash
node src/test.js openai/gpt-4 "Write a poem about coding"
```

### Generate Reports
```bash
npm run report list                    # List available JSON reports
npm run report from-json <file>        # Generate HTML from JSON
```

## Configuration

Edit `src/config.js` to customize:

- **Models**: Add/remove models to test
- **Prompts**: Modify test prompts
- **Iterations**: Change number of test runs
- **Timeout**: Adjust request timeout

### Example Configuration
```javascript
models: [
  {
    id: 'openai/gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    maxTokens: 4096,
  },
  // Add more models...
],
benchmarks: {
  prompts: [
    {
      name: 'Simple Question',
      content: 'What is the capital of France?',
      expectedLength: 'short',
    },
    // Add more prompts...
  ],
  iterations: 3,
  timeout: 30000,
}
```

## Output

The benchmark provides:

- **Summary Table**: Overall performance comparison
- **Detailed Results**: Per-model and per-prompt breakdown
- **Metrics**: Response time, token usage, success rate, cost
- **HTML Report**: Interactive charts and visualizations
- **JSON Export**: Structured data for further analysis

### Example Output
```
📊 Benchmark Results

┌─────────────────────┬───────────────┬───────────────┬───────────────┬───────────────┬───────────────┐
│ Model               │ Provider      │ Avg Time (ms) │ Avg Tokens    │ Success Rate  │ Total Cost ($) │
├─────────────────────┼───────────────┼───────────────┼───────────────┼───────────────┼───────────────┤
│ GPT-3.5 Turbo      │ OpenAI        │ 1250          │ 45            │ 100.0%        │ 0.0009        │
│ GPT-4              │ OpenAI        │ 2100          │ 52            │ 100.0%        │ 0.0012        │
│ Claude 3 Sonnet    │ Anthropic     │ 1800          │ 48            │ 100.0%        │ 0.0010        │
└─────────────────────┴───────────────┴───────────────┴───────────────┴───────────────┴───────────────┘

📊 Reports generated:
  HTML: reports/benchmark-2024-01-01T12-00-00-000Z.html
  JSON: reports/benchmark-2024-01-01T12-00-00-000Z.json
```

## Reports

The tool automatically generates two types of reports:

### HTML Report
- **Interactive Charts**: Response time, token usage, success rate, and cost comparisons
- **Summary Statistics**: Key metrics at a glance
- **Detailed Tables**: Complete results with formatting
- **Responsive Design**: Works on desktop and mobile

### JSON Export
- **Structured Data**: Complete benchmark results
- **Metadata**: Timestamp, summary statistics
- **Reusable**: Can be used for custom analysis

### Report Management
```bash
# List available JSON reports
npm run report list

# Generate HTML from existing JSON
npm run report from-json reports/benchmark-2024-01-01.json
```

## API Reference

### OpenRouterClient
```javascript
const client = new OpenRouterClient();

// Generate text
const result = await client.generateText('openai/gpt-4', 'Hello world');

// Get available models
const models = await client.getModels();
```

### BenchmarkEngine
```javascript
const engine = new BenchmarkEngine();
await engine.runBenchmark();
```

### ReportGenerator
```javascript
const generator = new ReportGenerator();
await generator.generateReport(results);
```

## Cost Calculation

The tool estimates costs based on:
- Input tokens: $0.001 per 1K tokens
- Output tokens: $0.002 per 1K tokens

*Note: Actual costs may vary based on OpenRouter's pricing*

## Troubleshooting

### API Key Issues
- Ensure your `.env` file exists and contains the correct API key
- Verify your OpenRouter account has sufficient credits
- Check API key permissions

### Model Availability
- Some models may be temporarily unavailable
- Check OpenRouter's model status page
- Try different models if one fails

### Timeout Errors
- Increase timeout in `config.js` for slower models
- Check your internet connection
- Some models may be under heavy load

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- OpenRouter Documentation: https://openrouter.ai/docs
- Issues: Create a GitHub issue
- Discussions: Use GitHub Discussions 