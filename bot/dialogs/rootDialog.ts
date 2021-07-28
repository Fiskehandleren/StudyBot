import { ActionTypes, CardFactory, TurnContext, TextFormatTypes } from "botbuilder";
import { ComponentDialog, DialogContext } from "botbuilder-dialogs";
import { Prompts } from './dialogs'
import { NlpManager } from 'node-nlp'
import { setupNLP } from './nlpSetup'
import { Pomodoro } from "./pomodoro";

export class RootDialog extends ComponentDialog {
  manager = new NlpManager({ languages: ['en'], forceNER: true })
  pomodoro: Pomodoro;

  constructor(id: string) {
    super(id);
    setupNLP(this.manager).then((manager: NlpManager) => this.manager = manager);
  }

  async onBeginDialog(innerDc: DialogContext, options: {} | undefined) {
    const result = await this.triggerCommand(innerDc);
    if (result) {
      return result;
    }
    return super.onBeginDialog(innerDc, options);
  }

  async onContinueDialog(innerDc: DialogContext) {
    return super.onContinueDialog(innerDc);
  }

  async sendPomodoroStartDialog(innerDc: DialogContext) {
    const cardButtons = [
      {
        type: ActionTypes.ImBack,
        title: "Start pomodoro",
        value: "pomodoro start",
      },
    ];
    const card = CardFactory.heroCard("", null, cardButtons, {
      text: `No Pomodoro instance found!`,
    });
    await innerDc.context.sendActivity({ attachments: [card] });
  }

  async triggerCommand(innerDc: DialogContext) {
    const conversationId = innerDc.context.activity.conversation.id;
    const removedMentionText = TurnContext.removeRecipientMention(innerDc.context.activity);
    const text = removedMentionText?.toLowerCase().replace(/\n|\r/g, "").trim(); // Remove the line break

    if (innerDc.context.activity.textFormat !== TextFormatTypes.Plain) {
      return innerDc.cancelAllDialogs();
    }
    console.log(text)
    switch (text) {
      case "whoami": {
        if (innerDc.context.activity.conversation.isGroup) {
          await innerDc.context.sendActivity(Prompts.GroupSSO);
          return innerDc.cancelAllDialogs();
        }
        break;
      }
      case "icinga": {
        await innerDc.context.sendActivity(Prompts.Icinga);
        return innerDc.cancelAllDialogs();
      }
      case "intro": {
        const cardButtons = [
          {
            type: ActionTypes.ImBack,
            title: "Show profile",
            value: "show",
          },
        ];
        const card = CardFactory.heroCard("Introduction", null, cardButtons, { text: `whoami`});

        await innerDc.context.sendActivity({ attachments: [card] });
        return innerDc.cancelAllDialogs();
      }
      case 'pomodoro': {
        const cardButtons = [
          {
            type: ActionTypes.ImBack,
            title: "Start pomodoro session",
            value: "pomodoro start",
          },
          {
            type: ActionTypes.ImBack,
            title: "Get stats of Pomodoro usage",
            value: "pomodoro stats",
          },
        ];  
        const card = CardFactory.heroCard("Pomodoro", null, cardButtons, null);
        await innerDc.context.sendActivity({ attachments: [card] });
        return innerDc.cancelAllDialogs();
      }
      case 'pomodoro start': {
        await innerDc.context.sendActivity('Starting Pomodoro');
        if (this.pomodoro) {
          this.pomodoro.startSession()
        } else {
          this.pomodoro = new Pomodoro(conversationId);
          this.pomodoro.startSession()
        }
        return innerDc.cancelAllDialogs();
      }
      case 'pomodoro pause': {
        if (this.pomodoro && (this.pomodoro.sessionActive || this.pomodoro.breakActive)) {
          this.pomodoro.pauseSession()
          const cardButtons = [
            {
              type: ActionTypes.ImBack,
              title: "Resume Pomodoro session",
              value: "pomodoro resume",
            },
          ];
          const card = CardFactory.heroCard("", null, cardButtons, {
            text: `Pomodoro session paused! Resume when you're ready!`,
          });
          await innerDc.context.sendActivity({ attachments: [card] });
        } else {
          await this.sendPomodoroStartDialog(innerDc)
        }
        return innerDc.cancelAllDialogs();
      }
      case 'pomodoro resume': {
        this.pomodoro.resumeSession();
        await innerDc.context.sendActivity('Resuming session...')
        this.pomodoro.calculateTimeRemaining()
          if (this.pomodoro.breakActive){
            await innerDc.context.sendActivity(`Time remaining of break: ${((this.pomodoro.remaining / 1000) / 60).toFixed(1)} minutes`);
          } else {
            await innerDc.context.sendActivity(`Time remaining of session: ${((this.pomodoro.remaining / 1000) / 60).toFixed(1)}`);
          }
          return innerDc.cancelAllDialogs();
        }
      case 'pomodoro status': {
        if (this.pomodoro) {
          this.pomodoro.calculateTimeRemaining()
          if (this.pomodoro.breakActive){
            await innerDc.context.sendActivity(`Time remaining of break: ${((this.pomodoro.remaining / 1000) / 60).toFixed(1)} minutes`);
          } else {
            await innerDc.context.sendActivity(`Time remaining of session: ${((this.pomodoro.remaining / 1000) / 60).toFixed(1)}`);
          }
        } else {
          await this.sendPomodoroStartDialog(innerDc)
        }
        return innerDc.cancelAllDialogs();
      }
      case 'pomodoro stats': {
        if (this.pomodoro) {
          await innerDc.context.sendActivity(`Sessions: ${this.pomodoro.sessionCount}`);
        } else {
          await this.sendPomodoroStartDialog(innerDc)
        }
        return innerDc.cancelAllDialogs();
      }
      default: {
        (async() => {
          // Make NLP prediction
          const response = await this.manager.process('en', text);
          console.log(response)
          if (response['answer'] != undefined) {
            await innerDc.context.sendActivity(response['answer']);
          } 
          else if (response['sentiment']['vote'] == 'negative') {
            await innerDc.context.sendActivity('Why you mad?');
          } else {
            const cardButtons = [
              {
                type: ActionTypes.ImBack,
                title: "Show introduction card",
                value: "intro",
              },
            ];
            const card = CardFactory.heroCard("", null, cardButtons, {
              text: Prompts.Default,
            });
            await innerDc.context.sendActivity({ attachments: [card] });
          }
          return innerDc.cancelAllDialogs();
        })(); 
      }
    }
  }
}
