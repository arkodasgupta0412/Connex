const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readJSON, writeJSON } = require('../../utils/fileOps');
const { DB_GROUPS } = require('../../config/paths');

module.exports = function(io) {
    const router = express.Router();

    router.get('/:username', (req, res) => {
        const groups = readJSON(DB_GROUPS);
        const userGroups = groups.filter(g => g.members.includes(req.params.username));
        const otherGroups = groups.filter(g => !g.members.includes(req.params.username));
        res.json({ userGroups, otherGroups });
    });

    router.post('/create', (req, res) => {
        const groups = readJSON(DB_GROUPS);
        const newGroup = {
            id: uuidv4(),
            name: req.body.groupName,
            admins: [req.body.creator],
            members: [req.body.creator],
            joinRequests: [],
            messages: []
        };
        groups.push(newGroup);
        writeJSON(DB_GROUPS, groups);
        res.json({ success: true });
    });

    router.post('/request', (req, res) => {
        const groups = readJSON(DB_GROUPS);
        const group = groups.find(g => g.id === req.body.groupId);
        if (group && !group.members.includes(req.body.username)) {
            if(!group.joinRequests.includes(req.body.username)) {
                group.joinRequests.push(req.body.username);
            }
            writeJSON(DB_GROUPS, groups);
        }
        res.json({ success: true });
    });

    router.post('/request/accept', (req, res) => {
        const { groupId, username } = req.body;
        const groups = readJSON(DB_GROUPS);
        const group = groups.find(g => g.id === groupId);
        
        if (group && group.joinRequests.includes(username)) {
            group.joinRequests = group.joinRequests.filter(u => u !== username);
            if (!group.members.includes(username)) {
                group.members.push(username);
            }
            
            const joinMessage = {
                id: uuidv4(),
                groupId: groupId,
                sender: 'SYSTEM',
                type: 'system',
                content: `${username} joined the group`,
                timestamp: new Date().toISOString(),
                comments: [],
                likes: 0,
                likedBy: []
            };
            group.messages.push(joinMessage);
            writeJSON(DB_GROUPS, groups);
            
            if (io && typeof io.to === 'function') {
                io.to(groupId).emit('receive_message', joinMessage);
            }
            res.json({ success: true, message: 'User accepted' });
        } else {
            res.json({ success: false, message: 'Request not found' });
        }
    });

    router.post('/request/reject', (req, res) => {
        const { groupId, username } = req.body;
        const groups = readJSON(DB_GROUPS);
        const group = groups.find(g => g.id === groupId);
        
        if (group && group.joinRequests.includes(username)) {
            group.joinRequests = group.joinRequests.filter(u => u !== username);
            writeJSON(DB_GROUPS, groups);
            res.json({ success: true, message: 'User rejected' });
        } else {
            res.json({ success: false, message: 'Request not found' });
        }
    });

    return router;
};
