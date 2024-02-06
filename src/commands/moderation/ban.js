const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js')
const { schemaDateToDate, createInfraction, updateInfraction, findActiveInfraction } = require('../../helpers/infractionhelpers.js')
const { infractionDMEmbed } = require('../../embeds/embeds.js')

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
    async execute(client, interaction) {
        await interaction.deferReply();
        
        const { options, user, guild, guildId } = interaction;

        const target = options.getUser('user')
        const reason = options.getString('reason') || 'No reason given';

        try {
            const infraction = await createInfraction(guildId, target, user, reason, 'ban');

            const embed = infractionDMEmbed(guild, target, user, infraction, reason, 'Red');

            await target.send({ embeds: [embed] }).then(() => {
                guild.members.ban(target.id, { reason: reason });
            }).catch(err => {
                console.log("hi")
                return;
            });

            const embed2 = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`**${target.username}** has been banned | ${reason}`)
                .setFooter({ text: `Case: ${infraction.ID} - ${schemaDateToDate(Date.now())}` });

            await interaction.editReply({ embeds: [embed2] });

            client.modlogs(guild, target, user, infraction, reason, "Red");

            const tempbanInfraction = await findActiveInfraction(guildId, target.id, 'tempban');

            if(tempbanInfraction) await updateInfraction(guildId, tempbanInfraction.ID);
        } catch(err) {
            await interaction.editReply({ content: `Bot does not have permission to ban **${target.tag}**`})
            console.log(err)
        }
        return;
    }
}
