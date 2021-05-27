import { Command, CommandContext, Permission } from './command';

export default class TestCommand implements Command {
    name = 'test';
    summary = 'Implements test service.';
    precondition: Permission = '';
    cooldown = 3;
    module = 'General';
    
    execute = (ctx: CommandContext) => ctx.channel.send('Test Command works');
    
}