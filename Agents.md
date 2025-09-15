## Project: AI-Workflow Share

This is a AI-Workflow Share demo code, for learning and sharing AI-Workflow.show code and run code for colleagues.


### Architecture Decisions
- Server Components by default, Client Components only when necessary
- tRPC for type-safe API calls
- drizzle for database access with explicit select statements
- Tailwind for styling (no custom CSS files)

### Code Style
- Formatting: Prettier with 100-char lines
- Imports: sorted with simple-import-sort
- Components: Pascal case, co-located with their tests
- Hooks: always prefix with 'use'

### Patterns to Follow
- Data fetching happens in Server Components
- Client Components receive data as props
- Use Zod schemas for all external data
- Error boundaries around every data display component

### What NOT to Do
- Don't use useEffect for data fetching
- Don't create global state without explicit approval
- Don't bypass TypeScript with 'any' types

### MCP

Always use context7 when I need code generation, setup or configuration steps, or 
library/API documentation. This means you should automatically use the Context7 MCP 
tools to resolve library id and get library docs without me having to explicitly ask.