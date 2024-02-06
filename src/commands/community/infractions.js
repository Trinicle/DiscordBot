const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const infractionSchema = require('../../schema/infractionSchema.js');
const { schemaDateToDate } = require('../../helpers/infractionhelpers.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('infractions')
        .setDescription('This gets a members infractions')
        .addUserOption(option => option
            .setName('user')
            .setDescription(`The member you want to check the infractions of`))
        .addNumberOption(option => option
            .setName('page')
            .setDescription('Selects page'))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),     
    async execute(client, interaction) {
        await interaction.deferReply();

        const { options, guildId, user } = interaction;
        
        const target = options.getUser('user');
        const page = options.getNumber('page') ? options.getNumber('page') : 1
        if(!target) {

        }

        infractionSchema.findOne({ GuildID: guildId, UserID: target.id }).then(async (data) => {
            if(data) {
                const infractions = data.Content;
                if(page < 1 || page*10 > infractions.length + 9) {
                    await interaction.editReply({ content: `Invalid page`})
                    return;
                }

                const end = infractions.length - (page - 1)*10
                const embed = await generateEmbed(infractions, target, end, page)
                
                await interaction.editReply({ embeds: [embed] }) 
            } else {
                const noinfractions = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle(`**${target.tag}'s history**`)
                    .setDescription(`None!`);
                interaction.editReply({ embeds: [noinfractions] })
            }
        }).catch((err) => {
            throw err
        })
    }
}

generateEmbed = async (infractions, target, end, page) => {
    const current = infractions.slice(end - 10 < 0 ? 0 : end - 10, end > infractions.length ? infractions.length : end);

    const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle(`**${target.tag}'s history | ${target.id}**`)
        .setDescription(`${current.map((infraction) => {
            return `
            __**${infraction.Type.toUpperCase()} \`[case-${infraction.ID}]\` (${schemaDateToDate(infraction.TimeStamp)})**__
            **Moderator**: <@!${infraction.ExecuterId}>
            **Reason**: ${infraction.Reason}
            **[RESOLVED ${infraction.Resolved ? ':white_check_mark:' : ':x:'}]**${infraction.Resolved ? `\n**Resolved By**: <@!${infraction.ResolvedId}>` : ''}
            `
        }).join(``)}`)
        .setFooter({ text: `ID: ${target.id} | Page ${page}/${Math.ceil(infractions.length/10.0)}` })
    return embed;
}