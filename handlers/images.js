'use strict';

const images = {
  banIncoming: {
    links: ['https://i.imgur.com/iTV6wwM.png', 'https://i.imgur.com/URrJQ1U.png'],
    name: 'Ban Incoming.png',
    type: 'embed',
  },
  readThePins: {
    name: 'Read the Pins.png',
    links: ['https://i.imgur.com/1im5Wmu.png'],
    type: 'embed',
  },
  wrongChannel: {
    links: ['https://i.imgur.com/FUQYQoC.png'],
    name: 'Wrong channel.png',
    type: 'embed',
  },
  vaubanned: {
    links: ['http://i.imgur.com/SHFjv3I.gif'],
    name: 'Vaubanned.gif',
    type: 'link',
  },
  muteIncoming: {
    links: ['https://i.imgur.com/K0X8blG.gif'],
    name: 'Silence.gif',
    type: 'link',
  },
  rule1: {
    links: ['https://i.imgur.com/VOrp87r.gif'],
    name: 'Rule1.gif',
    type: 'link',
  }
};

const handleImage = async (message, config, matches) => {
  let match;

  if (matches.includes('bi2')) {
    match = {
      name: images.banIncoming.name,
      link: images.banIncoming.links[1],
      type: images.banIncoming.type,
    };
  } else if (matches.includes('bi')) {
    match = {
      name: images.banIncoming.name,
      link: images.banIncoming.links[0],
      type: images.banIncoming.type,
    };
  } else if (matches.includes('rtp')) {
    match = {
      name: images.readThePins.name,
      link: images.readThePins.links[0],
      type: images.readThePins.type,
    };
  } else if (matches.includes('wc')) {
    match = {
      name: images.wrongChannel.name,
      link: images.wrongChannel.links[0],
      type: images.wrongChannel.type,
    };
  } else if (matches.includes('vaubanned')) {
    match = {
      name: images.vaubanned.name,
      link: images.vaubanned.links[0],
      type: images.vaubanned.type,
    };
  } else if (matches.includes('mi')) {
    match = {
      name: images.muteIncoming.name,
      link: images.muteIncoming.links[0],
      type: images.muteIncoming.type,
    };
  } else if (matches.includes('rule1')) {
    match = {
      name: images.rule1.name,
      link: images.rule1.links[0],
      type: images.rule1.type,
    };
  }
  const msg = await message.channel.send('', { file: { attachment: match.link, name: match.name } });
  message.delete();
  msg.delete(config.deletePics);
};

module.exports = { handleImage };
