const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('unbans user')
        .addUserOption(option => option
            .setName('user')
            .setDescription(`user to unban`)
            .setRequired(true))
        .addStringOption(option => option
            .setName('reason')
            .setDescription('reason for unban'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),     
    async execute(interaction) {
        await interaction.deferReply();

        const { options, user, guild } = interaction;

        const target = options.getUser('user')
        const reason = options.getString('reason') || 'No reason given';

        const banned = await guild.bans.fetch(target.id).catch(async (err) => {
            await interaction.editReply({ content: `<@!${target.id}> is not banned` })
        })

        if(banned) {
            guild.members.unban(target.id, { reason: reason })
            await interaction.editReply({ content: `<@!${target.id}> was unbanned` });
        }
        return;
    }
}