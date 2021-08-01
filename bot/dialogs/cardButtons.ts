import {
    ActionTypes
} from "botbuilder";

export let cardButtons = {
    pomodoro: [{
            type: ActionTypes.ImBack,
            title: "Start pomodoro session",
            value: "pomodoro start",
        },
        {
            type: ActionTypes.ImBack,
            title: "Get stats of Pomodoro usage",
            value: "pomodoro stats",
        }
    ],
    pomodoroResume: [{
        type: ActionTypes.ImBack,
        title: "Resume Pomodoro session",
        value: "pomodoro resume",
    }],
    whoami: [{
        type: ActionTypes.ImBack,
        title: "Show profile",
        value: "show",
    }],
    intro: [{
        type: ActionTypes.ImBack,
        title: "Show introduction card",
        value: "intro",
    }]
}