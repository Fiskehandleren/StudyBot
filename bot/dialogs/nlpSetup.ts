import { NlpManager } from 'node-nlp'


export enum Greetings {
    Bye = 'greetings.bye',
    Hello = 'greetings.hello',
    Insult = 'greetings.insult'
}

export async function setupNLP(manager: NlpManager): NlpManager {
    // Adds the utterances and intents for the NLP
    manager.addDocument('en', 'goodbye for now', Greetings.Bye);
    manager.addDocument('en', 'bye bye take care', Greetings.Bye);
    manager.addDocument('en', 'okay see you later', Greetings.Bye);
    manager.addDocument('en', 'bye for now', Greetings.Bye);

    manager.addDocument('en', 'hello', Greetings.Hello);
    manager.addDocument('en', 'hi', Greetings.Hello);
    manager.addDocument('en', 'howdy', Greetings.Hello);
    manager.addDocument('en', 'hey', Greetings.Hello);

    manager.addDocument('en', 'i hate you', Greetings.Insult);
    manager.addDocument('en', 'you suck', Greetings.Insult);
    manager.addDocument('en', 'i hate this', Greetings.Insult);
    manager.addDocument('en', 'annoying', Greetings.Insult);
    manager.addDocument('en', 'bad', Greetings.Insult);

    // Train also the NLG
    manager.addAnswer('en', Greetings.Bye, 'Till next time');
    manager.addAnswer('en', Greetings.Bye, 'see you soon!');
    manager.addAnswer('en', Greetings.Bye, 'bye!');

    manager.addAnswer('en', Greetings.Hello, 'Hey there!');
    manager.addAnswer('en', Greetings.Hello, 'hey');
    manager.addAnswer('en', Greetings.Hello, 'whattup?');
    manager.addAnswer('en', Greetings.Hello, 'long time no see!');
    manager.addAnswer('en', Greetings.Hello, 'Greetings!');

    manager.addAnswer('en', Greetings.Insult, 'Calm down fella')
    manager.addAnswer('en', Greetings.Insult, 'Why you mad?')
    manager.addAnswer('en', Greetings.Insult, 'Monday huh?')
    
    await manager.train()
    manager.save()
    return manager
}
