const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setchatlog')
        .setDescription('Sets the chat log to channel')
        .addStringOption(option => option
            .setName('channel')
            .setDescription('Channel name')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),     
    async execute(interaction) {
        await interaction.deferReply({ephemeral: true});
        const channelName = interaction.options.getString('channel').replace(/<#|>/g, '')
        const type = interaction.options.getString('type')
        const channels = await interaction.guild.channels.fetch();
        for(const channel of channels) {
            if(channel[0] == channelName) {
                const inputchannel = await interaction.guild.channels.fetch(channel[0]);
                if(inputchannel.type != 0) {
                    await interaction.editReply({content: `<#${channelName}> is incorrect channel type!`});
                    return null;
                }
                await interaction.editReply({content: `Success!`});
                return channelName;
            }
        }
        await interaction.editReply({content: `Channel ${channelName} does not exist!`});
        return null;
    }
}