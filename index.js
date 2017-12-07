'use strict';

const Discord = require('discord.js');

const client = new Discord.Client();
const config = {
  token: process.env.TOKEN,
  prefix: process.env.PREFIX || '!',
  opRole: process.env.OP_ROLE,
  logChannel: process.env.LOG_CHANNEL,
  guildId: process.env.GUILD_ID,
  deletePics: 100000,
  banIncoming: ['https://i.imgur.com/iTV6wwM.png', 'https://i.imgur.com/URrJQ1U.png'],
  readThePins: ['https://i.imgur.com/1im5Wmu.png'], 
  wrongChannel: ['https://i.imgur.com/FUQYQoC.png'],
};
let logChannel;
let guild;

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

  if (message.content === `${config.prefix}qm` && message.member.roles.get(config.opRole) && message.member.voiceChannel) {
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
   await Promise.all(vc.members.map(member => {
		if (!member.roles.get(config.opRole)) {
			return member.setMute(true, `QuickMuted by ${message.author.tag}(${message.author.id})`);
		}
		return undefined;
	}));
	log(`Muted members of ${vc.name} by ${message.author}`);
    message.delete();
  }

  if (message.content === `${config.prefix}um` && message.member.roles.get(config.opRole) && message.member.voiceChannel) {
    // unmute and react
    const vc = message.member.voiceChannel;
    if (muteds[vc.id]) {
    	const vcMuteds = muteds[vc.id];
        await vc.overwritePermissions(vc.guild.id, {SPEAK: true});
    	await Promise.all(vcMuteds.map((id) => {
    		return guild.members.get(id).setMute(false, `Unmuted after QuickMute by ${message.author.tag}(${message.author.id})`);
    	}));
    	muteds[vc.id] = undefined;
    	log(`Unuted members of ${vc.name} by ${message.author}`);
    }
    message.delete();
  }

  if (message.content === `${config.prefix}bi` && message.member.roles.get(config.opRole)) {
    const bi = await message.channel.send('', { file: { attachment: config.banIncoming[0], name: 'Ban Incoming.png' } });
    message.delete();
    bi.delete(config.deletePics);
  }

  if (message.content === `${config.prefix}bi2` && message.member.roles.get(config.opRole)) {
    const bi = await message.channel.send('', { file: { attachment: config.banIncoming[1], name: 'Ban Incoming.png' } });
    message.delete();
    bi.delete(config.deletePics);
  }

  if (message.content === `${config.prefix}rtp` && message.member.roles.get(config.opRole)) {
    const rtp = await message.channel.send('', { file: { attachment: config.readThePins[0], name: 'Read the Pins.png' } });
    message.delete();
    rtp.delete(config.deletePics);
  }

  if (message.content === `${config.prefix}wc` && message.member.roles.get(config.opRole)) {
    const wc = await message.channel.send('', { file: { attachment: config.wronChannel[0], name: 'Wrong Channel.png' } });
    message.delete();
    wc.delete(config.deletePics);
  }

});

client.login(config.token);
