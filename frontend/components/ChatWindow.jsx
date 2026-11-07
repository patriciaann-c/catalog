import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';

const API_URL = 'http://localhost:3000';

const SUGGESTIONS = [
    'Do you have any wireless earbuds?',
    'What is the cheapest product in the store?',
    'Show me surveillance cameras and their prices',
    'Are there any portable chargers or power banks?'
];

function ChatWindow() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom whenever messages or loading state changes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    function sendTextMessage(textToSend) {
        const text = textToSend.trim();
        if (text === '' || loading) {
            return;
        }
        const newMessages = [...messages, { role: 'user', content: text }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);
        setError('');

        fetch(`${API_URL}/ai/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: newMessages })
        })
            .then((response) => response.json())
            .then((jsonData) => {
                if (!jsonData.success) {
                    throw new Error(jsonData.message);
                }
                setMessages([...newMessages, { role: 'assistant', content: jsonData.data.reply }]);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }

    function handleSubmit(event) {
        event.preventDefault();
        sendTextMessage(input);
    }

    return (
        <div className="container py-4" style={{ maxWidth: '840px' }}>
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                {/* Header */}
                <div className="card-header bg-primary text-white p-3 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3">
                        <div
                            className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                            style={{ width: '44px', height: '44px', fontSize: '22px' }}
                        >
                            🤖
                        </div>
                        <div>
                            <div className="d-flex align-items-center gap-2">
                                <h1 className="h5 mb-0 fw-bold text-white">Catalog Assistant</h1>
                                <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-1 small">
                                    ● Online
                                </span>
                            </div>
                            <small className="text-white-50">Ask about products, specs, and availability</small>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        {messages.length > 0 && (
                            <button
                                type="button"
                                className="btn btn-outline-light btn-sm rounded-pill px-3"
                                onClick={() => setMessages([])}
                                title="Clear conversation"
                            >
                                Clear
                            </button>
                        )}
                        <Link to="/" className="btn btn-light btn-sm rounded-pill px-3 fw-semibold text-primary">
                            ← Back to Store
                        </Link>
                    </div>
                </div>

                {/* Messages Body */}
                <div
                    className="card-body p-4 bg-light"
                    style={{ height: '500px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}
                >
                    {messages.length === 0 ? (
                        <div className="m-auto text-center text-muted py-5" style={{ maxWidth: '520px' }}>
                            <div className="display-4 mb-3">💬✨</div>
                            <h2 className="h5 fw-bold text-dark">Welcome to My Store Assistant!</h2>
                            <p className="small mb-4 text-secondary">
                                I have access to our live store catalog. Feel free to ask about specific items, compare prices, or get recommendations.
                            </p>
                            <div className="d-flex flex-wrap gap-2 justify-content-center">
                                {SUGGESTIONS.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className="btn btn-white btn-outline-primary btn-sm rounded-pill px-3 py-2 shadow-sm"
                                        onClick={() => sendTextMessage(suggestion)}
                                        disabled={loading}
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((message, index) => {
                            const isUser = message.role === 'user';
                            return (
                                <div
                                    key={index}
                                    className={`d-flex mb-3 ${isUser ? 'justify-content-end' : 'justify-content-start gap-2'}`}
                                >
                                    {!isUser && (
                                        <div
                                            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm"
                                            style={{ width: '32px', height: '32px', fontSize: '16px' }}
                                        >
                                            🤖
                                        </div>
                                    )}
                                    <div
                                        className={`p-3 rounded-4 shadow-sm ${
                                            isUser
                                                ? 'bg-primary text-white rounded-bottom-end-0'
                                                : 'bg-white border text-dark rounded-bottom-start-0'
                                        }`}
                                        style={{ maxWidth: '78%', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}
                                    >
                                        <div className="small fw-semibold mb-1 opacity-75">
                                            {isUser ? 'You' : 'Assistant'}
                                        </div>
                                        <div>{message.content}</div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Thinking / Typing indicator */}
                    {loading && (
                        <div className="d-flex justify-content-start mb-3 gap-2 align-items-center">
                            <div
                                className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm"
                                style={{ width: '32px', height: '32px', fontSize: '16px' }}
                            >
                                🤖
                            </div>
                            <div className="bg-white border text-secondary px-3 py-2 rounded-4 shadow-sm d-flex align-items-center gap-2">
                                <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
                                <span className="small">AI Assistant is searching the catalog...</span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="alert alert-danger mb-0 rounded-0 d-flex justify-content-between align-items-center py-2 px-3">
                        <small><strong>Error:</strong> {error}</small>
                        <button
                            type="button"
                            className="btn-close btn-close-sm"
                            aria-label="Close"
                            onClick={() => setError('')}
                        ></button>
                    </div>
                )}

                {/* Footer Input */}
                <div className="card-footer bg-white p-3 border-top">
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <input
                                className="form-control form-control-lg rounded-start-pill ps-4 border-end-0"
                                type="text"
                                placeholder="Ask about products, descriptions, prices..."
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                                disabled={loading}
                                autoFocus
                            />
                            <button
                                className="btn btn-primary px-4 rounded-end-pill fw-semibold d-flex align-items-center gap-2"
                                type="submit"
                                disabled={loading || input.trim() === ''}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm" role="status"></span>
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Send</span>
                                        <span>➤</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                    <div className="text-center mt-2">
                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                            AI responses are based on real-time queries to your store's database.
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatWindow;
