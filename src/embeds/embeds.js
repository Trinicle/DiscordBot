const { EmbedBuilder } = require('discord.js')

exports.chatlogEmbed = (message) => {
    console.log(message)
    const embed = new EmbedBuilder()
        .setColor('#ED4245')
        .setAuthor({
            name: message.author.username,
            iconURL: message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 4096 })
        })
        .setDescription(`**Message sent by <@!${message.author.id}>**\n${message.content}`)
        .setTimestamp()
        .setFooter({ text: `User ID: ${message.author.id} | Message ID: ${message.id}`})

    return embed;
};
