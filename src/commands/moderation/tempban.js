const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const { schemaDateToDate, findActiveInfraction, updateInfraction, createTimedInfraction } = require('../../helpers/helpers.js');
const ms = require('ms')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tempban')
        .setDescription('Bans member')
        .addUserOption(option => option
            .setName('user')
            .setDescription(`bans members separated by a space`)
            .setRequired(true))
        .addStringOption(option => option
            .setName('duration')
            .setDescription('duration for ban')
            .setRequired(true))
        .addStringOption(option => option
            .setName('reason')
            .setDescription('reason of ban'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),     
    async execute(interaction) {
        await interaction.deferReply();
        
        const { options, user, guild, guildId } = interaction;

        const target = options.getUser('user');
        const reason = options.getString('reason') || 'No reason given';
        const duration = options.getString('duration') || 0;
        const time = ms(duration);

        let infraction = await findActiveInfraction(guildId, target.id, 'tempban');
        const isBanned = await findActiveInfraction(guildId, target.id, 'ban');

        if(time < 0) {
            await interaction.editReply(`duration must be non negative`);
            return;
        } 

        if(!time) {
            await interaction.editReply(`incorrect format, use s, m, d, y. Example: 1m`);
            return;
        }

        if(isBanned) {
            await interaction.editReply(`User is already permbanned`);
            return;
        }

        if(infraction) {
            await updateInfraction(guildId, infraction.ID)
        }

        const infractionID = await createTimedInfraction(guildId, target, user, reason, time, 'tempban');

        setTimeout(async () => {
            try {
                const infraction = await findActiveInfraction(guildId, target.id, 'tempban');
                if(infraction.ID == infractionID) {
                    updateInfraction(guildId, infraction.ID);
                    await guild.members.unban(target);
                    await interaction.followUp({ content: `<@!${target.id}> is no longer tempbanned \`[case-${infractionID}]\`` })
                }
            } catch(err) {
                console.log(err)
                return;
            }
        }, time);

        guild.members.ban(target.id, { reason: reason })
        await interaction.editReply({ content: `<@!${target.id}> was banned for ${reason}` });

        return;
    }
}