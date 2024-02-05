const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const { schemaDateToDate, createInfraction, updateInfraction, findActiveInfraction } = require('../../helpers/helpers.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('banss user')
        .addUserOption(option => option
            .setName('user')
            .setDescription(`user to ban`)
            .setRequired(true))
        .addStringOption(option => option
            .setName('reason')
            .setDescription('reason for ban'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),     
    async execute(interaction) {
        await interaction.deferReply();
        
        const { options, user, guild, guildId } = interaction;

        const target = options.getUser('user')
        const reason = options.getString('reason') || 'No reason given';

        const isBanned = await findActiveInfraction(guildId, target.id, 'ban');

        let total = null;

        if(!isBanned) {
            guild.members.ban(target.id, { reason: reason })
            await interaction.editReply({ content: `<@!${target.id}> was banned` });
            total = await createInfraction(guildId, target, user, reason, 'ban');

            const isTempbanned = await findActiveInfraction(guildId, target.id, 'tempban');

            await updateInfraction(guildId, isTempbanned, 'tempban');
        } else {
            await interaction.editReply({ content: `<@!${target.id}> is already permbanned` })
            return;
        }

        //make embed
        return;
    }
}
