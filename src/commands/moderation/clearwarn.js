const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const warningSchema = require('../../schema/infractionSchema.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resolve')
        .setDescription('This clear a members warnings')
        .addNumberOption(option => option
            .setName('infraction')
            .setDescription('ID of infraction')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),     
    async execute(interaction) {
        await interaction.deferReply();

        const { options, guildId, user } = interaction;
        
        const infractionID = options.getNumber('infraction');

        const embed = new EmbedBuilder();

        const warning = await warningSchema.findOneAndUpdate({ 
            GuildID: guildId, 
            'Content.ID': infractionID
        },
        {
            $set: {
                'Content.$.ResolvedId': user.id,
                'Content.$.ResolvedTag': user.tag,
                'Content.$.Resolved': true
            }
        },
        { returnDocument: "after" }).then((data) => {
            const rID = data.Content.find(item => item.ID == infractionID)
            console.log(rID.ResolvedTag)
            if(rID.ResolvedTag) {
                embed.setColor("Blue")
                .setDescription(`Infraction ${infractionID} has been resolved`)
    
                interaction.editReply({ embeds: [embed] })
            } else {
                interaction.editReply({ content: `<@!${rID.UserID}> has no warnings` })
            }
            return true;
        }).catch((err) => {
            console.log(err)
        })

        if(!warning) {
            await interaction.editReply({ content: `infraction does not exist`})
        }
    }
}