export type Message = {
  text: string;
  author: Author;
  isBot?: boolean;
};

export enum Author {
  You = 'You',
  Bot = 'Bot',
}
