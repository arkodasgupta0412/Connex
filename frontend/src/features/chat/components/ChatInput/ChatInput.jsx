import { useRef } from 'react';

import './ChatInput.css';

import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';


const ChatInput = ({ value, onChange, onSend, onAttach }) => {
    const fileInputRef = useRef(null);

    return (
        <div className="chat-input-container">
            <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*" 
                onChange={onAttach} 
            />
            <button 
                onClick={() => fileInputRef.current.click()} 
                className="input-btn attach-btn"
                title="Attach Image"
            >
                <AttachFileIcon style={{ transform: 'rotate(45deg)' }} />
            </button>
            
            <input 
                value={value} 
                onChange={onChange} 
                placeholder="Type a message..." 
                className="chat-text-input"
                onKeyDown={(e) => e.key === "Enter" && onSend()}
            />
            
            <button onClick={onSend} className="input-btn send-btn">
                <SendIcon />
            </button>
        </div>
    );
};

export default ChatInput;