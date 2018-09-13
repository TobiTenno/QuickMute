'use strict';

const request = require('request-promise');

const slowmo = async (message, config) => {
  const time = parseInt(message.cleanContent.replace(`${config.prefix}slowmo`, '').trim(), 10);
  if (Number.isNaN(time)) {
      message.react('❌');
      message.reply('Not a number. Specify a number.');
      return;
  } else {
    try {
      await request({
        url: `https://discordapp.com/api/channels/${message.channel.id}`,
        method: 'PATCH',
        headers: {
            "Authorization":`Bot ${config.token}`,
            "User-Agent":"Discord Boat",
        },
        body: { 'rate_limit_per_user': time, },
        json: true,
      });
      if (time === 0) {
        message.react('✅');
        message.react('🚫');
      } else {
        message.react('✅');
        (await message.reply(`Slow mode set to ${time}s`)).delete(10000);
      }
    } catch (error) {
      message.react('❌');
      config.log(error, 'error');
    }
  }
  
  await message.delete(5000);
};

module.exports = { slowmo };
