import { MessageEmbed, TextChannel } from 'discord.js';
import { Router } from 'express';

import { bot } from '../../bot';
import { CommandDocument, SavedCommand } from '../../data/models/command';
import Users from '../../data/users';
import Deps from '../../utils/deps';
import { validateBotOwner, sendError } from '../modules/api-utils';
import { ErrorLogger } from '../modules/logging/error-logger';
import { WebhookLogger } from '../modules/logging/webhook-logger';
import Stats from '../modules/stats';
import { auth } from '../server';

export const router = Router();

const stats = Deps.get<Stats>(Stats);
const users = Deps.get<Users>(Users);
const errorLogger = Deps.get<ErrorLogger>(ErrorLogger);
const webhookLogger = Deps.get<WebhookLogger>(WebhookLogger);

let commands: CommandDocument[] = [];
SavedCommand.find().then(cmds => commands = cmds);

router.get('/', (req, res) => res.json({ hello: 'earth' }));

router.get('/commands', async (req, res) => res.json(commands));

router.get('/auth', async (req, res) => {
  try {    
    const key = await auth.getAccess(req.query.code.toString());
    res.redirect(`${ process.env.DASHBOARD_URL}/auth?key=${key}`);
  } catch (error) { sendError(res, 400, error); }
});

router.post('/error', async(req, res) => {
  try {
    await errorLogger.dashboard(req.body.message);

    res.json({ message: 'Success' });
  } catch (error) { sendError(res, 400, error); }
});

router.post('/feedback', async(req, res) => {
  try {
    await webhookLogger.feedback(req.body.message);

    res.json({ message: 'Success' });
  } catch (error) {
    sendError(res, 400, error); }
});

router.get('/stats', async (req, res) => {
  try {
    await validateBotOwner(req.query.key);
  
    res.json({
      general: stats.general,
      commands: stats.commands,
      inputs: stats.inputs,
      modules: stats.modules
    });
  } catch (error) { sendError(res, 400, error); }
});

router.get('/invite', (req, res) => 
  res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${process.env.BOT_ID}&permissions=8&redirect_uri=${process.env.API_URL}&response_type=code&scope=bot%20connections`));

router.get('/login', (req, res) => res.redirect(auth.authCodeLink.url));

router.post('/vote/top-gg', async (req, res) => {
  try {
    if (req.get('authorization') !==  process.env.TOP_GG_AUTH)
      return res.status(400);

    const channel = bot.channels.cache.get( process.env.VOTE_CHANNEL_ID) as TextChannel;
    if (!channel)
      return res.status(400);

    const userId = req.body.user;
    const savedUser = await users.get({ id: userId });
    savedUser.votes ??= 0;
    savedUser.votes++;
    await savedUser.updateOne(savedUser);
    
    await webhookLogger.vote(userId, savedUser.votes);
  } catch (error) { sendError(res, 400, error); }
});
