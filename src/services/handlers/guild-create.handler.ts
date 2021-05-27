
import EventHandler from './event-handler';
import { Guild, TextChannel } from 'discord.js';
import Deps from '../../utils/deps';
import Guilds from '../../data/guilds';

export default class GuildCreateHandler implements EventHandler {
    on = 'guildCreate';

    constructor(private guilds = Deps.get<Guilds>(Guilds)) {}

    async invoke(guild: Guild): Promise<any> {
        await this.guilds.get(guild);
        this.sendWelcomeMessage(guild.systemChannel);
    }

    private sendWelcomeMessage(channel: TextChannel | null) {
        const url = `${ process.env.DASHBOARD_URL}/servers/${channel.guild.id}`;
        channel?.send(`Hi there, I'm NoCli! Pleasure to be invited to your server.\nYou can customize me at ${url}.\nMy current prefix is .`);
    }    
}