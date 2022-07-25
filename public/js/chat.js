const socket = io()

// Elements
const $messageForm = document.getElementById('messageForm')
const inputField = document.getElementById('inputField')
const sendBtn = document.getElementById('sendBtn')
const shareLocationBtn = document.getElementById('shareLocation')
const messages = document.getElementById('messages')

// Message templates
const messageTemplate = document.getElementById('messageTemplate').innerHTML
const locationTemplate = document.getElementById('locationTemplate').innerHTML
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML

// Options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = ( ) => {
    // New message element
    const $newMessage = messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = messages.offsetHeight

    // Height of messages container
    const containerHeight = messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
    }
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (message) => {
    console.log(message.url)
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.getElementById('sidebar').innerHTML = html
})

sendBtn.addEventListener('click', (e) => {
    e.preventDefault()
    if(inputField.value === ''){
        return alert('Enter a message')
    }
    sendBtn.disabled = true
    socket.emit('messageSent', inputField.value, (error) => {
        sendBtn.disabled = false
        inputField.value = ""
        inputField.focus()
        if(error) {
            console.log(error)
        } else {
            console.log('Message delivered!')
        }
    })
})

shareLocationBtn.addEventListener('click', () => {
    shareLocationBtn.disabled = true
    if(!navigator.geolocation){
        return alert('Geolocation not supported.')
    }

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            lat: position.coords.latitude,
            long: position.coords.longitude
        }, () => {
            shareLocationBtn.disabled = false
            console.log('Location shared!')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})