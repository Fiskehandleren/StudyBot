
export class Pomodoro {
    conversationId:string;
    duration: number;
    shortBreak: number;
    longBreak: number;

    sessionCount = 0;
    breakActive = false;
    sessionActive = false;
    timer: NodeJS.Timeout;
    startTime: number;
    remaining: number;

    constructor(conversationId, duration=25, shortBreak=5, longBreak=15){
        this.conversationId = conversationId;
        this.duration = duration;
        this.shortBreak = shortBreak;
        this.longBreak = longBreak;
    }

    private sendMessage(message: string):void {
        const data = { message: message};

        fetch('http://localhost:3978/api/notify', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {'Content-Type': 'application/json'}
            }
        ).then(result => console.log(result)).catch(err => console.error(err))
    }

    public startSession(): void {
        this.breakActive = false;
        this.sessionActive = true;
        this.startTime = Date.now();
        this.sendMessage(`Started Pomodoro session! ${this.duration} minutes until next break!`)
        this.timer = setTimeout(this.startBreak, this.duration * 60 * 1000);
    }

    public startBreak(): void {
        this.sessionCount += 1
        this.sessionActive = false;
        this.breakActive = true
        
        this.startTime = Date.now();
        if (this.sessionCount % 2 == 1) {
            this.timer = setTimeout(this.startSession, this.shortBreak * 60 * 1000);
            this.sendMessage(`Started short break! ${this.shortBreak} minutes until next session!`)
        } else {
            this.timer = setTimeout(this.startSession, this.longBreak * 60 * 1000);
            this.sendMessage(`Started short break! ${this.longBreak} minutes until next session!`)
        }
    }

    public calculateTimeRemaining(): void {
        if (this.sessionActive) {
            this.remaining = (this.duration * 60 * 1000) - (Date.now() - this.startTime);
        }
        else if (this.sessionCount % 2 == 1) {
            this.remaining = (this.shortBreak * 60 * 1000) - (Date.now() - this.startTime);
        } else {
            this.remaining = (this.longBreak * 60 * 1000) - (Date.now() - this.startTime);
        }
    }

    public pauseSession(): void {
        this.calculateTimeRemaining()
        clearTimeout(this.timer)
    }

    public resumeSession(): void {
        this.calculateTimeRemaining()
        if (this.sessionActive) {
            this.timer = setTimeout(this.startBreak, this.remaining);
        } else {
            this.timer = setTimeout(this.startSession, this.remaining);
        }
    }
}

