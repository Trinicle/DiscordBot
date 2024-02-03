const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('banss user')
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
        
        const { options, user, guild } = interaction;

        const target = options.getUser('user')
        const reason = options.getString('reason') || 'No reason given';
        
        const banned = await guild.bans.fetch(target.id).catch(async (err) => {
            guild.members.ban(target.id, { reason: reason })
            await interaction.editReply({ content: `<@!${target.id}> was banned` });
        })

        if(banned) {
            await interaction.editReply({ content: `<@!${target.id}> is already banned` })
        }
        return;
    }
}