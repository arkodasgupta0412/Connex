import './ChatHeader.css';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ChatHeader = ({ groupName, onBack }) => {
    return (
        <div className="chat-header">
            <button onClick={onBack} className="header-back-btn">
                <ArrowBackIcon />
            </button>
            <div className="header-group-name">
                {groupName}
            </div>
        </div>
    );
};

export default ChatHeader;