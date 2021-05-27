import { Command, CommandContext, Permission } from './command';

export default class RpsCommand implements Command {
    name = 'rps';
    summary = 'Play rock paper scissors with the bot';
    precondition: Permission = 'MENTION_EVERYONE';
    cooldown = 3;
    module = 'Entertainment';
    
    execute = (ctx: CommandContext, choice: string) => {
        const acceptedReplies = ['rock', 'paper', 'scissors'];
        if (!choice && !acceptedReplies.includes(choice)) return ctx.channel.send(`Please Choose \`${acceptedReplies.join(', ')}\``);


        const random = Math.floor((Math.random() * acceptedReplies.length));
        const result = acceptedReplies[random];

        if (result === choice) return ctx.msg.reply("It's a tie! We had the same choice.");

        switch (choice) {
            case acceptedReplies[0]: {
                if (result === 'paper') return ctx.msg.reply('I won!');
                else return ctx.msg.reply('You won!');
            }
            case 'paper': {
                if (result === 'scissors') return ctx.msg.reply('I won!');
                else return ctx.msg.reply('You won!');        
            }
            case 'scissors': {
                if (result === 'rock') return ctx.msg.reply('I won!');
                else return ctx.msg.reply('You won!');
            }
            default: {
                return ctx.msg.channel.send(`Only these responses are accepted: \`${acceptedReplies.join(', ')}\``);
            }
        }
    }
    
}