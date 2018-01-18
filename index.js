'use strict';

const Discord = require('discord.js');
const  { handleReport }  = require('./handlers/report.js');
const { handleImage } = require('./handlers/images.js');
const { handleMute } = require('./handlers/mute.js'); 
const { handleAnnounce } = require('./handlers/announcement.js');
const { handleDump } = require('./handlers/dump.js');

const client = new Discord.Client();
const config = {
  token: process.env.TOKEN,
  prefix: process.env.PREFIX || '!',
  opRole: process.env.OP_ROLE,
  logChannel: process.env.LOG_CHANNEL,
  reportChannel: process.env.REPORT_CHANNEL || process.env.LOG_CHANNEL,
  announcement: {
    webhook: {
      id: process.env.ANNOUNCEMENT_WEBHOOK_ID,
      token: process.env.ANNOUNCEMENT_WEBHOOK_TOKEN,
    },
    color: parseInt(process.env.ANNOUNCMENT_EMBED_COLOR || "0", 10),
    title: process.env.ANNOUNCMENT_EMBED_TITLE,
  },
  guildId: process.env.GUILD_ID,
  deletePics: 100000,
  pingOp: process.env.PING_FOR_REPORT === 'true',
  muteds: {},
  username: process.env.USERNAME,
};

const imgRegex = new RegExp(`^${config.prefix}(bi2|bi|rtp|wc|vaubanned)$`);
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
    fields: [{
      name: '_ _',
      value: message,
    }],
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

  if (message.member.roles.get(config.opRole)) {
    if (imgRegex.test(message.content)) {
      await handleImage(message, config, imgRegex.exec(message.content));
    }
    
    if(muteRegex.test(message.content)) {
      await handleMute(message, config, muteRegex.exec(message.content), log);
    }
    
    if (message.content.startsWith(`${config.prefix}announce`)) {
      await handleAnnounce(message, config, config.announcement.webhook.object);
    }
  }
  
  if (message.content.startsWith(`${config.prefix}dump`)) {
    if (message.attachments.first() && message.member.roles.get(config.superOp)) {
      await handleDump(message, config);
    } else {
      log('no attachment', 'error');
    }
  }

  if (message.content.startsWith(`${config.prefix}report`)) {
    await handleReport(message, config);
  }
});

client.on('ready', () => {
  // Set up configs
  config.logChannel = client.channels.get(config.logChannel);
  config.reportChannel = client.channels.get(config.reportChannel);
  config.guild = client.guilds.get(config.guildId);
  config.log = log;
  log(`Bot started. ${client.users.size} users online.`, '', 0x77dd77);
  if (config.username) {
      client.user.setUsername(config.username);
  }
  client.user.setPresence({
    status: 'online',
    game: {
      name: 'with your voice!',
    },
  });
  config.announcement.webhook.object = new Discord.WebhookClient(config.announcement.webhook.id, config.announcement.webhook.token);
  config.superOp = process.env.SUPER_OP;
  config.client = client;
});

client.login(config.token);
