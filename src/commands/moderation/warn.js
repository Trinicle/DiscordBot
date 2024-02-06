const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { schemaDateToDate, createInfraction } = require('../../helpers/infractionhelpers.js')
const { infractionDMEmbed } = require('../../embeds/embeds.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('warns user')
        .addUserOption(option => option
            .setName('user')
            .setDescription(`warns user`)
            .setRequired(true))
        .addStringOption(option => option
            .setName('reason')
            .setDescription('reason for warn'))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),     
    async execute(client, interaction) {
        await interaction.deferReply();

        const { options, guildId, user, guild } = interaction;
        
        const target = options.getUser('user');
        const reason = options.getString('reason') || 'No reason given';
        
        const infraction = await createInfraction(guildId, target, user, reason, 'warn');

        const embed = infractionDMEmbed(guild, target, user, infraction, reason, 'DarkOrange')

        const embed2 = new EmbedBuilder()
            .setColor("Red")
            .setDescription(`**${target.username}** has been warned | ${reason}`)
            .setFooter({ text: `Case: ${infraction.ID} - ${schemaDateToDate(Date.now())}` })

        target.send({ embeds: [embed] }).catch(err => {
            return;
        });

        await interaction.editReply({ embeds: [embed2] });

        client.modlogs(guild, target, user, infraction, reason, "Red")

        return;
    }
}
