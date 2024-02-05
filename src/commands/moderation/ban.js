const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js')
const { schemaDateToDate, createInfraction, updateInfraction, findActiveInfraction } = require('../../helpers/helpers.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans user, bans overwrite current tempban')
        .addUserOption(option => option
            .setName('user')
            .setDescription(`user to ban`)
            .setRequired(true))
        .addStringOption(option => option
            .setName('reason')
            .setDescription('reason for ban'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),     
    async execute(interaction) {
        await interaction.deferReply();
        
        const { options, user, guild, guildId } = interaction;

        const target = options.getUser('user')
        const reason = options.getString('reason') || 'No reason given';

        try {
            const infractionID = await createInfraction(guildId, target, user, reason, 'ban');

            const dmrEmbed = new EmbedBuilder()
            .setColor("DarkerGrey")
            .setDescription(`You have been banned from ${guild.name} | ${reason}`)
            .setFooter({ text: `Case: ${infractionID} - ${schemaDateToDate(Date.now())}` })

            target.send({ embeds: [dmrEmbed] }).catch(err => {
                return;
            });

            guild.members.ban(target.id, { reason: reason });
            await interaction.editReply({ content: `**${target.tag}** was banned | ${reason}` });

            const tempbanInfraction = await findActiveInfraction(guildId, target.id, 'tempban');

            if(tempbanInfraction) await updateInfraction(guildId, tempbanInfraction.ID);
        } catch(err) {
            await interaction.editReply({ content: `Bot does not have permission to ban **${target.tag}**`})
            console.log(err)
        }
        return;
    }
}
