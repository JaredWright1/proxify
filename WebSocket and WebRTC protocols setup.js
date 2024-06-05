const { RTCPeerConnection } = require('wrtc');

const pc = new RTCPeerConnection({
  sdpSemantics: 'unified-plan',
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
  ],
});

pc.onicecandidate = (event) => {
  if (event.candidate) {
    console.log('ICE Candidate: ', event.candidate);
  }
};

pc.ontrack = (event) => {
  const [transferredStream] = event.streams;
  console.log('WebRTC transmitted stream:', transferredStream);
};

const send = async (data) => {
  const offer = await pc.createOffer({ sdpSemantics: 'unified-plan' });
  await pc.setLocalDescription(offer);

  const ws = new WebSocket('ws://localhost:3000');
  ws.binaryType = 'arraybuffer';

  ws.onopen = () => {
    ws.send(pc.localDescription.sdp, { binary: true });
  };

  ws.onmessage = (event) => {
    const answerSdp = new TextDecoder().decode(event.data);
    pc.setRemoteDescription(new RTCSessionDescription({
      sdp: answerSdp,
      type: 'answer',
    }));
  };

  ws.onclose = async () => {
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    ws.send(pc.localDescription.sdp, { binary: true });
  };
};

send('Hello, WebRTC!');
