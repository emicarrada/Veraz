# AI Engine — providers

Reserved adapters. **None are implemented.**

| Folder | Intended backend |
|--------|------------------|
| `openai/` | OpenAI |
| `gemini/` | Google Gemini |
| `anthropic/` | Anthropic Claude |
| `openrouter/` | OpenRouter |
| `ollama/` | Ollama |
| `local/` | Local / self-hosted models |

Each adapter must implement `AIProvider` and be registered only through the Engine.
Features must never import these folders.
