'use strict';

const handleMute = async (message, config, matches, log) => {
  if (message.member.voiceChannel) {
    const vc = message.member.voiceChannel;
    if (matches.contains('qm')) {
      // mute and react
      // eslint-disable-next-line no-param-reassign
      config.muteds[vc.id] = vc.members.map((member) => {
        if (!member.roles.get(config.opRole)) {
          return member.id;
        }
        return undefined;
      }).filter(item => typeof item !== 'undefined');
      await vc.overwritePermissions(config.opRole, { SPEAK: true });
      await vc.overwritePermissions(vc.guild.id, { SPEAK: false });
      await Promise.all(vc.members.map((member) => {
        if (!member.roles.get(config.opRole)) {
          return member.setMute(true, `QuickMuted by ${message.author.tag} (${message.author.id})`);
        }
        return undefined;
      }).filter(p => typeof p !== 'undefined'));
      log(`Muted members of ${vc.name} by ${message.author}`);
    } else if (config.muteds[vc.id]) {
      const vcMuteds = config.muteds[vc.id];
      await vc.overwritePermissions(vc.guild.id, { SPEAK: true });
      await Promise.all(vcMuteds.map((id) => {
        const member = config.guild.members.get(id);
        if (member) {
          return member.setMute(false, `Unmuted by ${message.author.tag} (${message.author.id})`);
        }
        return undefined;
      }).filter(p => typeof p !== 'undefined'));
      config.muteds[vc.id] = undefined; // eslint-disable-line no-param-reassign
      log(`Unuted members of ${vc.name} by ${message.author}`);
    }
    message.delete();
  }
};

module.exports = { handleMute };
