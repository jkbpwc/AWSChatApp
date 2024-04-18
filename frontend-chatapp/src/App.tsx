import React, { useState, useEffect, useCallback, useRef } from 'react'
import { ChatClient } from './chat-client';

const URL = `wss://p57rbwgpg5.execute-api.us-east-1.amazonaws.com/demo`;

const App = () => {

  const socket = useRef<WebSocket | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [members, setMembers] = useState([]);
  const [chatRows, setChatRows] = useState<React.ReactNode[]>([]);
  const [username,setUserName]=useState<string|null>();

  const onSocketOpen = useCallback(() => {
    setIsConnected(true);
    // const name = prompt('Enter your name');
    // socket.current?.send(JSON.stringify({ action: 'setName', name }));
  }, []);

  const onSocketClose = useCallback(() => {
    setMembers([]);
    setIsConnected(false);
    setChatRows([]);
  }, []);

  const onSocketMessage = useCallback((dataStr) => {
    console.log(dataStr)
    setChatRows(oldArray => [...oldArray, <span><b>{dataStr}</b></span>]);
  }, []);

  const onConnect = useCallback(() => {
    const email = prompt("Enter Mail");
    setUserName(email);
    if (socket.current?.readyState !== WebSocket.OPEN) {
      socket.current = new WebSocket(URL+`?email=${email}`); 
      socket.current.addEventListener('open', onSocketOpen);
      socket.current.addEventListener('close', onSocketClose);
      socket.current.addEventListener('message', (event) => {
        onSocketMessage(event.data);
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      socket.current?.close();
    };
  }, []);

  const onSendPrivateMessage = useCallback(() => {
    const id = prompt('Enter the Id to Whom You want to send Message. ');
    const message = prompt('Enter private message for ' + id);
    socket.current?.send(JSON.stringify({
      action: 'sendToOne',
      message,
      id,
    }));
  }, []);

  const onSendPublicMessage = useCallback(() => {
    const message = prompt('Enter public message');
    socket.current?.send(JSON.stringify({
      action: 'sendMessage',
      message,
    }));
  }, []);

  const onDisconnect = useCallback(() => {
    setUserName("");
    if (isConnected) {
      socket.current?.close();
    }
  }, [isConnected]);

  return <ChatClient
    isConnected={isConnected}
    members={members}
    chatRows={chatRows}
    onPublicMessage={onSendPublicMessage}
    onPrivateMessage={onSendPrivateMessage}
    onConnect={onConnect}
    onDisconnect={onDisconnect}
    username={username}
  />;

}

export default App