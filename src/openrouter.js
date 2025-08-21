import axios from 'axios';
import { config } from './config.js';

class OpenRouterClient {
  constructor() {
    this.client = axios.create({
      baseURL: config.openrouter.baseURL,
      headers: {
        'Authorization': `Bearer ${config.openrouter.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ai-model-benchmark.com',
        'X-Title': 'AI Model Benchmark',
      },
    });
  }

  async generateText(modelId, prompt, maxTokens = 1000) {
    try {
      const response = await this.client.post('/chat/completions', {
        model: modelId,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      });

      return {
        success: true,
        content: response.data.choices[0].message.content,
        usage: response.data.usage,
        model: response.data.model,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        status: error.response?.status,
      };
    }
  }

  async getModels() {
    try {
      const response = await this.client.get('/models');
      return {
        success: true,
        models: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }
}

export default OpenRouterClient; 