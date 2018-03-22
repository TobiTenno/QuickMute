'use strict';

const Discord = require('discord.js');
const request = require('request-promise');

const handleDump = async (message, config) => {
  if (message.attachments.first()) {
    const firstAttach = message.attachments.first();
    if (firstAttach.filename.indexOf('.json') === -1) {
      return;
    }
    let channelConfig;

    try {
      const reqRes = await request({
        uri: firstAttach.url,
      });
      channelConfig = JSON.parse(reqRes);
    } catch (e) {
      message.reply('Couldn\'t get file.');
      config.log(e, 'error');
      return;
    }

    try {
      const tokens = channelConfig.messages;
      if (channelConfig.target) {
        let target = config.client.channels.get(channelConfig.target.channel || message.channel.id);

        if (channelConfig.target.webhook &&
          channelConfig.target.webhook.id &&
          channelConfig.target.webhook.token) {
          target = new Discord.WebhookClient(
            channelConfig.target.webhook.id,
            channelConfig.target.webhook.token,
          );
        }

        // if (channelConfig.cleanFirst) {
        //     const chnl =  config.client.channels.get(channelConfig.target.channel);
        //     if (chnl.messages.size > 1) {
        //       await chnl.bulkDelete(tokens.length);
        //     }
        // }
        for (const token of tokens) {
          switch (token.type) {
            case 'text':
              await target.send(token.content);
              break;
            case 'img':
              await target.send({
                files: [{
                  attachment: token.content,
                  name: token.name,
                }],
              });
              break;
            default:
              break;
          }
        }
      }
    } catch (e) {
      await config.log(e.message, 'error');
      await message.reply('Bad File');
    }
    await message.delete();
  }
};

module.exports = {
  handleDump,
};
