import { Command, CommandContext } from './command';
import SnakeGame from 'snakecord';

const snakeGame = new SnakeGame({
    title: "NoCli Snake Game",
    color: "RED",
    timestamp: false,
    gameOverTitle: "GAME OVER"
});

export default class SnakeCommand implements Command {
    name = "snake";
    summary = "A Snake Game";
    module = "Entertainment";
    execute = (ctx: CommandContext) => {
        return snakeGame.newGame(ctx.msg);
    }
}