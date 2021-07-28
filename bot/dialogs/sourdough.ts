export class Sourdough {
    timer: NodeJS.Timeout;
    feedTime: number;
    conversationId: string;

    constructor(conversationId: string) {
        this.conversationId = conversationId;
    }

    private sendMessage(message: string):void {
        const data = { message: message, conversationId: this.conversationId};

        fetch('http://localhost:3978/api/notify', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {'Content-Type': 'application/json'}
            }
        ).then(result => console.log(result)).catch(err => console.error(err))
    }

    public feed(): void {
        this.sendMessage(`You have now fed your sourdough. I'll send a message at xxx when you have to feed`)
        this.feedTime = Date.now();
        this.timer = setTimeout(function() {this.sendMessage(`Please make autolyse! Type <strong> sourdough autolyse </strong> to confirm`);} , 120 * 60 * 1000);
    }

    public autolyse(): void {
        this.sendMessage(`You have now made autolyse dough. I'll send a message at xxx when you have to observer when the sourdough is peaking!`)
        this.timer = setTimeout(function() {this.sendMessage(`You need to check if sourdough is peeking! Type <strong> sourdough mix </strong> to confirm that you have assembled the autolyse dough and sourdough`);} , Date.now() - this.feedTime + 4 * 60 * 60 * 1000);
    }

    public sourdoughMix(): void {
        this.sendMessage(`You have now mixed the sourdough with the autolyse! Now it needs to go into a raising basket. I'll send you a message when it's ready to bake! `)
        this.timer = setTimeout(function() {this.sendMessage(`The dough is ready to be baked!!`);} , 8 * 60 * 60 * 1000);
    }
}