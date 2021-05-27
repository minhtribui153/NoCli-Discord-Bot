import { Command, CommandContext, Permission } from './command';
import Discord from 'discord.js';
import ms from 'ms';
import { bot } from '../bot';

export default class GiveawayCommand implements Command {
    name = 'giveaway';
    summary = 'Creates a giveaway';
    module = 'Productivity';

    execute = (ctx: CommandContext) => {
        createGiveaway();

	    async function createGiveaway() {
		    ctx.msg.reply("Enter a name for the giveaway, and I'll create it for you.");

		    const channel: Discord.TextChannel = ctx.channel as Discord.TextChannel;

		const filter = (msg: Discord.Message) => msg.author.id == ctx.msg.author.id;

		let giveawayName, giveawayRewards;

		await channel.awaitMessages(filter, { max: 1 })
			.then((collected) => {
				giveawayName = collected.first().content;
				ctx.msg.reply(`Ok, I just created the **${giveawayName}** giveaway! Now, please enter the rewards :wink:`);
			});

		await channel.awaitMessages(filter, { max: 1 })
			.then((collected) => {
				giveawayRewards = collected.last().content;
				return ctx.msg.reply(`Ok, here are the rewards of your giveaway: **${giveawayRewards}**! Finally, please select the duration of the giveaway, eg: \`[number]m\`, \`[number]d\`, or \`[number]w\``);
			});

		const durationCollector: () => Promise<void> = async () => {
			await channel.awaitMessages(filter, { max: 1, errors: ["time"] })
				.then((collected) => {
					const durationNumber: string = collected.last().content;

					if (!ms(durationNumber)) {
						return ctx.msg.reply("This isn't a correct duration time. Please retry with a valid one.");
					}

					const channel = ctx.channel as unknown as Discord.TextChannel;
					channel.bulkDelete(7);

					const giveawayEmbed: Discord.MessageEmbed = new Discord.MessageEmbed()
						.setTitle(`🎉 **${giveawayName}** Giveaway!`)
						.setDescription(`React with :thumbsup: to enter!`)
						.addField('Rewards:', giveawayRewards)
						.addField('Ends in:', `\`${durationNumber}\``)
						.setColor("RANDOM")
						.setAuthor('Giveaway', ctx.msg.author.displayAvatarURL())
						.setTimestamp()
						.setFooter(bot.user.username, bot.user.displayAvatarURL())

					channel.send(giveawayEmbed).then(m => {
						m.react("👍🏻");

						const filter = (reaction: any, user: { id: string; }) => {
							return m.author.id == bot.user.id;
						};

						m.awaitReactions(filter, { time: ms(durationNumber) }).then(collected => {
							let users: Discord.User[][] = collected.map(u => u.users.cache.filter(u => !u.bot).map(u => u));
							let randomUser = users[0][Math.floor(Math.random() * users[0].length)];
							
							ctx.channel.send(`\n> __**Giveaway Ended**__\nCongratulations **${randomUser.tag}**\nYou won the giveaway!\nPrizes: \`${giveawayRewards}\``);
						});
					});

				});
			};

			await durationCollector();
		}
    }
    
}