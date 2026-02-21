import React, { useState } from 'react';
import Modal from '../../../../../components/modal/Modal';
import Button from '../../../../../components/button/Button'; 
import './GroupModal.css';

const GroupModal = ({ isOpen, onClose, onCreate }) => {
    const [groupName, setGroupName] = useState("");

    const handleSubmit = () => {
        if (!groupName.trim()) return;
        onCreate(groupName);
        setGroupName("");
        onClose();
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Create New Group"
            footer={
                <div className="group-modal-footer">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Create</Button>
                </div>
            }
        >
        
            <div className="group-modal-body">
                <input 
                    className="group-modal-input"
                    autoFocus
                    placeholder="Enter group name" 
                    value={groupName} 
                    onChange={(e) => setGroupName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
            </div>
        </Modal>
    );
};

export default GroupModal;