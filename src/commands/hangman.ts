import { Command, CommandContext, Permission } from './command';
import Discord from 'discord.js';
import fs from 'fs';

export default class HangmanCommand implements Command {
    name = 'hangman';
    summary = 'Play the NoCli Hangman Game!';
    module = 'Entertainment';
    precondition: Permission = 'SEND_MESSAGES';

    execute = (ctx: CommandContext) => {

        if (ctx.msg.author.bot) return;

        const wordsToFind: string[] = [];
        let data = fs.readFileSync('src/data/games/hangman-words.txt', "utf-8");

        for (let word of data.split("\n")) {
            wordsToFind.push(word);
        }

        const thatOneWord: string = wordsToFind[Math.floor(Math.random() * wordsToFind.length)];
        const reactions: string[] = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯', '🇰', '🇱', '🇲'];
        const reactions2: string[] = ['🇳', '🇴', '🇵', '🇶', '🇷', '🇸', '🇹', '🇺', '🇻', '🇼', '🇽', '🇾', '🇿'];
        let guessesNumber: number = 0;
        let guessedLetters: string[] = [];
        let stars: string = "";
        let firstMessageID;
        let secondMessageID;

        replaceWithStars();
        addReactions();

        function addReactions() {
            ctx.channel.send("> Initializing...").then(async msg => {
                for (let letter of reactions) {
                    await msg.react(letter);
                }
                firstMessageID = msg.id;
                createReactionCollector(msg);
            });

            ctx.channel.send("> Guess the word once reaction is loaded").then(async msg => {
                for (let char of reactions2) {
                    await msg.react(char);
                }
                secondMessageID = msg.id;
                createReactionCollector(msg);
            });
        }

        function createReactionCollector(msg: Discord.Message) {
            const filter: Discord.CollectorFilter = (reaction, user) => {
                return user.id === ctx.msg.author.id;
            }

            msg.awaitReactions(filter, { max: 1 })
                .then(collected => {
                    if (checkLetter(emojiToLetter(collected.first().emoji.name))) {
                        replaceWithStars(emojiToLetter(collected.first().emoji.name));
                        const correctLetter = new Discord.MessageEmbed()
                            .setAuthor(ctx.msg.author.username, ctx.msg.author.avatarURL())
                            .setDescription(`✅ Good job - you just found the \`${emojiToLetter(collected.first().emoji.name)}\` letter!`)
                            .setColor("#3AD919")
                    ctx.msg.channel.messages.fetch(firstMessageID).then(m => m.edit(correctLetter));

                    const status = new Discord.MessageEmbed()
                        .setDescription(`Word: \`${stars}\``)
                        .setColor("1E90FF")
                    ctx.msg.channel.messages.fetch(secondMessageID).then(m => m.edit(status));
                } else if (checkLetter(emojiToLetter(collected.first().emoji.name)) == false) {
                    guessesNumber++;
                    const incorrectLetter = new Discord.MessageEmbed()
                        .setAuthor(ctx.msg.author.username, ctx.msg.author.avatarURL())
                        .setDescription(`❌ Wrong letter \`${emojiToLetter(collected.first().emoji.name)}\`. Remaining attempts: **${10 - guessesNumber}**.`)
                        .setColor("#ff0000")
                    ctx.channel.messages.fetch(firstMessageID).then(m => m.edit(incorrectLetter));
                    guessedLetters.push(emojiToLetter(collected.first().emoji.name));
                }

                if (checkIfWin()) {
                    const youWon = new Discord.MessageEmbed()
                        .setAuthor(ctx.msg.author.username, ctx.msg.author.avatarURL())
                        .setDescription(`🙂 You won the game with *${10 - guessesNumber} attempts* left!`)
                        .setColor("#ffff00")
                    return ctx.channel.messages.fetch(firstMessageID).then(m => m.edit(youWon));
                } else if (guessesNumber >= 10) {
                    const youLost = new Discord.MessageEmbed()
                        .setAuthor(ctx.msg.author.username, ctx.msg.author.avatarURL())
                        .setDescription(`😦 You lost! Word was \`${thatOneWord}\`.`)
                        .setColor("#ff0000")
                    return ctx.channel.messages.fetch(firstMessageID).then(m => m.edit(youLost));
                }

                collected.first().remove();
                createReactionCollector(msg);
            }).catch(err => {
                createReactionCollector(msg);
            });
        }

        function checkLetter(letter) {
            if (!guessedLetters.includes(letter) && thatOneWord.split("").includes(letter)) {
                guessedLetters.push(letter);
                return true;
            } else if (guessedLetters.includes(letter)) {
                return null;
            } else {
                return false;
            }
        }


        function replaceWithStars(letter?) {
            if (guessedLetters.length == 0) {
                for (let i = 0; i < thatOneWord.length; i++) {
                    stars += "*";
                }
            } else {
                let test = "";
                for (let i = 0; i < thatOneWord.length; i++) {
                    if (thatOneWord.split("")[i] == letter) {
                        test += letter;
                    } else {
                        test += stars.split("")[i];
                    }
                }
                stars = test;
            }
            return stars;
        }

        function checkIfWin() {
            if (stars == thatOneWord) {
                return true;
            }
        }

        function emojiToLetter(emoji) {
            var unicodeChars = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯', '🇰', '🇱', '🇲', '🇳', '🇴', '🇵', '🇶', '🇷', '🇸', '🇹', '🇺', '🇻', '🇼', '🇽', '🇾', '🇿'];
            var chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
            let index = unicodeChars.indexOf(emoji);
            return chars[index];
        }
    }
    
}