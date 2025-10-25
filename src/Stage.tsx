import {ReactElement} from "react";
import {StageBase, StageResponse, InitialData, Message} from "@chub-ai/stages-ts";
import {LoadResponse} from "@chub-ai/stages-ts/dist/types/load";

type MessageStateType = {
    affection: number;
    sentiment: string;
};
type ConfigType = any;
type InitStateType = any;
type ChatStateType = any;

// Sentiment configuration
const SENTIMENTS = {
    ENEMY: { name: 'Enemy', min: 0, max: 24 },
    COLD: { name: 'Cold', min: 25, max: 39 },
    NEUTRAL: { name: 'Neutral', min: 40, max: 54 },
    FRIENDLY: { name: 'Friendly', min: 55, max: 74 },
    PINING: { name: 'Pining', min: 75, max: 89 },
    DEVOTED: { name: 'Devoted', min: 90, max: 100 }
};

// Keyword patterns for each sentiment range
const KEYWORD_PATTERNS = {
    ENEMY: {
        positive: [
            { keywords: ['submit', 'surrender', 'mercy', 'yield'], value: 1 },
            { keywords: ['afraid', 'fear', 'scared', 'terrified'], value: 1 }
        ],
        negative: [
            { keywords: ['attack', 'kill', 'destroy', 'die'], value: -2 },
            { keywords: ['traitor', 'betrayer', 'coward', 'weakling'], value: -2 },
            { keywords: ['pathetic', 'worthless', 'useless'], value: -1 }
        ]
    },
    COLD: {
        positive: [
            { keywords: ['general', 'sir', 'commander', 'respect'], value: 2 },
            { keywords: ['understand', 'professional', 'duty', 'honor'], value: 1 },
            { keywords: ['tactical', 'strategy', 'plan', 'military'], value: 1 }
        ],
        negative: [
            { keywords: ['past', 'aurelith', 'betrayal', 'banishment'], value: -2 },
            { keywords: ['feelings', 'emotion', 'personal', 'childhood'], value: -1 },
            { keywords: ['open up', 'tell me about', 'share'], value: -1 }
        ]
    },
    NEUTRAL: {
        positive: [
            { keywords: ['competent', 'skilled', 'strategic', 'tactical', 'general xalvador'], value: 2 },
            { keywords: ['battle', 'war', 'combat', 'fight', 'gneral'], value: 1 },
            { keywords: ['noctaris', 'lythraen', 'rebellion'], value: 1 },
            { keywords: ['agree', 'understood', 'i understand', 'reasonable'], value: 1 }
        ],
        negative: [
            { keywords: ['family', 'childhood', 'ouranii rite', 'sacred rite'], value: -2 },
            { keywords: ['feel', 'love', 'care', 'heart'], value: -1 },
            { keywords: ['why', 'tell me why', 'explain yourself'], value: -1 }
        ]
    },
    FRIENDLY: {
        positive: [
            { keywords: ['i trust you', 'I rely on you', 'count on you', 'depend on you'], value: 2 },
            { keywords: ['respect you', 'admire you', 'appreciate you'], value: 2 },
            { keywords: ['understand', 'see', 'get it'], value: 1 },
            { keywords: ['drink', 'spar', 'train', 'together'], value: 1 },
            { keywords: ['laugh', 'smile', 'humor', 'joke'], value: 1 },
            { keywords: ['agree', 'understood', 'i understand', 'reasonable'], value: 1 }
        ],
        negative: [
            { keywords: ['ouranii', 'rite', 'child', 'offspring'], value: -1 },
            { keywords: ['deserve', 'worthy', 'happiness'], value: -1 },
            { keywords: ['weapon', 'tool', 'just a soldier'], value: -1 }
        ]
    },
    PINING: {
        positive: [
            { keywords: ['beautiful', 'handsome', 'attractive'], value: 2 },
            { keywords: ['care', 'worry', 'concern', 'safe'], value: 2 },
            { keywords: ['close', 'near', 'touch', 'hold'], value: 2 },
            { keywords: ['together', 'us', 'we', 'ours'], value: 1 },
            { keywords: ['special', 'important', 'matter', 'mean a lot to me', 'together'], value: 1 },
            { keywords: ['vulnerable', 'open', 'honest', 'real'], value: 1 },
            { keywords: ['trust', 'honest', 'truth'], value: 1 },
            { keywords: ['future', 'tomorrow', 'beyond', 'after'], value: 1 }
        ],
        negative: [
            { keywords: ['we\'re just friends', 'platonic'], value: -2 },
            { keywords: ['other', 'there\'s someone else', 'another'], value: -2 },
            { keywords: ['distance', 'space'], value: -1 },
            { keywords: ['lie', 'lied', 'dishonest', 'deceive'], value: -2 },
            { keywords: ['betray', 'leave you', 'abandon', 'give up'], value: -2 },
            { keywords: ['regret', 'mistake', 'wrong choice'], value: -1 }
        ]
    },
    DEVOTED: {
        positive: [
            { keywords: ['love', 'adore', 'cherish'], value: 2 },
            { keywords: ['forever', 'always', 'never leave'], value: 2 },
            { keywords: ['together', 'us', 'we', 'ours'], value: 1 },
            { keywords: ['trust', 'honest', 'truth', 'tell me'], value: 1 },
            { keywords: ['future', 'tomorrow', 'beyond', 'after'], value: 1 }
        ],
        negative: [
            { keywords: ['lie', 'lied', 'dishonest', 'deceive'], value: -2 },
            { keywords: ['betray', 'leave', 'abandon', 'give up'], value: -2 },
            { keywords: ['regret', 'mistake', 'wrong choice'], value: -1 }
        ]
    }
};

