import { NlpManager } from 'node-nlp'


export enum Greetings {
    Bye = 'greetings.bye',
    Hello = 'greetings.hello'
}

export async function setupNLP(manager: NlpManager): NlpManager {
    // Adds the utterances and intents for the NLP
    manager.addDocument('en', 'goodbye for now', Greetings.Bye);
    manager.addDocument('en', 'bye bye take care', Greetings.Bye);
    manager.addDocument('en', 'okay see you later', Greetings.Bye);
    manager.addDocument('en', 'bye for now', Greetings.Bye);
    manager.addDocument('en', 'i must go', Greetings.Bye);

    manager.addDocument('en', 'hello', Greetings.Hello);
    manager.addDocument('en', 'hi', Greetings.Hello);
    manager.addDocument('en', 'howdy', Greetings.Hello);
    manager.addDocument('en', 'hey', Greetings.Hello);

    // Train also the NLG
    manager.addAnswer('en', Greetings.Bye, 'Till next time');
    manager.addAnswer('en', Greetings.Bye, 'see you soon!');
    manager.addAnswer('en', Greetings.Bye, 'bye!');

    manager.addAnswer('en', Greetings.Hello, 'Hey there!');
    manager.addAnswer('en', Greetings.Hello, 'hey');
    manager.addAnswer('en', Greetings.Hello, 'whattup?');
    manager.addAnswer('en', Greetings.Hello, 'long time no see!');
    manager.addAnswer('en', Greetings.Hello, 'Greetings!');

    await manager.train()
    manager.save()
    return manager
}
