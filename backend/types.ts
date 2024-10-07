export interface UserFields {
  username: string;
  password: string;
  token: string;
}

export interface IMessage {
  username: string;
  text: string;
  createdAt: Date;
}