const Discord = require('discord.js');
const request = require('request-promise');

const handleDump = async (message, config) => {
  if (message.attachments.first()) {
    const firstAttach = message.attachments.first();
    if (firstAttach.filename.indexOf('.json') === -1) {
      return;
    }

    try {
      const channelConfig = JSON.parse(await request({
        uri: firstAttach.url,
      }));
      const tokens = channelConfig.messages;
      if (channelConfig.target) {
          let target = config.client.channels.get(channelConfig.target.channel || message.channel.id);

          if (channelConfig.target.webhook && channelConfig.target.webhook.id && channelConfig.target.webhook.token) {
            target = new Discord.WebhookClient(channelConfig.target.webhook.id, channelConfig.target.webhook.token);
          }
          
          if (channelConfig.cleanCount) {
              const chnl =  config.client.channels.get(channelConfig.target.channel);
              await chnl.bulkDelete(35);
          }
          for (const token of tokens) {
            switch (token.type) {
            case "text":
              await target.send(token.content);
              break;
            case "img":
              await target.send('', {
                file: {
                  attachment: token.content,
                  name: token.name
                }
              });
              break;
            default:
              break;
            }
          }
      }
    } catch (e) {
      message.reply('Bad File');
    }
    message.delete();
  }

};

module.exports = {
  handleDump
};