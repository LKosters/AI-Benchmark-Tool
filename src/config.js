import dotenv from 'dotenv';

dotenv.config();

export const config = {
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
  },
  models: [
    {
      id: 'openai/gpt-5',
      name: 'GPT-5',
      provider: 'OpenAI',
      maxTokens: 4096,
    },
    {
      id: 'anthropic/claude-3-5-sonnet',
      name: 'Claude Sonnet 4',
      provider: 'Anthropic',
      maxTokens: 4096,
    },
    {
      id: 'perplexity/sonar-reasoning',
      name: 'Sonar Reasoning',
      provider: 'Perplexity',
      maxTokens: 4096,
    },
    {
      id: 'google/gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      provider: 'Google',
      maxTokens: 4096,
    },
  ],
  benchmarks: {
    prompts: [
      {
        name: 'Simple Question',
        content: 'What is the capital of France?',
        expectedLength: 'short',
      },
      {
        name: 'Code Generation',
        content: 'Write a Python function to calculate the factorial of a number.',
        expectedLength: 'medium',
      },
      {
        name: 'Creative Writing',
        content: 'Write a short story about a robot learning to paint.',
        expectedLength: 'long',
      },
      {
        name: 'Analysis',
        content: 'Analyze the pros and cons of renewable energy sources.',
        expectedLength: 'medium',
      },
    ],
    iterations: 1,
    timeout: 30000,
  },
}; 