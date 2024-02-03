const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans member(s)')
        .addStringOption(option => option
            .setName('users')
            .setDescription(`bans members separated by a space`)
            .setRequired(true))
        .addStringOption(option => option
            .setName('reason')
            .setDescription('reason of ban'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),     
    async execute(interaction) {
        await interaction.deferReply();
        
        const user = interaction.options.getString('users').replace(/<@|>/g, '');
        const reason = interaction.options.getString('reason');
        const members = user.split(' ');



        for(const member of members) {
            const isBanned = await interaction.guild.bans.fetch(member).catch(err => {
                console.log(err)
            })
            try {
                if(!isBanned) {
                    await interaction.guild.members.ban(member, { reason: reason})
                }
                else {
                    await interaction.editReply({ content: `<@!${member}> is already banned` })
                    return
                }
            } catch(err) {
                console.log(err)
                if(err.code == 50013) {
                    await interaction.editReply({ content: `Missing persmissions to ban <@!${member}>` })
                } else if(err.code == 10007) {
                    await interaction.editReply({ content: `Member <@!${member}> does not exist` })
                } else if(err.code == 10013) {
                    await interaction.editReply({ content: `User <@!${member}> does not exist` })
                }
                return;
            }
            if(members.length == 1) {
                await interaction.editReply({ content: `<@!${member}> was banned` });
            } else {
                await interaction.channel.send(`<@!${member}> was banned`);
            }
        }
        if(members.length > 1) {
            await interaction.editReply( {content: 'Done!'});
        }
        return;
    }
}