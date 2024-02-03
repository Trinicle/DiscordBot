const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute member')
        .addStringOption(option => option
            .setName('user')
            .setDescription(`mutes the member`)
            .setRequired(true))
        .addStringOption(option => option
            .setName('duration')
            .setDescription('duration of mute'))
        .addStringOption(option => option
            .setName('reason')
            .setDescription('reason for mute'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),     
    async execute(interaction) {
        await interaction.deferReply();
        const userID = interaction.options.getString('users').replace(/<@|>/g, '');
        const duration = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason');
        
    }
}