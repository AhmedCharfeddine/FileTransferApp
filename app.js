function createRoom() {
    document.querySelector('#createBtn').disabled = true;
    document.querySelector('#joinBtn').disabled = true;
    document.querySelector('#closeBtn').disabled = false;
    document.querySelector('#peer1-form').hidden = false;

    const iceConfiguration = { }
    iceConfiguration.iceServers = [];
    iceConfiguration.iceServers.push({
        urls: 'stun:stun1.l.google.com:19302' 
    })
    const localConnection = new RTCPeerConnection(iceConfiguration)

    
    localConnection.onicecandidate = e =>  {
        console.log(" NEW ice candidate on localconnection. reprinting SDP " )
        document.querySelector("#peer1-generated-sdp").innerHTML = JSON.stringify(localConnection.localDescription);
    }

    const sendChannel = localConnection.createDataChannel("sendChannel");


    sendChannel.onmessage = e =>  console.log("messsage received: "  + e.data )
    sendChannel.onopen = e => {
        console.log("channel opened");
        document.querySelector("#peer1-form").hidden = true;
        document.querySelector("#room-peer1").hidden = false;

        document.querySelector("#helloBtnPeer1").onclick = () => {
            sendChannel.send("hello from peer1!");
        }
    }
    sendChannel.onclose = e => {
        console.log("channel closed");
        refreshPage();
    }

    localConnection.createOffer().then(o => localConnection.setLocalDescription(o) );

    document.querySelector('#openConnectionBtn').onclick = () => {
        const answer = JSON.parse(document.querySelector("#sdp-from-peer2").value);
        localConnection.setRemoteDescription(answer).then(a=>{
            console.log("connection opened!");
            // TODO: add changes to UI to hide form and display transfer options
        });
    }
}



function joinRoom() {
    document.querySelector('#createBtn').disabled = true;
    document.querySelector('#joinBtn').disabled = true;
    document.querySelector('#closeBtn').disabled = false;
    document.querySelector('#peer2-form').hidden = false;

    const remoteConnection = new RTCPeerConnection();

    remoteConnection.onicecandidate = e =>  {
        console.log("NEW ice candidate on localconnection. displaying SDP" );
        //document.querySelector('#peer2-generated-sdp').innerHTML = JSON.stringify(remoteConnection.localDescription);
        console.log(remoteConnection.localDescription);
    }

    remoteConnection.ondatachannel= e => {
        const receiveChannel = e.channel;
        receiveChannel.onmessage = e =>  console.log("messsage received: "  + e.data)
        receiveChannel.onopen = e => {
            console.log("channel opened");
            document.querySelector("#peer2-form").hidden = true;
            document.querySelector("#room-peer2").hidden = false;
        }
        receiveChannel.onclose = e => {
            console.log("channel closed");
            refreshPage();
        };
        remoteConnection.channel = receiveChannel;
    }

    document.querySelector('#sendAnswerBtn').onclick = () => {
        const offer = JSON.parse(document.querySelector('#sdp-from-peer1').value);
        remoteConnection.setRemoteDescription(offer).then(a=>{
            document.querySelector('#peer2-sdp').hidden = false;
            // creating answer
            remoteConnection.createAnswer().then(a => 
                remoteConnection.setLocalDescription(a).then(a =>
                    document.querySelector('#peer2-generated-sdp').innerHTML = JSON.stringify(remoteConnection.localDescription)))
        })
    }
    
}


function refreshPage() {
    location.reload();
}

function copyToClipboard(text) {
    /* Get the text field */
    var copyText = document.getElementById(text);

    /* Copy the text inside the text field */
    navigator.clipboard.writeText(copyText.innerHTML);
} 



document.querySelector('#closeBtn').disabled = true;
document.querySelector('#createBtn').addEventListener('click', createRoom);
document.querySelector('#joinBtn').addEventListener('click', joinRoom);
document.querySelector('#closeBtn').addEventListener('click', refreshPage);
