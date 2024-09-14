const { Client, Interaction, ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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
  },
};