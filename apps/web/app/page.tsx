"use client";

import { useState } from "react";
import { useSocket } from "../context/SocketProvider";

export default function Page(){
  const {sendMessage,messages} = useSocket();
  const [message,setMessage] =useState('')
  return (
    <div>
      <div>
        <h1>
          All Messages will appear here
        </h1>
      </div>
      <div>
        <input
          onChange={(e) => setMessage(e.target.value)}
          placeholder= "Message..."/>
        <button onClick={e => sendMessage(message)}>send</button>
      </div>
      <div>
        {messages.map((e) => (
          <li>
            {e}
          </li>
        ))}
      </div>
    </div>
  )
}