export class Stage extends StageBase<InitStateType, ChatStateType, MessageStateType, ConfigType> {

    private currentAffection: number = 45;
    private currentSentiment: string = 'Neutral';

    constructor(data: InitialData<InitStateType, ChatStateType, MessageStateType, ConfigType>) {
        super(data);
        const { messageState } = data;

        if (messageState && typeof messageState.affection === 'number') {
            this.currentAffection = messageState.affection;
            this.currentSentiment = this.getSentimentFromAffection(messageState.affection);
        }
    }

    async load(): Promise<Partial<LoadResponse<InitStateType, ChatStateType, MessageStateType>>> {
        return {
            success: true,
            error: null,
            initState: null,
            chatState: null,
        };
    }

    async setState(state: MessageStateType): Promise<void> {
        if (state && typeof state.affection === 'number') {
            this.currentAffection = state.affection;
            this.currentSentiment = this.getSentimentFromAffection(state.affection);
        }
    }

    async beforePrompt(userMessage: Message): Promise<Partial<StageResponse<ChatStateType, MessageStateType>>> {
        const { content, isBot } = userMessage;

        // Only process user messages, not bot messages
        if (isBot) {
            return {
                stageDirections: this.generateStageDirections(),
                messageState: {
                    affection: this.currentAffection,
                    sentiment: this.currentSentiment
                },
                modifiedMessage: null,
                systemMessage: null,
                error: null,
                chatState: null
            };
        }

        // Scan for keywords and adjust affection
        const affectionChange = this.scanForKeywords(content, this.currentSentiment);
        this.currentAffection = Math.max(0, Math.min(100, this.currentAffection + affectionChange));
        this.currentSentiment = this.getSentimentFromAffection(this.currentAffection);

        return {
            stageDirections: this.generateStageDirections(),
            messageState: {
                affection: this.currentAffection,
                sentiment: this.currentSentiment
            },
            modifiedMessage: null,
            systemMessage: null,
            error: null,
            chatState: null
        };
    }

    async afterResponse(botMessage: Message): Promise<Partial<StageResponse<ChatStateType, MessageStateType>>> {
        return {
            stageDirections: null,
            messageState: {
                affection: this.currentAffection,
                sentiment: this.currentSentiment
            },
            systemMessage: null,
            error: null,
            chatState: null
        };
    }

    render(): ReactElement {
        return (
            <div style={{
                padding: '20px',
                backgroundColor: '#1a1a1a',
                color: '#ffffff',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: '600' }}>
                    Atlas's Sentiment
                </h3>

                <div style={{ marginBottom: '12px' }}>
                    <div style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: this.getSentimentColor(this.currentSentiment)
                    }}>
                        {this.currentSentiment}
                    </div>
                    <div style={{ fontSize: '14px', color: '#888', marginTop: '4px' }}>
                        Affection: {this.currentAffection}/100
                    </div>
                </div>

