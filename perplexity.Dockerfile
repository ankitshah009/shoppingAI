FROM node:18-slim

WORKDIR /app

# Install necessary tools
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create package.json
RUN echo '{"name":"perplexity-mcp-server","version":"1.0.0","private":true,"scripts":{"start":"perplexity-mcp"}}' > package.json

# Install perplexity-mcp
RUN npm install -g perplexity-mcp

# Set the API key environment variable
ENV PERPLEXITY_API_KEY=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
ENV PERPLEXITY_MODEL=mistral-7b-instruct

# Expose port
EXPOSE 3500

# Start the server
CMD ["perplexity-mcp"] 