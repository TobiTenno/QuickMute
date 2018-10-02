'use strict';

const { Generator } = require('warframe-name-generator');

const generator = new Generator();

class DynamicVoiceHandler {
  constructor(client, config) {
    this.client = client;
    this.config = config;

    if (config.dynamicVoice && config.dynamicVoice.control) {
      this.config.dynamicVoice.controlChannel = config.guild.channels
        .get(config.dynamicVoice.control);
    }

    if (config.dynamicVoice && config.dynamicVoice.template) {
      this.config.dynamicVoice.templateChannel = config.guild.channels
        .get(config.dynamicVoice.template);
    }

    client.on('voiceStateUpdate', (oldMember, newMember) => {
      if (this.checkManagementApplicable(oldMember, newMember)) {
        this.checkAllChannels();
      }
    });

    client.on('channelDelete', this.removeChannel);

    this.config.log('Constructed voice handler');
  }

  checkManagementApplicable(oldMember, newMember) {
    const isGuild = oldMember.guild.id === this.config.guild.id;
    if (isGuild) {
      if (!this.channels) {
        this.getCurrentChannels();
      }
      if (this.channels.length) {
        return this.channels.filter(channel => this.checkIfShouldFilter(
          channel, oldMember, newMember,
        )).length > 0;
      }
      return false;
    }
    return isGuild;
  }

  checkIfShouldFilter(channel, oldMember, newMember) {
    const shouldFilter = channel.id === oldMember.voiceChannelId
      || channel.id === newMember.voiceChannelId
      || channel.id === this.config.dynamicVoice.template;

    return shouldFilter;
  }

  async checkAllChannels() {
    if (this.config && this.config.dynamicVoice.templateChannel) {
      this.getEmptyChannels().forEach((channel, index) => {
        if (index !== 0) {
          this.removeChannel(channel);
          this.config.log(`Removed ${channel.name}`);
        }
      });
      if (this.getEmptyChannels().length < 1) {
        this.addChannel();
      }
    }
  }

  getEmptyChannels() {
    const emptyChannels = [];
    this.channels.forEach((channel) => {
      if (channel.members.size === 0) {
        emptyChannels.push(channel);
      }
    });
    return emptyChannels;
  }

  removeChannel(channelToRemove) {
    if (!this.channels || !this.channels.length) return;
    const postRemove = this.channels.slice(0);
    let indexToRemove;
    this.channels.forEach((currChannel, index) => {
      if (currChannel.id === channelToRemove.id) {
        indexToRemove = index;
        if (!channelToRemove.deleted) {
          try {
            channelToRemove.delete('Removing for dynamic channels');
          } catch (error) {
            this.config.log(error, 'error');
          }
        }
      }
    });
    postRemove.splice(indexToRemove, 1);
    this.config.dynamicVoice.controlChannel.setTopic(postRemove.map(channel => channel.id).join('\n'));
    this.getCurrentChannels();
  }

  async addChannel() {
    try {
      const newChannel = await this.config.dynamicVoice.templateChannel.clone(generator.make({ adjective: true, type: 'places' }), true, true, 'Dynamic Voice Channels');
      const currentDynamics = this.getCurrentChannels();
      currentDynamics.push(newChannel);
      newChannel.setParent(this.config.dynamicVoice.templateChannel.parentID, 'Moving channel for Dynamic channel');
      this.config.dynamicVoice.controlChannel.setTopic(currentDynamics.map(channel => channel.id).join('\n'));
      await newChannel.setUserLimit(this.config.dynamicVoice.templateChannel.userLimit, 'Channel setup for Dynamic Channel');
      this.config.log(`Added <#${newChannel.id}>`);
      return newChannel;
    } catch (error) {
      this.config.log(error, 'error');
      return undefined;
    }
  }

  getCurrentChannels() {
    if (this.config.dynamicVoice.controlChannel) {
      this.channels = this.config.dynamicVoice.controlChannel.topic
        .split('\n')
        .filter(id => this.config.guild.channels.has(id))
        .map(id => this.config.guild.channels.get(id));
      return this.channels;
    }
    return [];
  }
}

module.exports = DynamicVoiceHandler;
