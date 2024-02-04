const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setchatlog')
        .setDescription('Sets the chat log to channel')
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('Channel name')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),     
    async execute(interaction) {
        await interaction.deferReply({ephemeral: true});

        const { options, guild } = interaction;

        const channel = options.getChannel('channel');

        if(channel.type == 0) {
            await interaction.editReply({ content: `Chatlogs channel has been set to <#${channel.id}>` });
            return channel.id;
        } else {
            await interaction.editReply({ content: 'Wrong channel type' });
        }

    }
}