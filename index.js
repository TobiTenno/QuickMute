'use strict';

const Discord = require('discord.js');

const client = new Discord.Client();
const config = {
  token: process.env.TOKEN,
  prefix: process.env.PREFIX || '!',
  opRole: process.env.OP_ROLE,
  logChannel: process.env.LOG_CHANNEL,
  reportChannel: process.env.REPORT_CHANNEL || process.env.LOG_CHANNEL,
  guildId: process.env.GUILD_ID,
  deletePics: 100000,
  pingOp: process.env.PING_FOR_REPORT === 'true',
  banIncoming: ['https://i.imgur.com/iTV6wwM.png', 'https://i.imgur.com/URrJQ1U.png'],
  readThePins: ['https://i.imgur.com/1im5Wmu.png'], 
  wrongChannel: ['https://i.imgur.com/FUQYQoC.png'],
};
let logChannel;
let reportChannel;
let guild;
let opRole;

const muteds = {};

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
  if (logChannel) {
    logChannel.send('', {
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

client.on('ready', () => {
  logChannel = client.channels.get(config.logChannel);
  reportChannel = client.channels.get(config.reportChannel);
  guild = client.guilds.get(config.guildId);
  log(`Bot started. ${client.users.size} users online.`, '', 0x77dd77);
  client.user.setPresence({
    status: 'online',
    game: {
      name: 'with your voice!',
      url: 'https://warframe.com',
    },
  });
});

client.on('message', async (message) => {
  // don't call if the caller is a bot  or it's not in the designated guild
  if (message.author.bot || (message.channel.type !== 'text' && message.guild.id !== config.guildId)) return;

  if (message.member.roles.get(config.opRole)) {
    if (message.member.voiceChannel) {
      if (message.content === `${config.prefix}qm`) {
        // mute and react
        const vc = message.member.voiceChannel;
        muteds[vc.id] = vc.members.map((member) => {
          if (!member.roles.get(config.opRole)) {
            return member.id;
          }
          return undefined;
        }).filter(item => typeof item !== 'undefined');
        await vc.overwritePermissions(config.opRole, {SPEAK: true});
        await vc.overwritePermissions(vc.guild.id, {SPEAK: false});
        await Promise.all(vc.members.map((member) => {
          if (!member.roles.get(config.opRole)) {
            return member.setMute(true, `QuickMuted by ${message.author.tag} (${message.author.id})`);
          }
          return undefined;
        }).filter(p => typeof p !== 'undefined'));
        log(`Muted members of ${vc.name} by ${message.author}`);
        message.delete();
      }
      
      if (message.content === `${config.prefix}um`) {
        // unmute and react
        const vc = message.member.voiceChannel;
        if (muteds[vc.id]) {
          const vcMuteds = muteds[vc.id];
            await vc.overwritePermissions(vc.guild.id, {SPEAK: true});
            await Promise.all(vcMuteds.map((id) => {
              const member = guild.members.get(id);
              if (member) {
                return member.setMute(false, `Unmuted by ${message.author.tag} (${message.author.id})`);
              }
              return undefined;
            }).filter(p => typeof p !== 'undefined'));
          muteds[vc.id] = undefined;
          log(`Unuted members of ${vc.name} by ${message.author}`);
        }
        message.delete();
      }
    }

    if (message.content === `${config.prefix}bi`) {
      const bi = await message.channel.send('', { file: { attachment: config.banIncoming[0], name: 'Ban Incoming.png' } });
      message.delete();
      bi.delete(config.deletePics);
    }

    if (message.content === `${config.prefix}bi2`) {
      const bi = await message.channel.send('', { file: { attachment: config.banIncoming[1], name: 'Ban Incoming.png' } });
      message.delete();
      bi.delete(config.deletePics);
    }

    if (message.content === `${config.prefix}rtp`) {
      const rtp = await message.channel.send('', { file: { attachment: config.readThePins[0], name: 'Read the Pins.png' } });
      message.delete();
      rtp.delete(config.deletePics);
    }

    if (message.content === `${config.prefix}wc`) {
      const wc = await message.channel.send('', { file: { attachment: config.wrongChannel[0], name: 'Wrong Channel.png' } });
      message.delete();
      wc.delete(config.deletePics);
    }
  }
  
  if (message.content.startsWith(`${config.prefix}report`)) {
    const messagesContext = await message.channel.fetchMessages({
            limit: 5,
            before: message.id
          });
    const context = messagesContext.map(msg => `**${msg.author}**\n\t${msg.content} ` +
      `${msg.attachments.length ? 'there are attachments' : ''}`).join('\n');
    
    await reportChannel.send(config.pingOp ? '@here' : undefined, {
      embed: {
        color: 0xff0000,
        title: `New Report from ${message.author.tag}`, 
        fields: [{
          name: '_ _',
          value: message.content.replace(`${config.prefix}report`, ''),
          inline: true,
        }, {
          name: 'Context',
          value: context,
        }, {
          name: 'Channel',
          value: message.channel.toString(),
          inlinie: true,
        }, {
          name: 'Reporter',
          value: message.author.toString(),
          inlinie: true,
        }],
        timestamp: new Date(),
      }
    });
    await message.delete();
  }
});

client.login(config.token);
