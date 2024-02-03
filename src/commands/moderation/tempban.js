const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const ms = require('ms')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tempban')
        .setDescription('Bans member')
        .addStringOption(option => option
            .setName('users')
            .setDescription(`bans members separated by a space`)
            .setRequired(true))
        .addStringOption(option => option
            .setName('reason')
            .setDescription('reason of ban'))
        .addStringOption(option => option
            .setName('duration')
            .setDescription('duration for ban'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),     
    async execute(interaction) {
        await interaction.deferReply();
        
        const member = interaction.options.getString('users').replace(/<@|>/g, '');
        const duration = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason');

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

        !reason ? await interaction.editReply({ content: `<@!${member}> was banned` }) : await interaction.editReply({ content: `<@!${member}> was banned for ${reason}` })

        setTimeout(async () => {
            await interaction.guild.members.unban(member).catch(err => {
                console.log(err)
            });
        }, ms(duration))
        return;
    }
}