import Avatar from '../../../../../components/Avatar/Avatar';
import './GroupItem.css';
import { grey } from '@mui/material/colors'

const GroupItem = ({ group, isActive, onClick }) => {
    return (
        <div 
            onClick={onClick} 
            className={`group-item ${isActive ? 'active' : ''}`}
        >
            <div className="group-item-avatar">
                <Avatar sx={{ bgcolor: grey[900] }} name={group.name} size="md" />
            </div>
            <div className="group-item-info">
                <div className="group-item-name">{group.name}</div>
                <div className="group-item-status">Click to view chat</div>
            </div>
        </div>
    );
};

export default GroupItem;