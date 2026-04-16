export const applyTimeout = `
    const aiController = new AbortController()
    const aiTimeoutId = setTimeout(() => aiController.abort(), 20000) // 20 seg max

    const result = streamText({
      model: selectedModel,
      system: systemPrompt,
      messages: sanitizedMessages,
      abortSignal: aiController.signal,
      onFinish: async ({ text }) => {
        clearTimeout(aiTimeoutId)
        ...
      }
    });
`
