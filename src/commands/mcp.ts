
import { Command } from 'commander';
import { EnvaultMcpServer } from '../mcp/server.js';

export const mcpCommand = (program: Command) => {
    program.command('mcp')
        .description('🔌 Start the Envault MCP Server (Stdio)')
        .action(async () => {
            const server = new EnvaultMcpServer();
            await server.start();
        });
};
