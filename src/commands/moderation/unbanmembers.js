const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unbans member(s)')
        .addStringOption(option => option
            .setName('users')
            .setDescription(`unbans members separated by a space`)
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),     
    async execute(interaction) {
        await interaction.deferReply();
        const usertoID = interaction.options.getString('users').replace(/<@|>/g, '');
        const members = usertoID.split(' ');
        for(const member of members) {
            try {
                await interaction.guild.members.unban(member);
            } catch (err) {
                if(err.code == 50013) {
                    await interaction.editReply({ content: `Missing persmissions to unban <@!${member}>` })
                } else if(err.code == 10007) {
                    await interaction.editReply({ content: `Member <@!${member}> does not exist` })
                } else if(err.code == 10013) {
                    await interaction.editReply({ content: `User <@!${member}> does not exist` })
                }
                return;
            }
            if(members.length == 1) {
                await interaction.editReply({ content: `<@!${member}> was unbanned` });
            } else {
                await interaction.channel.send(`<@!${member}> was unbanned`);
            }
        }
        if(members.length > 1) {
            await interaction.editReply( {content: 'Done!'});
        }
        return;
    }
}