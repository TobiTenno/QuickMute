'use strict';

const handleAnnounce = async (message, config, webhook) => {
  const announcmentMsg = message.content.replace(`${config.prefix}announce`, '').trim();
  await webhook.send({
    embeds: [{
      title: config.announcement.title,
      color: config.announcement.color,
      description: announcmentMsg,
    }],
  });
  message.delete();
};

module.exports = {
  handleAnnounce,
};
