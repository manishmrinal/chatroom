const socket = io()
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {

    host: '/',
    port: '9000'
})

const myVideo = document.createElement('video');
myVideo.muted = true;

const peers = {}

navigator.mediaDevices.getUserMedia({

    video: true,
    audio: true
}).then(stream => {

    addVideoStream(myVideo, stream);

    myPeer.on('call', call => {
        console.log('inside mypeer calling')
        call.answer(stream)

        const videoIncoming = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(videoIncoming, userVideoStream)

        })
    })


    socket.on('user-connected', userId => {
            console.log('user has connected',userId)
        connectToNewUser(userId, stream);

    });

}).catch(err => {

    console.log(err)
});

socket.on('user-disconnected', userId => {

    console.log('disconnected user: ', userId)
    if (peers[userId]) {
        peers[userId].close()
    }

})


function connectToNewUser(userId, stream) {
    if(userId && stream)console.log('calling...')
    
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        console.log('calling...')
        addVideoStream(video, userVideoStream)
    })

    call.on('close', () => {
            console.log('removing')
        video.remove();
    })

    //peers[userId] = call
}

console.log('chat room id : ', ROOM_ID)
myPeer.on('open', id => {

    socket.emit('join-video-room', ROOM_ID, id);

})




function addVideoStream(video, stream) {
    const videoGrid = document.getElementById('video-grid')
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {

        video.play()
    });
    console.log('adding video')
    videoGrid.append(video);
}