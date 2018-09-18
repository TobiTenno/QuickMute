'use strict';

const { Client, WebhookClient } = require('discord.js');
const { handleReport } = require('./handlers/report.js');
const { handleImage } = require('./handlers/images.js');
const { handleMute } = require('./handlers/mute.js');
const { handleAnnounce } = require('./handlers/announcement.js');
const { handleDump } = require('./handlers/dump.js');
const DynamicVoiceHandler = require('./handlers/DynamicVoiceHandler');

const client = new Client();
const config = {
  token: process.env.TOKEN,
  prefix: process.env.PREFIX || '!',
  opRole: process.env.OP_ROLE,
  logChannelId: process.env.LOG_CHANNEL,
  reportChannelId: process.env.REPORT_CHANNEL || process.env.LOG_CHANNEL,
  announcement: {
    webhook: {
      id: process.env.ANNOUNCEMENT_WEBHOOK_ID,
      token: process.env.ANNOUNCEMENT_WEBHOOK_TOKEN,
    },
    color: parseInt(process.env.ANNOUNCMENT_EMBED_COLOR || '0', 10),
    title: process.env.ANNOUNCMENT_EMBED_TITLE,
  },
  guildId: process.env.GUILD_ID,
  deletePics: 100000,
  pingOp: process.env.PING_FOR_REPORT === 'true',
  muteds: {},
  username: process.env.USERNAME,
  dynamicVoice: {
    control: process.env.DYNAMIC_VOICE_TEMPLATE_CONTROL,
    template: process.env.DYNAMIC_VOICE_TEMPLATE_ID,
  },
};

const imgRegex = new RegExp(`^${config.prefix}(bi2|bi|rtp|wc|vaubanned|mi|rule1)$`);
const muteRegex = new RegExp(`^${config.prefix}(um|qm)$`);

function log(message, type, color) {
  const now = new Date();
  let eColor;
  if (type === 'error') {
    eColor = 0xff0000;
  } else if (color) {
    eColor = color;
  } else {
    eColor = 0x7289DA;
  }
  const embed = {
    color: eColor,
    description: message,
    timestamp: new Date(now.getTime() + (now.getTimezoneOffset() * 60000)),
  };
  if (config.logChannel) {
    config.logChannel.send('', {
      embed,
    // eslint-disable-next-line no-console
    }).catch(console.error);
  } else if (type !== 'error') {
    // eslint-disable-next-line no-console
    console.info(message);
  } else {
    // eslint-disable-next-line no-console
    console.error(message);
  }
}

client.on('message', async (message) => {
  // don't call if the caller is a bot  or it's not in the designated guild
  if (message.author.bot || !message.member || (message.channel.type !== 'text' && message.guild.id !== config.guildId)) return;

  if (message.member.roles.has(config.opRole)) {
    if (imgRegex.test(message.content)) {
      await handleImage(message, config, imgRegex.exec(message.content));
    }

    if (muteRegex.test(message.content)) {
      await handleMute(message, config, muteRegex.exec(message.content), log);
    }
  }

  if (message.member.roles.get(config.superOp)) {
    if (message.content.startsWith(`${config.prefix}dump`)) {
      if (message.attachments.first()) {
        await handleDump(message, config);
      } else {
        log('no attachment', 'error');
      }
    }

    if (message.content.startsWith(`${config.prefix}announce`)) {
      await handleAnnounce(message, config, config.announcement.webhook.object);
    }
  }

  if (message.content.startsWith(`${config.prefix}report`)) {
    await handleReport(message, config);
  }
});

const setup = () => {
  if (!client.guilds.has(config.guildId) || !client.guilds.get(config.guildId).available) {
    setTimeout(setup, 10000);
    return;
  }

  // Set up configs
  if (client.guilds.has(config.guildId)) {
    config.guild = client.guilds.get(config.guildId);
    log(`Initialized guild. ${config.guild.name} : ${config.guild.memberCount} members : ${config.guild.channels.size} channels`, 'debug');

    if (config.guild.channels.has(config.logChannelId)) {
      config.logChannel = config.guild.channels.get(config.logChannelId);
    } else {
      log(`Could not set log channel: ${config.logChannelId}`, 'error');
    }

    if (config.guild.channels.has(config.reportChannelId)) {
      config.reportChannel = config.guild.channels.get(config.reportChannelId);
    } else {
      log(`Could not set report channel: ${config.reportChannelId}`, 'error');
    }
  } else {
    log(`Could not set guild: ${config.guildId}`, 'error');
    log(`Setup is incomplete!! ${JSON.stringify(config)}`);
  }

  config.log = log;
  log(`Bot started. ${client.users.size} users online.`, '', 0x77dd77);
  if (config.username) {
    client.user.setUsername(config.username);
  }

  client.user.setPresence({
    status: 'online',
    game: {
      name: process.env.QM_STATUS || 'with your voice!',
    },
  });

  config.announcement.webhook.object = new WebhookClient(
    config.announcement.webhook.id, config.announcement.webhook.token,
  );
  config.superOp = process.env.SUPER_OP;
  config.client = client;

  config.voiceHandler = new DynamicVoiceHandler(config.client, config);

  if (config.opRole) {
    client.on('messageReactionAdd', (reaction, user) => {
      if (reaction.message.guild
        && reaction.message.guild.id === config.guild.id
        && config.guild.members.has(user.id)
        && config.guild.members.get(user.id).roles.has(config.opRole)) {
        switch (reaction.emoji.name) {
          case '🚫':
            if (config.guild.me.hasPermission('MANAGE_MESSAGES') && reaction.message.deletable) {
              reaction.message.delete();
            }
            break;
          default:
            break;
        }
      }
    });
    config.log('Constructed message reaction listener');
  }
};

client.on('ready', setup);

client.login(config.token);
setTimeout(async () => { await client.destroy(); process.exit(128); }, 43200000);
