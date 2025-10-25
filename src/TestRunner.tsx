import React, { useEffect, useState } from 'react';
import { Stage } from './Stage';
import { Message } from '@chub-ai/stages-ts';

// Test data
const testInit = {
    users: {
        '0': {
            anonymizedId: '1',
            name: 'User',
            isRemoved: false,
            chatProfile: ''
        }
    },
    characters: {
        '1': {
            anonymizedId: '1',
            name: 'Atlas Xalvador',
            isRemoved: false,
            description: 'The Iron Sentinel',
            example_dialogs: '',
            personality: 'Reserved, blunt, loyal',
            first_message: 'What do you want?',
            scenario: 'Military planning room in Noctaris',
            tavern_personality: '',
            system_prompt: '',
            post_history_instructions: '',
            alternate_greetings: [],
            partial_extensions: {
                chub: {
                    background_image: null
                }
            }
        }
    },
    messageState: null,
    config: null,
    environment: 'development' as const,
    initState: null,
    chatState: null
};

interface TestStageRunnerProps {
    factory: (data: any) => Stage;
}

export function TestStageRunner({ factory }: TestStageRunnerProps) {
    const [testOutput, setTestOutput] = useState<string[]>([]);
    const [stage, setStage] = useState<Stage | null>(null);

    useEffect(() => {
        runTests();
    }, []);

    async function runTests() {
        const output: string[] = [];

        output.push('=== Atlas Xalvador Affection System Test ===\n');

        const stageInstance = factory(testInit);
        await stageInstance.load();
        setStage(stageInstance);

        // Test scenarios
        const testMessages: Array<{ content: string; description: string; isBot: boolean }> = [
            { content: "General, what's your tactical assessment of our position?", description: 'Neutral - Military respect', isBot: false },
            { content: "I respect your leadership", description: 'Should increase affection', isBot: false },
            { content: "Tell me about your childhood", description: 'Too personal for Neutral - should decrease', isBot: false },
            { content: "Let's discuss battle strategy", description: 'Appropriate for current level', isBot: false },
            { content: "I trust you completely", description: 'Building trust', isBot: false },
            { content: "Want to spar together?", description: 'Friendly invitation', isBot: false },
            { content: "You're incredibly skilled", description: 'Compliment/respect', isBot: false },
            { content: "I care about you", description: 'Emotional connection', isBot: false },
            { content: "You're beautiful", description: 'Romantic interest', isBot: false },
            { content: "I love you", description: 'Declaration of love', isBot: false },
        ];

        for (const testMsg of testMessages) {
            const message: Message = {
                content: testMsg.content,
                anonymizedId: '1',
                isBot: testMsg.isBot,
                promptForId: '1',
                identity: '1',
                isMain: true
            };

            const result = await stageInstance.beforePrompt(message);

            output.push(`\n📝 User: "${testMsg.content}"`);
            output.push(`   Description: ${testMsg.description}`);
            output.push(`   Affection: ${result.messageState?.affection}/100`);
            output.push(`   Sentiment: ${result.messageState?.sentiment}`);
            output.push(`   ---`);
        }

        output.push('\n=== Test Complete ===\n');

        setTestOutput(output);
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#1a1a1a', color: '#fff', minHeight: '100vh' }}>
            <h1>Atlas Xalvador Affection System - Test Runner</h1>

            {stage && (
                <div style={{ marginBottom: '20px' }}>
                    {stage.render()}
                </div>
            )}

            <div style={{ marginTop: '20px' }}>
                <h2>Test Output:</h2>
                <pre style={{ backgroundColor: '#0a0a0a', padding: '15px', borderRadius: '5px', overflow: 'auto' }}>
                    {testOutput.join('\n')}
                </pre>
            </div>

            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#2a2a2a', borderRadius: '5px' }}>
                <h3>How to Use:</h3>
                <ul>
                    <li>This test runner automatically runs on load</li>
                    <li>Watch the affection changes as messages are processed</li>
                    <li>The UI component above shows the current state</li>
                    <li>Check the console for additional details</li>
                </ul>
            </div>
        </div>
    );
}