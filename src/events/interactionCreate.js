const {
  Client,
  Interaction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  ChannelType,
  EmbedBuilder,
} = require('discord.js');
const db = require('../utils/database');
const dbg = require('../utils/giveawayDatabase');

const TICKET_CATEGORY_ID = '1284195110615122009';
const LOG_CHANNEL_ID = '1284195111726485566';

module.exports = {
  name: 'interactionCreate',
  /**
   * @param {Client} client
   * @param {Interaction} interaction
   */
  async execute(client, interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: 'Ta komenda nie może być używana w wiadomościach prywatnych.',
        ephemeral: true,
      });
    }

    // Command interaction handling
    if (interaction.isCommand()) {
      if (!client.commands.has(interaction.commandName)) return;

      const interactionFunction = client.commands.get(interaction.commandName);

      if (interaction.deferred || interaction.replied) return;

      interactionFunction(interaction, client);
    }

    // Verification button handling
    if (interaction.isButton() && interaction.customId === 'verification_button') {
      if (!client.tempMathProblem) {
        return await interaction.reply({
          content: 'Problem matematyczny nie jest dostępny.',
          ephemeral: true,
        });
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

    // Modal submission handling
    if (interaction.isModalSubmit() && interaction.customId === 'verification_modal') {
      const userAnswer = interaction.fields.getTextInputValue('answer');
      const { correctAnswer } = client.tempMathProblem || {};

      await interaction.deferReply({ ephemeral: true }); // Defer the reply

      if (userAnswer === correctAnswer.toString()) {
        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (member) {
          await member.roles.add('1284195110237769809');
          await interaction.editReply({
            content: 'Poprawna odpowiedź! Otrzymałeś rolę.',
          });
        } else {
          await interaction.editReply({
            content: 'Nie udało się znaleźć użytkownika w serwerze.',
          });
        }
      } else {
        await interaction.editReply({
          content: 'Niepoprawna odpowiedź. Spróbuj ponownie.',
        });
      }

      const num1 = Math.floor(Math.random() * 10) + 1;
      const num2 = Math.floor(Math.random() * 10) + 1;
      const newCorrectAnswer = num1 + num2;
      client.tempMathProblem = { num1, num2, correctAnswer: newCorrectAnswer };
    }

// Giveaway join button handling
if (interaction.isButton() && interaction.customId.startsWith('join_')) {
  const name = interaction.customId.split('_')[1];
  const messageId = interaction.message.id;
  const giveaway = await dbg.getGiveawayByMessageId(messageId);

  if (!giveaway) {
    return interaction.reply({
      content: `Nie znaleziono giveaway o nazwie "${name}".`,
      ephemeral: true,
    });
  }

  const participants = await dbg.getParticipants(giveaway.id);
  if (participants.includes(interaction.user.id)) {
    return interaction.reply({
      content: 'Już dołączyłeś do tego giveaway.',
      ephemeral: true,
    });
  }

  // Dodaj uczestnika do giveaway
  await dbg.addParticipant(giveaway.id, interaction.user.id);
  
  // Zaktualizuj liczbę uczestników
  const updatedParticipants = await dbg.getParticipants(giveaway.id);
  
  // Zaktualizuj embed
  const embed = interaction.message.embeds[0];
  const newEmbed = EmbedBuilder.from(embed)
    .spliceFields(1, 1, { 
      name: 'Liczba uczestników', 
      value: updatedParticipants.length.toString(), 
      inline: true 
    });

  // Aktualizuj wiadomość z embedem
  await interaction.update({ embeds: [newEmbed] });

  // Powiadom użytkownika, że dołączył do giveaway
  await interaction.followUp({
    content: 'Dołączyłeś do giveaway!',
    ephemeral: true,
  });
}


    // Voting button handling
    if (interaction.isButton() && (interaction.customId.startsWith('approve_') || interaction.customId.startsWith('reject_'))) {
      const [action, messageId] = interaction.customId.split('_');
      const voteType = action === 'approve' ? 'approved' : 'rejected';

      await interaction.deferReply({ ephemeral: true }); // Defer the reply

      // Fetch the current votes
      db.get(`SELECT * FROM votes WHERE id = ?`, [messageId], async (err, row) => {
        if (err) {
          console.error('Błąd podczas pobierania głosów:', err);
          return await interaction.editReply({
            content: 'Wystąpił błąd podczas głosowania.',
          });
        }

        if (!row) {
          return await interaction.editReply({
            content: 'Propozycja nie została znaleziona.',
          });
        }

        // Check if the user has already voted
        db.get(
          `SELECT * FROM user_votes WHERE user_id = ? AND message_id = ?`,
          [interaction.user.id, messageId],
          async (err, userVote) => {
            if (err) {
              console.error('Błąd podczas sprawdzania głosu użytkownika:', err);
              return await interaction.editReply({
                content: 'Wystąpił błąd podczas głosowania.',
              });
            }

            if (userVote) {
              // User has already voted, update their vote
              if (userVote.vote_type !== voteType) {
                db.run(
                  `UPDATE votes SET ${userVote.vote_type} = ${userVote.vote_type} - 1, ${voteType} = ${voteType} + 1 WHERE id = ?`,
                  [messageId],
                  (err) => {
                    if (err) console.error('Błąd podczas aktualizacji głosu:', err);
                  }
                );
                db.run(
                  `UPDATE user_votes SET vote_type = ? WHERE user_id = ? AND message_id = ?`,
                  [voteType, interaction.user.id, messageId],
                  (err) => {
                    if (err) console.error('Błąd podczas aktualizacji głosu użytkownika:', err);
                  }
                );
              } else {
                return await interaction.editReply({
                  content: 'Już oddałeś głos w ten sposób.',
                });
              }
            } else {
              // New vote
              db.run(
                `UPDATE votes SET ${voteType} = ${voteType} + 1 WHERE id = ?`,
                [messageId],
                (err) => {
                  if (err) console.error('Błąd podczas zapisywania głosu:', err);
                }
              );
              db.run(
                `INSERT INTO user_votes (user_id, message_id, vote_type) VALUES (?, ?, ?)`,
                [interaction.user.id, messageId, voteType],
                (err) => {
                  if (err) console.error('Błąd podczas zapisywania głosu użytkownika:', err);
                }
              );
            }

            // Calculate the percentages
            db.get(
              `SELECT * FROM votes WHERE id = ?`,
              [messageId],
              async (err, updatedRow) => {
                if (err || !updatedRow) {
                  console.error('Błąd podczas pobierania zaktualizowanych głosów:', err);
                  return await interaction.editReply({
                    content: 'Wystąpił błąd podczas aktualizacji głosów.',
                  });
                }

                const totalVotes = updatedRow.approved + updatedRow.rejected;
                const approvePercent = totalVotes
                  ? Math.round((updatedRow.approved / totalVotes) * 100)
                  : 0;
                const rejectPercent = totalVotes
                  ? Math.round((updatedRow.rejected / totalVotes) * 100)
                  : 0;

                // Update the buttons
                const actionRow = new ActionRowBuilder().addComponents(
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

                await interaction.editReply({ content: 'Głos został zapisany!' });
              }
            );
          }
        );
      });
    }

    // Ticket type select menu interaction
    if (interaction.isStringSelectMenu() && interaction.customId === 'select_ticket_type') {
      const ticketType = interaction.values[0];
      const channelName = `${interaction.user.username}-${ticketType}`;
      const user = interaction.user.id;

      // Create a new channel in the specified category
      const channel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: TICKET_CATEGORY_ID,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: user,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          },
        ],
      });

      // Send a message to the new channel
      const embed = new EmbedBuilder()
        .setTitle('Ticket Utworzony')
        .setDescription(`Twój ticket został utworzony: ${ticketType}`)
        .setTimestamp();

      await channel.send({ embeds: [embed] });

      // Log the ticket creation
      const logEmbed = new EmbedBuilder()
        .setTitle('Nowy Ticket')
        .setDescription(`Użytkownik ${interaction.user.tag} utworzył ticket o typie: ${ticketType}`)
        .setTimestamp();

      const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
      if (logChannel) {
        await logChannel.send({ embeds: [logEmbed] });
      }

      await interaction.reply({ content: 'Twój ticket został utworzony!', ephemeral: true });
    }
  },
};
