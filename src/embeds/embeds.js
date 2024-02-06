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

exports.infractionDMEmbed = (guild, target, user, infraction, reason, color) => {
    const embed = new EmbedBuilder()
        .setColor(color)
        .setAuthor({
            name: target.tag,
            iconURL: target.displayAvatarURL({ format: 'png', dynamic: true, size: 4096 })
        })
		.setDescription(
            `
            **${infraction.Type.toUpperCase()}**
            You have been moderated in **${guild.name}**
            `)
        .addFields(
			{ name: `Case`, value: `${infraction.ID}`, inline: true },
			{ name: `Moderator`, value: `${user.tag}`, inline: true },
			{ name: `Reason`, value: reason })
        .setTimestamp()
        .setFooter({ text: `ID: ${user.id}`});
    return embed;
}