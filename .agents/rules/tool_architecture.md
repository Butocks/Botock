---
name: Tool Architecture Guidelines
description: Architectural rules for AI-agent-ready, isolated, and SEO-friendly tool modules in Botock.
trigger: always_on
---

# Tool Architecture Guidelines

When creating or modifying tools in the Botock platform, strictly adhere to the following rules:

1. **AI-Agent-Ready Tool Schema:**
   - Design tools as independent, functional modules.
   - Tools must expose a clear programmatic interface (schema) detailing their purpose, inputs, and outputs.
   - The design must allow future AI assistants to invoke these tools autonomously based on natural language text, requiring minimal manual configuration.

2. **Tool Isolation & Crash Resilience:**
   - Tools must be strictly isolated from each other and the core platform logic (e.g., using React Error Boundaries, isolated API routes).
   - A crash or error in a specific tool must be contained within its boundary and never cascade to disrupt the platform or other tools.

3. **SEO Optimization:**
   - Each tool must have a dedicated, SEO-friendly landing page with proper metadata, readable URLs, and clear descriptions.
   - Use Next.js Server-side rendering (SSR) or Static Site Generation (SSG) to ensure tool pages are fully indexable.
