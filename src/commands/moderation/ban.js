const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const { schemaDateToDate, createInfraction, updateInfraction, findActiveInfraction } = require('../../helpers/helpers.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans user')
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

        const unbanInfraction = await findActiveInfraction(guildId, target.id, 'unban');

        const banInfraction = await guild.bans.fetch(target.id).catch((err) => {
            return false;
        });

        if(!banInfraction) {
            try {
                guild.members.ban(target.id, { reason: reason });
                await interaction.editReply({ content: `<@!${target.id}> was banned | ${reason}` });

                if(unbanInfraction) await updateInfraction(guildId, unbanInfraction.ID);

                await createInfraction(guildId, target, user, reason, 'ban');

                const tempbanInfraction = await findActiveInfraction(guildId, target.id, 'tempban');

                if(tempbanInfraction) await updateInfraction(guildId, tempbanInfraction.ID, 'tempban');
            } catch(err) {
                await interaction.editReply({ content: `Bot does not have permission to ban <@!${target.id}>`})
                console.log(err)
            }
        } else {
            await interaction.editReply({ content: `<@!${target.id}> is already permbanned.` })
        }

        //make embed
        return;
    }
}
