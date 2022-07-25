const generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (username, url) => {
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
}

const generateRoomData = (room, users) => {
    return {
        room,
        users
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage,
    generateRoomData
}