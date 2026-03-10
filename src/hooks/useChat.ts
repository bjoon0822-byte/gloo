import { useState, useRef, useCallback, useEffect } from 'react';
import type { ChatMessage } from '../types';

/**
 * AI 챗봇 커스텀 훅
 * - 메시지 상태 관리
 * - AI 스트리밍 응답 파싱 (텍스트 + Tool Call + Tool Result)
 * - 자동 스크롤
 */
export function useChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 채팅 컨테이너 refs (여러 곳에서 동시에 스크롤)
    const scrollRefs = useRef<(HTMLDivElement | null)[]>([]);

    const addScrollRef = useCallback((ref: HTMLDivElement | null) => {
        if (ref && !scrollRefs.current.includes(ref)) {
            scrollRefs.current.push(ref);
        }
    }, []);

    // 자동 스크롤 헬퍼
    const scrollAllToBottom = useCallback(() => {
        setTimeout(() => {
            scrollRefs.current.forEach(ref => {
                if (ref) ref.scrollTop = ref.scrollHeight;
            });
        }, 50);
    }, []);

    // input change handler
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    }, []);

    // 채팅 전송 handler
    const handleSubmit = useCallback(async (e: React.FormEvent, overrideInput?: string) => {
        e.preventDefault();
        const trimmed = (overrideInput ?? input).trim();
        if (!trimmed || isLoading) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: trimmed };
        setMessages(prev => [...prev, userMsg]);
        if (overrideInput === undefined) setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })) }),
            });

            if (!res.ok) throw new Error(`API 응답 오류: ${res.status}`);

            // 스트리밍 텍스트 파싱 (tool call/result 포함)
            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let fullText = '';
            let hasContent = false;
            const toolInvocationsMap: Record<string, any> = {};
            const assistantId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', toolInvocations: [] }]);

            // 헬퍼: 현재 toolInvocations 상태를 메시지에 반영
            const updateMsg = (text: string) => {
                const invocations = Object.values(toolInvocationsMap);
                setMessages(prev => prev.map(m => m.id === assistantId
                    ? { ...m, content: text, toolInvocations: invocations.length > 0 ? invocations : undefined }
                    : m
                ));
                scrollAllToBottom();
            };

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n').filter(Boolean);

                    for (const line of lines) {
                        // Text chunk (0:)
                        if (line.startsWith('0:')) {
                            try {
                                const text = JSON.parse(line.slice(2));
                                fullText += text;
                                hasContent = true;
                                updateMsg(fullText);
                            } catch { /* skip */ }
                        }
                        // Tool call (9:)
                        else if (line.startsWith('9:')) {
                            hasContent = true;
                            try {
                                const toolCall = JSON.parse(line.slice(2));
                                const toolCallId = toolCall.toolCallId;
                                toolInvocationsMap[toolCallId] = {
                                    toolCallId,
                                    toolName: toolCall.toolName,
                                    args: toolCall.args,
                                    state: 'call',
                                };
                                updateMsg(fullText);
                            } catch { /* skip */ }
                        }
                        // Tool result (a:)
                        else if (line.startsWith('a:')) {
                            hasContent = true;
                            try {
                                const toolResult = JSON.parse(line.slice(2));
                                const toolCallId = toolResult.toolCallId;
                                if (toolInvocationsMap[toolCallId]) {
                                    toolInvocationsMap[toolCallId] = {
                                        ...toolInvocationsMap[toolCallId],
                                        state: 'result',
                                        result: toolResult.result,
                                    };
                                } else {
                                    toolInvocationsMap[toolCallId] = {
                                        toolCallId,
                                        toolName: 'search_shops',
                                        state: 'result',
                                        result: toolResult.result,
                                    };
                                }
                                updateMsg(fullText);
                            } catch { /* skip */ }
                        }
                    }
                }
            }

            if (!hasContent && !fullText) {
                setMessages(prev => prev.map(m => m.id === assistantId
                    ? { ...m, content: '죄송합니다. 응답을 처리하지 못했습니다. 다시 시도해주세요.' }
                    : m
                ));
            }
        } catch (err) {
            console.error('Chat API Error:', err);
            const errorMsg: ChatMessage = {
                id: (Date.now() + 2).toString(),
                role: 'assistant',
                content: '⚠️ AI 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, messages, scrollAllToBottom]);

    // Auto-scroll on new messages
    useEffect(() => {
        if (messages.length > 0) {
            scrollAllToBottom();
        }
    }, [messages, scrollAllToBottom]);

    return {
        messages,
        input,
        setInput,
        isLoading,
        handleInputChange,
        handleSubmit,
        addScrollRef,
    };
}
