const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const infractionSchema = require('../../schema/infractionSchema.js');
const { schemaDateToDate } = require('../../helpers/helpers.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('infractions')
        .setDescription('This gets a members infractions')
        .addUserOption(option => option
            .setName('user')
            .setDescription(`The member you want to check the infractions of`)
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),     
    async execute(interaction) {
        await interaction.deferReply();

        const { options, guildId } = interaction;
        
        const target = options.getUser('user');

        const embed = new EmbedBuilder()
        const nowarns = new EmbedBuilder()

        infractionSchema.findOne({ GuildID: guildId, UserID: target.id, UserTag: target.tag }).then((data) => {
            if(data) {
                embed.setColor("Red")
                    .setTitle(`**${target.tag}'s history**`)
                    .setDescription(`${data.Content.map(
                        (w, i) => 
                            `
                                __**${w.Type.toUpperCase()} \`[case-${w.ID}]\` (${schemaDateToDate(w.TimeStamp)})**__
                                **Moderator**: <@!${w.ExecuterId}>
                                **Reason**: ${w.Reason}
                                **[RESOLVED ${w.Resolved ? ':white_check_mark:' : ':x:'}]**${w.Resolved ? `\n**Resolved By**: <@!${w.ResolvedId}>` : ''}
                            `
                    ).join(``)}`)
                    .setFooter({ text: `ID: ${target.id} | ${schemaDateToDate(Date.now())}` })
                interaction.editReply({ embeds: [embed] })
            } else {
                nowarns.setColor("Green")
                    .setTitle(`**${target.tag}'s history**`)
                    .setDescription(`None!`)
                interaction.editReply({ embeds: [nowarns] })
            }
        }).catch((err) => {
            throw err
        })
    }
}