const path = require('path');

module.exports = {
    DB_USERS: path.join(__dirname, "../../users.json"),
    DB_GROUPS: path.join(__dirname, "../../groups.json"),
    UPLOAD_DIR: path.join(__dirname, "../../uploads")
};