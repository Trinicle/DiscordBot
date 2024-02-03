const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hello')
        .setDescription('Replies'),
    async execute(interaction) {
        await interaction.reply('hello')
    }
}