const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const warningSchema = require('../../schema/warnSchema.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('This gets a members warnings')
        .addUserOption(option => option
            .setName('user')
            .setDescription(`The member you want to check the warns of`)
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),     
    async execute(interaction) {
        await interaction.deferReply();

        const { options, guildId, user } = interaction;
        
        const target = options.getUser('user');

        const embed = new EmbedBuilder()
        const nowarns = new EmbedBuilder()

        warningSchema.findOne({ GuildID: guildId, UserID: target.id, UserTag: target.tag }).then((data) => {
            if(data) {
                embed.setColor("Blue")
                    .setDescription(`${target.tag}'s warnings: \n${data.Content.map(
                        (w, i) => 
                            `
                                **Warning**: ${i + 1}
                                **Warning Moderator**: ${w.ExecuterTag}
                                **Warn Reason**: ${w.Reason}
                            `
                    ).join(`-`)}`)
                interaction.editReply({ embeds: [embed] })
            } else {
                nowarns.setColor("Blue")
                    .setDescription(`${target.username} has no warnings!`)
                interaction.editReply({ embeds: [nowarns] })
            }
        }).catch((err) => {
            throw err
        })
    }
}