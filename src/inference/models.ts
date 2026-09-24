import { AnthropicMessages } from "@providers/anthropic/anthropic-messages"
import { OpenAIResponses } from "@providers/openai/openai-responses"
import { GeminiGenerateContent } from "@providers/gemini/gemini-generate-content"
import { OpenAIChatCompletions } from "@providers/openai/openai-chat-completions"
import { claudeSonnet46Specification } from "@providers/anthropic/models/claude-4-6-sonnet"
import { claudeOpus48Specification } from "@providers/anthropic/models/claude-4-8-opus"
import { claudeOpus47Specification } from "@providers/anthropic/models/claude-4-7-opus"
import { gemini35FlashSpecification } from "@providers/gemini/models/gemini-3-5-flash"
import { gemini31ProSpecification } from "@providers/gemini/models/gemini-3-1-pro"
import { deepSeekV4FlashSpecification } from "@providers/deepseek/models/deepseek-v4-flash"
import { deepSeekV4ProSpecification } from "@providers/deepseek/models/deepseek-v4-pro"
import { gpt54Specification } from "@providers/openai/models/gpt-5-4"
import { gpt54MiniSpecification } from "@providers/openai/models/gpt-5-4-mini"
import { gpt54NanoSpecification } from "@providers/openai/models/gpt-5-4-nano"
import { gpt55Specification } from "@providers/openai/models/gpt-5-5"
import { claudeHaiku45Specification } from "@providers/anthropic/models/claude-4-5-haiku"
import type { GenerativeModel } from "@inference/generative-model"

export const supportedModels: GenerativeModel[] = [
	{
		endpoint: new OpenAIResponses(),
		specification: gpt54Specification,
	},
	{
		endpoint: new OpenAIResponses(),
		specification: gpt54MiniSpecification,
	},
	{
		endpoint: new OpenAIResponses(),
		specification: gpt54NanoSpecification,
	},
	{
		endpoint: new OpenAIResponses(),
		specification: gpt55Specification,
	},
	{
		endpoint: new AnthropicMessages(),
		specification: claudeHaiku45Specification,
	},
	{
		endpoint: new AnthropicMessages(),
		specification: claudeSonnet46Specification,
	},
	{
		endpoint: new AnthropicMessages(),
		specification: claudeOpus47Specification,
	},
	{
		endpoint: new AnthropicMessages(),
		specification: claudeOpus48Specification,
	},
	{
		endpoint: new GeminiGenerateContent(),
		specification: gemini35FlashSpecification,
	},
	{
		endpoint: new GeminiGenerateContent(),
		specification: gemini31ProSpecification,
	},
	{
		endpoint: new OpenAIChatCompletions(),
		specification: deepSeekV4FlashSpecification,
	},
	{
		endpoint: new OpenAIChatCompletions(),
		specification: deepSeekV4ProSpecification,
	},
]
