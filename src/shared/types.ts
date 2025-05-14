export interface Event {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  participants: string[];
  location: string;
  image: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences?: Record<string, any>;
} 