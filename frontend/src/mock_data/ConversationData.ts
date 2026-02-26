// Mock conversation data for testing UI rendering

// Sample search results with annotations
const searchResultWithAnnotations = {
    title: "Search Results for Weather in New York",
    time: Date.now().toString(),
    image: "",
    description: JSON.stringify({
      annotations: [
        {
          title: "New York Weather - AccuWeather",
          url: "https://www.accuweather.com/en/us/new-york/10007/weather-forecast/349727",
        },
        {
          title: "March megastorm may bring blizzards, tornadoes, flooding and even fires across much of US",
          url: "https://apnews.com/article/36d65e42ceae596653a9e855f9c496f4?utm_source=openai",
        },
        {
          title: "March megastorm may bring blizzards, tornadoes, flooding and even fires across much of US",
          url: "https://weather.com/weather/tenday/l/New+York+NY",
        }
      ],
      text: "# [Weather](https://apnews.com/article/36d65e42ceae596653a9e855f9c496f4?utm_source=openai) in New York City\n\nBased on the search results, here's the current weather in New York City:\n\n- **Current Temperature**: 72°F\n- **Conditions**: Partly Cloudy\n- **Today's High**: 78°F\n- **Today's Low**: 65°F\n- **Precipitation Chance**: 20%\n- **Wind**: Northeast at 5-10 mph\n\nThe weather for the next few days is expected to remain mild with temperatures in the 70s. There's a slight chance of rain today, but the weekend is looking mostly clear."
    }),
    agent_time: "1.2",
    env_time: "0.3",
    obs_time: "0.5",
    token: 150,
    action: "search",
    visualization: ""
  };
  
  // Sample markdown-only search result
  const markdownOnlyResult = {
    title: "Information about Python Programming",
    time: Date.now().toString(),
    image: "",
    description: JSON.stringify({
      text: "# Python Programming Language\n\nPython is a high-level, interpreted programming language known for its readability and versatility.\n\n## Key Features\n\n- **Easy to Learn**: Simple syntax similar to English\n- **Versatile**: Used in web development, data science, AI, automation, etc.\n- **Large Community**: Extensive libraries and frameworks\n- **Cross-platform**: Runs on Windows, macOS, Linux\n\n## Popular Libraries\n\n- **NumPy**: For numerical computing\n- **Pandas**: For data analysis\n- **TensorFlow/PyTorch**: For machine learning\n- **Django/Flask**: For web development\n\nPython is currently one of the most popular programming languages in the world, widely used in various fields including data science, [web development](https://www.accuweather.com/en/us/new-york/10007/weather-forecast/349727), and artificial intelligence."
    }),
    agent_time: "0.9",
    env_time: "0.2",
    obs_time: "0.4",
    token: 180,
    action: "search",
    visualization: ""
  };
  
  // Mock conversation data
  export const mockConversationData = [
    // User message
    {
      type: "user",
      name: "user",
      content: [
        {
          title: "What's the weather like in New York today?",
          time: Date.now().toString(),
          image: "",
          description: "",
          agent_time: "0",
          env_time: "0",
          obs_time: "0",
          token: 0,
          action: "",
          visualization: ""
        }
      ]
    },
    
    // Computer Agent message
    {
      type: "agent",
      name: "Computer Agent",
      content: [
        {
          title: "I'll help you find the weather in New York",
          time: Date.now().toString(),
          image: "",
          description: "I'll search for the current weather conditions in New York City.",
          obs_time: "0.5",
          agent_time: "1.2",
          env_time: "0.3",
          token: 150,
          action: "search",
          visualization: ""
        },
        {
          title: "Let me use the search tool to find this information",
          time: (Date.now() + 1000).toString(),
          image: "",
          description: "I'll use a web search to get the most up-to-date weather information.",
          obs_time: "0.4",
          agent_time: "0.9",
          env_time: "0.2",
          token: 120,
          action: "search",
          visualization: ""
        }
      ]
    },
    
    // Search Agent with empty content (loading state)
    {
      type: "agent",
      name: "Search Agent",
      content: []
    },
    
    // User message (second query)
    {
      type: "user",
      name: "user",
      content: [
        {
          title: "Tell me about Python programming language",
          time: (Date.now() + 5000).toString(),
          image: "",
          description: "",
          agent_time: "0",
          env_time: "0",
          obs_time: "0",
          token: 0,
          action: "",
          visualization: ""
        }
      ]
    },
    
    // Computer Agent message (response to second query)
    {
      type: "agent",
      name: "Computer Agent",
      content: [
        {
          title: "I'll search for information about Python",
          time: (Date.now() + 6000).toString(),
          image: "",
          description: "Let me find some information about the Python programming language for you.",
          obs_time: "0.3",
          agent_time: "0.8",
          env_time: "0.2",
          token: 130,
          action: "search",
          visualization: ""
        }
      ]
    },
    
    // Search Agent with content (completed search)
    {
      type: "agent",
      name: "Search Agent",
      content: [
        searchResultWithAnnotations,
        {
          title: "Additional Weather Information",
          time: (Date.now() + 3000).toString(),
          image: "",
          description: "The weather in New York has been milder than usual for this time of year. The weekend is expected to be pleasant with temperatures in the mid-70s.",
          obs_time: "0.6",
          agent_time: "1.1",
          env_time: "0.4",
          token: 180,
          action: "search_result",
          visualization: ""
        }
      ]
    },
    
    // Search Agent with markdown-only content
    {
      type: "agent",
      name: "Search Agent",
      content: [
        markdownOnlyResult
      ]
    }
  ];
  
  // Different variations for testing specific scenarios
  export const emptySearchAgent = {
    type: "agent",
    name: "Search Agent",
    content: []
  };
  
  export const completedSearchAgent = {
    type: "agent",
    name: "Search Agent",
    content: [searchResultWithAnnotations]
  };
  
  export const markdownOnlySearchAgent = {
    type: "agent",
    name: "Search Agent",
    content: [markdownOnlyResult]
  };
  
  export default mockConversationData; 