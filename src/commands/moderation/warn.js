const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { schemaDateToDate, createInfraction } = require('../../helpers/helpers.js')

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
    async execute(interaction) {
        await interaction.deferReply();

        const { options, guildId, user } = interaction;
        
        const target = options.getUser('user');
        const reason = options.getString('reason') || 'No reason given';
        
        const total = await createInfraction(guildId, target, user, reason, 'warn');

        if(total) {
            const embed = new EmbedBuilder()
            .setColor("Red")
            .setDescription(`You have been warned in ${interaction.guild.name} | ${reason}`)

            const embed2 = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`**${target.username}** has been warned | ${reason}`)
                .setFooter({ text: `Case: ${total} - ${schemaDateToDate(Date.now())}` })

            target.send({ embeds: [embed] }).catch(err => {
                return;
            });

            interaction.editReply({ embeds: [embed2] });
        }

        return;
    }
}
