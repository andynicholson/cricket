import React, { useState } from 'react';
import styled from 'styled-components';
import { Send, Paperclip, Image } from 'react-feather';

const MessagesContainer = styled.div`
  display: flex;
  height: calc(100vh - 88px);
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
`;

const ConversationsList = styled.div`
  width: 320px;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
`;

const ConversationHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #1a1a1a;
`;

const ConversationItem = styled.div<{ $isActive?: boolean }>`
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => props.$isActive ? '#f3f4f6' : 'transparent'};

  &:hover {
    background-color: #f3f4f6;
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  color: #4b5563;
`;

const ConversationInfo = styled.div`
  flex: 1;
`;

const Name = styled.div`
  font-weight: 500;
  color: #1a1a1a;
`;

const LastMessage = styled.div`
  font-size: 14px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ChatHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Message = styled.div<{ $isOwn?: boolean }>`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  background-color: ${props => props.$isOwn ? '#2563eb' : '#f3f4f6'};
  color: ${props => props.$isOwn ? 'white' : '#1a1a1a'};
  align-self: ${props => props.$isOwn ? 'flex-end' : 'flex-start'};
`;

const MessageInput = styled.div`
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Input = styled.input`
  flex: 1;
  border: none;
  outline: none;
  padding: 8px 16px;
  background-color: #f3f4f6;
  border-radius: 8px;
  font-size: 14px;

  &::placeholder {
    color: #9ca3af;
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  border-radius: 8px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f3f4f6;
    color: #1a1a1a;
  }
`;

const SendButton = styled(IconButton)`
  color: #2563eb;
  
  &:hover {
    color: #1d4ed8;
  }
`;

const Messages: React.FC = () => {
  const [message, setMessage] = useState('');

  // Mock data for demonstration
  const conversations = [
    { id: 1, name: 'Sarah Johnson', lastMessage: 'See you at the trail tomorrow!', avatar: 'SJ' },
    { id: 2, name: 'Mike Chen', lastMessage: 'Great run today!', avatar: 'MC' },
    { id: 3, name: 'Emma Davis', lastMessage: 'Are you joining the race next week?', avatar: 'ED' },
  ];

  const messages = [
    { id: 1, text: 'Hey! Are you joining the morning trail run?', isOwn: false },
    { id: 2, text: 'Yes, I\'ll be there at 6 AM!', isOwn: true },
    { id: 3, text: 'Perfect! I\'ll bring some energy gels to share.', isOwn: false },
  ];

  return (
    <MessagesContainer>
      <ConversationsList>
        <ConversationHeader>Messages</ConversationHeader>
        {conversations.map(conv => (
          <ConversationItem key={conv.id} $isActive={conv.id === 1}>
            <Avatar>{conv.avatar}</Avatar>
            <ConversationInfo>
              <Name>{conv.name}</Name>
              <LastMessage>{conv.lastMessage}</LastMessage>
            </ConversationInfo>
          </ConversationItem>
        ))}
      </ConversationsList>

      <ChatArea>
        <ChatHeader>
          <Avatar>SJ</Avatar>
          <Name>Sarah Johnson</Name>
        </ChatHeader>

        <ChatMessages>
          {messages.map(msg => (
            <Message key={msg.id} $isOwn={msg.isOwn}>
              {msg.text}
            </Message>
          ))}
        </ChatMessages>

        <MessageInput>
          <IconButton>
            <Paperclip size={20} />
          </IconButton>
          <IconButton>
            <Image size={20} />
          </IconButton>
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
          <SendButton>
            <Send size={20} />
          </SendButton>
        </MessageInput>
      </ChatArea>
    </MessagesContainer>
  );
};

export default Messages; 