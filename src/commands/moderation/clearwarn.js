const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { schemaDateToDate, resolveInfraction } = require('../../helpers/helpers.js')

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
        const infraction = await resolveInfraction(guildId, infractionID, user);

        if(!infraction) {
            await interaction.editReply({ content:`Infraction does not exist` });
            return;
        }

        const embed = new EmbedBuilder();

        embed.setColor("Blue")
            .setDescription(`\`[case-${infractionID}]\` has been resolved`);
        interaction.editReply({ embeds: [embed] })

        return;
    }
}