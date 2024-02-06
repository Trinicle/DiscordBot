const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const { schemaDateToDate, createInfraction, updateInfraction, findActiveInfraction } = require('../../helpers/infractionhelpers.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('unbans user')
        .addUserOption(option => option
            .setName('user')
            .setDescription(`user to unban`)
            .setRequired(true))
        .addStringOption(option => option
            .setName('reason')
            .setDescription('reason for unban'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),     
    async execute(client, interaction) {
        await interaction.deferReply();

        const { options, user, guild, guildId } = interaction;

        const target = options.getUser('user')
        const reason = options.getString('reason') || 'No reason given';

        const unbanInfraction = await guild.bans.fetch(target.id).catch((err) => {
            return false;
        })
 
        if(unbanInfraction) {
            try {
                guild.members.unban(target.id, { reason: reason })
                await interaction.editReply({ content: `<@!${target.id}> was unbanned | ${reason}` });
                await createInfraction(guildId, target, user, reason, 'unban');

                const tempbanInfraction = await findActiveInfraction(guildId, target.id, 'tempban');
                
                if(tempbanInfraction) await updateInfraction(guildId, tempbanInfraction.ID, 'tempban');
            } catch (err) {
                console.log(err);
            }
        } else {
            await interaction.editReply({ content: `<@!${target.id}> is not banned.` })
        }
        return;
    }
}