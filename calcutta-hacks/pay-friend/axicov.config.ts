// axicov.config.ts for LangChain projects
const axicovConfig = {
  name: "Pay-friend AI",
  description: "A LangChain TypeScript application for building AI-powered solutions",
  readmePath: "./README.md",
  env: "./.env",
  
  params: {
    prompt: {
      type: String,
      description: "The prompt that the LLM will respond to",
      required: false
    },
    
    
  },
  
  port: 3000,
  tags: ["LangChain", "TypeScript", "AI", "LLM", "Vector Store"]
};

export default axicovConfig;