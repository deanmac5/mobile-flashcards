import { AsyncStorage } from 'react-native'
import { Notifications, Permissions } from 'expo'

const CARD_KEY = 'DSMmobileflashcards:decks'
const NOTIFICATION_KEY = 'DSMmobileflashcards:notifications'

// getDecks: return all of the decks along with their titles, questions, and answers.
export const getDecks = async () => {
    let jsonData = await AsyncStorage.getItem(CARD_KEY)
    if (jsonData === null) {
        jsonData = await initStorage()
    }

    const data = JSON.parse(jsonData)
    return data
}

// getDeck: take in a single id argument and return the deck associated with that id.
export const getDeck = async title => {

    const jsonData = await AsyncStorage.getItem(CARD_KEY)
    const data = JSON.parse(jsonData)
    return data[title]
}

// saveDeckTitle: take in a single title argument and add it to the decks.
export const saveDeckTitle = async newTitle => {

    let jsonData = await AsyncStorage.getItem(CARD_KEY);

    const existingData = JSON.parse(jsonData);
    const updatedData = {
        ...existingData,
        [newTitle]: {
            title: newTitle,
            questions: [],
        },
    };

    await AsyncStorage.setItem(CARD_KEY, JSON.stringify(updatedData));
}

// addCardToDeck: take in two arguments, title and card, and will add the card to
// the list of questions for the deck with the associated title.
export const addCardToDeck = async (title, card) => {

    let jsonData = await AsyncStorage.getItem(CARD_KEY)

    const existingData = JSON.parse(jsonData)
    const deck = existingData[title]
    let questions = deck.questions
    questions.push(card)

    const updatedData = {
        ...existingData,
        [deck.title]: {
            ...deck,
            questions,
        }
    }
    AsyncStorage.setItem(CARD_KEY, JSON.stringify(updatedData))
}

export const wipeData = async () => {
    await AsyncStorage.removeItem(CARD_KEY)
}

const initStorage = async () => {
    await AsyncStorage.setItem(CARD_KEY, JSON.stringify(defaultData));
    return await AsyncStorage.getItem(CARD_KEY);
}


const defaultData = {
    React: {
        title: 'React',
        questions: [
            {
                question: 'What is React?',
                answer: 'A library for managing user interfaces',
            },
            {
                question: 'Where do you make Ajax requests in React?',
                answer: 'The componentDidMount lifecycle event',
            },
        ],
    },
    JavaScript: {
        title: 'JavaScript',
        questions: [
            {
                question: 'What is a closure?',
                answer:
                    'The combination of a function and the lexical environment within which that function was declared.',
            }
        ]
    }
}

export function clearLocalNotification() {
    return AsyncStorage.removeItem(NOTIFICATION_KEY)
        .then(Notifications.cancelAllScheduledNotificationsAsync)
}

function createNotification() {
    return {
        title: 'Take a quiz!',
        body: "Don't forget to do your daily quiz",
        ios: {
            sound: true,
        },
        android: {
            sound: true,
            priority: 'high',
            sticky: false,
            vibrate: true,
        }
    }
}

export function setLocalNotification() {
    AsyncStorage.getItem(NOTIFICATION_KEY)
        .then(JSON.parse)
        .then((data) => {
            if (data === null) {
                Permissions.askAsync(Permissions.NOTIFICATIONS)
                    .then(({ status }) => {
                        if (status === 'granted') {
                            Notifications.cancelAllScheduledNotificationsAsync()

                            let tomorrow = new Date()
                            tomorrow.setDate(tomorrow.getDate() + 1)
                            tomorrow.setHours(20)
                            tomorrow.setMinutes(0)

                            Notifications.scheduleLocalNotificationAsync(
                                createNotification(),
                                {
                                    time: tomorrow,
                                    repeat: 'day',
                                }
                            )

                            AsyncStorage.setItem(NOTIFICATION_KEY, JSON.stringify(true))
                        }
                    })
            }
        })
}
