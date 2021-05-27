import { Command, CommandContext } from './command';
import { DiscordBattleShip } from 'discord-battleship';

export default class BattleshipCommand implements Command {
    name = 'battleship';
    summary = 'Play the NoCli Battleship Game!';
    module = 'Entertainment';
    execute = async (ctx: CommandContext, targetMention: string) => {
        const BattleShip = new DiscordBattleShip({
            embedColor: "RED",
            prefix: ctx.savedGuild.general.prefix
        });
        return await BattleShip.createGame(ctx.msg);
    }
}