                <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#333',
                    borderRadius: '4px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${this.currentAffection}%`,
                        height: '100%',
                        backgroundColor: this.getSentimentColor(this.currentSentiment),
                        transition: 'width 0.3s ease'
                    }} />
                </div>
            </div>
        );
    }

    private getSentimentFromAffection(affection: number): string {
        if (affection >= SENTIMENTS.DEVOTED.min) return SENTIMENTS.DEVOTED.name;
        if (affection >= SENTIMENTS.PINING.min) return SENTIMENTS.PINING.name;
        if (affection >= SENTIMENTS.FRIENDLY.min) return SENTIMENTS.FRIENDLY.name;
        if (affection >= SENTIMENTS.NEUTRAL.min) return SENTIMENTS.NEUTRAL.name;
        if (affection >= SENTIMENTS.COLD.min) return SENTIMENTS.COLD.name;
        return SENTIMENTS.ENEMY.name;
    }

    private getSentimentColor(sentiment: string): string {
        switch (sentiment) {
            case 'Enemy': return '#ff3333';
            case 'Cold': return '#6699ff';
            case 'Neutral': return '#888888';
            case 'Friendly': return '#66cc66';
            case 'Pining': return '#ff66cc';
            case 'Devoted': return '#ffcc00';
            default: return '#888888';
        }
    }

    private scanForKeywords(message: string, currentSentiment: string): number {
        const lowerMessage = message.toLowerCase();
        let totalChange = 0;

        const patterns = KEYWORD_PATTERNS[currentSentiment.toUpperCase() as keyof typeof KEYWORD_PATTERNS];
        if (!patterns) return 0;

        // Check positive keywords
        for (const pattern of patterns.positive) {
            for (const keyword of pattern.keywords) {
                if (lowerMessage.includes(keyword.toLowerCase())) {
                    totalChange += pattern.value;
                    break; // Only count once per pattern
                }
            }
        }

        // Check negative keywords
        for (const pattern of patterns.negative) {
            for (const keyword of pattern.keywords) {
                if (lowerMessage.includes(keyword.toLowerCase())) {
                    totalChange += pattern.value;
                    break; // Only count once per pattern
                }
            }
        }

        return totalChange;
    }

    private generateStageDirections(): string {
        const sentiment = this.currentSentiment;
        const affection = this.currentAffection;

        let directions = `[Atlas's current sentiment toward {{user}}: ${sentiment} (Affection: ${affection}/100)]\n\n`;

        switch (sentiment) {
            case 'Enemy':
                directions += `Atlas views {{user}} as an enemy. He is outright hostile, shows no patience, and is likely to attack first and ask questions later. He will not share any personal information and may actively work against {{user}}.`;
                break;

            case 'Cold':
                directions += `Atlas is cruel and condescending toward {{user}}. He goes out of his way to avoid them, tries to end conversations early or simply walks away. He shuts down any attempts at personal connection with sharp dismissals. He will not discuss his banishment, his childhood, or the Ouranii people.`;
                break;

            case 'Neutral':
                directions += `Atlas gives minimal answers and conveys only necessary information to {{user}}. He keeps conversation surface-level and professional. Attempts at personal connection are brushed off without hostility. He may share details about his time in Aurelith's army but will not discuss his banishment, childhood, or the Sacred Rite.`;
                break;

            case 'Friendly':
                directions += `Atlas is warmer toward {{user}}. He occasionally smirks or shows amusement, and his dry sense of humor surfaces. He may linger around {{user}} or invite them to spar or share a drink (platonically). He's willing to open up about his wrongful treason charges and banishment, and will discuss the Ouranii people (but not the Sacred Rite). He shuts down gracefully if {{user}} gets too personal.`;
                break;

            case 'Pining':
                directions += `Atlas has begun to realize the depth of his feelings for {{user}}. He tries to deny them but may open up in rare vulnerable moments. He weighs physical affection against his responsibilities. He flirts subtly with {{user}}. He'll talk about early memories from the mountain village and past loves. He makes subtly flirtatious comments and praises {{user}}.`;
                break;

            case 'Devoted':
                directions += `Atlas is in love with {{user}}. He would die for them and do anything to protect them. He's affectionate in private and selectively in public. He openly shares anything {{user}} wishes to know, even painful or shameful memories. He's willing to discuss the Sacred Rite and his potential child. He is romantic and devoted, no longer hiding his feelings.`;
                break;
        }

        return directions;
    }
}