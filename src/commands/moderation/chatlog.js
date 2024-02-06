const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const chatlogSchema = require('../../schema/chatlogSchema.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setchatlogs')
        .setDescription('Sets the chat log to channel')
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('Channel name'))
        .addBooleanOption(option => option
            .setName('enabled')
            .setDescription('Toggle logging on or off'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),     
    async execute(client, interaction) {
        await interaction.deferReply();

        const { options, guildId } = interaction;

        const channel = options.getChannel('channel');
        const option = options.getBoolean('enabled');

        let setOption = false;
        let setChannel = false;

        if(option || option == false) {
            await chatlogSchema.findOne({ GuildID: guildId }).then((data) => {
                if(!data) {
                    data = new chatlogSchema({
                        GuildID: guildId,
                        ChannelID: '',
                        Status: option,
                    });
                } else{
                    data.Status = option;
                }
                data.save();
                setOption != setOption;
            })
        }

        if(channel) {
            if(channel.type == 0) {
                await chatlogSchema.findOne({ GuildID: guildId }).then((data) => {
                    if(!data) {
                        data = new chatlogSchema({
                            GuildID: guildId,
                            ChannelID: channel.id,
                            Status: true
                        });
                    } else{
                        data.ChannelID = channel.id
                    }
                    data.save();
                    setChannel != setChannel;
                })
            } else {
                await interaction.editReply({ content: 'Wrong channel type' });
            }
        }
        if(setChannel && setOption) {
            await interaction.editReply({
                content: `test`
            })
        } else {
            await interaction.editReply({
                content: `Successfully updated chatlogs`
            })
        }
    }
}