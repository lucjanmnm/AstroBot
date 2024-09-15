const { Client, Interaction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ChannelType, EmbedBuilder } = require('discord.js');
const db = require('../utils/database');

module.exports = {
  name: 'interactionCreate',
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  async execute(client, interaction) {
    if (!interaction.guild) {
      return interaction.reply({ content: "Ta komenda nie może być używana w wiadomościach prywatnych.", ephemeral: true });
    }

    if (interaction.isCommand()) {
      if (!client.commands.has(interaction.commandName)) return;

      const interactionFunction = client.commands.get(interaction.commandName);

      if (interaction.deferred || interaction.replied) return;

      interactionFunction(interaction, client);
    }

    if (interaction.isButton() && interaction.customId === 'verification_button') {
      if (!client.tempMathProblem) {
        return await interaction.reply({ content: 'Problem matematyczny nie jest dostępny.', ephemeral: true });
      }

      const { num1, num2 } = client.tempMathProblem;

      const modal = new ModalBuilder()
        .setCustomId('verification_modal')
        .setTitle(`Rozwiąż zadanie: ${num1} + ${num2}`);

      const answerInput = new TextInputBuilder()
        .setCustomId('answer')
        .setLabel('Podaj odpowiedź')
        .setStyle(TextInputStyle.Short);

      const actionRow = new ActionRowBuilder().addComponents(answerInput);

      modal.addComponents(actionRow);

      await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'verification_modal') {
      const userAnswer = interaction.fields.getTextInputValue('answer');
      const { correctAnswer } = client.tempMathProblem || {};

      if (userAnswer === correctAnswer.toString()) {
        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (member) {
          await member.roles.add('1284195110237769809');
          await interaction.reply({ content: 'Poprawna odpowiedź! Otrzymałeś rolę.', ephemeral: true });
        } else {
          await interaction.reply({ content: 'Nie udało się znaleźć użytkownika w serwerze.', ephemeral: true });
        }
      } else {
        await interaction.reply({ content: 'Niepoprawna odpowiedź. Spróbuj ponownie.', ephemeral: true });
      }

      const num1 = Math.floor(Math.random() * 10) + 1;
      const num2 = Math.floor(Math.random() * 10) + 1;
      const newCorrectAnswer = num1 + num2;
      client.tempMathProblem = { num1, num2, correctAnswer: newCorrectAnswer };
    }

    if (interaction.isButton() && (interaction.customId.startsWith('approve_') || interaction.customId.startsWith('reject_'))) {
      const [action, messageId] = interaction.customId.split('_');
      const voteType = action === 'approve' ? 'approved' : 'rejected';
      const otherVoteType = action === 'approve' ? 'rejected' : 'approved';

      // Fetch the current votes
      db.get(`SELECT * FROM votes WHERE id = ?`, [messageId], async (err, row) => {
        if (err || !row) {
          return await interaction.reply({ content: 'Propozycja nie została znaleziona.', ephemeral: true });
        }

        // Check if the user has already voted
        db.get(`SELECT * FROM user_votes WHERE user_id = ? AND message_id = ?`, [interaction.user.id, messageId], async (err, userVote) => {
          if (err) {
            console.error('Error checking user vote:', err);
            return await interaction.reply({ content: 'Wystąpił błąd podczas głosowania.', ephemeral: true });
          }

          if (userVote) {
            // User has already voted, update their vote
            if (userVote.vote_type !== voteType) {
              db.run(`UPDATE votes SET ${userVote.vote_type} = ${userVote.vote_type} - 1, ${voteType} = ${voteType} + 1 WHERE id = ?`, [messageId], (err) => {
                if (err) console.error('Błąd podczas aktualizacji głosu:', err);
              });
              db.run(`UPDATE user_votes SET vote_type = ? WHERE user_id = ? AND message_id = ?`, [voteType, interaction.user.id, messageId], (err) => {
                if (err) console.error('Błąd podczas aktualizacji głosu użytkownika:', err);
              });
            }
          } else {
            // New vote
            db.run(`UPDATE votes SET ${voteType} = ${voteType} + 1 WHERE id = ?`, [messageId], (err) => {
              if (err) console.error('Błąd podczas zapisywania głosu:', err);
            });
            db.run(`INSERT INTO user_votes (user_id, message_id, vote_type) VALUES (?, ?, ?)`, [interaction.user.id, messageId, voteType], (err) => {
              if (err) console.error('Błąd podczas zapisywania głosu użytkownika:', err);
            });
          }

          // Calculate the percentages
          db.get(`SELECT * FROM votes WHERE id = ?`, [messageId], async (err, updatedRow) => {
            if (err || !updatedRow) {
              return await interaction.reply({ content: 'Wystąpił błąd podczas aktualizacji głosów.', ephemeral: true });
            }

            const totalVotes = updatedRow.approved + updatedRow.rejected;
            const approvePercent = totalVotes ? Math.round((updatedRow.approved / totalVotes) * 100) : 0;
            const rejectPercent = totalVotes ? Math.round((updatedRow.rejected / totalVotes) * 100) : 0;

            // Update the buttons
            const actionRow = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId(`approve_${messageId}`)
                  .setLabel(`✅ ${approvePercent}% [${updatedRow.approved}]`)
                  .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                  .setCustomId(`reject_${messageId}`)
                  .setLabel(`❌ ${rejectPercent}% [${updatedRow.rejected}]`)
                  .setStyle(ButtonStyle.Danger)
              );

            // Update the message
            const message = await interaction.message.fetch();
            await message.edit({ components: [actionRow] });

            await interaction.reply({ content: 'Głos został zapisany!', ephemeral: true });
          });
        });
      });
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'select_ticket_type') {
      const ticketType = interaction.values[0];
      const channelName = `${interaction.user.username}-${ticketType}`;
      const user = interaction.user.id;
      
      // Create a new channel
      const channel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        topic: `Zgłoszenie typu: ${ticketType}`,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: user,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
          },
          {
            id: '1284195110615122000',
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
          },
        ],
      });

      const embed = new EmbedBuilder()
        .setTitle('Zgłoszenie przyjęte')
        .setDescription(`Typ zgłoszenia: ${ticketType}`)
        .setColor('#00FF00')
        .setTimestamp();

      const actionRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('Zamknij zgłoszenie')
            .setStyle(ButtonStyle.Danger)
        );

      await channel.send({ embeds: [embed], components: [actionRow] });

      await interaction.reply({ content: `Kanał zgłoszeniowy został utworzony: ${channel}`, ephemeral: true });
    }

    if (interaction.isButton() && interaction.customId === 'close_ticket') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: 'Tylko administratorzy mogą zamknąć zgłoszenie.', ephemeral: true });
      }
    
      const user = interaction.user.id;
      const channel = interaction.channel;
    
      const closeEmbed = new EmbedBuilder()
        .setTitle('Zgłoszenie zamknięte')
        .setDescription('Kanał został zamknięty.')
        .setColor('#FF0000')
        .setTimestamp();
    
      const closeActionRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('delete_ticket')
            .setLabel('Usuń')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('reopen_ticket')
            .setLabel('Odblokuj')
            .setStyle(ButtonStyle.Success)
        );
    
      await interaction.update({ embeds: [closeEmbed], components: [closeActionRow] });
      await channel.permissionOverwrites.edit(user, { 
        SendMessages: false 
      });
    }

    if (interaction.isButton() && interaction.customId === 'delete_ticket') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: 'Tylko administratorzy mogą usunąć zgłoszenie.', ephemeral: true });
      }
      
      const channel = interaction.channel;
      await interaction.update({ content: 'Kanał zgłoszeniowy zostanie usunięty za 5 sekund.', components: [] });
      setTimeout(async () => {
        await channel.delete();
      }, 5000);
    }

    if (interaction.isButton() && interaction.customId === 'reopen_ticket') {
      const channel = interaction.channel;
      const user = interaction.user.id;

      const reopenEmbed = new EmbedBuilder()
        .setTitle('Zgłoszenie otwarte ponownie')
        .setDescription('Kanał został ponownie otwarty.')
        .setColor('#00FF00')
        .setTimestamp();

      const reopenActionRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('Zamknij zgłoszenie')
            .setStyle(ButtonStyle.Danger)
        );

      await interaction.update({ embeds: [reopenEmbed], components: [reopenActionRow] });
      await channel.permissionOverwrites.edit(user, { 
        SendMessages: true,
        ViewChannel: true
      });
      //await channel.setParent('1284986166176645132'); 
    }
  },
};
