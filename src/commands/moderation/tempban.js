const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const { schemaDateToDate, findActiveInfraction, updateInfraction, createTimedInfraction } = require('../../helpers/helpers.js');
const ms = require('ms')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tempban')
        .setDescription('Tempbans user, old tempban will be overwritten')
        .addUserOption(option => option
            .setName('user')
            .setDescription(`Tempbans user`)
            .setRequired(true))
        .addStringOption(option => option
            .setName('duration')
            .setDescription('Duration for ban')
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
            await interaction.editReply(`Duration must be non negative.`);
            return;
        } 

        if(!time) {
            await interaction.editReply(`Incorrect format, use s, m, d, y. Example: 1m`);
            return;
        }

        if(isBanned) {
            await interaction.editReply(`<@!${target.id}> is already permbanned.`);
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

        guild.members.ban(target.id, { reason: reason }).catch(async (err) => {
            await interaction.editReply({ content: `Bot does not have permission to ban **${target.tag}**`})
            return;
        })
        await interaction.editReply({ content: `<@!${target.id}> was banned | ${reason}` });

        return;
    }
}