const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const ms = require('ms')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tempban')
        .setDescription('Bans member')
        .addUserOption(option => option
            .setName('user')
            .setDescription(`bans members separated by a space`)
            .setRequired(true))
        .addStringOption(option => option
            .setName('duration')
            .setDescription('duration for ban')
            .setRequired(true))
        .addStringOption(option => option
            .setName('reason')
            .setDescription('reason of ban'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),     
    async execute(interaction) {
        await interaction.deferReply();
        
        const { options, user, guild } = interaction;

        const target = options.getUser('user');
        const reason = options.getString('reason') || 'No reason given';
        const duration = options.getString('duration') || 0;
        const time = ms(duration);
        console.log(target);
        
        const banned = await guild.bans.fetch(target.id).catch(async (err) => {
            if(time < 0) {
                await interaction.editReply(`duration must be non negative`);
                return;
            } 

            if(!time) {
                await interaction.editReply(`incorrect format, use s, m, d, y. Example: 1m`);
                return;
            }

            guild.members.ban(target.id, { reason: reason })
            await interaction.editReply({ content: `<@!${target.id}> was banned for ${reason}` });

            setTimeout(async () => {
                await guild.members.unban(target).catch(err => {
                    console.log(err)
                });
            }, time);
            return;
        });

        if(banned) {
            await interaction.editReply({ content: `<@!${target.id}> is already banned` })
            return;
        }
        return;
    }
}