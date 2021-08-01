import { TeamsActivityHandler, CardFactory, TurnContext, ActionTypes, BotState, Activity} from "botbuilder";
import { cardButtons } from "./dialogs/cardButtons";
import { MainDialog } from "./dialogs/mainDialog";

export class TeamsBot extends TeamsActivityHandler {
  conversationState: BotState;
  userState: BotState;
  dialog: MainDialog;
  dialogState: any;
  conversationReferences: any;
  /**
   * @param {ConversationState} conversationState
   * @param {UserState} userState
   * @param {Dialog} dialog
   * @param {ConversationReferences} conversationReferences
   */
  constructor(conversationState: BotState, userState: BotState, dialog: MainDialog, conversationReferences: any) {
    super();
    if (!conversationState) {
      throw new Error("[TeamsBot]: Missing parameter. conversationState is required");
    }
    if (!userState) {
      throw new Error("[TeamsBot]: Missing parameter. userState is required");
    }
    if (!dialog) {
      throw new Error("[TeamsBot]: Missing parameter. dialog is required");
    }
    this.conversationState = conversationState;
    this.userState = userState;
    this.dialog = dialog;
    this.dialogState = this.conversationState.createProperty("DialogState");
    this.conversationReferences = conversationReferences;

    this.onMessage(async (context, next) => {
      console.log("Running dialog with Message Activity.");
      this.addConversationReference(context.activity);

      // Run the Dialog with the new message Activity.
      await this.dialog.run(context, this.dialogState);
      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });
    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      for (let cnt = 0; cnt < membersAdded.length; cnt++) {
        if (membersAdded[cnt].id) {
          const card = CardFactory.heroCard("Welcome", null, cardButtons.intro, {
            text: `Hello! I'm StudyBot. <br>You can reply <strong>intro</strong> to see an introduction card. To see all available commands visit the <a href=\"https://github.com/Fiskehandleren/StudyBot">Github repository</a>`,
          });
          await context.sendActivity({ attachments: [card] });
          break;
        }
      }
      await next();
    });

    this.onConversationUpdate(async (context, next) => {
      this.addConversationReference(context.activity);

      await next();
  });
  }

  async run(context: TurnContext): Promise<void> {
    await super.run(context);

    // Save any state changes. The load happened during the execution of the Dialog.
    await this.conversationState.saveChanges(context, false);
    await this.userState.saveChanges(context, false);
  }

  async handleTeamsSigninVerifyState(context: TurnContext): Promise<void> {
    console.log("Running dialog with signin/verifystate from an Invoke Activity.");
    await this.dialog.run(context, this.dialogState);
  }

  async handleTeamsSigninTokenExchange(context: TurnContext): Promise<void> {
    await this.dialog.run(context, this.dialogState);
  }

  async onSignInInvoke(context: TurnContext): Promise<void> {
    await this.dialog.run(context, this.dialogState);
  }

  addConversationReference(activity: Activity): void {
    const conversationReference = TurnContext.getConversationReference(activity);
    this.conversationReferences[conversationReference.conversation.id] = conversationReference;
}

}

