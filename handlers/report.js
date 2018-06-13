'use strict';

const handleReport = async (message, config) => {
  const messagesContext = await message.channel.fetchMessages({
    limit: 5,
    before: message.id,
  });
  const context = messagesContext.map(msg => `**${msg.author}**\n\t${msg.content} ` +
    `${msg.attachments.length ? 'there are attachments' : ''}`).join('\n');

  await config.reportChannel.send(config.pingOp ? `<@&${config.opRole}>` : undefined, {
    embed: {
      color: 0xff0000,
      title: `New Report from ${message.author.tag}`,
      fields: [{
        name: '_ _',
        value: message.content.replace(`${config.prefix}report`, ''),
        inline: true,
      }, {
        name: 'Channel',
        value: message.channel.toString(),
        inline: true,
      }, {
        name: 'Reporter',
        value: message.author.toString(),
        inline: true,
      }, {
        name: 'Voice Channel',
        value: message.member.voiceChannel ? message.member.voiceChannel.name : 'Memeber not in voice channel',
        inline: true,
      }, {
        name: 'Context',
        value: context,
      }],
      timestamp: new Date(),
    },
  });
  await message.delete();
};

module.exports = { handleReport };
