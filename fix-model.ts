export const changeToOpenAI = `
    let selectedModel = openai('gpt-4o-mini')

    if (mode === 'premium' || mode === 'search') {
      selectedModel = openai('gpt-4o')
    }
`
