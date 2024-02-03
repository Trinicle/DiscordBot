const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const warningSchema = require('../../schema/warnSchema.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearwarn')
        .setDescription('This clear a members warnings')
        .addUserOption(option => option
            .setName('user')
            .setDescription(`user you want to clear the warnings of`)
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),     
    async execute(interaction) {
        await interaction.deferReply();

        const { options, guildId, user } = interaction;
        
        const target = options.getUser('user');

        const embed = new EmbedBuilder()


        const data = await warningSchema.findOne({ GuildID: guildId, UserID: target.id, UserTag: target.tag })

        if(data) {
            await warningSchema.findOneAndDelete({ GuildID: guildId, UserID: target.id, UserTag: target.username })
            
            embed.setColor("Blue")
            .setDescription(`${target.tag}'s warnings have been cleared`)

            interaction.editReply({ embeds: [embed] })
        } else {
            interaction.editReply({ content: `${target.tag} has no warnings` })
        }

    }
}