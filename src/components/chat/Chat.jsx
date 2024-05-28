import React, { useEffect, useState, useRef } from 'react';
import "./chat.css";
import EmojiPicker from 'emoji-picker-react';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import upload from '../../lib/upload';

const Chat = () => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });

  const endRef = useRef(null);
  const { currentUser } = useUserStore();
  const { chatId, user,isCurrentUserBlocked,isReceiverBlocked } = useChatStore();

  // Scroll to the end whenever chat updates
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // Set up onSnapshot listener for chat updates
  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });
    return () => {
      unSub();
    };
  }, [chatId]);

  const handleEmoji = e => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = e => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
      });
    }
  };

  const handleSend = async () => {
    if (text === "") return;

    let imgUrl = null; // Initialize imgUrl
    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }), // Conditionally add img property
        }),
      });

      const userIDs = [currentUser.id, user.id];

      for (const id of userIDs) {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex(c => c.chatId === chatId);

          if (chatIndex !== -1) { // Ensure chatIndex is valid
            userChatsData.chats[chatIndex].lastMessage = text;
            userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
            userChatsData.chats[chatIndex].updatedAt = Date.now();

            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });
          }
        }
      }
    } catch (err) {
      console.log(err);
    }

    setImg({
      file: null,
      url: "",
    });

    setText("");
  };

  return (
    <div className='chat'>
      <div className='top'>
        <div className='user'>
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className='texts'>
            <span>{user?.username}</span>
            <p>Lorem ipsum dolor sit amet consectetur</p>
          </div>
        </div>
        <div className='icons'>
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>
      <div className='center'>
        {chat?.messages?.map((message, index) => (
          <div className={message.senderId===currentUser?.id ? "message own" : "message"} key={index}>
            <div className="texts">
              {message.img && <img src={message.img} alt='' />}
              <p>{message.text}</p>
            </div>
          </div>
        ))}
        {img.url && <div className='message own'>
          <div className="texts">
            <img src={img.url} alt="" /> {/* Corrected image src */}
          </div>
        </div>}
        <div ref={endRef}></div>
      </div>
      <div className='bottom'>
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input type="file" id='file' style={{ display: "none" }} onChange={handleImg} />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <input
          type="text"
          placeholder={(isCurrentUserBlocked || isReceiverBlocked) ? "You cannot send message": 'Type a message... '}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="emoji">
          <img src="./emoji.png" alt="" onClick={() => setOpen((prev) => !prev)} />
          {open && <div className="picker">
            <EmojiPicker onEmojiClick={handleEmoji} />
          </div>}
        </div>
        <button className='sendButton' onClick={handleSend}
        disabled={isCurrentUserBlocked || isReceiverBlocked}
        >Send</button>
      </div>
    </div>
  );
}

export default Chat;